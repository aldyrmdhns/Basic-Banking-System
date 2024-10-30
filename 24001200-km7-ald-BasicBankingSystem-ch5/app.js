// require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const swaggerUI = require("swagger-ui-express");
const swaggerDocs = require("./src/docs/swagger.json");
const authRoute = require("./src/routes/authRoutes");
const userRoute = require("./src/routes/userRoute");
const accountRoute = require("./src/routes/accountRoute");
const transactionRoute = require("./src/routes/transactionRoute");
const errorHandler = require("./src/middlewares/errorHandler");

const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/accounts", accountRoute);
app.use("/api/v1/transactions", transactionRoute);
app.use(errorHandler);

const PORT = 9090;
app.listen(PORT, () => console.log(`-Listening on Port: ${PORT}`));

module.exports = app;