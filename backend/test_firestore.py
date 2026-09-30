
from datetime import datetime, timezone

from app.firebase_db import get_firestore_client

db = get_firestore_client()

doc = {
    "message": "Firestore connection successful",
    "created_at": datetime.now(timezone.utc).isoformat(),
    "test": True,
}

ref = db.collection("connection_tests").add(doc)

print("Firestore write successful!")
print("Document ID:", ref[1].id)
print("Collection: connection_tests")