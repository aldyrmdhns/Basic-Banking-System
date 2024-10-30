const express = require("express");
const {
	createAccount,
	getAllAccount,
	getAccountById,
	deleteAccount,
} = require("../controllers/accountController");

const route = express.Router();

route.post("/", createAccount);
route.get("/", getAllAccount);
route.get("/:id", getAccountById);
route.delete("/:id", deleteAccount);

module.exports = route;
