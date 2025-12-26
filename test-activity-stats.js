// Simple test script to verify the activity stats API
const axios = require('axios');

const testActivityStats = async () => {
  try {
    // You'll need to replace this with a valid access token
    const token = 'your-access-token-here';
    
    const response = await axios.get('http://localhost:8000/api/v1/users/activity-stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Activity Stats Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

// Uncomment to run the test
// testActivityStats();

console.log('Test script created. Update with valid token and uncomment to run.');