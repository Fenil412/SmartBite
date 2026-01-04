# SmartBite AI/ML Models 🤖

Advanced machine learning and AI services for the SmartBite application, providing intelligent meal recommendations, nutrition analysis, health risk assessment, and personalized meal planning optimization.

## 🌟 Features

### 🧠 Machine Learning Models
- **Meal Recommendation Engine**: Content-based and collaborative filtering algorithms
- **Nutrition Prediction**: XGBoost and Random Forest models for nutritional analysis
- **Health Risk Assessment**: ML models for dietary health impact prediction
- **Meal Clustering**: K-Means clustering for meal variety and categorization
- **Preference Learning**: User preference modeling and adaptation algorithms

### 🎯 Optimization Algorithms
- **Meal Plan Optimization**: Linear programming with OR-Tools and PuLP
- **Constraint Satisfaction**: Multi-objective optimization for dietary requirements
- **Cost Optimization**: Budget-aware meal planning algorithms
- **Nutritional Balance**: Macro and micronutrient optimization
- **Variety Maximization**: Ensuring diverse meal selections

### 🔮 AI-Powered Insights
- **Groq AI Integration**: Advanced natural language processing for nutrition advice
- **Health Impact Analysis**: AI-driven analysis of dietary choices on health outcomes
- **Personalized Recommendations**: Context-aware meal suggestions
- **Weekly Planning Intelligence**: Smart weekly meal plan generation
- **Nutrition Coaching**: AI-powered dietary guidance and tips

### 📊 Data Processing & Analytics
- **Data Preprocessing**: Advanced data cleaning and feature engineering
- **Nutritional Database**: Comprehensive food and nutrition data management
- **User Behavior Analysis**: Pattern recognition in eating habits
- **Trend Analysis**: Nutritional trend identification and forecasting
- **Performance Metrics**: Model accuracy and recommendation quality tracking

## 🏗️ Architecture

### Directory Structure
```
Models/
├── app/                     # Flask application and API endpoints
│   ├── api/                 # API route handlers
│   │   ├── admin.py         # Admin analytics endpoints
│   │   ├── chat.py          # AI chat integration
│   │   ├── health.py        # Health analysis endpoints
│   │   ├── meals.py         # Meal recommendation endpoints
│   │   └── planning.py      # Meal planning endpoints
│   ├── models/              # ML model definitions and training
│   │   ├── recommendation/  # Recommendation algorithms
│   │   ├── nutrition/       # Nutrition prediction models
│   │   ├── optimization/    # Optimization algorithms
│   │   └── clustering/      # Clustering algorithms
│   ├── services/            # Business logic and data processing
│   │   ├── ai_service.py    # AI integration service
│   │   ├── data_service.py  # Data processing service
│   │   ├── ml_service.py    # ML model service
│   │   └── optimization_service.py
│   ├── utils/               # Utility functions and helpers
│   │   ├── data_utils.py    # Data processing utilities
│   │   ├── ml_utils.py      # ML helper functions
│   │   ├── nutrition_utils.py # Nutrition calculations
│   │   └── validation.py    # Input validation
│   └── config/              # Configuration files
│       ├── settings.py      # Application settings
│       └── database.py      # Database configuration
├── datasets/                # Training data and datasets
│   ├── nutrition/           # Nutritional databases
│   ├── meals/               # Meal datasets
│   ├── users/               # User preference data
│   └── processed/           # Preprocessed datasets
├── ml/                      # Machine learning pipelines
│   ├── training/            # Model training scripts
│   ├── evaluation/          # Model evaluation and testing
│   ├── preprocessing/       # Data preprocessing pipelines
│   └── deployment/          # Model deployment utilities
├── models/                  # Trained model artifacts
│   ├── recommendation/      # Recommendation model files
│   ├── nutrition/           # Nutrition prediction models
│   ├── clustering/          # Clustering model files
│   └── optimization/        # Optimization model parameters
├── venv/                    # Python virtual environment
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables
├── .env.example             # Environment template
└── app.py                   # Main Flask application
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+ (3.10+ recommended)
- pip (Python package manager)
- Virtual environment support
- MongoDB (for data storage)
- Redis (optional, for caching)

### Installation

1. **Navigate to Models directory:**
```bash
cd Models
```

2. **Create and activate virtual environment:**
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Environment Configuration:**
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Configure the following variables:
```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/smartbite
DATABASE_NAME=smartbite

