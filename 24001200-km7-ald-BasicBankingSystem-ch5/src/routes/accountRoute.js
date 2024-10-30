const express = require("express");
const {
	createAccount,
	getAllAccount,
	getAccountById
} = require("../controllers/accountController");

const route = express.Router();

route.post("/", createAccount);
route.get("/", getAllAccount);
route.get("/:id", getAccountById);

module.exports = route;
