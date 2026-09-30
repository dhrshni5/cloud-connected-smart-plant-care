
from datetime import datetime, timezone, timedelta
from threading import Lock

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Smart Plant Care API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

MOISTURE_THRESHOLD = 30
COOLDOWN_SECONDS = 60
MAX_WATERING_SECONDS = 5

readings = []
watering_events = []
devices = {}
pump_states = {}
last_watered = {}
lock = Lock()


class SensorReading(BaseModel):
    device_id: str = Field(min_length=1, max_length=50)
    soil_moisture: float = Field(ge=0, le=100)
    temperature: float = Field(ge=-20, le=80)
    humidity: float = Field(ge=0, le=100)


def now():
    return datetime.now(timezone.utc)


def water(device_id, reason):
    current = now()
    previous = last_watered.get(device_id)

    if pump_states.get(device_id, False):
        return False

    if previous and current - previous < timedelta(seconds=COOLDOWN_SECONDS):
        return False

    # Simulated actuator: this records a bounded watering action.
    pump_states[device_id] = True
    last_watered[device_id] = current

    watering_events.append({
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
        "storage": "temporary in-memory",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/sensor-data")
def receive_sensor_data(data: SensorReading):
    timestamp = now()

    with lock:
        reading = data.model_dump()
        reading["timestamp"] = timestamp.isoformat()
        readings.append(reading)

        devices[data.device_id] = timestamp

        triggered = False
        if data.soil_moisture < MOISTURE_THRESHOLD:
            triggered = water(data.device_id, "automatic_low_moisture")

        return {
            "message": "Sensor data received",
            "reading": reading,
            "watering_triggered": triggered,
            "pump_status": "ON" if pump_states.get(data.device_id) else "OFF",
            "threshold": MOISTURE_THRESHOLD,
        }


@app.get("/api/readings")
def get_readings():
    return list(reversed(readings[-50:]))


@app.get("/api/status")
def get_status():
    current = now()
    result = []

    for device_id, timestamp in devices.items():
        recent = next(
            (r for r in reversed(readings)
             if r["device_id"] == device_id),
            None,
        )

        if recent is None:
            continue

        result.append({
            **recent,
            "device_status": (
                "online" if current - timestamp < timedelta(seconds=30)
                else "offline"
            ),
            "plant_status": (
                "Needs water"
                if recent["soil_moisture"] < MOISTURE_THRESHOLD
                else "Healthy"
            ),
            "pump_status": (
                "ON" if pump_states.get(device_id, False) else "OFF"
            ),
        })

    return result


@app.get("/api/watering-events")
def get_watering_events():
    return list(reversed(watering_events[-50:]))


@app.post("/api/water/{device_id}")
def manual_water(device_id: str):
    with lock:
        if device_id not in devices:
            raise HTTPException(status_code=404, detail="Unknown device")

        if not water(device_id, "manual"):
            raise HTTPException(
                status_code=429,
                detail="Pump busy or watering cooldown active",
            )

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