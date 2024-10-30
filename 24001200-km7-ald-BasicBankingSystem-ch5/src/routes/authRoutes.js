const express = require("express");
const {register, login, authenticate} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const route = express.Router();

route.post('/register', register);
route.post('/login', login);
route.get('/authenticate', authMiddleware, authenticate);

module.exports = route;