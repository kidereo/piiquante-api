require("dotenv").config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const { User, validateUser } = require("../../../models/User");
const auth = require("../../../middleware/auth");
const jwtKey = process.env.JWT_PRIVATE_KEY;

describe("auth middleware", () => {
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
