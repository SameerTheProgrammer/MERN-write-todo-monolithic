const ErrorHandler = require('../helper/errorHandler');
const catchAsyncErrors = require('../helper/catchAsyncErrors');
const todoModel = require('../models/todoModel');
const folderModel = require('../models/folderModel');
const sanitizeHtml = require('sanitize-html');




/*==================================================================
===================== for todo file in a folder =====================
====================================================================*/

// ---> Create a new todo file ---> (user)
exports.createTodoFile = catchAsyncErrors(async (req, res, next) => {

    const folderId = req.params.id;
    const userId = req.user.id;
    const { todoFileName } = req.body;

    // Check if a todo with the same name already exists in the folder
    const isNamed = todoModel.findOne({ todoFileName, user: userId });
    if (!isNamed) {
        return next(new ErrorHandler("Todo name already used", 500));
    }

    const newTodo = await todoModel.create({
        todoFileName,
        user: userId,
    })

    // push new todo file id in folder model
    const folder = await findByIdAndUpdate(folderId,
        {
            $push: { todos: newTodo._id }
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(201).json({
        newTodo,
        folder,
        success: true,
        message: "New todo created, now write some todo and todos"
    })
})

// ---> Update an existing todo File ---> (user)
exports.updateTodoFile = catchAsyncErrors(async (req, res, next) => {

    // Fetch the note document and chech note exist yes or no
    const isTodo = await todoModel.findById(req.params.id);   //**********  req.body.id ***************
    if (!isTodo) {
        return next(new ErrorHandler("todo not found", 404));
    }

    isTodo.todoFileName = req.body.todoFileName;
    isTodo.updatedAt = new Date.now();
    await isTodo.save();

    res.status(201).json({
        updatedTodo: isTodo,
        success: true,
        message: "Todo name updated"
    })
})

// ---> delete a single todo file ---> (user)
exports.deleteTodoFile = catchAsyncErrors(async (req, res, next) => {

    // Fetch the note document and chech note exist yes or no
    const isTodo = await todoModel.findById(req.params.id);   //**********  req.body.id ***************
    if (!isTodo) {
        return next(new ErrorHandler("todo not found", 404));
    }

    await isTodo.remove();

    await folderModel.findOneAndUpdate({ todofile: isTodo._id }, {
        $pull: {
            todoFile: {
                _id: todoModel._id,
            },
        },
    });

    res.status(201).json({
        success: true,
        message: "Todo file and thier associated Todos are deleted "
    })
})


// ---> get a todo file  ---> (user)
exports.getTodoFile = catchAsyncErrors(async (req, res, next) => {

    // Find the todoFile document by its ID
    const todoFile = await todoModel.findById(req.params.id);

    if (!todoFile) {
        return next(new ErrorHandler("Todo file not found", 404));
    }

    const allTodos = todoFile.todo.sort((a, b) => b.updatedAt - a.updatedAt);

    res.status(200).json({
        todoFileName: todoFile.todoFileName, // Include todoFileName in the response
        createdAt: todoFile.createdAt,
        allTodos,
        success: true,
        message: "Todos retrieved",
    });
});

/*==================================================================
===================== for todos file in a todoFile =====================
====================================================================*/


// ---> Create a new todo  ---> (user)
exports.createTodo = catchAsyncErrors(async (req, res, next) => {

    const todoFile = await todoModel.findById(req.params.id);
    if (!todoFile) {
        return next(new ErrorHandler("Todo file not found", 404));
    }

    const { description, priority, status } = req.body;

    // Sanitize user-generated content before saving it to the database
    const sanitizedDescription = sanitizeHtml(description);

    const newTodo = {
        description: sanitizedDescription,
        priority,
        status,
    };

    // Push the new todo into the todo array
    todoFile.todo.push(newTodo);
    isTodo.updatedAt = new Date.now();

    // Save the updated TodoFile document
    await todoFile.save();

    res.status(201).json({
        newTodo,
        success: true,
        message: "New todo created"
    })

})

// ---> Update an existing todo  ---> (user)
exports.updateTodo = catchAsyncErrors(async (req, res, next) => {

    // Fetch the note document and chech note exist yes or no
    const todoFile = await todoModel.findOne({ todo: req.params.id });
    if (!todoFile) {
        return next(new ErrorHandler("Todo file not found", 404));
    }

    const { description, priority, status } = req.body;
    const sanitizedDescription = sanitizeHtml(description);

    const todoIndex = todoFile.todo.findIndex((e) => e._id.toString() === req.params.id.toString());

    if (todoIndex === -1) {
        return next(new ErrorHandler("Todo not found", 404));
    }

    // Update the specific todo item
    todoFile.todo[ todoIndex ].description = sanitizedDescription;
    todoFile.todo[ todoIndex ].priority = priority;
    todoFile.todo[ todoIndex ].status = status;
    todoFile.todo[ todoIndex ].updatedAt = new Date();

    // Save the updated TodoFile document
    await todoFile.save();

    res.status(201).json({
        todoFile,
        success: true,
        message: "Todo updated"
    })
})

// ---> delete a single todo  ---> (user)
exports.deleteTodo = catchAsyncErrors(async (req, res, next) => {

    // Find the TodoFile document by its ID
    const todoFile = await todoModel.findOne({ todo: req.params.id });    //// problem "todo._id"

    if (!todoFile) {
        return next(new ErrorHandler("Todo file not found", 404));
    }

    // Find the index of the todo item to delete within the todo array
    const todoIndex = todoFile.todo.findIndex(e => e._id.toString() === req.params.id.toString());

    if (todoIndex === -1) {
        return next(new ErrorHandler("Todo not found", 404));
    }

    // Use splice to remove the todo item from the array
    todoFile.todo.splice(todoIndex, 1);

    isTodo.updatedAt = new Date.now();

    // Save the updated TodoFile document
    await todoFile.save();

    res.status(200).json({
        success: true,
        message: "Todo deleted",
    });
});






