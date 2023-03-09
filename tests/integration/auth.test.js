const request = require("supertest");
require("dotenv").config();

const { User } = require("../../models/User");
const Sauce = require("../../models/Sauce");

let server;

describe("(IntegrationTesting): Auth Routes, Middleware & Controllers", () => {
  /*
   * Setup and teardown with cleanup.
   */
  beforeAll(() => {
    server = require("../../index");
  });
  afterAll(async () => {
    await Sauce.findOneAndDelete({ name: "Hot Test Sauce" });
    await server.close();
  });

  /*
   * Test suite.
   */
  describe("POST /api/auth/login", () => {
    test("should return the 400 error if email is missing", async () => {
      const res = await request(server).post("/api/auth/login").send({
        password: "password",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    test("should return the 400 error if password is missing", async () => {
      const res = await request(server).post("/api/auth/login").send({
        email: "tester@test.dev",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    test("should return the 400 error if user is unknown", async () => {
      const res = await request(server).post("/api/auth/login").send({
        email: "test@test.dev",
        password: "password",
      });

      expect(res.body).toHaveProperty("error");
      expect(res.status).toBe(400);
    });

    test("should return auth token on sucessfull login", async () => {
      const res = await request(server).post("/api/auth/login").send({
        email: process.env.TEST_EMAIL,
        password: process.env.TEST_PASSWORD,
      });

      expect(res.status).toBe(200);
      expect(res.headers).toHaveProperty("x-auth-token");
    });
  });

  describe("auth middleware", () => {
    test("should return the 401 error if no token provided", async () => {
      const res = await request(server)
        .post("/api/sauces")
        .set("x-auth-token", "")
        .send({
          name: "Hot Test Sauce 2",
          manufacturer: "Test Manufacturer",
          description: "Hot Sauce to test the app.",
          mainPepper: "Jest",
          heat: 5,
        });

      expect(res.status).toBe(401);
    });

    test("should return the 400 error if the token is invalid", async () => {
      const res = await request(server)
        .post("/api/sauces")
        .set("x-auth-token", "token")
        .send({
          name: "Hot Test Sauce",
          manufacturer: "Test Manufacturer",
          description: "Hot Sauce to test the app.",
          mainPepper: "Jest",
          heat: 5,
        });

      expect(res.status).toBe(400);
    });

    test("should return the 200 status if the token is valid", async () => {
      const user = await User.findOne();
      const token = await user.generateAuthToken();
      const res = await request(server)
        .post("/api/sauces")
        .set("x-auth-token", token)
        .send({
          name: "Hot Test Sauce",
          manufacturer: "Test Manufacturer",
          description: "Hot Sauce to test the app.",
          mainPepper: "Jest",
          heat: 5,
        });

      expect(res.status).toBe(200);
    });
  });
});
