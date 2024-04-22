const {
  insertDiscount,
  updateDiscount,
  deleteDiscount,
  updateOrder,
} = require("../../src/controller/admin");
const DiscountModels = require("../../src/models/discount");
const TransactionModels = require("../../src/models/transaction");

//MOCK
jest.mock("../../src/models/discount");
jest.mock("../../src/models/transaction");

//TEST INSERT DISCOUNT
describe("Unit Testing for insertDiscount", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should insert discount successfully", async () => {
    const req = {
      body: {
        discount_code: "DISCOUNT123",
        percentage: 10,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    DiscountModels.findOne.mockResolvedValueOnce(null);
    DiscountModels.create.mockResolvedValueOnce({
      _id: "discount_id",
      discount_code: "DISCOUNT123",
      percentage: 10,
    });

    await insertDiscount(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "200",
      message: "Discount DISCOUNT123 successfully added",
      discount: {
        _id: "discount_id",
        discount_code: "DISCOUNT123",
        percentage: 10,
      },
    });
  });

  it("should return error if code already exists", async () => {
    const req = {
      body: {
        discount_code: "DISCOUNT123",
        percentage: 10,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    DiscountModels.findOne.mockResolvedValueOnce({
      _id: "existing_discount_id",
      discount_code: "DISCOUNT123",
      percentage: 10,
    });

    await insertDiscount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "Code is already exist",
    });
  });

  it("should return error if discount creation fails", async () => {
    const req = {
      body: {
        discount_code: "DISCOUNT123",
        percentage: 10,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    DiscountModels.findOne.mockResolvedValueOnce(null);
    DiscountModels.create.mockRejectedValueOnce(new Error("Database error"));

    await insertDiscount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "500",
      message: "Database error",
    });
  });
});

//TEST UPDATE DISCOUNT
describe("Unit Testing for updateDiscount", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update discount successfully", async () => {
    const req = {
      params: {
        id_discount: "discount_id",
      },
      body: {
        discount_code: "UPDATED123",
        percentage: 20,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    DiscountModels.findOne.mockResolvedValueOnce({
      _id: "discount_id",
      discount_code: "DISCOUNT123",
      percentage: 10,
    });

    DiscountModels.findOneAndUpdate.mockResolvedValueOnce({
      _id: "discount_id",
      discount_code: "UPDATED123",
      percentage: 20,
    });

    await updateDiscount(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "200",
      message: "Success update UPDATED123",
      discount: {
        _id: "discount_id",
        discount_code: "UPDATED123",
        percentage: 20,
      },
    });
  });

  it("should return error if discount not found", async () => {
    const req = {
      params: {
        id_discount: "discount_id",
      },
      body: {
        discount_code: "UPDATED123",
        percentage: 20,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    DiscountModels.findOne.mockResolvedValueOnce(null);

    await updateDiscount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "Discount not found",
    });
  });

  it("should return error if not all fields are filled", async () => {
    const req = {
      params: {
        id_discount: "discount_id",
      },
      body: {
        discount_code: "",
        percentage: null,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateDiscount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "Fill all fields",
    });
  });

  it("should return error if update operation fails", async () => {
    const req = {
      params: {
        id_discount: "discount_id",
      },
      body: {
        discount_code: "UPDATED123",
        percentage: 20,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    DiscountModels.findOne.mockResolvedValueOnce({
      _id: "discount_id",
      discount_code: "DISCOUNT123",
      percentage: 10,
    });

    DiscountModels.findOneAndUpdate.mockRejectedValueOnce(
      new Error("Database error")
    );

    await updateDiscount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "500",
      message: "Database error",
    });
  });
});

//TEST DELETE DISCOUNT
describe("Unit Testing for deleteDiscount", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should delete discount successfully", async () => {
    const id_discount = "discount_id";

    const mockDeletedDiscount = {
      _id: id_discount,
      discount_code: "DISCOUNT10",
      percentage: 10,
    };

    DiscountModels.findByIdAndDelete.mockResolvedValue(mockDeletedDiscount);

    const req = { params: { id_discount } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deleteDiscount(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "200",
      message: `Success delete discount with ID ${id_discount}`,
    });
  });

  it("should return error if discount not found", async () => {
    const id_discount = "non_existent_discount_id";

    DiscountModels.findByIdAndDelete.mockResolvedValue(null);

    const req = { params: { id_discount } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deleteDiscount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "Discount not found",
    });
  });

  it("should handle error during deletion", async () => {
    const id_discount = "discount_id";
    const errorMessage = "Database error";

    DiscountModels.findByIdAndDelete.mockRejectedValue(new Error(errorMessage));

    const req = { params: { id_discount } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deleteDiscount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "500",
      message: errorMessage,
    });
  });
});

//TEST UPDATE ORDER
describe("Unit Testing for updateOrder", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update order status to "READYTOPICKUP"', async () => {
    const req = {
      params: {
        id_transaction: "transaction_id",
      },
    };

    const mockUpdatedTransaction = {
      _id: "transaction_id",
      transaction_status: "READYTOPICKUP",
    };

    TransactionModels.findOneAndUpdate.mockResolvedValue(
      mockUpdatedTransaction
    );

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "200",
      message: "Success",
      data: mockUpdatedTransaction,
    });
  });

  it("should handle error if update fails", async () => {
    const req = {
      params: {
        id_transaction: "transaction_id",
      },
    };

    const errorMessage = "Database error";
    TransactionModels.findOneAndUpdate.mockRejectedValue(
      new Error(errorMessage)
    );

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "500",
      message: errorMessage,
    });
  });
});
