const {
  registerUser,
  loginUser,
  sendVerification,
  logoutUser,
  activateAccount,
  updateProfile,
  updatePassword,
  forgotPassword,
  getUserDetails,
  resetPassword,
  getAllFolder,
} = require('../controller/userController');
const { isAuthenticatedUser } = require('../middleware/authentication');
const express = require("express");
const router = express.Router();



router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(isAuthenticatedUser,logoutUser);
router.route("/sendVerification").post(sendVerification);
router.route("/activateAccount").post(activateAccount);
router.route("/updateProfile").put(isAuthenticatedUser, updateProfile);
router.route("/updatePassword").put(isAuthenticatedUser, updatePassword);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword").put(resetPassword);
router.route("/getUserDetails").get(isAuthenticatedUser, getUserDetails);
router.route("/getAllFolder").get(isAuthenticatedUser, getAllFolder);


module.exports = router;