const catchAsyncErrors = require("../helper/catchAsyncErrors");
const folderModel = require('../models/folderModel');
const noteModel = require('../models/noteModel');
const todoModel = require('../models/todoModel');
const ErrorHandler = require("../helper/errorHandler")




// ---> Create a new folder ---> (user)
exports.createFolder = catchAsyncErrors(async (req, res, next) => {
    
    const {folderName} = req.body;

    // Check if a folder with the same name already exists in the user data
    const isNamed = folderModel.findOne({ folderName, user: req.user.id });
    if (isNamed) {
        return next(new ErrorHandler("Folder name already used", 500));
    }

    const folder = await folderModel.create({ folderName, user: req.user.id });
    await folder.populate("user", "name avatar")

    res.status(201).json({
        folder,
        success: true,
        message: "Folder created, now you can create some file to write some todo and notes"
    })
})

// ---> Update an existing folder ---> (user)
exports.updateFolder = catchAsyncErrors(async (req, res, next) => {

    const isFolder = await folderModel.findById(req.params.id);   //**********  req.body.id ***************
    if (!isFolder) {
        return next(new ErrorHandler("Folder not found", 404));
    }

    // checking weather this user is created this folder or not
    if (isFolder.user.toString() !== req.user.id) {
        return next(new ErrorHandler("Unauthorized access", 403));
    }

    isFolder.folderName = req.body.folderName;
    isFolder.updatedAt = new Date.now();

    await isFolder.save();

    res.status(201).json({
        isFolder,
        success: true,
        message: "Folder updated"
    })
})

// ---> Delete single folder of user ---> (user)
exports.deleteFolder = catchAsyncErrors(async (req, res, next) => {

    const folder = await folderModel.findById(req.params.id);  //**********  req.body.id ***************

    if (folder.user.toString() !== req.user.id) {
        return next(new ErrorHandler("Unauthorized access", 403));
    }

    // If the folder doesn't exist, return a 404 error
    if (!folder) {
        return next(new ErrorHandler("Folder not found", 404));
    }

    // Delete associated notes and todos
    await noteModel.deleteMany({ folder: folder._id });
    await todoModel.deleteMany({ folder: folder._id });

    await folder.remove();

    res.status(201).json({
        success: true,
        message: "Folder and associated data are deleted"
    });

});


// ---> Delete all folders of user ---> (user)
exports.deleteAllFolders = catchAsyncErrors(async (req, res, next) => {

    const userId = req.user.id;

    // removing all folder, notes and todos
    await folderModel.deleteMany({ user: userId });
    await noteModel.deleteMany({ user: userId });
    await todoModel.deleteMany({ user: userId });

    res.status(201).json({
        success: true,
        message: "All folders and associated data are deleted"
    })
})



// Delete all file of a folder ---> (user)
exports.deleteAllFiles = catchAsyncErrors(async (req, res, next) => {

    const userId = req.user.id;
    const isFolder = await folderModel.findById(req.params.id);   //**********  req.body.id ***************
    if (!isFolder) {
        return next(new ErrorHandler("Folders not found", 404));
    }

    if (isFolder.user.toString() !== userId) {
        return next(new ErrorHandler("Unauthorized access", 403));
    }

    // removing all files unde folder
    await noteModel.deleteMany({ user: userId, folder: isFolder._id });
    await todoModel.deleteMany({ user: userId, folder: isFolder._id });

    // Update the folder's notes and todos arrays
    isFolder.notes = [];
    isFolder.todos = [];
    isFolder.updatedAt = new Date.now();
    await isFolder.save();

    res.status(201).json({
        success: true,
        message: `All files of ${ isFolder.folderName } are deleted `
    })
})

// get all file of a folder ---> (user)
// exports.getAllFiles = catchAsyncErrors(async (req, res, next) => {

//     const userId = req.user.id;
//     const isFolder = await folderModel.findById(req.params.id);   
//     if (!isFolder) {
//         return next(new ErrorHandler("Folders not found", 404));
//     }

//     if (isFolder.user.toString() !== userId) {
//         return next(new ErrorHandler("Unauthorized access", 403));
//     }


//     res.status(201).json({
//         success: true,
//     })
// })







