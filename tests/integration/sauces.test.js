const request = require("supertest");

const Sauce = require("../../models/Sauce");

let server;

describe("(IntegrationTesting): Sauces Routes & Controllers", () => {
  //Setup and Teardown
  beforeAll(() => {
    return (server = require("../../index"));
  });
  afterAll(() => {
    return server.close();
  });

  //Tests proper
  describe("GET /api/sauces", () => {
    test("should return all sauces", async () => {
      const res = await request(server).get("/api/sauces");

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(3);
      expect(
        res.body.some((sauce) => sauce.name === "HP Brown Sauce")
      ).toBeTruthy();
    });
  });
  describe("GET /api/sauces/:id", () => {
    test("should return a sauce with a given id", async () => {
      const sauce = await Sauce.findOne();
      const res = await request(server).get(`/api/sauces/${sauce._id}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toMatch(sauce.name);
    });
  });
});
