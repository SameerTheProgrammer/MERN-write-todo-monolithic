const mongoose = require('mongoose');

const contactSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [ true, "Please Enter Your Name" ],
            maxLength: [ 30, "Name cannot exceed more than 30 characters" ],
            minLength: [ 2, "Name should have less than 2 characters" ],
        },
        email: {
            type: String,
            required: [ true, "Please Enter Your Email" ],
            validate: [ validator.isEmail, "Please Enter a valid Email" ],
        },
        subject:{
            type:String,
            required: [ true, "Write something" ],
            maxLength: [ 50, "Subject cannot exceed more than 30 characters" ],
            minLength: [ 2, "Subject should have more than 2 characters" ],
        },
        message:{
            type:String,
            required: [ true, "Write something" ],
            maxLength: [ 500, "Message cannot exceed more than 500 characters" ],
            minLength: [ 10, "Message should have more than 10 characters" ],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model("Contact", contactSchema);
