const {
    getAllUsers,
    getSingleUser,
    updateUserRole,
    deleteUser,
} = require('../controller/adminController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/authentication');
const express = require("express");
const router = express.Router();

router
    .route("/admin/users")
    .get(isAuthenticatedUser, authorizeRoles([ "admin", "superAdmin" ]), getAllUsers);

router
    .route("/admin/user/:id")
    .get(isAuthenticatedUser, authorizeRoles([ "admin", "superAdmin" ]), getSingleUser)
    .put(isAuthenticatedUser, authorizeRoles([ "admin", "superAdmin" ]), updateUserRole)
    .delete(isAuthenticatedUser, authorizeRoles([ "admin", "superAdmin" ]), deleteUser);

module.exports = router;