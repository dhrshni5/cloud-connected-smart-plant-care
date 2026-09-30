# 🌱 Cloud-Connected Smart Plant Care & Automated Watering System

A cloud-connected smart plant care system that uses a **simulated ESP32 IoT device** to monitor plant conditions and automatically manage watering based on soil moisture levels.

The project demonstrates how IoT devices can communicate with a cloud platform to collect sensor data, store historical readings, trigger automated actions, and provide remote monitoring through a web dashboard.

---

## 🎯 Project Objective

Plants require regular monitoring of soil moisture and environmental conditions. Manual monitoring can result in underwatering or overwatering.

This project aims to develop a cloud-connected system that:

* Monitors soil moisture and environmental conditions
* Collects sensor data from a simulated IoT device
* Sends sensor data to a cloud backend
* Stores sensor readings and events in a cloud database
* Automatically triggers watering when soil moisture falls below a threshold
* Provides a web dashboard for remote monitoring
* Maintains historical sensor and watering data
* Generates alerts for important plant conditions

---

## 🏗️ System Architecture

```text
┌──────────────────────────┐
│   Wokwi ESP32 Simulator  │
│                          │
│ Soil Moisture Sensor     │
│ Temperature Sensor       │
│ Humidity Sensor          │
│ Virtual Relay / Pump     │
└────────────┬─────────────┘
             │
             │ HTTP / REST
             ▼
┌──────────────────────────┐
│      FastAPI Backend     │
│                          │
│ Sensor Data API          │
│ Watering Logic           │
│ Device Management        │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│    Firebase Firestore    │
│                          │
│ Sensor Readings          │
│ Watering Events          │
│ Alerts                   │
│ Device Data              │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│     React Dashboard      │
│                          │
│ Live Sensor Readings     │
│ Historical Charts        │
│ Pump Status              │
│ Alerts                   │
│ Manual Watering          │
└──────────────────────────┘
```

---

## 🔧 Technology Stack

| Component         | Technology                |
| ----------------- | ------------------------- |
| IoT Simulation    | Wokwi                     |
| Microcontroller   | ESP32                     |
| Backend           | Python, FastAPI           |
| API Communication | REST / HTTP               |
| Cloud Database    | Firebase Firestore        |
| Frontend          | React                     |
| Programming       | C++ / Python / JavaScript |
| Version Control   | Git & GitHub              |

---

## 📡 IoT Layer

Since physical IoT hardware is not available, the project uses **Wokwi to simulate an ESP32-based IoT device**.

The simulated device collects:

* Soil moisture
* Temperature
* Humidity

A virtual relay/pump is used to represent the watering actuator.

The ESP32 communicates with the cloud backend through HTTP/REST requests.

---

## ☁️ Cloud Layer

The cloud backend receives sensor readings from the IoT device and processes them.

The backend is responsible for:

* Receiving sensor data
* Validating incoming data
* Storing readings
* Applying watering rules
* Managing watering events
* Providing data to the dashboard
* Handling device-related requests

---

## 💧 Automated Watering

The system uses a configurable soil moisture threshold.

For example:

```text
Soil Moisture = 24%
Threshold      = 30%

24% < 30%
      ↓
Watering Triggered
      ↓
Virtual Pump ON
      ↓
Moisture increases
      ↓
Virtual Pump OFF
```

Safety mechanisms such as cooldown periods and maximum watering duration can be used to prevent repeated or excessive watering.

---

## 📊 Dashboard

The React dashboard provides remote monitoring of the plant.

The dashboard can display:

* Current soil moisture
* Temperature
* Humidity
* Plant status
* Pump status
* Automatic watering status
* Last watering time
* Historical sensor readings
* Watering history
* Alerts
* Manual watering control

---

## 🚨 Alerts

The system can generate alerts for conditions such as:

* Low soil moisture
* High temperature
* Low water level
* Device offline
* Watering events
* System errors

---

## 📈 Historical Data

Sensor readings and watering events are stored in the cloud database.

This allows the system to maintain historical information such as:

```text
Timestamp
Soil Moisture
Temperature
Humidity
Pump Status
Watering Event
```

Historical data can be visualized through charts in the dashboard.

---

## 🔐 Security

The system is designed with cloud security considerations including:

* Authentication
* User-device authorization
* Secure API access
* Firestore security rules
* Input validation
* Protection of sensitive configuration values
* Secure communication

---

## 🚀 Future Enhancements

Possible future improvements include:

* Physical ESP32 hardware integration
* Real soil moisture and environmental sensors
* MQTT communication
* Mobile application
* Push notifications
* Weather-based watering
* Machine learning for plant health prediction
* Multiple plant/device management
* Advanced cloud scalability
* Real-time notification services

---

## 📁 Project Structure

```text
cloud-connected-smart-plant-care/
│
├── backend/
│   ├── app/
│   └── requirements.txt
│
├── iot/
│   └── wokwi/
│
├── frontend/
│
├── tests/
│
├── docs/
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🧪 Testing

The system will be tested for:

* Sensor data transmission
* API requests
* Cloud data storage
* Automatic watering
* Manual watering
* Threshold updates
* Alert generation
* Device status
* Dashboard updates
* Invalid requests
* Multiple sensor readings

---

## 📌 Project Status

🚧 **Under Development**

The project is being developed as a Cloud Computing project with a simulated IoT hardware layer.

---

## 👩‍💻 Project

**Cloud-Connected Smart Plant Care & Automated Watering System**

Built as a Cloud Computing project demonstrating the integration of **IoT simulation, REST APIs, cloud database services, automated decision-making, and web-based monitoring**.
