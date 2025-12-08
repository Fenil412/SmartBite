import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
import uniqueValidator from "mongoose-unique-validator";

const PASSWORD_MIN_LENGTH = 8;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;

/* ===========================
   PROFILE SUB-SCHEMA
=========================== */
const ProfileSchema = new mongoose.Schema(
    {
        age: { type: Number, min: 0 },
        heightCm: { type: Number, min: 0 },
        weightKg: { type: Number, min: 0 },
        gender: { type: String, enum: ["male", "female", "other"], default: "other" },
        activityLevel: {
            type: String,
            enum: ["sedentary", "light", "moderate", "active", "very_active"]
        },
        goal: {
            type: String,
            enum: ["fat_loss", "muscle_gain", "maintenance"]
        },

        dietaryPreferences: { type: [String], default: [] },
        dietaryRestrictions: { type: [String], default: [] },
        allergies: { type: [String], default: [] },

        medicalNotes: { type: String, default: "" }
    },
    { _id: false }
);

/* ===========================
   USER SCHEMA
=========================== */
const UserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email required"],
            unique: true,
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
            unique: true,
            trim: true,
            minlength: [USERNAME_MIN_LENGTH, `Min length ${USERNAME_MIN_LENGTH}`],
            maxlength: [USERNAME_MAX_LENGTH, `Max length ${USERNAME_MAX_LENGTH}`],
            validate: {
                validator: (v) => /^[a-zA-Z0-9._-]+$/.test(v),
                message: "Username may contain letters, numbers, dot, underscore, hyphen"
            }
        },

        passwordHash: {
            type: String,
            required: true,
            select: false
        },

        name: { type: String, trim: true, default: "" },
        phone: {
            type: String,
            trim: true,
            validate: {
                validator: (v) => !v || validator.isMobilePhone(v, "any"),
                message: "Invalid phone number"
            }
        },

        locale: { type: String, default: "en-US" },
        timezone: { type: String, default: "UTC" },
        isVerified: { type: Boolean, default: false },
        roles: { type: [String], default: ["user"] },

        preferences: {
            units: { type: String, enum: ["metric", "imperial"], default: "metric" },
            budgetTier: { type: String, enum: ["low", "medium", "high"], default: "medium" },
            preferredCuisines: { type: [String], default: [] }
        },

        refreshToken: { type: String, select: false },
        lastActiveAt: { type: Date },

        profile: { type: ProfileSchema, default: {} },

        favoriteMeals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meal" }],
        planHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Plan" }]
    },
    { timestamps: true }
);

UserSchema.plugin(uniqueValidator, { message: "{PATH} already exists" });

/* ===========================
   VIRTUAL PASSWORD
=========================== */
UserSchema.virtual("password")
    .set(function (plain) {
        this._plainPassword = plain;
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
        if (!this._plainPassword) {
            this.invalidate("password", "Password required");
            return next(new Error("Password required"));
        }

        if (!isStrongPassword(this._plainPassword)) {
            this.invalidate(
                "password",
                `Password must be ${PASSWORD_MIN_LENGTH}+ chars with letters & numbers`
            );
            return next(new Error("Weak password"));
        }
    }
    next();
});

/* ===========================
   HASH BEFORE SAVE
=========================== */
UserSchema.pre("save", async function (next) {
    try {
        if (this._plainPassword) {
            const salt = await bcrypt.genSalt(10);
            this.passwordHash = await bcrypt.hash(this._plainPassword, salt);
            this._plainPassword = undefined;
        }
        if (!this.lastActiveAt) this.lastActiveAt = new Date();
        next();
    } catch (err) {
        next(err);
    }
});

/* ===========================
   METHODS
=========================== */
UserSchema.methods.verifyPassword = async function (plain) {
    return bcrypt.compare(plain, this.passwordHash);
};

UserSchema.methods.toPublic = function () {
    return {
        id: this._id,
        email: this.email,
        username: this.username,
        name: this.name,
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
UserSchema.index({ "profile.goal": 1 });

/* ===========================
   EXPORT (NAMED EXPORT)
=========================== */
export const User = mongoose.model("User", UserSchema);
