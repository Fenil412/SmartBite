from flask import Flask
from meal_planning import meal_planning_bp
from nutrition_goal import nutrition_goal_bp
from rule_filtering import rule_filtering_bp
from variety_clustering import variety_clustering_bp
from content_filtering import content_filtering_bp
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})


# Register all modules
app.register_blueprint(meal_planning_bp, url_prefix="/meal_planning")
app.register_blueprint(nutrition_goal_bp, url_prefix="/nutrition_goal")
app.register_blueprint(rule_filtering_bp, url_prefix="/rule_filtering")
app.register_blueprint(variety_clustering_bp, url_prefix="/variety_clustering")
app.register_blueprint(content_filtering_bp, url_prefix="/content_filtering")

@app.route('/')
def home():
    return {"status": "Unified server running with all 5 models"}

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)