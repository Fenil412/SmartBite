import { MealPlan } from "../models/mealPlan.model.js";
import { ApiError } from "../utils/ApiError.js";

/* ===========================
   HELPERS
=========================== */

const normalizeIngredientName = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value.toLowerCase().trim();
    if (typeof value === "object" && value.name) {
        return value.name.toLowerCase().trim();
    }
    return null;
};

// Parse ingredient string to extract quantity, unit, and name
const parseIngredient = (ingredientString) => {
    if (!ingredientString) return null;
    
    // Common patterns: "2 lbs chicken breast", "1 cup rice", "3 tbsp olive oil"
    const match = ingredientString.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s+(.+)$/);
    
    if (match) {
        const [, quantity, unit, name] = match;
        return {
            name: name.trim(),
            quantity: parseFloat(quantity),
            unit: unit || 'piece'
        };
    }
    
    // If no quantity found, assume 1 piece
    return {
        name: ingredientString.trim(),
        quantity: 1,
        unit: 'piece'
    };
};
const getCategoryForIngredient = (ingredientName) => {
    const name = ingredientName.toLowerCase();
    
    // Produce
    if (name.includes('tomato') || name.includes('onion') || name.includes('garlic') || 
        name.includes('lettuce') || name.includes('spinach') || name.includes('carrot') ||
        name.includes('bell pepper') || name.includes('cucumber') || name.includes('potato') ||
        name.includes('broccoli') || name.includes('cauliflower') || name.includes('cabbage') ||
        name.includes('apple') || name.includes('banana') || name.includes('orange') ||
        name.includes('lemon') || name.includes('lime') || name.includes('avocado')) {
        return 'Produce';
    }
    
    // Dairy
    if (name.includes('milk') || name.includes('cheese') || name.includes('butter') ||
        name.includes('yogurt') || name.includes('cream') || name.includes('egg')) {
        return 'Dairy';
    }
    
    // Meat & Seafood
    if (name.includes('chicken') || name.includes('beef') || name.includes('pork') ||
        name.includes('fish') || name.includes('salmon') || name.includes('shrimp') ||
        name.includes('turkey') || name.includes('lamb')) {
        return 'Meat';
    }
    
    // Pantry/Dry Goods
    if (name.includes('rice') || name.includes('pasta') || name.includes('flour') ||
        name.includes('sugar') || name.includes('salt') || name.includes('pepper') ||
        name.includes('oil') || name.includes('vinegar') || name.includes('beans') ||
        name.includes('lentils') || name.includes('quinoa') || name.includes('oats')) {
        return 'Pantry';
    }
    
    // Spices & Condiments
    if (name.includes('cumin') || name.includes('paprika') || name.includes('oregano') ||
        name.includes('basil') || name.includes('thyme') || name.includes('cinnamon') ||
        name.includes('ginger') || name.includes('turmeric') || name.includes('soy sauce') ||
        name.includes('ketchup') || name.includes('mustard') || name.includes('honey')) {
        return 'Condiments';
    }
    
    // Frozen
    if (name.includes('frozen')) {
        return 'Frozen';
    }
    
    // Bakery
    if (name.includes('bread') || name.includes('bagel') || name.includes('muffin') ||
        name.includes('croissant') || name.includes('roll')) {
        return 'Bakery';
    }
    
    // Beverages
    if (name.includes('juice') || name.includes('soda') || name.includes('water') ||
        name.includes('tea') || name.includes('coffee') || name.includes('wine') ||
        name.includes('beer')) {
        return 'Beverages';
    }
    
    return 'Other';
};

// Generate realistic cost estimates
const estimateItemCost = (ingredientName, quantity, unit) => {
    const name = ingredientName.toLowerCase();
    let basePrice = 2.00; // Default base price
    
    // Price mapping based on ingredient type
    if (name.includes('chicken') || name.includes('beef') || name.includes('fish')) {
        basePrice = 8.00;
    } else if (name.includes('cheese') || name.includes('butter')) {
        basePrice = 4.50;
    } else if (name.includes('olive oil') || name.includes('avocado')) {
        basePrice = 5.00;
    } else if (name.includes('rice') || name.includes('pasta') || name.includes('flour')) {
        basePrice = 1.50;
    } else if (name.includes('tomato') || name.includes('onion') || name.includes('potato')) {
        basePrice = 1.00;
    } else if (name.includes('spice') || name.includes('herb')) {
        basePrice = 3.00;
    }
    
    // Adjust for quantity and unit
    let multiplier = 1;
    if (unit === 'lb' || unit === 'pound') multiplier = quantity;
    else if (unit === 'oz' || unit === 'ounce') multiplier = quantity * 0.0625;
    else if (unit === 'kg') multiplier = quantity * 2.2;
    else if (unit === 'g' || unit === 'gram') multiplier = quantity * 0.0022;
    else if (unit === 'cup') multiplier = quantity * 0.5;
    else if (unit === 'tbsp' || unit === 'tablespoon') multiplier = quantity * 0.03;
    else if (unit === 'tsp' || unit === 'teaspoon') multiplier = quantity * 0.01;
    else multiplier = quantity * 0.1; // Default for pieces, items, etc.
    
    return Math.max(0.25, basePrice * multiplier); // Minimum 25 cents
};

