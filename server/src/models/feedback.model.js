import mongoose from "mongoose";

/* ===========================
   FEEDBACK SCHEMA
=========================== */

const FeedbackSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        meal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Meal"
        },

        mealPlan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MealPlan"
        },

        type: {
            type: String,
            enum: [
                "too_expensive",
                "too_hard_to_cook",
                "too_spicy",
                "too_many_carbs",
                "too_low_protein",
                "portion_size_issue",
                "taste_issue",
                "liked",
                "disliked"
            ],
            required: true
        },

        rating: {
            type: Number,
            min: 1,
            max: 5
        },

        comment: {
            type: String,
            trim: true
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

FeedbackSchema.index({ user: 1, createdAt: -1 });

export const Feedback = mongoose.model("Feedback", FeedbackSchema);
