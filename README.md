# SmartBite 🍽️ – AI-Powered Meal Planner

🎥 [Watch the Demo on YouTube](https://youtu.be/oOi-JO964K0?si=3IaJPU_74WhA7m2P) 

SmartBite is a **full-stack web application** designed to generate **personalized meal recommendations and weekly diet plans** using **AI/ML models** combined with a modern web stack. It blends **nutrition science** with **machine learning optimization** to help users achieve their **health and fitness goals**.

## 🌟 Features
- **Content-Based Filtering**: Recommends meals based on ingredients, nutrition, and similarity.
- **Rule + ML Ranking**: Applies dietary restrictions and ranks meals via ML models.
- **Variety via Clustering**: Ensures weekly plans aren’t repetitive using K-Means clustering.
- **Optimized Meal Planning**: Solves constraints (calories, macros, cost) using OR-Tools / PuLP.
- **AI Insights**: Grok AI API generates smart summaries and nutrition insights.
- **Secure Auth & Profiles**: JWT-based login with custom diet preferences & history.
- **Modern UI/UX**: Built with React + Tailwind for speed and clarity.

## 📦 Frontend Dependencies
- **React.js** (with Vite bundler for fast builds)
  - TypeScript (for strongly typed UI components)
  - Axios (for API requests)
- **Tailwind CSS** (for responsive styling)
  - Flexbox/Grid for layout
  - Utility classes for design consistency

## ⚙️ Backend Dependencies (Node.js & Express)
- **Core Packages**
  - `express` (RESTful APIs)
  - `jsonwebtoken` (JWT Authentication)
  - `multer` (file uploads, if needed)
- **Database**
  - `mongodb` + `mongoose` (for user profiles, preferences, meals)


## 🤖 AI/ML Layer (Python Services)
- **Core Libraries**
  - `pandas`, `numpy` (data preprocessing)
  - `scikit-learn` (ML models: clustering, ranking)
  - `xgboost`, `randomforest` (nutrition prediction)
- **Optimization**
  - `pulp`, `ortools` (meal plan optimization)
- **Deployment**
  - Flask / FastAPI (serving ML models as microservices)
  - `gunicorn` (for scalable deployment)

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Fenil412/SmartBite.git
cd SmartBite
````

### 2️⃣ Backend Setup

#### Install dependencies:

```bash
cd server
npm install
```

#### Run server:

```bash
npm start
```

### 3️⃣ AI/ML Service Setup

#### Install dependencies:

```bash
cd Models
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Run service:

```bash
python app.py
```

### 4️⃣ Frontend Setup

#### Install dependencies:

```bash
cd client
npm install
```

#### Start the frontend:

```bash
npm run dev
```

## 🔄 Contributing

### 1️⃣ Fork the Project

Click the **Fork** button at the top right of the repository.

### 2️⃣ Clone the Fork

```bash
git clone https://github.com/your-username/SmartBite.git
cd SmartBite
```

### 3️⃣ Create a Branch

```bash
git checkout -b feature-new-model
```

### 4️⃣ Make Changes & Commit

```bash
git add .
git commit -m "Added new meal recommendation model"
```

### 5️⃣ Push & Create a Pull Request

```bash
git push origin feature-new-model
```

Then open a **Pull Request** on GitHub.

## 🎯 Why SmartBite is Unique?

* **Hybrid Approach**: Combines nutrition science with ML-based optimization.
* **AI-Powered Insights**: Personalized health tips via Grok AI.
* **End-to-End Solution**: React.js frontend, Node.js backend, and Python ML services.
* **User-Centric Design**: Supports dietary preferences, restrictions, and history tracking.

## 📜 License

This project is licensed under the MIT License.

---

🚀 **Let’s make healthy eating smarter with AI! Contribute now!** 🚀


This README provides a **detailed overview**, **setup guide**, and **contribution process** for developers who want to fork and enhance your **SmartBite** project. 🚀

```

