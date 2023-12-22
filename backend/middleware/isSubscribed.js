const ErrorHandler = require("../helper/errorHandler");

exports.isSubscribed = () => {
  return (req, res, next) => {
    if (
      !req.user.subsription.status === "active" &&
      !req.user.trial.status === true &&
      !req.user.role === "admin" &&
      !req.user.role === "superAdmin"
    ) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource `,
          403
        )
      );
    }
    next();
  };
};