# AI Services
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key (optional)

# Model Configuration
MODEL_PATH=./models/
DATASET_PATH=./datasets/
CACHE_ENABLED=True
REDIS_URL=redis://localhost:6379

# Optimization Settings
MAX_OPTIMIZATION_TIME=30
DEFAULT_MEAL_COUNT=21
NUTRITION_TOLERANCE=0.1

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/ml_service.log
```

5. **Initialize datasets (optional):**
```bash
python -m app.utils.data_utils --init-datasets
```

6. **Start the ML service:**

Development mode:
```bash
python app.py
```

Production mode:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 🤖 ML Models & Algorithms

### Recommendation Engine
- **Content-Based Filtering**: Ingredient and nutrition similarity
- **Collaborative Filtering**: User behavior patterns
- **Hybrid Approach**: Combined content and collaborative methods
- **Deep Learning**: Neural collaborative filtering (optional)

### Nutrition Analysis
- **XGBoost Regressor**: Macro and micronutrient prediction
- **Random Forest**: Nutritional completeness scoring
- **Linear Regression**: Calorie estimation models
- **Feature Engineering**: Advanced nutritional feature extraction

### Optimization Algorithms
- **Linear Programming**: OR-Tools for constraint satisfaction
- **Integer Programming**: Discrete meal selection optimization
- **Multi-Objective Optimization**: Pareto-optimal meal plans
- **Genetic Algorithms**: Evolutionary meal plan optimization

### Clustering & Segmentation
- **K-Means Clustering**: Meal categorization and variety
- **DBSCAN**: Outlier detection in nutritional data
- **Hierarchical Clustering**: Ingredient grouping
- **User Segmentation**: Behavioral pattern clustering

## 📡 API Endpoints

### Meal Recommendations
- `POST /api/recommendations/meals` - Get personalized meal recommendations
- `POST /api/recommendations/similar` - Find similar meals
- `POST /api/recommendations/batch` - Batch meal recommendations
- `GET /api/recommendations/trending` - Get trending meals

### Nutrition Analysis
- `POST /api/nutrition/analyze` - Analyze meal nutrition
- `POST /api/nutrition/predict` - Predict nutritional values
- `POST /api/nutrition/score` - Calculate nutrition score
- `POST /api/nutrition/compare` - Compare nutritional profiles

### Meal Planning
- `POST /api/planning/generate` - Generate optimized meal plan
- `POST /api/planning/optimize` - Optimize existing meal plan
- `POST /api/planning/validate` - Validate meal plan constraints
- `POST /api/planning/adjust` - Adjust meal plan parameters

### Health Analysis
- `POST /api/health/risk-assessment` - Assess dietary health risks
- `POST /api/health/impact-analysis` - Analyze nutrition impact
- `POST /api/health/recommendations` - Get health-based recommendations
- `POST /api/health/trends` - Analyze health trends

### AI Chat & Insights
- `POST /api/ai/chat` - AI-powered nutrition chat
- `POST /api/ai/insights` - Generate nutrition insights
- `POST /api/ai/summary` - Summarize dietary patterns
- `POST /api/ai/advice` - Get personalized advice

### Admin & Analytics
- `GET /api/admin/models` - Get model performance metrics
- `GET /api/admin/analytics` - System analytics and usage
- `POST /api/admin/retrain` - Trigger model retraining
- `GET /api/admin/health` - Service health check

## 🔧 Model Training & Deployment

### Training Pipeline
```bash
# Train recommendation models
python -m ml.training.recommendation_trainer

# Train nutrition prediction models
python -m ml.training.nutrition_trainer

# Train clustering models
python -m ml.training.clustering_trainer

