const {
	createAccountService,
	getAllAccountService,
	getAccountByIdService,
	deleteAccountService,
} = require("../services/accountServices");
const { isEmpty, isNumber } = require("../utils/validator");

const createAccount = async (req, res, next) => {
	try {
		let { user_id, bank_name, bank_account_number, balance } = req.body;

		if (isEmpty([user_id, bank_name, bank_account_number, balance])) {
			return res.status(400).json({
				status: "Failed",
				message: "Failed To Create Account, Make Sure To fill all Form",
			});
		}
		if (!isNumber(bank_account_number)) {
			return res.status(400).json({
				status: "Failed",
				message: "Bank Account number must be a number",
			});
		}
		if (!isNumber(balance)) {
			return res.status(400).json({
				status: "Failed",
				message: "Balance must be a number",
			});
		}

		const newAccount = await createAccountService(req.body);

		res.status(201).json({
			status: "Success",
			message: "Account Created Successfully",
			data: newAccount,
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

const getAllAccount = async (req, res, next) => {
	try {
		const account = await getAllAccountService();
		res.status(200).json({
			status: "Success",
			message: "Successfuly Retrieved All Data",
			data: account,
		});
	} catch (error) {
		next(error);
	}
};

const getAccountById = async (req, res, next) => {
	try {
		const account = await getAccountByIdService(req.params.id);

		if (!account) {
			return res.status(404).json({
				status: "Failed",
				message: "There's no Such Account!",
			});
		}

		res.status(200).json({
			status: "Success",
			message: "Successfuly Retrieved The Data",
			data: account,
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	createAccount,
	getAllAccount,
	getAccountById
};
