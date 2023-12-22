const mongoose = require('mongoose');

const noteSchema = mongoose.Schema(
    {
        noteFileName: {
            type: String,
            trim: true,
            unique: true,
            required: [ true, "Please enter Note file name" ],
            min: [ 1, "Note file name must have at least 1 character" ],
            max: [ 15, "Note file name should be less than 15 characters" ],
        },

        title: {
            type: String,
            trim: true,
            required: [ true, "Please enter title" ],
            min: [ 1, "Title must have at least 1 character" ],
            max: [ 15, "Title should be less than 15 characters" ],
        },

        description: {
            type: String,
            trim: true,
            required: [ true, "Please type something" ],
            min: [ 1, "Description must have at least 1 character" ],
        },

        image: {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        },

        priority: {
            type: String,
            enum: [ "High", "Normal", "Low" ],
            default: "Low",
        },

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
        timestamp: true
    }
);

module.exports = mongoose.model("NoteFile", noteSchema);
