const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createAccountService = async (data) => {
	let { user_id, bank_name, bank_account_number, balance } = data;
    
    const isExist = await prisma.bank_accounts.findUnique({where: {bank_account_number: bank_account_number}});
    
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
			bank_name: true,
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

module.exports = {
	createAccountService,
	getAllAccountService,
	getAccountByIdService,
};
