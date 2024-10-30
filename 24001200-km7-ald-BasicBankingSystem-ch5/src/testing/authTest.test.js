const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const request = require("supertest");
const app = require("../../app");
let token;

beforeEach(async () => {
	await prisma.users.create({
		data:{
			name: "Aerith Gainsborough",
			email: "aerith@gmail.com",
			password: "aerith123"
		}
	});
});

afterEach(async () => {
    await prisma.users.deleteMany({
        where: {email: "aerith@gmail.com"}
    });
});

afterAll(async () => {
    const findUser = await prisma.users.findUnique({where: {email: "tifae@gmail.com"}});
    await prisma.users.deleteMany({where: {id: findUser.id}});
});

describe("API Integration Testing - Endpoint /register", () => {
    test("Succes Create User - 201", async () => {
        const newUser = {
            name: "Tifa Lockhart",
            email: "tifae@gmail.com",
            password: "tifa1234"
        }
    
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send(newUser)
            .set("Accept", "application/json");
    
        expect(response.status).toBe(201);
        expect(typeof response.body.data).toBe("object");
        expect(response.body.data).toHaveProperty("id");
        expect(response.body.data).toHaveProperty("name");
        expect(response.body.data).toHaveProperty("email",);
        expect(response.body.data).toHaveProperty("password");
    });
    test("Failed Create User - 400 (Missing Fields)", async () => {
        const newUser = {
            email: "tifae@gmail.com",
            password: "tifa1234"
        };
    
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send(newUser)
            .set("Accept", "application/json");
    
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("status", "Failed");
        expect(response.body).toHaveProperty("message", "Failed To Create User, Make Sure To fill all Form");
    });
    test("Failed Create User - 400 (Invalid Email)", async () => {
        const newUser = {
            name: "Tifa Lockhart",
            email: "abc",
            password: "tifa1234"
        };
    
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send(newUser)
            .set("Accept", "application/json");
    
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("status", "Failed");
        expect(response.body).toHaveProperty("message", "Email must be a Gmail address");
    });
    test("Failed Create User - 400 (Invalid Password Length)", async () => {
        const newUser = {
            name: "Tifa Lockhart",
            email: "tifae@gmail.com",
            password: "tifa"
        };
    
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send(newUser)
            .set("Accept", "application/json");
    
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("status", "Failed");
        expect(response.body).toHaveProperty("message", "Password must be at least 8 characters long");
    });
    test("Failed Create User - 400 (Email Already Used)", async () => {
        const newUser = {
            name: "Tifa Lockhart",
            email: "aerith@gmail.com",
            password: "tifa1234"
        };
    
        const response = await request(app)
            .post("/api/v1/auth/register")
            .send(newUser)
            .set("Accept", "application/json");
    
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("status", "Failed");
        expect(response.body).toHaveProperty("message", "Email Already Used");
    });
});

describe("API Integration Testing - Endpoint /login", () => {
    test("Successful login - 200", async () => {
        const loginUser = {
            email: "tifae@gmail.com",
                password: "tifa1234",
            };

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send(loginUser)
                .set("Accept", "application/json");

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("Success");
            expect(response.body).toHaveProperty("accessToken");
            token = response.body.accessToken;
        });
    test("Failed Create User - 400 (Missing Fields)", async () => {
        const newUser = {
            password: "tifa1234"
        };
    
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send(newUser)
            .set("Accept", "application/json");
    
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("status", "Failed");
        expect(response.body).toHaveProperty("message", "Login Failed, Make Sure To fill all Form");


    });
    test("Failed Create User - 400 (Invalid Email)", async () => {
        const newUser = {
            name: "Tifa Lockhart",
            email: "abc",
            password: "tifa1234"
        };
    
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send(newUser)
            .set("Accept", "application/json");
    
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("status", "Failed");
        expect(response.body).toHaveProperty("message", "Email must be a Gmail address");
    });
    test("Failed Create User - 400 (Wrong Email)", async () => {
        const newUser = {
            name: "Tifa Lockhart",
            email: "lockhart@gmail.com",
            password: "tifa1234"
        };
    
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send(newUser)
            .set("Accept", "application/json");
    
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("status", "Failed");
        expect(response.body).toHaveProperty("message", "Email or Password Incorrect!");
    });
    test("Failed Create User - 400 (Wrong Password)", async () => {
        const newUser = {
            name: "Tifa Lockhart",
            email: "tifae@gmail.com",
            password: "tifa"
        };
    
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send(newUser)
            .set("Accept", "application/json");
    
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("status", "Failed");
        expect(response.body).toHaveProperty("message", "Email or Password Incorrect!");
    });
});

describe("API Integration Testing - Endpoint /authenticate", () => {
    test("Success Accessing Authenticate Endpoint - 200", async() => {
        console.log(token);
        
        const response = await request(app)
            .get("/api/v1/auth/authenticate")
            .set("Authorization", `Bearer ${token}`)
            .set("Accept", "application/json");
        
        console.log(response.body);
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("Success");
        expect(response.body.message).toBe("You're Okay To Be In Here!");
    });
    test("Failed Accessing Authenticate Endpoint - 401", async() => {
        const response = await request(app)
            .get("/api/v1/auth/authenticate")
            .set("Accept", "application/json");

        expect(response.status).toBe(401);
        expect(response.body.status).toBe("Failed");
        expect(response.body.message).toBe("You aren\'t Authorized Here!");
    });
});
