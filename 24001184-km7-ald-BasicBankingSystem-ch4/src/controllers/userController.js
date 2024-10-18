const {
	createUserService,
	getAllUserService,
	getUserByIdService,
} = require("../services/userServices");
const {
	isEmpty,
	isGmail,
	isNumber,
	isPasswordVaild,
} = require("../utils/validator");

const createUser = async (req, res, next) => {
	try {
		let { name, email, password, profile } = req.body;

		if (
			isEmpty([
				name,
				email,
				password,
				profile.identity_type,
				profile.identity_number,
				profile.address,
			])
		) {
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
		if (!isPasswordVaild(password)) {
			return res.status(400).json({
				status: "Failed",
				message: "Password must be at least 8 characters long",
			});
		}
		if (!isNumber(profile.identity_number)) {
			return res.status(400).json({
				status: "Failed",
				message: "Identity number must be a number",
			});
		}

		const newUser = await createUserService(req.body);

		res.status(201).json({
			status: "Success",
			message: "User Created Successfully",
			data: newUser,
		});
	} catch (error) {
		if (error.status) {
			return res.status(error.status).json({
				status: "Failed",
				message: error.message,
			});
		}

		next(error);
	}
};

const getAllUser = async (req, res, next) => {
	try {
		const user = await getAllUserService();
		res.status(200).json({
			status: "Success",
			message: "Successfuly Retrieved All Data",
			data: user,
		});
	} catch (error) {
		next(error);
	}
};

const getUserById = async (req, res, next) => {
	try {
		const user = await getUserByIdService(req.params.userId);

		if (!user) {
			return res.status(404).json({
				status: "Failed",
				message: "There's no Such User!",
			});
		}

		res.status(200).json({
			status: "Success",
			message: "Successfuly Retrieved The Data",
			data: user,
		});
	} catch (error) {
		next(error);
	}
};

module.exports = { createUser, getAllUser, getUserById };
