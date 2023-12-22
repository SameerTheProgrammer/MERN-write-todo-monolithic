const express = require('express');
const {
    createTodoFile,
    updateTodoFile,
    deleteTodoFile,
    getTodoFile,
    createTodo,
    deleteTodo
} = require('../controller/todoController');
const { updateNote } = require('../controller/noteController');
const { isAuthenticatedUser } = require('../middleware/authentication');

const router = express.Router();

// for todo file
router.route("/createTodoFile/:id").post(isAuthenticatedUser, createTodoFile);
router.route("/updateTodoFile/:id").put(isAuthenticatedUser, updateTodoFile);
router.route("/deleteTodoFile/:id").delete(isAuthenticatedUser, deleteTodoFile);
router.route("/getNoteFile/:id").get(isAuthenticatedUser, getTodoFile);


// for todos of todoFile
router.route("/createTodo/:id").post(isAuthenticatedUser, createTodo);
router.route("/updateTodo/:id").put(isAuthenticatedUser, updateNote);
router.route("/deleteTodo/:id").delete(isAuthenticatedUser, deleteTodo);



module.exports = router;
