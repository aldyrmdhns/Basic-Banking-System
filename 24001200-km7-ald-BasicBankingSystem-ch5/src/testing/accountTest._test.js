const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const request = require("supertest");
const app = require("../../app");

beforeEach(async () => {
	await prisma.users.create({
		data:{
			name: "Theodore Valseto",
			email: "theo123@gmail.com",
			password: "12345678",
			profile: {
				create :{
					identity_type: "KTP",
					identity_number: "777666",
					address: "Jln. Kesetiaan"
				}
			}
		}
	});

	const userId = await prisma.users.findUnique({where: {email: "theo123@gmail.com"}});

	await prisma.bank_accounts.create({
		data:{
			user_id: parseInt(userId.id),
			bank_name: "theozzz",
			bank_account_number: "172721",
			balance: 100000
		}
	});
});

afterEach(async () => {
	await prisma.bank_accounts.deleteMany({
		where: { bank_account_number: "172721" },
	});
	await prisma.profiles.deleteMany({
		where: { identity_number: "777666" },
	});
	await prisma.users.deleteMany({
		where: { email: "theo123@gmail.com" },
	});
	await prisma.profiles.deleteMany({
		where: { identity_number: "212121" },
	});
	await prisma.users.deleteMany({
		where: { email: "stark123@gmail.com" },
	});
});

describe("API Integration Testing - Endpoint /accounts", () => {
	//Get All Accounts
    test("Success Get All Accounts Data - 200", async () => {
		const response = await request(app).get("/api/v1/accounts");

		expect(response.status).toBe(200);
		expect(typeof response.body).toBe("object");
		expect(Array.isArray(response.body.data)).toBe(true);

		if (response.body.data > 0) {
			const check = response[0];
			expect(check).toHaveProperty("id");
			expect(check).toHaveProperty("user_id");
			expect(check).toHaveProperty("bank_name");
			expect(check).toHaveProperty("bank_account_number");
			expect(check).toHaveProperty("balance");
		}
	});
	//Get Account by Id
	test("Success Get Account by ID - 200", async () => {
		const findUser = await prisma.bank_accounts.findUnique({where: {bank_account_number: "172721"}});
		const userId = findUser.id
	
		const response = await request(app).get(`/api/v1/accounts/${userId}`);
	
		expect(response.status).toBe(200);
		expect(typeof response.body.data).toBe("object");
	
		const userData = response.body.data;
		expect(userData).toHaveProperty("bank_name");
		expect(userData).toHaveProperty("bank_account_number");
		expect(userData).toHaveProperty("balance");
	});
	test("Failed Get Account by ID - 404", async () => {
		const accountId = 9999;
		const response = await request(app).get(`/api/v1/accounts/${accountId}`);

		expect(response.status).toBe(404);
		expect(response.body.status).toBe("Failed");
		expect(response.body.message).toBe(
			"There's no Such Account!"
		);
	});
	//Create Account
	test("Succes Create Account - 201", async () => {
		const findUser = await prisma.users.findUnique({where: {email: "theo123@gmail.com"}});
		const id = findUser.id
		const newAccount = {
			user_id: id,
			bank_name: "theodorez",
			bank_account_number: "101010",
			balance: 300000
		}

		const response = await request(app)
			.post("/api/v1/accounts")
			.send(newAccount)
			.set("Accept", "application/json");

		expect(response.status).toBe(201);
		expect(typeof response.body.data).toBe("object");
		expect(response.body.data).toHaveProperty("id");
		expect(response.body.data).toHaveProperty("user_id");
		expect(response.body.data).toHaveProperty("bank_name",);
		expect(response.body.data).toHaveProperty("bank_account_number");
		expect(response.body.data).toHaveProperty("balance");

		await prisma.bank_accounts.deleteMany({
			where: { bank_account_number: "101010" },
		});
	});
	test("Fail Create Account - 400 (Missing Fields)", async () => {
		const newAccount = {
			bank_name: "theodorez",
			bank_account_number: "101010",
			balance: 300000
		}

		const response = await request(app)
			.post("/api/v1/accounts")
			.send(newAccount)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.status).toBe("Failed");
		expect(response.body.message).toBe(
			"Failed To Create Account, Make Sure To fill all Form"
		);
	});
	test("Fail Create Account - 400 (Non-Numeric Account Number)", async () => {
		const findUser = await prisma.users.findUnique({where: {email: "theo123@gmail.com"}});
		const id = findUser.id
		const newAccount = {
			user_id: id,
			bank_name: "theodorez",
			bank_account_number: "abc123",
			balance: 300000
		}

		const response = await request(app)
			.post("/api/v1/accounts")
			.send(newAccount)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.status).toBe("Failed");
		expect(response.body.message).toBe(
			"Bank Account number must be a number"
		);
	});
	test("Fail Create Account - 400 (Non-Numeric Balance)", async () => {
		const findUser = await prisma.users.findUnique({where: {email: "theo123@gmail.com"}});
		const id = findUser.id
		const newAccount = {
			user_id: id,
			bank_name: "theodorez",
			bank_account_number: "101010",
			balance: "abc123"
		}

		const response = await request(app)
			.post("/api/v1/accounts")
			.send(newAccount)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.status).toBe("Failed");
		expect(response.body.message).toBe(
			"Balance must be a number"
		);
	});
	test("Fail Create Account - 400 (Bank Account Number Already Used)", async () => {
		const findUser = await prisma.users.findUnique({where: {email: "theo123@gmail.com"}});
		const id = findUser.id
		const newAccount = {
			user_id: id,
			bank_name: "theodorez",
			bank_account_number: "172721",
			balance: 300000
		}

		const response = await request(app)
			.post("/api/v1/accounts")
			.send(newAccount)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.status).toBe("Failed");
		expect(response.body.message).toBe(
			"Bank account number Already Exist"
		);
	});
	test("Internal Server Error on Get Account by ID - 500", async () => {
		const invalidAccountId = "invalid-id";

		const response = await request(app)
			.get(`/api/v1/accounts/${invalidAccountId}`)
			.set("Accept", "application/json");

		expect(response.status).toBe(500);
		expect(response.body.status).toBe("Failed");
		expect(response.body.message).toBe(
			"There's Something Wrong with The Server!"
		);
	});
});
