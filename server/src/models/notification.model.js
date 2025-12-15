import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        event: {
            type: String,
            required: true,
            index: true
        },

        channels: {
            email: {
                status: { type: String, enum: ["success", "failed"], default: "failed" },
                error: String
            },
            sms: {
                status: { type: String, enum: ["success", "failed"], default: "failed" },
                error: String
            }
        },

        payload: {
            type: Object,
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "sent", "failed"],
            default: "pending"
        },

        attempts: {
            type: Number,
            default: 0
        },

        lastError: {
            type: String
        },

        sentAt: Date
    },
    { timestamps: true }
);

NotificationSchema.index({ status: 1, createdAt: 1 });

export const Notification = mongoose.model("Notification", NotificationSchema);
