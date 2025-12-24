from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS
from app.api.routes import api
from app.utils.logger import setup_logger
import os

def create_app():
    app = Flask(__name__)
    CORS(app, origins=os.getenv("CORS_ORIGIN", "*"))
    setup_logger()
    app.register_blueprint(api)
    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
