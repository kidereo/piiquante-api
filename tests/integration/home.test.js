const request = require("supertest");
const config = require("config");

let server;

describe("(IntegrationTesting): Home Routes & Controllers", () => {
  /*
   * Setup and teardown with cleanup.
   */
  beforeAll(() => {
    server = require("../../index");
  });
  afterAll(async () => {
    await server.close();
  });

  /*
   * Test suite.
   */
  describe("GET /api", () => {
    test("should return the 200 response and app name", async () => {
      const res = await request(server).get("/api");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(config.get("app-name"));
    });
  });
});
