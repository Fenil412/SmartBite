import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
import uniqueValidator from "mongoose-unique-validator";

const PASSWORD_MIN_LENGTH = 8;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;

/* ===========================
   SUB-SCHEMAS
=========================== */

// 1. Profile Schema (Physical & Goals)
const ProfileSchema = new mongoose.Schema(
    {
        age: { type: Number, min: 0, required: true },
        heightCm: { type: Number, min: 0, required: true },
        weightKg: { type: Number, min: 0, required: true },
        gender: { type: String, enum: ["male", "female", "other"], default: "other" },
        activityLevel: {
            type: String,
            enum: ["sedentary", "light", "moderate", "active", "very_active"],
            required: true
        },
        goal: {
            type: String,
            enum: ["fat_loss", "muscle_gain", "maintenance"],
            required: true
        },
        dietaryPreferences: { type: [String], default: [] },
        dietaryRestrictions: { type: [String], default: [] },
        allergies: { type: [String], default: [] },
        medicalNotes: { type: String, default: "" }
    },
    { _id: false }
);

// 2. Activity History Schema (For security logging)
const ActivitySchema = new mongoose.Schema({
    action: { type: String, required: true },
    metadata: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

/* ===========================
   USER SCHEMA
=========================== */
const UserSchema = new mongoose.Schema(
    {
        // --- Identity ---
        email: {
            type: String,
            required: [true, "Email required"],
            unique: true, // This automatically creates an index!
            lowercase: true,
            trim: true,
            validate: {
                validator: (v) => validator.isEmail(v),
                message: "Invalid email format"
            }
        },
        username: {
            type: String,
            required: [true, "Username required"],
            unique: true, // This automatically creates an index!
            trim: true,
            minlength: [USERNAME_MIN_LENGTH, `Min length ${USERNAME_MIN_LENGTH}`],
            maxlength: [USERNAME_MAX_LENGTH, `Max length ${USERNAME_MAX_LENGTH}`],
            validate: {
                validator: (v) => /^[a-zA-Z0-9._-]+$/.test(v),
                message: "Username may contain letters, numbers, dot, underscore, hyphen"
            }
        },
        password: {
            type: String,
            required: true,
            select: false
        },

        // --- Personal Details ---
        name: { type: String, trim: true, required: true },
        phone: {
            type: String,
            trim: true,
            validate: {
                validator: (v) => !v || validator.isMobilePhone(v, "any"),
                message: "Invalid phone number"
            }
        },
        avatar: {
            publicId: { type: String },
            url: { type: String }
        },

        // --- System & Security ---
        roles: { type: [String], default: ["user"] },
        isVerified: { type: Boolean, default: false },
        locale: { type: String, default: "en-US" },
        timezone: { type: String, default: "UTC" },

        tokenVersion: { type: Number, default: 0 },
        refreshToken: { type: String, select: false },

        // Password Management
        passwordChangedAt: { type: Date },
        passwordExpiresAt: { type: Date },
        passwordExpiryReminderSent: { type: Boolean, default: false },

        passwordResetOtp: { type: String, select: false },
        passwordResetOtpExpiresAt: { type: Date, select: false },

        // --- App Preferences ---
        preferences: {
            units: { type: String, enum: ["metric", "imperial"], default: "metric" },
            budgetTier: { type: String, enum: ["low", "medium", "high"], default: "medium" },
            preferredCuisines: { type: [String], default: [] }
        },

        // --- Core Application Data ---
        profile: {
            type: ProfileSchema,
            required: [true, "Profile details are compulsory"]
        },

        favoriteMeals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meal" }],
        planHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Plan" }],

        // --- Logging ---
        activityHistory: { type: [ActivitySchema], default: [] },
        lastActiveAt: { type: Date },

        // --- Soft Delete ---
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date }
    },
    { timestamps: true }
);

UserSchema.plugin(uniqueValidator, { message: "{PATH} already exists" });

/* ===========================
   VIRTUAL PASSWORD
=========================== */
UserSchema.virtual("plainPassword")
    .set(function (plain) {
        this._plainPassword = plain;
        this.password = plain;
    })
    .get(function () {
        return this._plainPassword;
    });

/* ===========================
   PASSWORD VALIDATION
=========================== */
function isStrongPassword(pw) {
    if (!pw || pw.length < PASSWORD_MIN_LENGTH) return false;
    if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return false;
    return true;
}

UserSchema.pre("validate", function (next) {
    if (this.isNew || this._plainPassword) {
        if (this.isNew && !this._plainPassword && !this.password) {
            this.invalidate("password", "Password required");
        }

        if (this._plainPassword && !isStrongPassword(this._plainPassword)) {
            this.invalidate(
                "password",
                `Password must be ${PASSWORD_MIN_LENGTH}+ chars with letters & numbers`
            );
        }
    }
    next();
});

/* ===========================
   HASH BEFORE SAVE
=========================== */
UserSchema.pre("save", async function (next) {
    try {
        if (!this.isModified("password")) return next();

        if (!this.password) return next(new Error("Password required"));

        this.password = await bcrypt.hash(
            this.password,
            Number(process.env.BCRYPT_SALT_ROUNDS) || 10
        );

        next();
    } catch (err) {
        next(err);
    }
});

/* ===========================
   METHODS
=========================== */
UserSchema.methods.isPasswordCorrect = async function (plain) {
    return bcrypt.compare(plain, this.password);
};

UserSchema.methods.toPublic = function () {
    return {
        id: this._id,
        email: this.email,
        username: this.username,
        name: this.name,
        avatar: this.avatar,
        locale: this.locale,
        timezone: this.timezone,
        isVerified: this.isVerified,
        roles: this.roles,
        preferences: this.preferences,
        profile: this.profile
    };
};

/* ===========================
   INDEXES
=========================== */
// FIXED: Removed duplicate indexes for email and username.
// `unique: true` in the schema already handles them.

UserSchema.index({ "profile.goal": 1 });

/* ===========================
   EXPORT
=========================== */
export const User = mongoose.model("User", UserSchema);