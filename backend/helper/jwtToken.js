// Create Token and saving in cookie
const sendToken = (user, statusCode, res, type) => {
    
    const jwtToken = user.getJWTToken(process.env.JWT_EXPIRE);

    // options for cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    }; 

    res.status(statusCode).cookie("writeDailyUser", jwtToken, options,).json({
        success: true,
        message:"Login successful",
        user,
        token,
    });
}


module.exports = sendToken;