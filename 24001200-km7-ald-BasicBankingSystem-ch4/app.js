require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const userRoute = require("./src/routes/userRoute");
const accountRoute = require("./src/routes/accountRoute");
const transactionRoute = require("./src/routes/transactionRoute");
const errorHandler = require("./src/middlewares/errorHandler");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/api/v1/users", userRoute);
app.use("/api/v1/accounts", accountRoute);
app.use("/api/v1/transactions", transactionRoute);
app.use(errorHandler);

const PORT = process.env.PORT || 9090;
app.listen(PORT, () => console.log(`-Listening on Port: ${PORT}`));
