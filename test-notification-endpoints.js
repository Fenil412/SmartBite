// Test script for notification endpoints
// Run this after starting the server: node test-notification-endpoints.js

const API_BASE = 'http://localhost:8000/api/v1'

// Test notification endpoints
async function testNotificationEndpoints() {
  console.log('🧪 Testing Notification Endpoints...\n')
  
  // You'll need to replace this with a valid JWT token from your app
  const authToken = 'YOUR_JWT_TOKEN_HERE'
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  }

  try {
    // Test 1: Get notifications
    console.log('1. Testing GET /notifications')
    const notificationsResponse = await fetch(`${API_BASE}/notifications`, {
      headers
    })
    const notificationsData = await notificationsResponse.json()
    console.log('✅ Notifications:', notificationsData.success ? 'Success' : 'Failed')
    console.log('   Count:', notificationsData.data?.notifications?.length || 0)
    
    // Test 2: Get unread count
    console.log('\n2. Testing GET /notifications/unread-count')
    const unreadResponse = await fetch(`${API_BASE}/notifications/unread-count`, {
      headers
    })
    const unreadData = await unreadResponse.json()
    console.log('✅ Unread Count:', unreadData.success ? 'Success' : 'Failed')
    console.log('   Count:', unreadData.data?.unreadCount || 0)
    
    // Test 3: Get latest notifications
    console.log('\n3. Testing GET /notifications/latest')
    const latestResponse = await fetch(`${API_BASE}/notifications/latest`, {
      headers
    })
    const latestData = await latestResponse.json()
    console.log('✅ Latest Notifications:', latestData.success ? 'Success' : 'Failed')
    console.log('   Count:', latestData.data?.notifications?.length || 0)
    
    // If we have notifications, test mark as read/unread
    if (notificationsData.data?.notifications?.length > 0) {
      const firstNotification = notificationsData.data.notifications[0]
      
      // Test 4: Mark as read
      console.log('\n4. Testing PATCH /notifications/:id/read')
      const markReadResponse = await fetch(`${API_BASE}/notifications/${firstNotification._id}/read`, {
        method: 'PATCH',
        headers
      })
      const markReadData = await markReadResponse.json()
      console.log('✅ Mark as Read:', markReadData.success ? 'Success' : 'Failed')
      
      // Test 5: Mark as unread
      console.log('\n5. Testing PATCH /notifications/:id/unread')
      const markUnreadResponse = await fetch(`${API_BASE}/notifications/${firstNotification._id}/unread`, {
        method: 'PATCH',
        headers
      })
      const markUnreadData = await markUnreadResponse.json()
      console.log('✅ Mark as Unread:', markUnreadData.success ? 'Success' : 'Failed')
    }
    
    // Test 6: Mark all as read
    console.log('\n6. Testing PATCH /notifications/mark-all-read')
    const markAllReadResponse = await fetch(`${API_BASE}/notifications/mark-all-read`, {
      method: 'PATCH',
      headers
    })
    const markAllReadData = await markAllReadResponse.json()
    console.log('✅ Mark All as Read:', markAllReadData.success ? 'Success' : 'Failed')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n📝 Instructions:')
    console.log('1. Start the server: cd server && npm run dev')
    console.log('2. Login to get a JWT token from the browser dev tools')
    console.log('3. Replace YOUR_JWT_TOKEN_HERE with the actual token')
    console.log('4. Run this test: node test-notification-endpoints.js')
  }
}

testNotificationEndpoints()