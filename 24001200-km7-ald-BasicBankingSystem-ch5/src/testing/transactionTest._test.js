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
			balance: 300000
		}
	});
	await prisma.bank_accounts.create({
		data:{
			user_id: parseInt(userId.id),
			bank_name: "valsetoZ",
			bank_account_number: "777111",
			balance: 500000
		}
	});

	const sourceId = await prisma.bank_accounts.findUnique({where: {bank_account_number: "777111"}});
	const destId = await prisma.bank_accounts.findUnique({where: {bank_account_number: "172721"}});

	await prisma.transaction.create({
		data: {
			source_id: sourceId.id,
			destination_id: destId.id,
			amount: 15000
		}
	})
});

afterEach(async () => {
	const sourceId = await prisma.bank_accounts.findUnique({where: {bank_account_number: "777111"}});

	await prisma.transaction.deleteMany({
		where: { source_id: sourceId.id },
	});
	await prisma.bank_accounts.deleteMany({
		where: { bank_account_number: "172721" },
	});
	await prisma.bank_accounts.deleteMany({
		where: { bank_account_number: "777111" },
	});
	await prisma.profiles.deleteMany({
		where: { identity_number: "777666" },
	});
	await prisma.users.deleteMany({
		where: { email: "theo123@gmail.com" },
	});
});

