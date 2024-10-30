	const bycrpt = require("bcrypt");
	const jwt = require("jsonwebtoken");
	const { PrismaClient } = require("@prisma/client");
	const prisma = new PrismaClient();
	const { isEmpty, isGmail, isPasswordValid } = require("../utils/validator");
	const SALT = parseInt(process.env.SALT, 10);

	const register = async (req, res, next) => {
		let { name, email, password } = req.body;

		try {
			const isExist_email = await prisma.users.findUnique({
				where: { email: email },
			});
			if (isEmpty([name, email, password])) {
				return res.status(400).json({
					status: "Failed",
					message: "Failed To Create User, Make Sure To fill all Form",
				});
			}
			if (!isGmail(email)) {
				return res.status(400).json({
					status: "Failed",
					message: "Email must be a Gmail address",
				});
			}
			if (!isPasswordValid(password)) {
				return res.status(400).json({
					status: "Failed",
					message: "Password must be at least 8 characters long",
				});
			}
			if (isExist_email) {
				return res.status(400).json({ 
					status: "Failed", message: "Email Already Used" 
				});
			}

			const hashedPassword = await bycrpt.hash(password, SALT);

			const newUser = await prisma.users.create({
				data: { name, email, password: hashedPassword },
			});

			res.status(201).json({
				status: "Success",
				message: "User Created Successfully",
				data: newUser,
			});
		} catch (error) {
			next(error);
		}
	};

	const login = async (req, res, next) => {
		let { email, password } = req.body;
		try {
			if (isEmpty([email, password])) {
				return res.status(400).json({
					status: "Failed",
					message: "Login Failed, Make Sure To fill all Form",
				});
			}
			if (!isGmail(email)) {
				return res.status(400).json({
					status: "Failed",
					message: "Email must be a Gmail address",
				});
			}

			const checkUser = await prisma.users.findUnique({ where: {email: email} });
			if (!checkUser) {
				return res.status(400).json({
					status: "Failed",
					message: "Email or Password Incorrect!",
				});
			}

			const checkPassword = await bycrpt.compare(password, checkUser.password);
			if (!checkPassword) {
				return res.status(400).json({
					status: "Failed",
					message: "Email or Password Incorrect!",
				});
			}

			const accessToken = jwt.sign(
				{ userId: checkUser.id, userName: checkUser.name },
				process.env.JWT_SECRET
			);
			res.status(200).json({
				status: "Success",
				message: "Login Successful",
				accessToken: accessToken,
			});
		} catch (error) {
			next(error);
		}
	};

	const authenticate = (req, res, next) => {
		res.status(200).json({
			status: "Success",
			message: "You're Okay To Be In Here!"
		});
	};

	module.exports = { register, login, authenticate };
