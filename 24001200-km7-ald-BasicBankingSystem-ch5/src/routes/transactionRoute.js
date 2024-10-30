const express = require("express");
const {
	createTransasction,
	getAllTransaction,
	getTransactionById,
} = require("../controllers/transactionController");

const route = express.Router();

route.post("/", createTransasction);
route.get("/", getAllTransaction);
route.get("/:id", getTransactionById);

module.exports = route;
