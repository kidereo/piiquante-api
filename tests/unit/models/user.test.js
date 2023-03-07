require("dotenv").config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const { User, validateUser } = require("../../../models/User");
const jwtKey = process.env.JWT_PRIVATE_KEY;

describe("(UnitTesting): User functions", () => {
  describe("user.validateUser", () => {
    it("should validate user details", () => {
      const userDetails = {
        email: "test@test.com",
        password: "password",
        isAdmin: true,
      };
      const validatedDetails = validateUser(userDetails);
      expect(validatedDetails).toEqual({ value: userDetails });
    });
  });

  describe("user.generateAuthToken", () => {
    it("should return a valid token", () => {
      //const userDetails = { _id: "6406f84c8f4d08add4053b0f", isAdmin: true };
      const userDetails = {
        _id: mongoose.Types.ObjectId().toHexString(),
        email: "test@test.com",
        isAdmin: true,
      };
      const user = new User(userDetails);
      const token = user.generateAuthToken();
      const decodedToken = jwt.verify(token, jwtKey);
      expect(decodedToken).toMatchObject(userDetails);
    });
  });
});
