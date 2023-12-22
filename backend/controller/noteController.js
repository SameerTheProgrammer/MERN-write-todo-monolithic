const catchAsyncErrors = require("../helper/catchAsyncErrors");
const folderModel = require('../models/folderModel');
const noteModel = require('../models/noteModel');
const ErrorHandler = require("../helper/errorHandler")
const sanitizeHtml = require('sanitize-html');


// Create a new note in a folder -----> (user)
exports.createNoteFile = catchAsyncErrors(async (req, res, next) => {

    const {id}= req.params;
    const folder = await folderModel.findById(id);
    const userId = req.user.id;

    if (!folder) {
        return next(new ErrorHandler("Folder not found", 404));
    }

    const {noteFileName, description}= req.body;

    // Check if a note with the same name already exists in the folder
    const isNamed = await noteModel.findOne({
        noteFileName,
        user:userId
    });
    if (isNamed) {
        return next(new ErrorHandler("notes file name already used", 500));
    }

    // Sanitize user-generated content before saving it to the database
    const sanitizedDescription = sanitizeHtml(description);

    const content = {
        ...req.body,
        description: sanitizedDescription,
        user: userId,
        image: {
            public_id: "",
            url: "",
        }
    }

    const newNote = await noteModel.create(content);

    // pushing reference of this note to folder model
    folder.noteFile.push(newNote._id);

    await folder.save();

    res.status(201).json({
        newNote,
        sucsess: true,
        message: "Note Created"
    })
})


// Update an existing note ---> (user)
exports.updateNote = catchAsyncErrors(async (req, res, next) => {

    // Fetch the note document and chech note exist yes or no
    const isNote = await noteModel.findById(req.params.id);
    if (!isNote) {
        return next(new ErrorHandler("Note not found", 404));
    }

    if (isNote.user.toString() !== req.user.id) {
        return next(new ErrorHandler("Unauthorized access", 403));
    }

    const isNamed = await noteModel.findOne({ noteFileName: req.body.noteFileName, });
    if (isNamed) {
        return next(new ErrorHandler("Note file name already used", 500));
    }

    // Sanitize user-generated content before saving it to the database
    const sanitizedDescription = sanitizeHtml(req.body.description);

    // Update the note document
    isNote.noteFileName = req.body.noteFileName;
    isNote.description = sanitizedDescription;
    isNote.image = {
        public_id: "",
        url: "",
    };
    isNote.updatedAt = new Date.now()

    await isNote.save();

    res.status(201).json({
        updatedNote: isNote,
        sucsess: true,
        message: "Note Updated"
    })
})


// Delete a note   ---> (user)
exports.deleteNote = catchAsyncErrors(async (req, res, next) => {

    const note = await noteModel.findById(req.params.id);

    if (!note) {
        return next(new ErrorHandler("Note not found"));
    }

    if (note.user.toString() !== req.user.id) {
        return next(new ErrorHandler("Unauthorized access", 403));
    }

    await note.remove();

    // removing note reference from folder model
    await folderModel.findOneAndUpdate({noteFile: note.id},{          // await folderModel.findByIdAndUpdate(note.folder,{   
        $pull:{
            noteFile:{
                _id:note._id, 
            },
        },
    });
   

    res.status(201).json({
        success: true,
        message: "Note deleted"
    });

})


// Get a single note ---> (user)
exports.getNote = catchAsyncErrors(async (req, res, next) => {

    const note = await noteModel.findById(req.params.id); 

    if (!note) {
        return next(new ErrorHandler("Note not found"));
    }

    if (note.user.toString() !== req.user.id) {
        return next(new ErrorHandler("Unauthorized access", 403));
    }

    res.status(201).json({
        note,
        success: true,
        message: "Note deleted"
    });

})



