import firebase_admin
from firebase_admin import credentials, auth
from app.config import settings
import json

class FirebaseAuth:
    def __init__(self):
        if not firebase_admin._apps:
            # Parse the private key from environment
            private_key = settings.firebase_private_key.replace('\\n', '\n')
            
            cred_dict = {
                "type": "service_account",
                "project_id": settings.firebase_project_id,
                "private_key": private_key,
                "client_email": settings.firebase_client_email,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token"
            }
            
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
    
    async def verify_token(self, id_token: str) -> dict:
        """Verify Firebase ID token"""
        try:
            decoded_token = auth.verify_id_token(id_token)
            return {
                "uid": decoded_token.get("uid"),
                "email": decoded_token.get("email"),
                "name": decoded_token.get("name", ""),
                "verified": True
            }
        except Exception as e:
            return {"verified": False, "error": str(e)}

firebase_auth = FirebaseAuth()