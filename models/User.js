const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'] // Simple regex for email validation
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Ensuring the index is created in the database
UserSchema.index({ email: 1 }, { unique: true });

const UserModel = mongoose.model("User", UserSchema); // Capitalize model name for convention
module.exports = UserModel;
