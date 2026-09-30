
import os

import firebase_admin
from firebase_admin import credentials, firestore


def get_firestore_client():
    """Initialize Firebase once and return a Firestore client."""
    if not firebase_admin._apps:
        key_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")

        if not key_path:
            raise RuntimeError(
                "Set GOOGLE_APPLICATION_CREDENTIALS to your Firebase key path."
            )

        credential = credentials.Certificate(key_path)
        firebase_admin.initialize_app(credential)

    return firestore.client()