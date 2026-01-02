# Test Flask environment variables
# Run this in Models directory: python test-flask-env.py

import os
from dotenv import load_dotenv
import hmac
import hashlib

# Load environment variables
load_dotenv()

def test_environment():
    """Test Flask environment configuration"""
    secret = os.getenv('INTERNAL_HMAC_SECRET')
    
    if not secret:
        return False, "INTERNAL_HMAC_SECRET not found in environment"
    
    if len(secret) < 32:
        return False, "INTERNAL_HMAC_SECRET too short (should be at least 32 characters)"
    
    # Test HMAC generation
    try:
        timestamp = "1766938768"
        body = '{"userId":"test123","data":{"user":{"id":"test123","name":"test"}}}'
        
        expected = hmac.new(
            secret.encode(),
            (timestamp + body).encode(),
            hashlib.sha256
        ).hexdigest()
        
        return True, f"Environment configured correctly. HMAC test passed."
    except Exception as e:
        return False, f"HMAC generation failed: {str(e)}"

if __name__ == "__main__":
    success, message = test_environment()
    if success:
        exit(0)
    else:
        exit(1)