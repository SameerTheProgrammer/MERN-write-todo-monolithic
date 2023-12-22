const express = require('express');
const { 
    createFolder, 
    updateFolder, 
    deleteFolder, 
    deleteAllFolders, 
    deleteAllFiles,
} = require('../controller/folderController');
const router = express.Router();
const  { isAuthenticatedUser} = require('../middleware/authentication');



router.route("/createFolder").post(isAuthenticatedUser,createFolder);
router.route("/updateFolder/:id").put(isAuthenticatedUser,updateFolder);
router.route("/deleteFolder/:id").post(isAuthenticatedUser,deleteFolder);
router.route("/deleteAllFolder").delete(isAuthenticatedUser,deleteAllFolders);
router.route("/deleteAllFiles/:id").post(isAuthenticatedUser,deleteAllFiles);


module.exports = router;