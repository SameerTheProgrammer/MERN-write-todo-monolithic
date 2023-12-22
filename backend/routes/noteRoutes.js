const express = require('express');
const {
    createNoteFile,
    updateNote,
    deleteNote,
    getNote,
} = require('../controller/noteController');
const router = express.Router();
const { isAuthenticatedUser } = require('../middleware/authentication');
const { isSubscribed } = require('../middleware/isSubscribed');


router.route("/createNote/:id").post(isAuthenticatedUser, isSubscribed, createNoteFile);
router.route("/updateNote/:id").put(isAuthenticatedUser, updateNote);
router.route("/deleteNote/:id").delete(isAuthenticatedUser, deleteNote);
router.route("/getNote/:id").get(isAuthenticatedUser, getNote);



module.exports = router;
