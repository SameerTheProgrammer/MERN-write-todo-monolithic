const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const { readdirSync } = require("fs");

const errorMiddleware = require("./helper/error");

// Initialize Express
const app = express();

// Helmet Middleware: Set HTTP headers for security
app.use(helmet());

// CORS Middleware: Allow requests from trusted domains only
app.use(cors());

// Rate Limiting Middleware: Prevent abuse and DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Express Session Middleware: Session management
app.use(
  session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true,
  })
);


app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// Route Imports
readdirSync("./routes").map(route => app.use("/user", require("./routes/" + route)));


// Middleware for Errors
app.use(errorMiddleware);

module.exports = app;
