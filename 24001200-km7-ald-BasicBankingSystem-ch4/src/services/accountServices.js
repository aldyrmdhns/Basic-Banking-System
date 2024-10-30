const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createAccountService = async (data) => {
	let { user_id, bank_name, bank_account_number, balance } = data;

	const isExist = await prisma.bank_accounts.findUnique({
		where: { bank_account_number: bank_account_number },
	});

	if (isExist) {
		throw { status: 400, message: "Bank account number Already Exist" };
	}

	const newAccount = await prisma.bank_accounts.create({
		data: {
			bank_name,
			bank_account_number,
			balance: parseFloat(balance),
			user: {
				connect: { id: parseInt(user_id) },
			},
		},
	});

	return newAccount;
};

const getAllAccountService = async () => {
	const account = await prisma.bank_accounts.findMany({
		select: {
			id: true,
			bank_name: true,
			bank_account_number: true,
		},
	});

	return account;
};

const getAccountByIdService = async (id) => {
	const account = await prisma.bank_accounts.findUnique({
		where: { id: parseInt(id) },
		select: {
			bank_name: true,
			bank_account_number: true,
			balance: true,
		},
	});

	return account;
};

const deleteAccountService = async (id) => {
	id = parseInt(id);

	await prisma.transaction.deleteMany({
		where: {
			OR: [{ source_id: id }, { destination_id: id }],
		},
	});

	const deletedAccount = await prisma.bank_accounts.delete({
		where: { id: id },
	});

	return deletedAccount;
};

module.exports = {
	createAccountService,
	getAllAccountService,
	getAccountByIdService,
	deleteAccountService,
};
