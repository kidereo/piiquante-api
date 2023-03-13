const error = require("../../../middleware/error");

describe("(UnitTesting): Error middleware", () => {
  test("should return the 500 status, an error message and abort without calling next()", () => {
    const err = {
      message: "Fatal error",
      code: 500,
    };
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    error(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: err.message });
    expect(next).not.toHaveBeenCalled();
  });
});
