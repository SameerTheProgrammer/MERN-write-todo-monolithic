const catchAsyncErrors = require("../helper/catchAsyncErrors");
const folderModel = require("../models/folderModel");
const userModel = require("../models/userModel");
const ErrorHandler = require("../helper/errorHandler");
const sendToken = require("../helper/jwtToken");

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, cpassword } = req.body;

    if (password !== cpassword) {
        return next(
            new ErrorHandler("comfirm Password and password does not match")
        );
    }

    const isUser = await userModel.findOne({ email });
    if (!isUser) {
        return next(
            new ErrorHandler(
                "This email address already exists,try with a different email address"
            ),
            400
        );
    }

    const newUser = await userModel.create({
        name,
        email,
        password,
        avatar,
    });

    const emailVerificationToken = user.getJWTToken(
        process.env.JWT_EXPIRE_VERIFICATION
    );
    const url = `${ process.env.FRONTEND_URL }/activate/${ emailVerificationToken }`;
    sendVerificationEmail(user.email, user.name, url);

    res.status(201).json({
        newUser,
        success: true,
        message: "Registration successful",
    });
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // checking if user has given password and email both

    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email & Password", 400));
    }

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    if (user.verified !== true) {
        return next(
            new ErrorHandler(
                "Please Verify Your account. Verification link sended in you gmail"
            ),
            401
        );
    }

    sendToken(user, 200, res);
});

// Logout User
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.cookie("writeDailyUser", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged Out",
    });
});

// send verification link
exports.sendVerification = async (req, res) => {
    const email = req.body.email;
    const user = await userModel.find(email);
    if (user.verified === true) {
        return res.status(400).json({
            message: "This account is already activated.",
        });
    }

    const emailVerificationToken = user.getJWTToken(
        process.env.JWT_EXPIRE_VERIFICATION
    );
    const url = `${ process.env.FRONTEND_URL }/activate/${ emailVerificationToken }`;
    sendVerificationEmail(user.email, user.name, url);

    return res.status(200).json({
        message: "Email verification link has been sent to your email.",
    });
};

// activiting user account to login
exports.activateAccount = async (req, res) => {
    const { emailVerificationToken } = req.body;
    const user = jwt.verify(emailVerificationToken, process.env.JWT_SECRET);
    const check = await userModel.findById(user.id);

    if (check.verified == true) {
        return res
            .status(400)
            .json({ message: "This email is already activated." });
    } else {
        await userModel.findByIdAndUpdate(user.id, { verified: true });
        return res
            .status(200)
            .json({ message: "Account has beeen activated successfully." });
    }
};

// update user profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const { name, email, avatar } = req.body;

    const isUser = await userModel.findOne({ email });
    if (!isUser) {
        return next(
            new ErrorHandler(
                "This email address already exists,try with a different email address"
            ),
            400
        );
    }

    if (isUser._id.toString() !== req.user.id) {
        return next(new ErrorHandler("Unauthorized access", 403));
    }

    isUser.name = name;
    isUser.email = email;
    isUser.avatar = avatar;
    const updatedUser = await isUser.save();

    sendToken(updatedUser, 200, res);
});

// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findById(req.user.id).select("+password");

    if (user._id.toString() !== req.user.id) {
        return next(new ErrorHandler("Unauthorized access", 403));
    }

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.cPassword) {
        return next(new ErrorHandler("password does not match", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
});

// forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
        return next(new ErrorHandler("Invalid email", 401));
    }

    const ResetPasswordtoken = user.getJWTToken(
        process.env.JWT_EXPIRE_RESET_PASSWORD
    );
    const url = `${ process.env.FRONTEND_URL }/resetPassword/${ ResetPasswordtoken }`;
    sendResetPasswordLink(user.email, user.name, url);

    res.status(200).json({
        success: true,
        message: "Reset link sended",
    });
});

// reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { ResetPasswordtoken, newPassword, cNewPassword } = req.body;

    if (newPassword !== cNewPassword) {
        return next(
            new ErrorHandler("New Password and Comfirm Password should match", 404)
        );
    }

    const user = jwt.verify(ResetPasswordtoken, process.env.JWT_SECRET);

    if (!user) {

        return next(new ErrorHandler("Invalid reset link", 404));
    }

    const check = await userModel.findById(user.id);

    if (!check) {
        return next(new ErrorHandler("Invalid reset link", 404));
    }

    check.password = newPassword;

    await check.save();

    return res.status(200).json({
        user: check,
        success: true,
        message: "Password has beeen changed successfully.",
    });
});

// Get User Detail
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});


// ---> get all folders and user details ---> (user)
exports.getAllFolder = catchAsyncErrors(async (req, res, next) => {
    const userDetail = await userModel.findById(req.user.id);

    const folders = await folderModel
        .find({ user: req.user.id })
        .populate({
            path: "noteFile",
            select: "noteFileName priority",
            options: { sort: { updatedAt: -1 } }, // Sort noteFile objects within each folder
        })
        .populate({
            path: "todoFile",
            select: "todoFileName",
            options: { sort: { updatedAt: -1 } }, // Sort todoFile objects within each folder
        });

    res.status(201).json({
        userDetail: { ...userDetail.toObject(), folders },
        success: true,
    });
});
