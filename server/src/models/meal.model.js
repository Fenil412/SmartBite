import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

/* ===========================
   SUB SCHEMAS
=========================== */

const NutritionSchema = new mongoose.Schema(
    {
        calories: { type: Number, required: true },
        protein: { type: Number, required: true },
        carbs: { type: Number, required: true },
        fats: { type: Number, required: true },
        fiber: { type: Number, default: 0 },
        sugar: { type: Number, default: 0 },
        sodium: { type: Number, default: 0 },
        glycemicIndex: { type: Number }
    },
    { _id: false }
);

/* ===========================
   MEAL SCHEMA
=========================== */

const MealSchema = new mongoose.Schema(
    {
        // Basic info
        name: { type: String, required: true, trim: true },
        description: { type: String },
        cuisine: { type: String, index: true },
        mealType: {
            type: String,
            enum: ["breakfast", "lunch", "dinner", "snack"],
        },

        // Nutrition
        nutrition: { type: NutritionSchema, required: true },

        // Ingredients
        ingredients: [{ type: String, trim: true }],
        allergens: [{ type: String }],

        // Diet compatibility
        isVegetarian: { type: Boolean, default: false },
        isVegan: { type: Boolean, default: false },
        isGlutenFree: { type: Boolean, default: false },
        isDairyFree: { type: Boolean, default: false },
        isNutFree: { type: Boolean, default: false },

        // Cost & prep
        costLevel: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        prepTimeMinutes: { type: Number },

        // Media
        image: {
            publicId: String,
            url: String
        },

        // ML support
        embeddingVector: {
            type: [Number],
            select: false // used by Python service
        },

        cookTime: { type: Number, required: true }, // minutes
        skillLevel: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "beginner"
        },
        appliances: { type: [String], default: [] },

        // Ownership & stats
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        isActive: { type: Boolean, default: true },
        
        // Admin approval status
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "approved"
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        reviewedAt: { type: Date }
    },
    { timestamps: true }
);

MealSchema.plugin(mongoosePaginate);

/* ===========================
   INDEXES
=========================== */

MealSchema.index({ cuisine: 1, mealType: 1 });
MealSchema.index({ "nutrition.calories": 1 });
MealSchema.index({ createdBy: 1 });

export const Meal = mongoose.model("Meal", MealSchema);
