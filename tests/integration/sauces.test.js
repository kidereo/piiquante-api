const request = require("supertest");
const crypto = require("crypto");

const Sauce = require("../../models/Sauce");
const { User } = require("../../models/User");

let server;
let randomUserId;

describe("(IntegrationTesting): Sauces Routes & Controllers", () => {
  /*
   * Setup and teardown with cleanup.
   */
  beforeAll(async () => {
    randomUserId = crypto.randomBytes(12).toString("hex");
    server = require("../../index");
  });
  afterAll(async () => {
    await Sauce.findOneAndDelete({ name: "Hot Test Sauce" });
    await Sauce.findOneAndDelete({ name: "Hot Test Sauce 2" });
    server.close();
  });

  /*
   * Test suite.
   */
  describe("GET /api/sauces", () => {
    test("should return all sauces", async () => {
      //Add a new sauce to the database
      const user = await User.findOne();
      const testSauce = new Sauce({
        name: "Hot Test Sauce",
        manufacturer: "Test Manufacturer",
        description: "Hot Sauce to test the app.",
        mainPepper: "Jest",
        heat: 5,
        userId: user._id,
      });
      await testSauce.save();

      //Send a request to see all sauces
      const res = await request(server).get("/api/sauces");

      //Expect to see the recently added sauce in the response
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(3);
      expect(
        res.body.some((sauce) => sauce.name === "Hot Test Sauce")
      ).toBeTruthy();
    });
  });

  describe("GET /api/sauces/:id", () => {
    test("should return a sauce with an existing id", async () => {
      //Find the test sauce
      const testSauce = await Sauce.findOne({ name: "Hot Test Sauce" });

      //Send a request to return the test sauce
      const res = await request(server).get(`/api/sauces/${testSauce._id}`);

      //Expect the required sauce to be returned
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", testSauce.name);
    });

    test("should return the 404 error if unknown id is supplied", async () => {
      //Send a request to return a sauce with a non-existing id
      //const unknownId = "6405d61c3f35bf4e94c3a959";
      const unknownId = crypto.randomBytes(12).toString("hex");
      const res = await request(server).get(`/api/sauces/${unknownId}`);

      //Expect the 404 error to be returned
      expect(res.status).toBe(404);
    });

    test("should return the 400 error if invalid id is supplied", async () => {
      //Send a request to return a sauce with an invalid id
      const invalidId = 1;
      const res = await request(server).get(`/api/sauces/${invalidId}`);

      //Expect the 404 error to be returned
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/sauces", () => {
    test("should return the 401 error if user is not logged in", async () => {
      //No token is sent in the header
      const res = await request(server).post("/api/sauces").send({
        name: "Hot Test Sauce",
        manufacturer: "Test Manufacturer",
        description: "Hot Sauce to test the app.",
        mainPepper: "Jest",
        heat: 5,
        userId: randomUserId,
      });

      //Expect the 401 error
      expect(res.status).toBe(401);
    });

    test("should return the 400 error if sauce name is less than 5 characters", async () => {
      const sauceName = new Array(4).join("a");
      const user = await User.findOne();
      const token = await user.generateAuthToken();
      //Add token in the header but less than 5 characters in the name
      const res = await request(server)
        .post("/api/sauces")
        .set("x-auth-token", token)
        .send({
          name: sauceName,
          manufacturer: "Test Manufacturer",
          description: "Hot Sauce to test the app.",
          mainPepper: "Jest",
          heat: 5,
        });

      //Expect the 400 error
      expect(res.status).toBe(400);
    });

    test("should return the 400 error if sauce name is more than 50 characters", async () => {
      const sauceName = new Array(55).join("a");
      const user = await User.findOne();
      const token = await user.generateAuthToken();
      //Add token in the header but more than 50 characters in the name
      const res = await request(server)
        .post("/api/sauces")
        .set("x-auth-token", token)
        .send({
          name: sauceName,
          manufacturer: "Test Manufacturer",
          description: "Hot Sauce to test the app.",
          mainPepper: "Jest",
          heat: 5,
        });

      //Expect the 400 error
      expect(res.status).toBe(400);
    });

    test("should return the 400 error if the user does not exist", async () => {
      const sauceName = new Array(10).join("a");
      const token = new User().generateAuthToken();

      const res = await request(server)
        .post("/api/sauces")
        .set("x-auth-token", token)
        .send({
          name: sauceName,
          manufacturer: "Test Manufacturer",
          description: "Hot Sauce to test the app.",
          mainPepper: "Jest",
          heat: 5,
        });

      //Expect the 400 error
      expect(res.status).toBe(400);
    });

    test("should save the sauce and return the 200 response and the new sauce object on successfull addition", async () => {
      const user = await User.findOne();
      const token = await user.generateAuthToken();
      const res = await request(server)
        .post("/api/sauces")
        .set("x-auth-token", token)
        .send({
          name: "Hot Test Sauce 2",
          manufacturer: "Test Manufacturer",
          description: "Hot Sauce to test the app.",
          mainPepper: "Jest",
          heat: 5,
        });

      const newSauce = await Sauce.find({ name: "Hot Test Sauce 2" });

      //Expect the 200 response and the new sauce object
      expect(res.status).toBe(200);
      expect(newSauce).not.toBeNull();
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "Hot Test Sauce 2");
    });
  });

  describe("PUT /api/sauces/:id", () => {
    test("should return the 400 error if invalid id is supplied", async () => {
      const user = await User.findOne();
      const token = await user.generateAuthToken();
      const invalidId = 1;

      const res = await request(server)
        .put(`/api/sauces/${invalidId}`)
        .set("x-auth-token", token)
        .send({ heat: 10 });

      expect(res.status).toBe(400);
    });

    test("should return the 404 error if unknown id is supplied", async () => {
      const user = await User.findOne();
      const token = await user.generateAuthToken();
      const unknownId = crypto.randomBytes(12).toString("hex");

      const res = await request(server)
        .put(`/api/sauces/${unknownId}`)
        .set("x-auth-token", token)
        .send({ heat: 10 });

      expect(res.status).toBe(404);
    });

    test("should return the 401 error if user is not allowed to edit given sauce", async () => {
      const user = await User.findOne();
      const token = await user.generateAuthToken();
      const sauce = await Sauce.findOne();

      const res = await request(server)
        .put(`/api/sauces/${sauce._id}`)
        .set("x-auth-token", token)
        .send({ heat: 10 });

      expect(res.status).toBe(401);
    });

    test("should return the 200 status if user is allowed to edit given sauce", async () => {
      const user = await User.findOne();
      const token = await user.generateAuthToken();
      const sauce = await Sauce.findOne({ userId: user._id });

      const res = await request(server)
        .put(`/api/sauces/${sauce._id}`)
        .set("x-auth-token", token)
        .send({ heat: 10 });

      expect(res.status).toBe(200);
      expect(res.body.heat).toBe(10);
    });
  });

  describe("DELETE /api/sauces/:id", () => {
    test("should return the 400 error if invalid id is supplied", async () => {
      const user = await User.findOne();
      const token = await user.generateAuthToken();
      const invalidId = 1;

      const res = await request(server)
        .delete(`/api/sauces/${invalidId}`)
        .set("x-auth-token", token);

      expect(res.status).toBe(400);
    });

    test("should return the 404 error if unknown id is supplied", async () => {
      const user = await User.findOne();
      const token = await user.generateAuthToken();
      const unknownId = crypto.randomBytes(12).toString("hex");

      const res = await request(server)
        .delete(`/api/sauces/${unknownId}`)
        .set("x-auth-token", token);

      expect(res.status).toBe(404);
    });

    test("should return the 401 error if user is not allowed to delete given sauce", async () => {
      const user = await User.findOne();
      const token = await user.generateAuthToken();
      const sauce = await Sauce.findOne();

      const res = await request(server)
        .delete(`/api/sauces/${sauce._id}`)
        .set("x-auth-token", token);

      expect(res.status).toBe(401);
    });

    test("should return the 200 status if user is allowed to delete given sauce", async () => {
      const user = await User.findOne();
      const token = await user.generateAuthToken();
      const sauce = await Sauce.findOne({ userId: user._id });

      const res = await request(server)
        .delete(`/api/sauces/${sauce._id}`)
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
    });
  });
});
