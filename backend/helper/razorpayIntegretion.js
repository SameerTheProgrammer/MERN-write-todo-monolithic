
const Razorpay = require('razorpay');

// Razorpay integretion
exports.createRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_API_SECRET,
    });
};