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
            required: true
        },

        channel: {
            type: String,
            enum: ["email", "sms"],
            default: "email"
        },

        title: String,
        message: String,

        meta: {
            type: Object,
            default: {}
        },

        status: {
            type: String,
            enum: ["pending", "sent", "failed"],
            default: "pending"
        },

        error: String
    },
    { timestamps: true }
);

NotificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", NotificationSchema);
