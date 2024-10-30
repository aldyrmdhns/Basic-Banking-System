const {
	createTransasctionService,
	getAllTransactionService,
	getTransactionByIdService,
} = require("../services/transactionServices");
const { isEmpty, isNumber } = require("../utils/validator");

const createTransasction = async (req, res, next) => {
	try {
		let {
			source_bank_account_number,
			destination_bank_account_number,
			amount,
		} = req.body;

		if (
			isEmpty([
				source_bank_account_number,
				destination_bank_account_number,
				amount,
			])
		) {
			return res.status(400).json({
				status: "Failed",
				message: "Transaction Failed, Make Sure To fill all Form",
			});
		}
		if (!isNumber(source_bank_account_number)) {
			return res.status(400).json({
				status: "Failed",
				message: "Source Bank Account Number must be a number",
			});
		}
		if (!isNumber(destination_bank_account_number)) {
			return res.status(400).json({
				status: "Failed",
				message: "Destination Bank Account Number must be a number",
			});
		}
		if (!isNumber(amount)) {
			return res.status(400).json({
				status: "Failed",
				message: "Balance Amount must be a number",
			});
		}

		const newTransaction = await createTransasctionService(req.body);

		res.status(201).json({
			status: "Success",
			message: "Transaction Created Successfully",
			data: newTransaction,
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

const getAllTransaction = async (req, res, next) => {
	try {
		const transaction = await getAllTransactionService();
		res.status(200).json({
			status: "Success",
			message: "Successfuly Retrieved All Data",
			data: transaction,
		});
	} catch (error) {
		next(error);
	}
};

const getTransactionById = async (req, res, next) => {
	try {
		const transaction = await getTransactionByIdService(req.params.id);

		if (!transaction) {
			return res.status(404).json({
				status: "Failed",
				message: "There's no Such Transaction!",
			});
		}

		res.status(200).json({
			status: "Success",
			message: "Successfuly Retrieved The Data",
			data: transaction,
		});
	} catch (error) {
		next(error);
	}
};

module.exports = { createTransasction, getAllTransaction, getTransactionById };
