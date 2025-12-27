// Test script for the new API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api/v1';

// Test data for storeAdditionalData
const additionalData = {
  "budgetTier": "medium",
  "preferredCuisines": ["Indian", "Italian"],
  "units": "metric",
  "dietaryPreferences": ["vegetarian"],
  "dietaryRestrictions": [],
  "allergies": ["peanuts"],
  "medicalNotes": "None",
  "favoriteMeals": ["693e4dda9027897aec930c7a"]
};

// Test data for updateUserData
const updateData = {
  "fullName": "John Doe",
  "phone": "+919913312353",
  "profile": {
    "age": 65,
    "heightCm": 171,
    "weightKg": 74,
    "gender": "male",
    "activityLevel": "moderate",
    "goal": "muscle_gain",
    "dietaryPreferences": ["vegetarian"],
    "dietaryRestrictions": [],
    "allergies": ["peanuts"],
    "medicalNotes": "None"
  },
  "preferences": {
    "preferredCuisines": ["Indian", "Italian"],
    "budgetTier": "medium"
  }
};

const testEndpoints = async () => {
  try {
    // You'll need to replace this with a valid access token
    const token = 'your-access-token-here';
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('Testing API endpoints...\n');

    // Test 1: Activity Stats
    console.log('1. Testing GET /users/activity-stats');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/users/activity-stats`, { headers });
      console.log('✅ Activity Stats Response:', statsResponse.data);
    } catch (error) {
      console.log('❌ Activity Stats Error:', error.response?.data || error.message);
    }

    // Test 2: Store Additional Data
    console.log('\n2. Testing PUT /users/additional-data');
    try {
      const additionalResponse = await axios.put(`${BASE_URL}/users/additional-data`, additionalData, { headers });
      console.log('✅ Store Additional Data Response:', additionalResponse.data);
    } catch (error) {
      console.log('❌ Store Additional Data Error:', error.response?.data || error.message);
    }

    // Test 3: Update User Data
    console.log('\n3. Testing PUT /users/update');
    try {
      const updateResponse = await axios.put(`${BASE_URL}/users/update`, updateData, { headers });
      console.log('✅ Update User Data Response:', updateResponse.data);
    } catch (error) {
      console.log('❌ Update User Data Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('General Error:', error.message);
  }
};

// Uncomment to run the test
// testEndpoints();

console.log('Test script created. Update with valid token and uncomment testEndpoints() to run.');
console.log('\nAPI Endpoints to test:');
console.log('- GET /users/activity-stats');
console.log('- PUT /users/additional-data');
console.log('- PUT /users/update');