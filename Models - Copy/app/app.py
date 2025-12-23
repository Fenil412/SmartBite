# app/app.py
from flask import Flask
from flask_cors import CORS

from app.routes.recommend import recommend_bp
from app.routes.feedback import feedback_bp
from app.routes.coach import coach_bp
from app.routes.health import health_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(recommend_bp, url_prefix="/recommend")
    app.register_blueprint(feedback_bp, url_prefix="/feedback")
    app.register_blueprint(coach_bp, url_prefix="/coach")
    app.register_blueprint(health_bp, url_prefix="/health")

    return app

app = create_app()

if __name__ == "__main__":
    app.run(port=5000, debug=True)
