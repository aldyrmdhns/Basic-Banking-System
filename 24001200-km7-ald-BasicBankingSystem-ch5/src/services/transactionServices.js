const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createTransasctionService = async (data) => {
	let {
		source_bank_account_number,
		destination_bank_account_number,
		amount,
	} = data;

	amount = parseFloat(amount);

	const sourceAccount = await prisma.bank_accounts.findUnique({
		where: { bank_account_number: source_bank_account_number },
	});
	const destinationAccount = await prisma.bank_accounts.findUnique({
		where: { bank_account_number: destination_bank_account_number },
	});

	if (!sourceAccount) {
		throw { status: 404, message: "Source bank account number not found" };
	}
	if (!destinationAccount) {
		throw {
			status: 404,
			message: "Destination bank account number not found",
		};
	}

	if (sourceAccount.balance < amount) {
		throw { status: 400, message: "Insufficient Balance" };
	}
	if (amount < 5000) {
		throw {
			status: 400,
			message:
				"Cannot perform transaction. Minimum Transaction is 5000 required",
		};
	}

	await prisma.bank_accounts.update({
		where: { id: sourceAccount.id },
		data: { balance: { decrement: amount } },
	});

	await prisma.bank_accounts.update({
		where: { id: destinationAccount.id },
		data: { balance: { increment: amount } },
	});

	const newTransaction = await prisma.transaction.create({
		data: {
			source_id: sourceAccount.id,
			destination_id: destinationAccount.id,
			amount,
		},
	});

	return {
		transaction_id: newTransaction.id,
		source_bank_name: sourceAccount.bank_name,
		destination_bank_name: destinationAccount.bank_name,
		amount: newTransaction.amount,
	};
};

const getAllTransactionService = async () => {
	const transaction = await prisma.transaction.findMany({
		select: {
			id: true,
			source_account: {
				select: {
					bank_name: true,
					bank_account_number: true,
				},
			},
			amount: true,
		},
	});

	return transaction;
};

const getTransactionByIdService = async (id) => {
	const transaction = await prisma.transaction.findUnique({
		where: { id: parseInt(id) },
		select: {
			id: true,
			source_account: {
				select: {
					bank_name: true,
					bank_account_number: true,
				},
			},
			destination_account: {
				select: {
					bank_name: true,
					bank_account_number: true,
				},
			},
			amount: true,
		},
	});

	return transaction;
};

module.exports = {
	createTransasctionService,
	getAllTransactionService,
	getTransactionByIdService,
};