/* ===========================
   AGGREGATE INGREDIENTS
=========================== */
export const buildGroceryList = async (mealPlanId, userId) => {
    const plan = await MealPlan.findOne({
        _id: mealPlanId,
        user: userId
    }).populate("days.meals.meal");

    if (!plan) throw new ApiError(404, "Meal plan not found");

    const map = new Map();
    let itemIdCounter = 1;

    plan.days.forEach(day => {
        day.meals.forEach(({ meal }) => {
            meal.ingredients?.forEach(ingredientString => {
                const parsed = parseIngredient(ingredientString);
                if (!parsed) return;
                
                const key = `${parsed.name}-${parsed.unit}`;

                if (!map.has(key)) {
                    const category = getCategoryForIngredient(parsed.name);
                    const estimatedCost = estimateItemCost(parsed.name, parsed.quantity, parsed.unit);
                    
                    map.set(key, {
                        id: `item_${itemIdCounter++}`,
                        name: parsed.name,
                        unit: parsed.unit,
                        quantity: 0,
                        estimatedCost: 0,
                        category: category,
                        purchased: false
                    });
                }

                const item = map.get(key);
                item.quantity += parsed.quantity;
                item.estimatedCost = estimateItemCost(item.name, item.quantity, item.unit);
            });
        });
    });

    const items = Array.from(map.values());
    
    // Group by category
    const categories = {};
    items.forEach(item => {
        if (!categories[item.category]) {
            categories[item.category] = [];
        }
        categories[item.category].push(item);
    });

    // Convert to array format expected by frontend
    const categoriesArray = Object.entries(categories).map(([name, items]) => ({
        name,
        items: items.sort((a, b) => a.name.localeCompare(b.name))
    }));

    return {
        categories: categoriesArray.sort((a, b) => a.name.localeCompare(b.name)),
        totalItems: items.length,
        totalEstimatedCost: items.reduce((sum, item) => sum + item.estimatedCost, 0)
    };
};

/* ===========================
   COST ESTIMATION
=========================== */
export const estimateWeeklyCost = async (mealPlanId, userId) => {
    const groceryList = await buildGroceryList(mealPlanId, userId);
    
    const categoryBreakdown = {};
    let totalCost = 0;
    
    groceryList.categories.forEach(category => {
        const categoryTotal = category.items.reduce((sum, item) => sum + item.estimatedCost, 0);
        categoryBreakdown[category.name] = categoryTotal;
        totalCost += categoryTotal;
    });
    
    // Determine budget level
    let budgetLevel = 'low';
    if (totalCost > 150) budgetLevel = 'high';
    else if (totalCost > 75) budgetLevel = 'medium';
    
    // Mock nutrition coverage
    const nutritionCoverage = {
        protein: Math.min(100, Math.round((totalCost / 200) * 100)),
        carbs: Math.min(100, Math.round((totalCost / 150) * 100)),
        fats: Math.min(100, Math.round((totalCost / 180) * 100)),
        vitamins: Math.min(100, Math.round((totalCost / 160) * 100)),
        minerals: Math.min(100, Math.round((totalCost / 170) * 100))
    };

    return {
        totalCost: Number(totalCost.toFixed(2)),
        categoryBreakdown,
        budgetLevel,
        nutritionCoverage,
        itemCount: groceryList.totalItems
    };
};

/* ===========================
   MISSING ITEMS
=========================== */
export const getMissingItems = async (mealPlanId, userId, pantryItems = []) => {
    const groceryList = await buildGroceryList(mealPlanId, userId);
    
    const pantrySet = new Set(
        pantryItems
            .map(normalizeIngredientName)
            .filter(Boolean)
    );

    const missingItems = [];
    
    groceryList.categories.forEach(category => {
        category.items.forEach(item => {
            if (!pantrySet.has(normalizeIngredientName(item.name))) {
                // Add priority based on category and cost
                let priority = 'low';
                if (item.category === 'Meat' || item.category === 'Dairy') priority = 'high';
                else if (item.category === 'Produce' || item.estimatedCost > 5) priority = 'medium';
                
                missingItems.push({
                    ...item,
                    priority
                });
            }
        });
    });

    return missingItems.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
};

