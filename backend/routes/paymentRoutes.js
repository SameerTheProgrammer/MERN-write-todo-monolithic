const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../middleware/authentication');
const {
    buySubscription,
    getRazorpayKey,
    cancelSubscription,
    paymentVerification
} = require('../controller/paymentController');
const { isSubscribed } = require('../middleware/isSubscribed');

// Buy Subscription
router.route("/subscribe").get(isAuthenticatedUser, buySubscription);

// Verify Payment and save reference in database 
router.route("/paymentVerification").get(isAuthenticatedUser, paymentVerification);

// Get Razorpay Key
router.route("/getRazorpayKey").get(getRazorpayKey);


// Cancel subscription
router.route("/subscribe/cancel").delete(isAuthenticatedUser, isSubscribed ,cancelSubscription);


module.exports = router;