# Evaluate all models
python -m ml.evaluation.model_evaluator
```

### Model Evaluation
```bash
# Run comprehensive evaluation
python -m ml.evaluation.evaluate_all

# Generate performance reports
python -m ml.evaluation.generate_reports

# A/B testing framework
python -m ml.evaluation.ab_testing
```

### Deployment
```bash
# Deploy models to production
python -m ml.deployment.deploy_models

# Update model versions
python -m ml.deployment.version_manager

# Monitor model performance
python -m ml.deployment.monitor
```

## 📊 Data Management

### Dataset Processing
- **Nutrition Database**: USDA FoodData Central integration
- **Recipe Processing**: Ingredient extraction and normalization
- **User Data**: Privacy-preserving user preference learning
- **Synthetic Data**: Data augmentation for model training

### Data Pipeline
```bash
# Process raw datasets
python -m app.utils.data_processor

# Update nutrition database
python -m app.utils.nutrition_updater

# Clean and validate data
python -m app.utils.data_validator

# Generate training datasets
python -m app.utils.dataset_generator
```

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
python -m pytest tests/

# Run specific test categories
python -m pytest tests/models/
python -m pytest tests/api/
python -m pytest tests/utils/
```

### Model Testing
```bash
# Test model accuracy
python -m tests.model_tests.accuracy_tests

# Test recommendation quality
python -m tests.model_tests.recommendation_tests

# Test optimization algorithms
python -m tests.model_tests.optimization_tests
```

### Performance Testing
```bash
# Load testing
python -m tests.performance.load_tests

# Latency testing
python -m tests.performance.latency_tests

# Memory usage testing
python -m tests.performance.memory_tests
```

## 📈 Monitoring & Logging

### Model Performance Monitoring
- **Accuracy Tracking**: Real-time model performance metrics
- **Drift Detection**: Data and concept drift monitoring
- **A/B Testing**: Continuous model improvement testing
- **User Feedback**: Recommendation quality feedback loop

### System Monitoring
- **API Performance**: Response time and throughput monitoring
- **Resource Usage**: CPU, memory, and GPU utilization
- **Error Tracking**: Comprehensive error logging and alerting
- **Health Checks**: Automated service health monitoring

## 🔒 Security & Privacy

### Data Privacy
- **Data Anonymization**: User data privacy protection
- **Federated Learning**: Privacy-preserving model training
- **Differential Privacy**: Statistical privacy guarantees
- **GDPR Compliance**: Data protection regulation compliance

### Model Security
- **Input Validation**: Robust input sanitization
- **Model Versioning**: Secure model deployment pipeline
- **Access Control**: API authentication and authorization
- **Audit Logging**: Comprehensive audit trail

## 🚀 Deployment & Scaling

### Production Deployment
```bash
# Docker deployment
docker build -t smartbite-ml .
docker run -p 5000:5000 smartbite-ml

# Kubernetes deployment
kubectl apply -f k8s/ml-service.yaml

# Cloud deployment (AWS/GCP/Azure)
# See deployment guides in docs/
```

### Scaling Strategies
- **Horizontal Scaling**: Multiple service instances
- **Model Caching**: Redis-based model result caching
- **Batch Processing**: Asynchronous batch recommendations
- **GPU Acceleration**: CUDA-enabled model inference

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Set up development environment
4. Make your changes
5. Add comprehensive tests
6. Ensure all tests pass
7. Submit a pull request

### Model Contribution Guidelines
- Follow scikit-learn API conventions
- Include comprehensive documentation
- Add unit tests for new models
- Provide performance benchmarks
- Include example usage

## 📚 Documentation

### API Documentation
- **Swagger/OpenAPI**: Interactive API documentation
- **Model Documentation**: Detailed model descriptions
- **Algorithm Explanations**: Mathematical foundations
- **Performance Benchmarks**: Model comparison metrics

### Research Papers & References
- Content-based recommendation systems
- Collaborative filtering algorithms
- Multi-objective optimization techniques
- Nutritional analysis methodologies

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Powered by AI/ML for intelligent nutrition and meal planning** 🤖🍽️