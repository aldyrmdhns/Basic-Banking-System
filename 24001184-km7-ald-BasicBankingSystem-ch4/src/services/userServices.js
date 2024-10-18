const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createUserService = async (data) => {
	let { name, email, password, profile } = data;

	const isExist_email = await prisma.users.findUnique({
		where: { email: email },
	});
	const isExist_identity_number = await prisma.profiles.findUnique({
		where: { identity_number: profile.identity_number },
	});

	if (isExist_email) {
		throw { status: 400, message: "Email Already Used" };
	}
	if (isExist_identity_number) {
		throw { status: 400, message: "Identity Number Already Used" };
	}

	const newUser = await prisma.users.create({
		data: {
			name,
			email,
			password,
			profile: {
				create: {
					identity_type: profile.identity_type,
					identity_number: profile.identity_number,
					address: profile.address,
				},
			},
		},
		include: { profile: true },
	});

	return newUser;
};

const getAllUserService = async () => {
	const user = await prisma.users.findMany({
		select: {
			id: true,
			name: true,
			email: true,
			profile: {
				select: {
					identity_type: true,
					identity_number: true,
					address: true,
				},
			},
		},
	});

	return user;
};

const getUserByIdService = async (id) => {
	const user = await prisma.users.findUnique({
		where: { id: parseInt(id) },
		select: {
			name: true,
			email: true,
			profile: {
				select: {
					identity_type: true,
					identity_number: true,
					address: true,
				},
			},
		},
	});

	return user;
};

module.exports = { createUserService, getAllUserService, getUserByIdService };
