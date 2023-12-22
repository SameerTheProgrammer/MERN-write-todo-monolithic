const catchAsyncErrors = require("../helper/catchAsyncErrors");
const folderModel = require("../models/folderModel");
const userModel = require("../models/userModel");
const ErrorHandler = require("../helper/errorHandler");
const sendToken = require("../helper/jwtToken");


// Get all users according to filters ---> subscribedUser, trialUser and allUser ---> (admin)
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    let filter = {};

    // Check if the request query parameter 'filter' is provided
    if (req.query.filter) {
        const filterValue = req.query.filter.toLowerCase();

        // Depending on the filter value, set the appropriate filter criteria
        if (filterValue === "subscribeduser") {
            filter = { "subsription.status": "active" };
        } else if (filterValue === "trialuser") {
            filter = { trial: true };
        }
    }

    const users = await userModel.find(filter);

    res.status(200).json({
        success: true,
        users,
    });
});

// Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findById(req.params.id);

    if (!user) {
        return next(
            new ErrorHandler(`User does not exist with Id: ${ req.params.id }`)
        );
    }

    res.status(200).json({
        success: true,
        user,
    });
});

// update User Role  --> Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {

    const user = await userModel.findById(req.params.is);
    if (!user) return next(new ErrorHandler("User not found", 400));


    if (req.user.role === user.role && req.user.role === "user")
        return next(new ErrorHandler(
            "You can't change role of admin only superAdmin can change admin role",
            400
        ));

    const options = {
        role: req.body.role
    };

    await userModel.findByIdAndUpdate(req.params.id, options, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

// Delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findById(req.params.id);

    if (!user) {
        return next(
            new ErrorHandler(`User does not exist with Id: ${ req.params.id }`, 400)
        );
    }

    if (req.user.role === user.role && user.role === "superAdmin")
    return next(new ErrorHandler(
        "You can't delete admin only superAdmin can delete admin",
        400
    ));

    // const imageId = user.avatar.public_id;

    // await cloudinary.v2.uploader.destroy(imageId);

    await user.remove();

    res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
    });
});


