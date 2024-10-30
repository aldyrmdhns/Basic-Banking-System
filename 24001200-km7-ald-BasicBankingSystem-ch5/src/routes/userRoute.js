const express = require("express");
const {
	createUser,
	getAllUser,
	getUserById,
} = require("../controllers/userController");

const route = express.Router();

route.post("/", createUser);
route.get("/", getAllUser);
route.get("/:userId", getUserById);

module.exports = route;