describe("API Integration Testing - Endpoint /transactions", () => {
	//Get All Transaction
	test("Success Get All Transaction Data - 200", async () => {
		const response = await request(app).get("/api/v1/transactions");

		expect(response.status).toBe(200);
		expect(typeof response.body).toBe("object");
		expect(Array.isArray(response.body.data)).toBe(true);

		if (response.body.data > 0) {
			const check = response[0];
			expect(check).toHaveProperty("id");
			expect(check).toHaveProperty("source_account");
			expect(check).toHaveProperty("source_account.bank_name");
			expect(check).toHaveProperty("source_account.bank_account_number");
			expect(check).toHaveProperty("amount");
		}
	});
	//Get Transaction by Id
	test("Success Get Transaction by ID - 200", async () => {
		const findSourceId = await prisma.bank_accounts.findUnique({where: {bank_account_number: "777111"}});
		const findTransaction = await prisma.transaction.findFirst({
			where: { source_id:  findSourceId.id},
		});
		const transactionId = findTransaction.id

		const response = await request(app).get(`/api/v1/transactions/${transactionId}`);

		expect(response.status).toBe(200);
		expect(typeof response.body).toBe("object");

		expect(response.body.data).toHaveProperty("id");
		expect(response.body.data).toHaveProperty("source_account");
		expect(response.body.data).toHaveProperty("destination_account");
		expect(response.body.data).toHaveProperty("amount");

		expect(response.body.data.source_account).toHaveProperty("bank_name");
		expect(response.body.data.source_account).toHaveProperty("bank_account_number");
		expect(response.body.data.destination_account).toHaveProperty("bank_name");
		expect(response.body.data.destination_account).toHaveProperty("bank_account_number");
	});
	test("Failed Get Transaction by ID - 404", async () => {
		const transactionId = 9999;
		const response = await request(app).get(`/api/v1/transactions/${transactionId}`);

		expect(response.status).toBe(404);
		expect(response.body.status).toBe("Failed");
		expect(response.body.message).toBe("There's no Such Transaction!");
	});
	//Create Transaction
	test("Succes Create Transaction - 201", async () => {
		const newTransaction = {
			source_bank_account_number: "777111",
			destination_bank_account_number: "172721",
			amount: 15000
		}

		const response = await request(app)
			.post("/api/v1/transactions")
			.send(newTransaction)
			.set("Accept", "application/json");

		expect(response.status).toBe(201);
		expect(typeof response.body.data).toBe("object");
		expect(response.body.data).toHaveProperty("transaction_id");
		expect(response.body.data).toHaveProperty("source_bank_name");
		expect(response.body.data).toHaveProperty("destination_bank_name",);
		expect(response.body.data).toHaveProperty("amount");
	});
	test("Failed Create Transaction - 400 (Missing Fields)", async () => {
		const newTransaction = {
			destination_bank_account_number: "172721",
			amount: 15000
		};
	
		const response = await request(app)
			.post("/api/v1/transactions")
			.send(newTransaction)
			.set("Accept", "application/json");
	
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("status", "Failed");
		expect(response.body).toHaveProperty("message", "Transaction Failed, Make Sure To fill all Form");
	});
	test("Failed Create Transaction - 400 (Non-Numeric Source Account)", async () => {
		const newTransaction = {
			source_bank_account_number: "abc123",
			destination_bank_account_number: "172721",
			amount: 15000
		};
	
		const response = await request(app)
			.post("/api/v1/transactions")
			.send(newTransaction)
			.set("Accept", "application/json");
	
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("status", "Failed");
		expect(response.body).toHaveProperty("message", "Source Bank Account Number must be a number");
	});
	test("Failed Create Transaction - 400 (Non-Numeric Destination Account)", async () => {
		const newTransaction = {
			source_bank_account_number: "777111",
			destination_bank_account_number: "abc123",
			amount: 15000
		};
	
		const response = await request(app)
			.post("/api/v1/transactions")
			.send(newTransaction)
			.set("Accept", "application/json");
	
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("status", "Failed");
		expect(response.body).toHaveProperty("message", "Destination Bank Account Number must be a number");
	});
	test("Failed Create Transaction - 400 (Non-Numeric Amount)", async () => {
		const newTransaction = {
			source_bank_account_number: "777111",
			destination_bank_account_number: "172721",
			amount: "abc123"
		};
	
		const response = await request(app)
			.post("/api/v1/transactions")
			.send(newTransaction)
			.set("Accept", "application/json");
	
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("status", "Failed");
		expect(response.body).toHaveProperty("message", "Balance Amount must be a number");
	});
	test("Failed Create Transaction - 404 (Source Account Not Found)", async () => {
		const newTransaction = {
			source_bank_account_number: "9999",
			destination_bank_account_number: "172721",
			amount: 15000
		};
	
		const response = await request(app)
			.post("/api/v1/transactions")
			.send(newTransaction)
			.set("Accept", "application/json");
	
		expect(response.status).toBe(404);
		expect(response.body).toHaveProperty("message", "Source bank account number not found");
	});
	test("Failed Create Transaction - 404 (Destination Account Not Found)", async () => {
		const newTransaction = {
			source_bank_account_number: "777111",
			destination_bank_account_number: "9999",
			amount: 15000
		};
	
		const response = await request(app)
			.post("/api/v1/transactions")
			.send(newTransaction)
			.set("Accept", "application/json");
	
		expect(response.status).toBe(404);
		expect(response.body).toHaveProperty("message", "Destination bank account number not found");
	});
	test("Failed Create Transaction - 400 (Insufficient Balance)", async () => {
		const newTransaction = {
			source_bank_account_number: "777111",
			destination_bank_account_number: "172721",
			amount: 9999999
		};
	
		const response = await request(app)
			.post("/api/v1/transactions")
			.send(newTransaction)
			.set("Accept", "application/json");
	
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("message", "Insufficient Balance");
	});
	test("Failed Create Transaction - 400 (Minimum Transaction Amount)", async () => {
		const newTransaction = {
			source_bank_account_number: "777111",
			destination_bank_account_number: "172721",
			amount: 3000
		};
	
		const response = await request(app)
			.post("/api/v1/transactions")
			.send(newTransaction)
			.set("Accept", "application/json");
	
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("message", "Cannot perform transaction. Minimum Transaction is 5000 required");
	});
	test("Internal Server Error on Get Transaction by ID - 500", async () => {
		const invalidTransactionId = "invalid-id";

		const response = await request(app)
			.get(`/api/v1/transactions/${invalidTransactionId}`)
			.set("Accept", "application/json");

		expect(response.status).toBe(500);
		expect(response.body.status).toBe("Failed");
		expect(response.body.message).toBe(
			"There's Something Wrong with The Server!"
		);
	});
});