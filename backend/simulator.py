
import json
import time
import urllib.error
import urllib.request

API_URL = "http://127.0.0.1:8000/api/sensor-data"

while True:
    payload = {
        "device_id": "plant-01",
        "soil_moisture": 24,
        "temperature": 29,
        "humidity": 64
    }

    request = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            result = json.loads(response.read().decode("utf-8"))
            print(json.dumps(result, indent=2))
    except (urllib.error.URLError, TimeoutError) as error:
        print("API connection failed:", error)

    time.sleep(5)