/* ===========================
   GROCERY SUMMARY
=========================== */
export const getGrocerySummary = async (mealPlanId, userId) => {
    const groceryList = await buildGroceryList(mealPlanId, userId);
    const costEstimate = await estimateWeeklyCost(mealPlanId, userId);

    return {
        totalItems: groceryList.totalItems,
        purchasedCount: 0, // Will be updated by frontend based on local storage
        pendingCount: groceryList.totalItems,
        totalCost: costEstimate.totalCost,
        budgetLevel: costEstimate.budgetLevel,
        categories: groceryList.categories.map(cat => ({
            name: cat.name,
            itemCount: cat.items.length,
            estimatedCost: cat.items.reduce((sum, item) => sum + item.estimatedCost, 0)
        }))
    };
};

/* ===========================
   MARK PURCHASED
=========================== */
export const markPurchasedItems = async (mealPlanId, userId, items = []) => {
    // This is handled by frontend local storage
    // Backend just acknowledges the request
    return {
        success: true,
        message: `${items.length} items updated successfully`,
        updatedItems: items,
        timestamp: new Date().toISOString()
    };
};

/* ===========================
   STORE SUGGESTIONS
=========================== */
export const getStoreSuggestions = async () => {
    return [
        {
            id: 'store_1',
            name: 'Fresh Market Plus',
            type: 'Supermarket',
            priceRange: 'medium',
            estimatedTotal: 85.50,
            distance: '0.8 miles',
            specialOffers: [
                '20% off organic produce',
                'Buy 2 get 1 free on dairy products'
            ]
        },
        {
            id: 'store_2',
            name: 'Budget Grocery Mart',
            type: 'Discount Store',
            priceRange: 'low',
            estimatedTotal: 67.25,
            distance: '1.2 miles',
            specialOffers: [
                'Weekly specials on pantry items',
                '$5 off orders over $50'
            ]
        },
        {
            id: 'store_3',
            name: 'Premium Foods',
            type: 'Gourmet Market',
            priceRange: 'high',
            estimatedTotal: 125.75,
            distance: '0.5 miles',
            specialOffers: [
                'Free delivery on orders over $100',
                'Premium organic selection'
            ]
        },
        {
            id: 'store_4',
            name: 'QuickShop Online',
            type: 'Online Delivery',
            priceRange: 'medium',
            estimatedTotal: 92.00,
            distance: 'Delivery available',
            specialOffers: [
                'Same-day delivery available',
                'No delivery fee for first-time users'
            ]
        }
    ];
};

/* ===========================
   BUDGET ALTERNATIVES
=========================== */
export const getBudgetAlternatives = async (mealPlanId, userId) => {
    const groceryList = await buildGroceryList(mealPlanId, userId);
    const alternatives = [];
    
    groceryList.categories.forEach(category => {
        category.items.forEach(item => {
            // Only suggest alternatives for expensive items
            if (item.estimatedCost > 3.00) {
                let alternative = '';
                let savings = 0;
                let nutritionImpact = '';
                let reason = '';
                
                const name = item.name.toLowerCase();
                
                if (name.includes('organic')) {
                    alternative = item.name.replace(/organic\s*/i, '');
                    savings = item.estimatedCost * 0.3;
                    reason = 'Choose conventional over organic';
                    nutritionImpact = 'Minimal nutritional difference, same health benefits';
                } else if (name.includes('beef')) {
                    alternative = 'Ground turkey';
                    savings = item.estimatedCost * 0.25;
                    reason = 'Lean protein alternative';
                    nutritionImpact = 'Lower in saturated fat, similar protein content';
                } else if (name.includes('salmon')) {
                    alternative = 'Canned salmon';
                    savings = item.estimatedCost * 0.4;
                    reason = 'Canned version provides same nutrients';
                    nutritionImpact = 'Same omega-3 benefits, slightly higher sodium';
                } else if (name.includes('cheese')) {
                    alternative = 'Store brand cheese';
                    savings = item.estimatedCost * 0.2;
                    reason = 'Generic brand alternative';
                    nutritionImpact = 'Same nutritional profile, similar taste';
                } else if (item.estimatedCost > 5.00) {
                    alternative = `Store brand ${item.name}`;
                    savings = item.estimatedCost * 0.15;
                    reason = 'Generic brand option';
                    nutritionImpact = 'Comparable quality and nutrition';
                }
                
                if (alternative && savings > 0.50) {
                    alternatives.push({
                        id: `alt_${item.id}`,
                        originalItem: item.name,
                        alternative,
                        savings: Number(savings.toFixed(2)),
                        savingsPercentage: Math.round((savings / item.estimatedCost) * 100),
                        reason,
                        nutritionImpact,
                        category: item.category
                    });
                }
            }
        });
    });
    
    return alternatives.sort((a, b) => b.savings - a.savings);
};
