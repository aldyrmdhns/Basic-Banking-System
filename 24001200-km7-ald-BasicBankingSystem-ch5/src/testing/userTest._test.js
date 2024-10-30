const { PrismaClient } = require("@prisma/client");
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
});

afterEach(async () => {
	await prisma.profiles.deleteMany({
		where: { identity_number: "777666" },
	});
	await prisma.users.deleteMany({
		where: { email: "theo123@gmail.com" },
	});
});

describe("API Integration Testing - Endpoint /users", () => {
	//Get All User
	test("Success Get All User Data - 200", async () => {
		const response = await request(app).get("/api/v1/users");

		expect(response.status).toBe(200);
		expect(typeof response.body).toBe("object");
		expect(Array.isArray(response.body.data)).toBe(true);

		if (response.body.data > 0) {
			const check = response[0];
			expect(check).toHaveProperty("id");
			expect(check).toHaveProperty("name");
			expect(check).toHaveProperty("email");
			expect(check).toHaveProperty("profile.identity_type");
			expect(check).toHaveProperty("profile.identity_number");
			expect(check).toHaveProperty("profile.address");
		}
	});
	//Get User by Id
	test("Success Get User by ID - 200", async () => {
		const findUser = await prisma.users.findUnique({
			where: { email: "theo123@gmail.com" },
		});
		const userId = findUser.id;

		const response = await request(app).get(`/api/v1/users/${userId}`);

		expect(response.status).toBe(200);
		expect(typeof response.body.data).toBe("object");

		expect(response.body.data).toHaveProperty("name");
		expect(response.body.data).toHaveProperty("email");
		expect(response.body.data).toHaveProperty("profile");

		expect(response.body.data.profile).toHaveProperty("identity_type");
		expect(response.body.data.profile).toHaveProperty("identity_number");
		expect(response.body.data.profile).toHaveProperty("address");
	});
	test("Failed Get User by ID - 404", async () => {
		const userId = 9999;
		const response = await request(app).get(`/api/v1/users/${userId}`);

		expect(response.status).toBe(404);
		expect(response.body.status).toBe("Failed");
		expect(response.body.message).toBe("There's no Such User!");
	});
	//Create User
	test("Succes Create User - 201", async () => {
		const newUser = {
			name: "Tony Stark",
			email: "stark123@gmail.com",
			password: "12345678",
			profile: {
				identity_type: "KTP",
				identity_number: "898989",
				address: "Jln. Avenger",
			},
		};

		const response = await request(app)
			.post("/api/v1/users")
			.send(newUser)
			.set("Accept", "application/json");

		expect(response.status).toBe(201);
		expect(typeof response.body.data).toBe("object");
		expect(response.body.data).toHaveProperty("id");
		expect(response.body.data).toHaveProperty("name");
		expect(response.body.data).toHaveProperty("email");
		expect(response.body.data).toHaveProperty("profile");
		expect(response.body.data.profile).toHaveProperty("identity_type");
		expect(response.body.data.profile).toHaveProperty("identity_number");
		expect(response.body.data.profile).toHaveProperty("address");

		await prisma.profiles.deleteMany({where: {identity_number: "898989"}});
		await prisma.users.deleteMany({where: {email: "stark123@gmail.com"}});
	});
	test("Fail Create User - 400 (Missing Fields)", async () => {
		const newUser = {
			email: "theo123@gmail.com",
			password: "12345678",
			profile: {
				identity_type: "KTP",
				identity_number: "777666",
				address: "Jln. Kesetiaan",
			},
		};

		const response = await request(app)
			.post("/api/v1/users")
			.send(newUser)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.status).toBe("Failed");
		expect(response.body.message).toBe(
			"Failed To Create User, Make Sure To fill all Form"
		);
	});
	test("Fail Create User - 400 (Invalid Email)", async () => {
		const newUser = {
			name: "Theodore Valseto",
			email: "abc",
			password: "12345678",
			profile: {
				identity_type: "KTP",
				identity_number: "777666",
				address: "Jln. Kesetiaan",
			},
		};

		const response = await request(app)
			.post("/api/v1/users")
			.send(newUser)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.status).toBe("Failed");
		expect(response.body.message).toBe("Email must be a Gmail address");
	});
	test("Fail Create User - 400 (Invalid Password Length)", async () => {
		const newUser = {
			name: "Theodore Valseto",
			email: "theo123@gmail.com",
			password: "123",
			profile: {
				identity_type: "KTP",
				identity_number: "777666",
				address: "Jln. Kesetiaan",
			},
		};

		const response = await request(app)
			.post("/api/v1/users")
			.send(newUser)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.status).toBe("Failed");
		expect(response.body.message).toBe(
			"Password must be at least 8 characters long"
		);
	});
	test("Fail Create User - 400 (Invalid Identity Number)", async () => {
		const newUser = {
			name: "Theodore Valseto",
			email: "theo123@gmail.com",
			password: "12345678",
			profile: {
				identity_type: "KTP",
				identity_number: "abc123",
				address: "Jln. Kesetiaan",
			},
		};

		const response = await request(app)
			.post("/api/v1/users")
			.send(newUser)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.status).toBe("Failed");
		expect(response.body.message).toBe("Identity number must be a number");
	});
	test("Fail Create User - 400 (Email Already Used)", async () => {
		await prisma.users.create({
			data: {
				name: "Existing User",
				email: "existing@gmail.com",
				password: "password123",
				profile: {
					create: {
						identity_type: "KTP",
						identity_number: "121212",
						address: "Jln. Existing",
					},
				},
			},
		});

		const existingProfile = await prisma.profiles.findUnique({
			where: { identity_number: "121212" },
		});
		const existingUser = await prisma.users.findUnique({
			where: { email: "existing@gmail.com" },
		});

		const newUser = {
			name: "Theodore Valseto",
			email: "existing@gmail.com",
			password: "12345678",
			profile: {
				identity_type: "KTP",
				identity_number: "777666",
				address: "Jln. Kesetiaan",
			},
		};

		const response = await request(app)
			.post("/api/v1/users")
			.send(newUser)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.status).toBe("Failed");
		expect(response.body.message).toBe("Email Already Used");

		await prisma.profiles.deleteMany({
			where: { identity_number: existingProfile.identity_number },
		});
		await prisma.users.deleteMany({
			where: { email: existingUser.email },
		});
	});
	test("Fail Create User - 400 (Identity Number Already Used)", async () => {
		await prisma.users.create({
			data: {
				name: "Existing User",
				email: "existing2@gmail.com",
				password: "password123",
				profile: {
					create: {
						identity_type: "KTP",
						identity_number: "111222",
						address: "Jln. Existing",
					},
				},
			},
		});

		const existingProfile = await prisma.profiles.findUnique({
			where: { identity_number: "111222" },
		});
		const existingUser = await prisma.users.findUnique({
			where: { email: "existing2@gmail.com" },
		});

		const newUser = {
			name: "Theodore Valseto",
			email: "theo321@gmail.com",
			password: "12345678",
			profile: {
				identity_type: "KTP",
				identity_number: "111222",
				address: "Jln. Kesetiaan",
			},
		};

		const response = await request(app)
			.post("/api/v1/users")
			.send(newUser)
			.set("Accept", "application/json");

		expect(response.status).toBe(400);
		expect(response.body.status).toBe("Failed");
		expect(response.body.message).toBe("Identity Number Already Used");

		await prisma.profiles.deleteMany({
			where: { identity_number: existingProfile.identity_number },
		});
		await prisma.users.deleteMany({
			where: { email: existingUser.email },
		});
	});
	test("Internal Server Error on Get User by ID - 500", async () => {
		const invalidUserId = "invalid-id";

		const response = await request(app)
			.get(`/api/v1/users/${invalidUserId}`)
			.set("Accept", "application/json");

		expect(response.status).toBe(500);
		expect(response.body.status).toBe("Failed");
		expect(response.body.message).toBe(
			"There's Something Wrong with The Server!"
		);
	});
});
