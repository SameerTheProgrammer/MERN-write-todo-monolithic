const catchAsyncErrors = require("../helper/catchAsyncErrors");
const userModel = require('../models/userModel');
const paymentModel = require('../models/paymentModel');

const { createRazorpayInstance } = require('../helper/razorpayIntegretion');
const instance = createRazorpayInstance();

const crypto = require('crypto');
const ErrorHandler = require("../helper/errorHandler")

// buy subscription to get access premium feature
exports.buySubscription = catchAsyncErrors(async (req, res, next) => {

    const user = await userModel.findById(req.user.id);
    if (user.role === "admin") return next(new ErrorHandler("Admin can't buy subscription", 400));

    const PLAN_ID = process.env.PLAN_ID || "plan_Mkn2nkNonb9ZEz";
    const subscription = await instance.subscription.create({
        plan_id: PLAN_ID,
        customer_notify: 1,
        quantity: 5,
        total_count: 12,
    });

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    await user.save();

    res.status(201).json({
        success: true,
        message: "Your subscription was successful now, you can use our premium feature",
        subscriptionId: subscription.id,
    })

})
// subscription payment Verification 
exports.paymentVerification = catchAsyncErrors(async (req, res, next) => {

    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;

    const user = await userModel.findById(req.user.id);
    if (user.role === "admin") return next(new ErrorHandler("Admin can't buy subscription", 400));

    const subscriptionId = user.subscription.id;

    const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_API_SERECT)
        .update(razorpay_payment_id + "|" + subscriptionId, "utf-8")
        .digest("hex");

    const isAuthentic = generated_signature === razorpay_signature;

    if (!isAuthentic)
        return res.redirect(`${ process.env.FRONTEND_URL }/paymentfailed`);

    // database comes here
    await paymentModel.create({
        razorpay_payment_id,
        razorpay_signature,
        razorpay_subscription_id
    });

    user.subscription.status = "active";
    await user.save();

    res.redirect(`${ process.env.FRONTEND_URL }/paymentsuccess?reference=${ razorpay_payment_id }`);
})

// Get Razorpay Key ---> (user)
exports.getRazorpayKey = catchAsyncErrors(async (req, res, next) => {
    res.status(200), json({
        success: true,
        key: process.env.RAZORPAY_API_KEY
    })
})

// cancel subscription
exports.cancelSubscription = catchAsyncErrors(async (req, res, next) => {

    const user = await userModel.findById(req.user.id);

    const subscriptionId = userModel.subscription.id;

    const refund = false;

    await instance.subscriptions.cancel(subscriptionId);

    const payment = await paymentModel.findOne({ razorpay_subscription_id: subscriptionId });

    const gap = Date.now() - payment.createdAt;

    const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;

    if (refundTime > gap) {
        await instance.payments.refund(payment.razorpay_subscription_id);
        refund = true;
    }

    await payment.remove();

    user.subscription.id = undefined;
    user.subscription.status = undefined;
    user.save();


    res.status(200), json({
        success: true,
        message: refund ?
            "Subscription cancelled, You will receive full refund within 7 days."
            :
            "Subscription cancelled, But no refund will initiated because refund is only for 7 days before subscription ",
    })
})