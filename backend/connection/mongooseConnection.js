const mongoose = require("mongoose");

const connectDatabase = () => {
    mongoose
        .connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then((data) => {
            console.log(`Mongodb connected with server: ${ data.connection.host }`);
        })
        .catch((err) => {
            throw err;
        });
};

module.exports = connectDatabase;
