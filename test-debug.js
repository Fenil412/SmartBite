// Debug test to see what's happening
async function debugTest() {
  try {
    console.log('Testing server response...')
    
    const response = await fetch('http://localhost:8000/api/v1/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test', password: 'test' })
    })
    
    console.log('Status:', response.status)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))
    
    const text = await response.text()
    console.log('Response text:', text.substring(0, 200))
    
    try {
      const json = JSON.parse(text)
      console.log('Parsed JSON:', json)
    } catch (e) {
      console.log('JSON parse error:', e.message)
    }
    
  } catch (error) {
    console.error('Fetch error:', error.message)
  }
}

debugTest()