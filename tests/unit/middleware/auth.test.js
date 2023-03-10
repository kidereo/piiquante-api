const mongoose = require("mongoose");

const { User } = require("../../../models/User");
const auth = require("../../../middleware/auth");

describe("(UnitTesting): Auth middleware", () => {
  test("should populate req.user with a valid token payload", () => {
    const user = {
      _id: mongoose.Types.ObjectId().toHexString(),
      isAdmin: true,
    };
    const token = new User(user).generateAuthToken();
    const req = { header: jest.fn().mockReturnValue(token) };
    const res = {};
    const next = jest.fn();

    auth(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user).toMatchObject(user);
  });
});
