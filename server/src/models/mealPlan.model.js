import mongoose from "mongoose";

/* ===========================
   SUB SCHEMAS
=========================== */

const DayMealSchema = new mongoose.Schema(
    {
        mealType: {
            type: String,
            enum: ["breakfast", "lunch", "dinner", "snack"],
            required: true
        },
        meal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Meal",
            required: true
        }
    },
    { _id: false }
);

const DayPlanSchema = new mongoose.Schema(
    {
        day: {
            type: String,
            enum: [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday"
            ],
            required: true
        },
        meals: {
            type: [DayMealSchema],
            required: true
        }
    },
    { _id: false }
);

/* ===========================
   MEAL PLAN SCHEMA
=========================== */

const MealPlanSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        title: {
            type: String,
            default: "Weekly Meal Plan"
        },

        weekStartDate: {
            type: Date,
            required: true
        },

        days: {
            type: [DayPlanSchema],
            required: true
        },

        nutritionSummary: {
            calories: Number,
            protein: Number,
            carbs: Number,
            fats: Number
        },

        generatedBy: {
            type: String,
            enum: ["manual", "ai"],
            default: "ai"
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

MealPlanSchema.index({ user: 1, createdAt: -1 });

export const MealPlan = mongoose.model("MealPlan", MealPlanSchema);
