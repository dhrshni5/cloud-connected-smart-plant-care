
from datetime import datetime, timezone, timedelta
from threading import Lock

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.firebase_db import get_firestore_client

app = FastAPI(title="Smart Plant Care API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MOISTURE_THRESHOLD = 30
COOLDOWN_SECONDS = 60
MAX_WATERING_SECONDS = 5

lock = Lock()
last_watered = {}
pump_states = {}


class SensorReading(BaseModel):
    device_id: str = Field(min_length=1, max_length=50)
    soil_moisture: float = Field(ge=0, le=100)
    temperature: float = Field(ge=-20, le=80)
    humidity: float = Field(ge=0, le=100)


def now():
    return datetime.now(timezone.utc)


def db():
    return get_firestore_client()


def water(device_id, reason):
    current = now()
    previous = last_watered.get(device_id)

    if pump_states.get(device_id, False):
        return False

    if previous and current - previous < timedelta(
        seconds=COOLDOWN_SECONDS
    ):
        return False

    pump_states[device_id] = True
    last_watered[device_id] = current

    db().collection("watering_events").add({
        "device_id": device_id,
        "timestamp": current.isoformat(),
        "reason": reason,
        "duration_seconds": MAX_WATERING_SECONDS,
        "status": "completed",
    })

    pump_states[device_id] = False
    return True


@app.get("/")
def root():
    return {
        "project": "Cloud-Connected Smart Plant Care",
        "api_status": "running",
        "storage": "Google Cloud Firestore",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/sensor-data")
def receive_sensor_data(data: SensorReading):
    timestamp = now()
    reading = data.model_dump()
    reading["timestamp"] = timestamp.isoformat()

    with lock:
        database = db()

        database.collection("sensor_readings").add(reading)

        database.collection("devices").document(
            data.device_id
        ).set({
            **reading,
            "last_seen": timestamp.isoformat(),
        }, merge=True)

        triggered = False
        if data.soil_moisture < MOISTURE_THRESHOLD:
            triggered = water(
                data.device_id, "automatic_low_moisture"
            )

        return {
            "message": "Sensor data received and saved",
            "reading": reading,
            "watering_triggered": triggered,
            "pump_status": (
                "ON" if pump_states.get(data.device_id) else "OFF"
            ),
            "threshold": MOISTURE_THRESHOLD,
        }


@app.get("/api/readings")
def get_readings():
    docs = (
        db().collection("sensor_readings")
        .order_by("timestamp", direction="DESCENDING")
        .limit(50).stream()
    )
    return [doc.to_dict() for doc in docs]


@app.get("/api/status")
def get_status():
    current = now()
    result = []

    for doc in db().collection("devices").stream():
        item = doc.to_dict()
        last_seen = datetime.fromisoformat(item["last_seen"])

        result.append({
            **item,
            "device_status": (
                "online" if current - last_seen < timedelta(seconds=30)
                else "offline"
            ),
            "plant_status": (
                "Needs water"
                if item["soil_moisture"] < MOISTURE_THRESHOLD
                else "Healthy"
            ),
            "pump_status": (
                "ON" if pump_states.get(doc.id, False) else "OFF"
            ),
        })

    return result


@app.get("/api/watering-events")
def get_watering_events():
    docs = (
        db().collection("watering_events")
        .order_by("timestamp", direction="DESCENDING")
        .limit(50).stream()
    )
    return [doc.to_dict() for doc in docs]


@app.post("/api/water/{device_id}")
def manual_water(device_id: str):
    with lock:
        device = (
            db().collection("devices")
            .document(device_id).get()
        )

        if not device.exists:
            raise HTTPException(status_code=404, detail="Unknown device")

        try:
            if not water(device_id, "manual"):
                raise HTTPException(
                    status_code=429,
                    detail="Watering cooldown active",
                )
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=500, detail="Watering operation failed"
            ) from exc

        return {
            "message": "Simulated watering completed",
            "device_id": device_id,
            "pump_status": "OFF",
            "duration_seconds": MAX_WATERING_SECONDS,
        }


@app.get("/api/config")
def get_config():
    return {
        "moisture_threshold": MOISTURE_THRESHOLD,
        "cooldown_seconds": COOLDOWN_SECONDS,
        "max_watering_seconds": MAX_WATERING_SECONDS,
    }