````markdown
# 🍽️ SmartBite – AI-Powered Meal Planner

🎥 [Watch the Demo on YouTube](https://youtu.be/oOi-JO964K0?si=3IaJPU_74WhA7m2P-link)  

SmartBite is a **full-stack web application** that generates **personalized meal recommendations and weekly diet plans** using **AI/ML models** combined with a modern web stack. It blends **nutrition science** with **machine learning optimization** to help users achieve their **health and fitness goals**.

---

## 🌟 Features
- **Content-Based Filtering** → recommends meals based on ingredients, nutrition & similarity.
- **Rule + ML Ranking** → applies dietary restrictions & ranks meals via ML models.
- **Variety via Clustering** → ensures weekly plans aren’t repetitive using K-Means.
- **Optimized Meal Planning** → solves constraints (calories, macros, cost) using OR-Tools / PuLP.
- **AI Insights** → Grok AI API generates smart summaries & nutrition insights.
- **Secure Auth & Profiles** → JWT-based login, custom diet preferences & history.
- **Modern UI/UX** → Built with React + Tailwind for speed and clarity.

---

## ⚙️ Tech Stack

### 🔹 Frontend
- React.js (with Vite bundler)
- TypeScript (for UI Components)
- Tailwind CSS (responsive UI)
- Axios (API calls)

### 🔹 Backend
- Node.js + Express (RESTful APIs)
- JWT Authentication
- Multer (uploads, if needed)

### 🔹 Database
- MongoDB (user profiles, preferences, meals)

### 🔹 AI/ML Layer
- Python-based services (Flask/FastAPI)
  - `pandas`, `numpy` (data processing)
  - `scikit-learn` (ML models: clustering, ranking)
  - `pulp` / `ortools` (meal plan optimization)
  - `xgboost` / `randomforest` (nutrition prediction)


## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Fenil412/SmartBite.git
cd SmartBite
````

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4️⃣ AI Layer Setup

```bash
cd ai
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

---

## 🔄 Contributing

### 1️⃣ Fork the Project

Click the **Fork** button at the top right.

### 2️⃣ Clone Your Fork

```bash
git clone https://github.com/your-username/SmartBite.git
cd SmartBite
```

### 3️⃣ Create a Feature Branch

```bash
git checkout -b feature-new-recommender
```

### 4️⃣ Commit Your Changes

```bash
git add .
git commit -m "Added new nutrition recommender"
```

### 5️⃣ Push & Open a PR

```bash
git push origin feature-new-recommender
```

Then open a **Pull Request**.

---

## 🎯 Why SmartBite is Unique?

* **Hybrid AI Approach** → Combines **rules, ML models, clustering, and optimization**.
* **Full-Stack Integration** → React + Node + MongoDB + Python ML.
* **Health-Oriented** → Focused on real nutrition, macros, and calorie goals.
* **Scalable Design** → Ready for cloud deployment with Docker.
* **Hackathon-Ready Demo** → Fast, intuitive UI with real AI insights.

---

## 📜 License

This project is licensed under the MIT License.

---

🚀 **Smart eating, powered by SmartBite!** 🍽️

```

