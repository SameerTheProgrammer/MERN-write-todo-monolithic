const mongoose = require('mongoose');

const folderSchema = mongoose.Schema(
    {
        folderName: {
            type: String,
            required: [ true, "Please enter folder name" ],
            trim: true,
            unique: [ true, "folder name already used" ],
            min: [ 1, "Folder name must have at least 1 character" ],
            max: [ 15, "Folder name should be less than 15 characters" ],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        notesFile: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "NoteFile",
            },
        ],
        todosFile: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "TodoFile",
            },
        ],

    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model("Folder", folderSchema);
