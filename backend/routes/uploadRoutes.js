const express = require("express");
const { uploadImages } = require("../controller/uploadController");
const { isAuthenticatedUser } = require("../middleware/authentication");
const imageUpload = require("../helper/imageUpload");

const router = express.Router();

router.post("/uploadImages", isAuthenticatedUser, imageUpload, uploadImages);
// router.post("/listImages", authUser, listImages);

module.exports = router;
