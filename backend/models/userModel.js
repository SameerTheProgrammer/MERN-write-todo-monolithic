const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [ true, "Please Enter Your Name" ],
            maxLength: [ 30, "Name cannot exceed 30 characters" ],
            minLength: [ 2, "Name should have less than 2 characters" ],
        },
        email: {
            type: String,
            required: [ true, "Please Enter Your Email" ],
            unique: true,
            validate: [ validator.isEmail, "Please Enter a valid Email" ],
        },
        password: {
            type: String,
            required: [ true, "Please Enter Your Password" ],
            minLength: [ 8, "Password should be greater than 8 characters" ],
            select: false,
        },

        avatar: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            default: "user",
        },

        verified: {
            type: Boolean,
            default: false,
        },

        subsription: {
            id: String,
            status: String,
        },

        trial: {
            status: {
                type: Boolean,
                default: false,
            },
            startedAt: {
                type: Date,
            },
            noOfTrial: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        timestamp: true
    }
);

// hash the user password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

// Compare Password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// JWT TOKEN
userSchema.methods.getJWTToken = function (expire) {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: expire,
    });
};

module.exports = mongoose.model("User", userSchema);
