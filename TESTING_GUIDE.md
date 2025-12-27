# Testing Guide for Profile & Activity Features

## ✅ Features Implemented

### 1. **Editable Profile Page**
- Click "Edit Profile" button to enter edit mode
- All fields are now editable with proper form controls
- Save/Cancel functionality with loading states
- Calls both `updateUserData` and `storeAdditionalData` APIs

### 2. **Complete API Integration**
- **PUT /users/update**: Updates basic info, profile, and preferences
- **PUT /users/additional-data**: Stores dietary info, favorite meals, etc.
- **GET /users/activity-stats**: Gets activity statistics
- **GET /users/activity**: Gets activity history with filtering

### 3. **Activity History Filtering**
- **All Time**: Shows all activities
- **Today**: Shows only today's activities
- **This Week**: Shows activities from last 7 days
- **This Month**: Shows activities from last 30 days

## 🧪 Manual Testing Steps

### Testing Profile Edit Functionality

1. **Navigate to Profile Page**
   - Go to `/dashboard/profile`
   - Verify all sections display current user data

2. **Enter Edit Mode**
   - Click "Edit Profile" button
   - Verify all fields become editable
   - Check that buttons change to "Save Changes" and "Cancel"

3. **Test Basic Information Editing**
   - Edit Full Name
   - Edit Phone Number
   - Verify Email and Username are read-only

4. **Test Physical Information Editing**
   - Change Age (number input)
   - Change Height in cm (number input)
   - Change Weight in kg (number input)
   - Change Gender (dropdown)
   - Change Activity Level (dropdown)
   - Change Goal (dropdown)

5. **Test Preferences Editing**
   - Change Units (metric/imperial)
   - Change Budget Tier (low/medium/high)
   - Add/Remove Preferred Cuisines (press Enter to add, × to remove)

6. **Test Dietary Information Editing**
   - Add/Remove Dietary Preferences
   - Add/Remove Dietary Restrictions
   - Add/Remove Allergies
   - Edit Medical Notes (textarea)

7. **Test Additional Settings (Edit Mode Only)**
   - Add Favorite Meal IDs
   - Remove Favorite Meal IDs

8. **Save Changes**
   - Click "Save Changes"
   - Verify loading state shows
   - Check for success message
   - Verify data persists after page refresh

### Testing Activity History Filtering

1. **Navigate to Activity/History Page**
   - Go to `/dashboard/activity`
   - Verify activity stats cards display

2. **Test Filter Options**
   - Select "All Time" - should show all activities
   - Select "Today" - should show only today's activities
   - Select "This Week" - should show last 7 days
   - Select "This Month" - should show last 30 days

3. **Verify Activity Stats**
   - Check Total Activities count
   - Check Active Days count
   - Check This Week count
   - Check Last Active date

## 🔧 API Testing

### Test Profile Update APIs

```bash
# Test updateUserData API
curl -X PUT http://localhost:8000/api/v1/users/update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe Updated",
    "phone": "+1234567890",
    "profile": {
      "age": 30,
      "heightCm": 175,
      "weightKg": 70,
      "gender": "male",
      "activityLevel": "moderate",
      "goal": "muscle_gain"
    },
    "preferences": {
      "units": "metric",
      "budgetTier": "medium",
      "preferredCuisines": ["Italian", "Indian"]
    }
  }'

# Test storeAdditionalData API
curl -X PUT http://localhost:8000/api/v1/users/additional-data \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "budgetTier": "medium",
    "preferredCuisines": ["Indian", "Italian"],
    "units": "metric",
    "dietaryPreferences": ["vegetarian"],
    "dietaryRestrictions": [],
    "allergies": ["peanuts"],
    "medicalNotes": "None",
    "favoriteMeals": ["693e4dda9027897aec930c7a"]
  }'

# Test activity stats API
curl -X GET http://localhost:8000/api/v1/users/activity-stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test activity history API
curl -X GET http://localhost:8000/api/v1/users/activity \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 Common Issues & Solutions

### Issue: Edit button doesn't make fields editable
**Solution**: Check browser console for JavaScript errors. Verify React state is updating correctly.

### Issue: Save button doesn't work
**Solution**: 
1. Check network tab for API calls
2. Verify authentication token is valid
3. Check server logs for errors

### Issue: Activity filtering doesn't work
**Solution**: 
1. Verify activity data is being fetched
2. Check date filtering logic in `loadActivityData` function
3. Ensure activities have valid `createdAt` timestamps

### Issue: API returns 401 Unauthorized
**Solution**: 
1. Login again to get fresh tokens
2. Check if tokens are being sent in request headers
3. Verify token hasn't expired

## 📊 Expected Data Flow

### Profile Update Flow
1. User clicks "Edit Profile"
2. Form fields become editable
3. User modifies data
4. User clicks "Save Changes"
5. Frontend calls `updateUserData` API
6. Frontend calls `storeAdditionalData` API
7. Both APIs update MongoDB
8. Frontend updates local state
9. UI refreshes with new data
10. Success message shown

### Activity Filtering Flow
1. User selects filter option
2. `loadActivityData` function called
3. Raw activity data fetched from API
4. Data filtered based on selected timeframe
5. Filtered data sorted by date (newest first)
6. UI updates with filtered activities
7. Stats recalculated for filtered data

## ✅ Success Criteria

- ✅ All profile fields are editable
- ✅ Save functionality works for all data types
- ✅ Both APIs are called correctly
- ✅ Data persists after page refresh
- ✅ Activity filtering works for all time periods
- ✅ Activity stats update correctly
- ✅ Error handling works properly
- ✅ Loading states provide user feedback
- ✅ Form validation prevents invalid data
- ✅ UI is responsive and user-friendly

## 🚀 Ready for Production

All features have been implemented and tested:
- Complete profile editing functionality
- Proper API integration with both endpoints
- Working activity history filtering
- Error handling and loading states
- Responsive design and user feedback