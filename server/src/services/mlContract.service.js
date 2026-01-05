import { User } from "../models/user.model.js";
import { Meal } from "../models/meal.model.js";
import { MealPlan } from "../models/mealPlan.model.js";
import { Feedback } from "../models/feedback.model.js";
import { Constraint } from "../models/constraint.model.js";
import crypto from 'crypto';
import axios from 'axios';

/**
 * Build ML-ready user context
 */
export const buildUserMLContext = async (userId) => {
    const user = await User.findById(userId).lean();
    if (!user) throw new Error("User not found");

    // Get user constraints (with fallback to empty object)
    const constraints = await Constraint.findOne({ user: userId }).lean() || {};

    // Get recent feedback (limit to 100 most recent)
    const feedback = await Feedback.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

    // Get recent meal plans for adherence history
    const recentPlans = await MealPlan.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('days.meals.meal', 'name cuisine mealType nutrition')
        .lean();

    // Build adherence history from meal plans
    const adherenceHistory = recentPlans.flatMap(plan =>
        plan.days.flatMap(day =>
            day.meals
                .filter(meal => meal.adherence && meal.meal) // Only include meals with adherence data
                .map(meal => ({
                    mealId: meal.meal._id,
                    mealName: meal.meal.name,
                    cuisine: meal.meal.cuisine,
                    mealType: meal.mealType,
                    status: meal.adherence.status,
                    date: day.date || plan.weekStartDate,
                    planId: plan._id
                }))
        )
    );

    return {
        user: {
            id: user._id,
            // Profile data with safe fallbacks
            age: user.profile?.age || null,
            heightCm: user.profile?.heightCm || null,
            weightKg: user.profile?.weightKg || null,
            gender: user.profile?.gender || null,
            activityLevel: user.profile?.activityLevel || 'moderate',
            goal: user.profile?.goal || 'maintain',

            // Dietary information
            dietaryPreferences: user.profile?.dietaryPreferences || [],
            dietaryRestrictions: user.profile?.dietaryRestrictions || [],
            allergies: user.profile?.allergies || [],

            // Preferences
            budgetTier: user.preferences?.budgetTier || 'medium',
            preferredCuisines: user.preferences?.preferredCuisines || [],
            units: user.preferences?.units || 'metric'
        },

        constraints: {
            cookTime: constraints.cookTime || null,
            skillLevel: constraints.skillLevel || 'beginner',
            appliances: constraints.appliances || [],
            cookingDays: constraints.cookingDays || []
        },

        feedback: feedback.map(f => ({
            id: f._id,
            type: f.type,
            rating: f.rating,
            mealId: f.meal,
            mealPlanId: f.mealPlan,
            comment: f.comment || null,
            createdAt: f.createdAt
        })),

        adherenceHistory: adherenceHistory,

        // Metadata
        contextGeneratedAt: new Date().toISOString(),
        dataVersion: '1.0'
    };
};

/**
 * Fetch meal catalog for ML
 */
export const fetchMealCatalogForML = async () => {
    const meals = await Meal.find({ isActive: true })
        .select(
            "name cuisine mealType nutrition ingredients allergens costLevel cookTime skillLevel appliances embeddingVector createdBy likedBy"
        )
        .lean();

    return meals.map(meal => ({
        id: meal._id,
        name: meal.name,
        cuisine: meal.cuisine || 'unknown',
        mealType: meal.mealType || 'dinner',
        
        // Nutrition with safe fallbacks
        nutrition: {
            calories: meal.nutrition?.calories || 0,
            protein: meal.nutrition?.protein || 0,
            carbs: meal.nutrition?.carbs || 0,
            fats: meal.nutrition?.fats || 0,
            fiber: meal.nutrition?.fiber || 0,
            sugar: meal.nutrition?.sugar || 0,
            sodium: meal.nutrition?.sodium || 0,
            glycemicIndex: meal.nutrition?.glycemicIndex || null
        },
        
        // Ingredients and allergens
        ingredients: meal.ingredients || [],
        allergens: meal.allergens || [],
        
        // Cooking constraints
        costLevel: meal.costLevel || 'medium',
        cookTime: meal.cookTime || 30,
        skillLevel: meal.skillLevel || 'beginner',
        appliances: meal.appliances || [],
        
        // ML features
        embedding: meal.embeddingVector || [],
        
        // Social features
        createdBy: meal.createdBy,
        likeCount: meal.likedBy?.length || 0,
        
        // Metadata
        lastUpdated: meal.updatedAt || meal.createdAt
    }));
};

/**
 * Get meal catalog statistics for ML monitoring
 */
export const getMealCatalogStats = async () => {
    const totalMeals = await Meal.countDocuments({ isActive: true });
    
    const cuisineStats = await Meal.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$cuisine', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    
    const mealTypeStats = await Meal.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$mealType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    
    const skillLevelStats = await Meal.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$skillLevel', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);

    return {
        totalMeals,
        cuisineDistribution: cuisineStats,
        mealTypeDistribution: mealTypeStats,
        skillLevelDistribution: skillLevelStats,
        generatedAt: new Date().toISOString()
    };
};

/**
 * ML Contract Service for secure communication with Flask AI
 * NOTE: This is kept for other ML services, but NOT used for analytics dashboard
 */
class MLContractService {
    constructor() {
        this.flaskUrl = process.env.FLASK_AI_URL || 'http://127.0.0.1:5000';
        this.internalKey = process.env.INTERNAL_HMAC_SECRET;
        
        if (!this.internalKey) {
            console.warn('INTERNAL_HMAC_SECRET not found - Flask ML services will be disabled');
            return;
        }
    }

    /**
     * Generate HMAC signature for request authentication
     */
    generateSignature(data, timestamp) {
        const payload = timestamp + JSON.stringify(data);
        return crypto.createHmac('sha256', this.internalKey).update(payload).digest('hex');
    }

    /**
     * Make authenticated request to Flask AI service
     */
    async makeRequest(endpoint, data) {
        if (!this.internalKey) {
            throw new Error('Flask ML service not configured');
        }

        const timestamp = Math.floor(Date.now() / 1000).toString();
        const signature = this.generateSignature(data, timestamp);
        
        try {
            const response = await axios.post(`${this.flaskUrl}${endpoint}`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Timestamp': timestamp,
                    'X-Signature': signature,
                    'X-Source': 'node-backend'
                },
                timeout: 30000
            });
            
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(`Flask AI Error: ${error.response.data?.message || error.response.statusText}`);
            } else if (error.request) {
                throw new Error('Flask AI service is not responding');
            } else {
                throw new Error(`Request failed: ${error.message}`);
            }
        }
    }

    /**
     * Get AI user context (for ML services, NOT analytics)
     */
    async getAIUserContext(userId) {
        try {
            const response = await this.makeRequest('/internal/user-context', {
                userId: userId
            });
            return response;
        } catch (error) {
            throw new Error(`Failed to get AI user context: ${error.message}`);
        }
    }
}

// Create singleton instance for other ML services (NOT analytics)
export const mlContractService = new MLContractService();