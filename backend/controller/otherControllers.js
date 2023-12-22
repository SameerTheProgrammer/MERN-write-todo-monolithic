const catchAsyncErrors = require("../helper/catchAsyncErrors");
const ErrorHandler = require("../helper/errorHandler");
const contactModel = require("../models/contactModel");
const userModel = require("../models/userModel");
const sanitizeHtml = require('sanitize-html');
const cron = require('node-cron');

/*==================================================================
===================== for contact form  ============================
====================================================================*/

// Send message to admins and super admin
exports.sendContactMessage = catchAsyncErrors(async (req, res, next) => {

    const { message, subject } = req.body;
    const sanitizedDescription = sanitizeHtml(message);

    const name = req.user.name || req.body.name;
    const email = req.user.email || req.body.email;
    const userId = req.user.id || undefined;

    const newContactMessage = await contactModel.create({ email, name, message: sanitizedDescription, subject, user: userId });

    res.status(201).json({
        newContactMessage,
        success: true,
        message: "Message sended successfully",
    });
});

/*==================================================================
============= for trial of premium feature for 15 days =============
====================================================================*/

// Route to start a new 15 days free trial
exports.startTrial = catchAsyncErrors(async (req, res, next) => {

    // Check if the user already has an active subscription or trial
    if (req.user.subsription.status === "active" || req.user.trial.status === true) {
        return next(new ErrorHandler("You already have an active subscription or trial.", 400));
    }

    if (req.user.trial.noOfTrial > 1)
        return next(new ErrorHandler("You already used your free trial.", 400));


    // Set the trial status to true, trial start date update the user's document
    req.user.trial.status = true;
    req.user.trial.noOfTrial = 1;
    req.user.trial.startedAt = new Date.now();

    // Start the scheduling for this user's trial expiration
    startTrialScheduling(req.user.id);

    await req.user.save();

    return res.status(200).json({
        message: "You have started a new 15 days free trial of our premium features."
    });

});



const startTrialScheduling = catchAsyncErrors((userId) => {

    // Schedule a job to run every day and check if the user's trial has expired
    cron.schedule('0 0 * * *', async () => {

        const user = await userModel.findById(userId);

        // Check if the user has an active trial and if it has been more than 15 days
        if (user && user.trial.status === true) {
            const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000); // 15 days in milliseconds

            if (user.trial.startedAt <= fifteenDaysAgo) {
                // Update the trial status to false
                user.trial.status = false;
                await user.save();

                return res.status(200).json({
                    message: `Trial expired for user with ID ${ userId }.`
                });
            }
        }
    });
})



/*==========================================================================================
==== for to get notification of contact mesaage and which user buy/cancel subscription  ====
==========================================================================================*/

// Route to start a new 15 days free trial
exports.notification = catchAsyncErrors(async (req, res, next) => {

    

    return res.status(200).json({
        message: "You have started a new 15 days free trial of our premium features."
    });

});








