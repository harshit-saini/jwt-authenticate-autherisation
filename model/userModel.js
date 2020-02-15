const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");


// user will enter name, email, password, confirmPassword
const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "please enter yout name"]
    },
    email: {
        type: String,
        required: [true, "please enter your email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "please provide a valid email"]
    },
    password: {
        type: String,
        required: [true, "please enter password"],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, "please confirm yout password "],
        minlength: 8,
        validate: {
            // this only works on create and save 
            validator: function (el) {
                return el == this.password
            },
            message: "passwords are not the same"
        }
    },
    passwordChangesAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpiresAt: Date,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

})



userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) return next();

    // hash the password with bcrypt 
    this.password = await bcrypt.hash(this.password, 12)

    // remove the confirm password field as we do not need this 
    this.confirmPassword = undefined;

    next();
})

userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangesAt = Date.now() - 1000;

    next();
})

userSchema.methods.comparePassword = async function (candidatePassword, password) {
    return await bcrypt.compare(candidatePassword, password)
}

userSchema.methods.isPasswordChangedAt = function (JWTtimeStamp) {
    if (this.passwordChangesAt) {
        let a = parseInt(this.passwordChangesAt.getTime() / 1000, 10)

        return a > JWTtimeStamp
    }

    return false
}

const userModel = new mongoose.model("userModel", userSchema);

module.exports = userModel;