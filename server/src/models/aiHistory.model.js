import mongoose from "mongoose";

const AiHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true
        },
        username: {
            type: String,
            required: true,
            index: true
        },
        type: {
            type: String,
            required: true,
            enum: [
                'chat',
                'analyze_meals', 
                'generate_weekly_plan',
                'health_risk_report',
                'nutrition_impact_summary',
                'weekly_summary',
                'meal_analysis'
            ],
            index: true
        },
        action: {
            type: String,
            required: true
        },
        request: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        response: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        success: {
            type: Boolean,
            default: true
        },
        error: {
            type: String
        },
        processingTime: {
            type: Number // in milliseconds
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    { 
        timestamps: true,
        collection: 'ai_history' // Explicitly set collection name
    }
);

// Indexes for better query performance
AiHistorySchema.index({ userId: 1, timestamp: -1 });
AiHistorySchema.index({ username: 1, timestamp: -1 });
AiHistorySchema.index({ type: 1, timestamp: -1 });
AiHistorySchema.index({ userId: 1, type: 1, timestamp: -1 });

export const AiHistory = mongoose.model("AiHistory", AiHistorySchema);