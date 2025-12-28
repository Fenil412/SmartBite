# Test Flask environment variables
# Run this in Models directory: python test-flask-env.py

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("🔍 Flask Environment Test")
print(f"INTERNAL_HMAC_SECRET: '{os.getenv('INTERNAL_HMAC_SECRET')}'")
print(f"SECRET exists: {bool(os.getenv('INTERNAL_HMAC_SECRET'))}")
print(f"SECRET length: {len(os.getenv('INTERNAL_HMAC_SECRET', ''))}")

# Test HMAC generation
import hmac
import hashlib

secret = os.getenv('INTERNAL_HMAC_SECRET')
if secret:
    timestamp = "1766938768"
    body = '{"userId":"test123","data":{"user":{"id":"test123","name":"test"}}}'
    
    expected = hmac.new(
        secret.encode(),
        (timestamp + body).encode(),
        hashlib.sha256
    ).hexdigest()
    
    print(f"\nHMAC Test:")
    print(f"Timestamp: {timestamp}")
    print(f"Body: {body}")
    print(f"HMAC input: '{timestamp + body}'")
    print(f"Expected signature: {expected}")
else:
    print("❌ INTERNAL_HMAC_SECRET not found!")