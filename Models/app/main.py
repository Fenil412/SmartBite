from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS
from app.api.routes import api
from app.utils.logger import setup_logger
import os
from app.api.internal import internal_api
from app.api.analytics import analytics_bp
from app.api.admin import admin_bp
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    
    # CORS configuration - allow all origins for development
    cors_origin = os.getenv("CORS_ORIGIN", "*")
    CORS(app, 
         origins=cors_origin,
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization', 'x-timestamp', 'x-signature'])
    
    setup_logger()
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        try:
            from app.db.mongo import client
            # Test database connection
            client.admin.command('ping')
            db_status = "connected"
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            db_status = "disconnected"
        
        return jsonify({
            'status': 'healthy',
            'database': db_status,
            'services': {
                'ai_api': 'active',
                'admin_api': 'active', 
                'analytics_api': 'active',
                'internal_api': 'active'
            },
            'version': '1.0.0',
            'cors_origin': cors_origin
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    # Register blueprints
    app.register_blueprint(api, url_prefix='/api')
    app.register_blueprint(internal_api, url_prefix='/internal')
    app.register_blueprint(analytics_bp, url_prefix='/analytics')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    logger.info("Flask AI Service initialized successfully")
    logger.info(f"CORS enabled for: {cors_origin}")
    
    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT"))  # Render injects this
    logger.info(f"Starting Flask AI Service on 0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
