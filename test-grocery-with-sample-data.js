// Test script to create sample meals and meal plans for grocery testing
// Run this after starting the server: node test-grocery-with-sample-data.js

const API_BASE = 'http://localhost:8000/api/v1'

// Sample meals with detailed ingredients
const sampleMeals = [
  {
    name: "Chicken Stir Fry",
    description: "Healthy chicken stir fry with vegetables",
    cuisine: "Asian",
    mealType: "dinner",
    nutrition: {
      calories: 450,
      protein: 35,
      carbs: 25,
      fats: 18,
      fiber: 5,
      sugar: 8,
      sodium: 650
    },
    ingredients: [
      "2 lbs chicken breast",
      "1 cup broccoli florets",
      "1 bell pepper",
      "2 tbsp soy sauce",
      "1 tbsp olive oil",
      "2 cloves garlic",
      "1 tsp ginger",
      "1 cup jasmine rice"
    ],
    cookingTime: 25,
    difficulty: "easy",
    servings: 4,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  {
    name: "Vegetarian Pasta",
    description: "Creamy pasta with vegetables and herbs",
    cuisine: "Italian",
    mealType: "dinner",
    nutrition: {
      calories: 380,
      protein: 12,
      carbs: 55,
      fats: 14,
      fiber: 6,
      sugar: 5,
      sodium: 420
    },
    ingredients: [
      "1 lb penne pasta",
      "2 cups cherry tomatoes",
      "1 cup spinach",
      "1/2 cup parmesan cheese",
      "3 tbsp olive oil",
      "2 cloves garlic",
      "1 cup heavy cream",
      "1 tsp dried basil",
      "1/2 tsp black pepper",
      "1 tsp salt"
    ],
    cookingTime: 20,
    difficulty: "easy",
    servings: 4,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false
  },
  {
    name: "Salmon with Quinoa",
    description: "Grilled salmon with quinoa and roasted vegetables",
    cuisine: "Mediterranean",
    mealType: "dinner",
    nutrition: {
      calories: 520,
      protein: 42,
      carbs: 35,
      fats: 22,
      fiber: 8,
      sugar: 4,
      sodium: 380
    },
    ingredients: [
      "4 salmon fillets",
      "1 cup quinoa",
      "2 cups mixed vegetables",
      "2 tbsp olive oil",
      "1 lemon",
      "2 cloves garlic",
      "1 tsp dried herbs",
      "1/2 tsp salt",
      "1/4 tsp black pepper"
    ],
    cookingTime: 30,
    difficulty: "medium",
    servings: 4,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true
  },
  {
    name: "Greek Yogurt Parfait",
    description: "Healthy breakfast with yogurt, berries, and granola",
    cuisine: "American",
    mealType: "breakfast",
    nutrition: {
      calories: 280,
      protein: 18,
      carbs: 35,
      fats: 8,
      fiber: 6,
      sugar: 22,
      sodium: 120
    },
    ingredients: [
      "2 cups greek yogurt",
      "1 cup mixed berries",
      "1/2 cup granola",
      "2 tbsp honey",
      "1/4 cup almonds",
      "1 tsp vanilla extract"
    ],
    cookingTime: 5,
    difficulty: "easy",
    servings: 2,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false
  }
];

async function testGroceryWithSampleData() {
  console.log('🧪 Testing Grocery Functionality with Sample Data...\n')
  
  // You'll need to replace this with a valid JWT token from your app
  const authToken = 'YOUR_JWT_TOKEN_HERE'
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  }

  try {
    console.log('📝 Step 1: Creating sample meals...')
    const createdMeals = []
    
    for (const meal of sampleMeals) {
      const response = await fetch(`${API_BASE}/meals`, {
        method: 'POST',
        headers,
        body: JSON.stringify(meal)
      })
      
      if (response.ok) {
        const data = await response.json()
        createdMeals.push(data.data.meal)
        console.log(`✅ Created meal: ${meal.name}`)
      } else {
        console.log(`❌ Failed to create meal: ${meal.name}`)
      }
    }
    
    if (createdMeals.length === 0) {
      console.log('❌ No meals created. Cannot proceed with meal plan creation.')
      return
    }
    
    console.log(`\n📅 Step 2: Creating meal plan with ${createdMeals.length} meals...`)
    
    // Create a meal plan with the created meals
    const mealPlan = {
      title: "Test Grocery Week",
      weekStartDate: new Date().toISOString().split('T')[0],
      days: [
        {
          day: "monday",
          meals: [
            { meal: createdMeals[3]._id, mealType: "breakfast" }, // Greek Yogurt Parfait
            { meal: createdMeals[1]._id, mealType: "dinner" }     // Vegetarian Pasta
          ]
        },
        {
          day: "tuesday", 
          meals: [
            { meal: createdMeals[3]._id, mealType: "breakfast" }, // Greek Yogurt Parfait
            { meal: createdMeals[0]._id, mealType: "dinner" }     // Chicken Stir Fry
          ]
        },
        {
          day: "wednesday",
          meals: [
            { meal: createdMeals[3]._id, mealType: "breakfast" }, // Greek Yogurt Parfait
            { meal: createdMeals[2]._id, mealType: "dinner" }     // Salmon with Quinoa
          ]
        }
      ]
    }
    
    const mealPlanResponse = await fetch(`${API_BASE}/meal-plans`, {
      method: 'POST',
      headers,
      body: JSON.stringify(mealPlan)
    })
    
    if (!mealPlanResponse.ok) {
      console.log('❌ Failed to create meal plan')
      return
    }
    
    const mealPlanData = await mealPlanResponse.json()
    const planId = mealPlanData.data.plan._id
    console.log(`✅ Created meal plan: ${planId}`)
    
    console.log('\n🛒 Step 3: Testing grocery endpoints...')
    
    // Test grocery list
    console.log('\n1. Testing grocery list generation...')
    const groceryResponse = await fetch(`${API_BASE}/meal-plans/${planId}/grocery-list`, {
      headers
    })
    
    if (groceryResponse.ok) {
      const groceryData = await groceryResponse.json()
      console.log('✅ Grocery list generated successfully!')
      console.log(`   Categories: ${groceryData.data.list.categories?.length || 0}`)
      console.log(`   Total items: ${groceryData.data.list.totalItems || 0}`)
      console.log(`   Estimated cost: $${groceryData.data.list.totalEstimatedCost?.toFixed(2) || '0.00'}`)
      
      // Show sample items
      if (groceryData.data.list.categories?.length > 0) {
        console.log('\n   Sample items:')
        groceryData.data.list.categories.slice(0, 2).forEach(category => {
          console.log(`   📦 ${category.name}:`)
          category.items.slice(0, 3).forEach(item => {
            console.log(`      - ${item.name} (${item.quantity} ${item.unit}) - $${item.estimatedCost.toFixed(2)}`)
          })
        })
      }
    } else {
      console.log('❌ Failed to generate grocery list')
    }
    
    // Test grocery summary
    console.log('\n2. Testing grocery summary...')
    const summaryResponse = await fetch(`${API_BASE}/meal-plans/${planId}/grocery-summary`, {
      headers
    })
    
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json()
      console.log('✅ Grocery summary generated successfully!')
      console.log(`   Total items: ${summaryData.data.totalItems}`)
      console.log(`   Total cost: $${summaryData.data.totalCost}`)
      console.log(`   Budget level: ${summaryData.data.budgetLevel}`)
    } else {
      console.log('❌ Failed to generate grocery summary')
    }
    
    // Test missing items
    console.log('\n3. Testing missing items detection...')
    const missingResponse = await fetch(`${API_BASE}/meal-plans/${planId}/missing-items`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        pantryItems: ['salt', 'pepper', 'olive oil', 'garlic', 'rice']
      })
    })
    
    if (missingResponse.ok) {
      const missingData = await missingResponse.json()
      console.log('✅ Missing items detected successfully!')
      console.log(`   Missing items: ${missingData.data.missing.length}`)
      
      if (missingData.data.missing.length > 0) {
        console.log('\n   High priority missing items:')
        missingData.data.missing
          .filter(item => item.priority === 'high')
          .slice(0, 3)
          .forEach(item => {
            console.log(`      - ${item.name} (${item.priority} priority) - $${item.estimatedCost.toFixed(2)}`)
          })
      }
    } else {
      console.log('❌ Failed to detect missing items')
    }
    
    // Test cost estimate
    console.log('\n4. Testing cost estimate...')
    const costResponse = await fetch(`${API_BASE}/meal-plans/${planId}/cost-estimate`, {
      headers
    })
    
    if (costResponse.ok) {
      const costData = await costResponse.json()
      console.log('✅ Cost estimate generated successfully!')
      console.log(`   Total cost: $${costData.data.totalCost}`)
      console.log(`   Budget level: ${costData.data.budgetLevel}`)
      
      if (costData.data.categoryBreakdown) {
        console.log('\n   Category breakdown:')
        Object.entries(costData.data.categoryBreakdown).forEach(([category, cost]) => {
          console.log(`      ${category}: $${cost.toFixed(2)}`)
        })
      }
    } else {
      console.log('❌ Failed to generate cost estimate')
    }
    
    // Test store suggestions
    console.log('\n5. Testing store suggestions...')
    const storeResponse = await fetch(`${API_BASE}/meal-plans/${planId}/store-suggestions`, {
      headers
    })
    
    if (storeResponse.ok) {
      const storeData = await storeResponse.json()
      console.log('✅ Store suggestions generated successfully!')
      console.log(`   Available stores: ${storeData.data.stores.length}`)
      
      if (storeData.data.stores.length > 0) {
        console.log('\n   Sample stores:')
        storeData.data.stores.slice(0, 2).forEach(store => {
          console.log(`      - ${store.name} (${store.type}) - $${store.estimatedTotal} - ${store.priceRange} price range`)
        })
      }
    } else {
      console.log('❌ Failed to get store suggestions')
    }
    
    // Test budget alternatives
    console.log('\n6. Testing budget alternatives...')
    const altResponse = await fetch(`${API_BASE}/meal-plans/${planId}/budget-alternatives`, {
      headers
    })
    
    if (altResponse.ok) {
      const altData = await altResponse.json()
      console.log('✅ Budget alternatives generated successfully!')
      console.log(`   Available alternatives: ${altData.data.alternatives.length}`)
      
      if (altData.data.alternatives.length > 0) {
        console.log('\n   Top savings opportunities:')
        altData.data.alternatives.slice(0, 3).forEach(alt => {
          console.log(`      - ${alt.originalItem} → ${alt.alternative} (Save $${alt.savings})`)
        })
      }
    } else {
      console.log('❌ Failed to get budget alternatives')
    }
    
    console.log('\n🎉 All grocery tests completed!')
    console.log(`\n📱 Frontend URL: http://localhost:5174/dashboard/grocery/${planId}`)
    console.log('💡 You can now test the grocery functionality in the frontend!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n📝 Instructions:')
    console.log('1. Start the server: cd server && npm run dev')
    console.log('2. Login to get a JWT token from the browser dev tools')
    console.log('3. Replace YOUR_JWT_TOKEN_HERE with the actual token')
    console.log('4. Run this test: node test-grocery-with-sample-data.js')
  }
}

testGroceryWithSampleData()