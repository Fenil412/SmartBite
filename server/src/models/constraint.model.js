import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const ConstraintSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // one constraint profile per user
            index: true
        },

        maxCookTime: {
            type: Number, // minutes
            min: 0,
            default: 30
        },

        skillLevel: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "beginner"
        },

        appliances: {
            hasGasStove: { type: Boolean, default: true },
            hasOven: { type: Boolean, default: false },
            hasMicrowave: { type: Boolean, default: true },
            hasAirFryer: { type: Boolean, default: false },
            hasBlender: { type: Boolean, default: false }
        },

        cookingDays: {
            type: [String],
            enum: [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday"
            ],
            default: []
        }
    },
    { timestamps: true }
);

ConstraintSchema.plugin(mongoosePaginate);

export const Constraint = mongoose.model("Constraint", ConstraintSchema);
