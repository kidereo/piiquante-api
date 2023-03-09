const request = require("supertest");

const { User } = require("../../models/User");

let server;

describe("(IntegrationTesting): Users Routes, Middleware & Controllers", () => {
  /*
   * Setup and teardown with cleanup.
   */
  beforeAll(() => {
    server = require("../../index");
  });
  afterAll(async () => {
    await User.findOneAndDelete({ email: "tester@test.com" });
    await User.findOneAndDelete({ email: "test_user@test.com" });
    await User.findOneAndDelete({ email: "test_user_2@test.com" });
    await server.close();
  });

  /*
   * Test suite.
   */
  describe("GET /api/users", () => {
    test("should return the 401 error if not auth token is sent", async () => {
      const res = await request(server).get("/api/users");

      expect(res.status).toBe(401);
    });

    test("should return all users to an admin", async () => {
      //Add a new user to the database
      const newUser = new User({
        email: "tester@test.com",
        password: "password",
        isAdmin: true,
      });
      await newUser.save();

      const authUser = await User.findOne({ email: "tester@test.com" });
      const token = authUser.generateAuthToken();

      //Send a request to see all users
      const res = await request(server)
        .get("/api/users")
        .set("x-auth-token", token);

      //Expect to see 200 response and the recently added user in it
      expect(res.status).toBe(200);
      expect(
        res.body.some((user) => user.email === "tester@test.com")
      ).toBeTruthy();
    });

    test("should return the 403 error to a non admin", async () => {
      const authUser = await User.findOne({ isAdmin: null });
      const token = authUser.generateAuthToken();

      const res = await request(server)
        .get("/api/users")
        .set("x-auth-token", token);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/users/me", () => {
    test("should return own info to the currently authenticated user", async () => {
      const user = await User.findOne();
      const token = user.generateAuthToken();

      const res = await request(server)
        .get("/api/users/me")
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(user.email);
    });
  });

  describe("POST /api/auth/signup", () => {
    test("should return the 400 error if the request body is incomplete", async () => {
      const res = await request(server)
        .post("/api/auth/signup")
        .send({ email: "test_user@test.com" });

      expect(res.status).toBe(400);
    });

    test("should return the 400 error if the user already exists", async () => {
      const testUser = new User({
        email: "test_user@test.com",
        password: "password",
      });
      await testUser.save();

      const res = await request(server)
        .post("/api/auth/signup")
        .send({ email: "test_user@test.com", password: "password" });

      expect(res.status).toBe(400);
    });

    test("should save the user and return the 200 response and the new user object on successfull addition", async () => {
      const res = await request(server)
        .post("/api/auth/signup")
        .send({ email: "test_user_2@test.com", password: "password" });

      const newUser = await User.findOne({ email: "test_user_2@test.com" });

      expect(res.status).toBe(200);
      expect(res.body.value.email).toBe(newUser.email);
    });
  });
});
