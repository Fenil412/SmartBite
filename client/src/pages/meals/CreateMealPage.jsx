import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, X, Save } from 'lucide-react'
import { mealService } from '../../services/mealService'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import ImageUpload from '../../components/meals/ImageUpload'

const CreateMealPage = () => {
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: '',
    mealType: '',
    nutrition: {
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
      fiber: '',
      sugar: '',
      sodium: '',
      glycemicIndex: ''
    },
    ingredients: [''],
    allergens: [''],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
    isNutFree: false,
    costLevel: 'medium',
    prepTimeMinutes: '',
    cookTime: '',
    skillLevel: 'beginner',
    appliances: ['']
  })

  const cuisineOptions = [
    'Italian', 'Chinese', 'Indian', 'Mexican', 'Thai', 'Japanese', 
    'Mediterranean', 'American', 'French', 'Korean', 'Vietnamese'
  ]

  const mealTypeOptions = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' }
  ]

  const costLevelOptions = [
    { value: 'low', label: 'Low Cost' },
    { value: 'medium', label: 'Medium Cost' },
    { value: 'high', label: 'High Cost' }
  ]

  const skillLevelOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }))
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      error('Meal name is required')
      return false
    }
    
    if (!formData.nutrition.calories || !formData.nutrition.protein || 
        !formData.nutrition.carbs || !formData.nutrition.fats) {
      error('Basic nutrition information (calories, protein, carbs, fats) is required')
      return false
    }

    if (!formData.cookTime) {
      error('Cook time is required')
      return false
    }

    const hasValidIngredients = formData.ingredients.some(ingredient => ingredient.trim())
    if (!hasValidIngredients) {
      error('At least one ingredient is required')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Create FormData for file upload
      const submitData = new FormData()

      // Add image if selected
      if (selectedImage) {
        submitData.append('image', selectedImage)
      }

      // Clean up the data
      const cleanedData = {
        ...formData,
        nutrition: {
          calories: parseInt(formData.nutrition.calories) || 0,
          protein: parseInt(formData.nutrition.protein) || 0,
          carbs: parseInt(formData.nutrition.carbs) || 0,
          fats: parseInt(formData.nutrition.fats) || 0,
          fiber: parseInt(formData.nutrition.fiber) || 0,
          sugar: parseInt(formData.nutrition.sugar) || 0,
          sodium: parseInt(formData.nutrition.sodium) || 0,
          glycemicIndex: parseInt(formData.nutrition.glycemicIndex) || undefined
        },
        ingredients: formData.ingredients.filter(item => item.trim()),
        allergens: formData.allergens.filter(item => item.trim()),
        appliances: formData.appliances.filter(item => item.trim()),
        prepTimeMinutes: parseInt(formData.prepTimeMinutes) || undefined,
        cookTime: parseInt(formData.cookTime) || 0
      }

      // Remove empty fields
      if (!cleanedData.description?.trim()) delete cleanedData.description
      if (!cleanedData.cuisine) delete cleanedData.cuisine
      if (!cleanedData.mealType) delete cleanedData.mealType
      if (cleanedData.allergens.length === 0) delete cleanedData.allergens
      if (cleanedData.appliances.length === 0) delete cleanedData.appliances
      if (!cleanedData.nutrition.glycemicIndex) delete cleanedData.nutrition.glycemicIndex

      // Add all form fields to FormData
      Object.keys(cleanedData).forEach(key => {
        if (key === 'nutrition') {
          submitData.append('nutrition', JSON.stringify(cleanedData.nutrition))
        } else if (Array.isArray(cleanedData[key])) {
          cleanedData[key].forEach(item => {
            submitData.append(`${key}[]`, item)
          })
        } else if (cleanedData[key] !== undefined && cleanedData[key] !== null && cleanedData[key] !== '') {
          submitData.append(key, cleanedData[key])
        }
      })

      const response = await mealService.createMeal(submitData)
      
      if (response.success) {
        success('Meal created successfully!')
        navigate(`/dashboard/meals/${response.data.meal._id}`)
      }
    } catch (err) {
      error(err.message || 'Failed to create meal')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <button
          onClick={() => navigate('/dashboard/meals')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to meals</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Meal
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your delicious recipe with the community
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Basic Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meal Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter meal name"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows="3"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Describe your meal..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cuisine
              </label>
              <select
                value={formData.cuisine}
                onChange={(e) => handleInputChange('cuisine', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select cuisine</option>
                {cuisineOptions.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meal Type
              </label>
              <select
                value={formData.mealType}
                onChange={(e) => handleInputChange('mealType', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select meal type</option>
                {mealTypeOptions.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <ImageUpload
            onImageChange={setSelectedImage}
            onImageRemove={() => setSelectedImage(null)}
          />
        </div>

        {/* Nutrition Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Nutrition Information *
          </h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Calories *
              </label>
              <input
                type="number"
                value={formData.nutrition.calories}
                onChange={(e) => handleInputChange('nutrition.calories', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Protein (g) *
              </label>
              <input
                type="number"
                value={formData.nutrition.protein}
                onChange={(e) => handleInputChange('nutrition.protein', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Carbs (g) *
              </label>
              <input
                type="number"
                value={formData.nutrition.carbs}
                onChange={(e) => handleInputChange('nutrition.carbs', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fats (g) *
              </label>
              <input
                type="number"
                value={formData.nutrition.fats}
                onChange={(e) => handleInputChange('nutrition.fats', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fiber (g)
              </label>
              <input
                type="number"
                value={formData.nutrition.fiber}
                onChange={(e) => handleInputChange('nutrition.fiber', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sugar (g)
              </label>
              <input
                type="number"
                value={formData.nutrition.sugar}
                onChange={(e) => handleInputChange('nutrition.sugar', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sodium (mg)
              </label>
              <input
                type="number"
                value={formData.nutrition.sodium}
                onChange={(e) => handleInputChange('nutrition.sodium', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Glycemic Index
              </label>
              <input
                type="number"
                value={formData.nutrition.glycemicIndex}
                onChange={(e) => handleInputChange('nutrition.glycemicIndex', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Ingredients *
          </h2>
          
          <div className="space-y-3">
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleArrayChange('ingredients', index, e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={`Ingredient ${index + 1}`}
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('ingredients', index)}
                    className="p-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addArrayItem('ingredients')}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add ingredient</span>
            </button>
          </div>
        </div>

        {/* Allergens */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Allergens
          </h2>
          
          <div className="space-y-3">
            {formData.allergens.map((allergen, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={allergen}
                  onChange={(e) => handleArrayChange('allergens', index, e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={`Allergen ${index + 1}`}
                />
                {formData.allergens.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('allergens', index)}
                    className="p-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addArrayItem('allergens')}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add allergen</span>
            </button>
          </div>
        </div>

        {/* Diet Compatibility */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Diet Compatibility
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { key: 'isVegetarian', label: 'Vegetarian' },
              { key: 'isVegan', label: 'Vegan' },
              { key: 'isGlutenFree', label: 'Gluten Free' },
              { key: 'isDairyFree', label: 'Dairy Free' },
              { key: 'isNutFree', label: 'Nut Free' }
            ].map(diet => (
              <label key={diet.key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[diet.key]}
                  onChange={(e) => handleInputChange(diet.key, e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-gray-700 dark:text-gray-300">{diet.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cooking Details */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Cooking Details
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cook Time (minutes) *
              </label>
              <input
                type="number"
                value={formData.cookTime}
                onChange={(e) => handleInputChange('cookTime', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="30"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prep Time (minutes)
              </label>
              <input
                type="number"
                value={formData.prepTimeMinutes}
                onChange={(e) => handleInputChange('prepTimeMinutes', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="15"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cost Level
              </label>
              <select
                value={formData.costLevel}
                onChange={(e) => handleInputChange('costLevel', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {costLevelOptions.map(cost => (
                  <option key={cost.value} value={cost.value}>{cost.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skill Level
              </label>
              <select
                value={formData.skillLevel}
                onChange={(e) => handleInputChange('skillLevel', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {skillLevelOptions.map(skill => (
                  <option key={skill.value} value={skill.value}>{skill.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Appliances */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Required Appliances
          </h2>
          
          <div className="space-y-3">
            {formData.appliances.map((appliance, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={appliance}
                  onChange={(e) => handleArrayChange('appliances', index, e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={`Appliance ${index + 1} (e.g., oven, microwave)`}
                />
                {formData.appliances.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('appliances', index)}
                    className="p-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addArrayItem('appliances')}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add appliance</span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/meals')}
            className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isSubmitting ? 'Creating...' : 'Create Meal'}</span>
          </button>
        </div>
      </motion.form>
    </div>
  )
}

export default CreateMealPage