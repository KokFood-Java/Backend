const { loginUser, getUser } = require("../../src/controller/user");
const UserModels = require("../../src/models/user");
const bcrypt = require("bcrypt");

//MOCK
jest.mock("../../src/models/user");
jest.mock("bcrypt");
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("token"),
}));

//TEST LOGIN
describe("Unit Testing for loginUser", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should login user successfully", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };

    const mockUser = {
      _id: "user_id",
      email: "test@example.com",
      password: "hashed_password",
    };

    UserModels.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "200",
      message: "Login user success",
      data: {
        token: "token",
        user: mockUser,
      },
    });
  });

  it("should return error for wrong email", async () => {
    const req = {
      body: {
        email: "wrong@example.com",
        password: "password123",
      },
    };

    UserModels.findOne.mockResolvedValue(null);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "Wrong email",
    });
  });

  it("should return error for wrong password", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "wrongpassword",
      },
    };

    const mockUser = {
      _id: "user_id",
      email: "test@example.com",
      password: "hashed_password",
    };

    UserModels.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "Wrong password",
    });
  });
});

//TEST GET USER
describe("Unit Testing for getUser", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return user data if user exists", async () => {
    const req = {
      body: {
        email: "test@example.com",
      },
    };

    const mockUser = {
      _id: "user_id",
      email: "test@example.com",
      name: "Test User",
    };

    UserModels.findOne.mockResolvedValue(mockUser);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "200",
      message: "Success Get User",
      user: mockUser,
    });
  });

  it("should return error if user does not exist", async () => {
    const req = {
      body: {
        email: "nonexistent@example.com",
      },
    };

    UserModels.findOne.mockResolvedValue(null);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "User does not exist",
    });
  });
});
