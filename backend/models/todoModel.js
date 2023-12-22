const mongoose = require('mongoose');


const todoSchema = mongoose.Schema(
    {
        todoFileName: {
            type: String,
            trim: true,
            required: [ true, "Please enter Todo file name" ],
            min: [ 1, "Todo file name have atleast 1 character" ],
            max: [ 15, "Todo file name should be less than 15 characters" ],

        },

        todo: [
            {
                description: {
                    type: String,
                    required: true,
                    max: [ 60, "Todo file name should be less than 60 characters" ],
                },
                priority: {
                    type: String,
                    enum: [ "High", "Normal", "Low" ],
                    default: "Low",
                },
                status: {
                    type: String,
                    enum: [ "Completed", "Pending", "Ongoing" ],
                    default: "Pending",
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
                updatedAt: {
                    type: Date,
                    default: Date.now,
                },


            },
        ],

        folder: {
            type: mongoose.Schema.ObjectId,
            ref: "Folder",
            required: true,
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

module.exports = mongoose.model("TodoFile", todoSchema);