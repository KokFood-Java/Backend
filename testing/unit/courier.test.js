const {
  checkOrder,
  takeOrder,
  pickUpOrder,
  completeOrder,
} = require("../../src/controller/courier");
const TransactionModels = require("../../src/models/transaction");
const UserModels = require("../../src/models/user");

//MOCK
jest.mock("../../src/models/transaction");
jest.mock("../../src/models/user");

//TEST CHECK ORDER
describe("Unit Testing for checkOrder", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return transactions if there are orders being cooked", async () => {
    const mockTransactions = [
      {
        _id: "transaction_id_1",
        transaction_status: "COOKING",
        id_courier: null,
        order_type: "DELIVERY",
      },
      {
        _id: "transaction_id_2",
        transaction_status: "READYTOPICKUP",
        id_courier: null,
        order_type: "DELIVERY",
      },
    ];

    TransactionModels.find.mockResolvedValue(mockTransactions);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await checkOrder({}, res);
    console.log(res.json.mock.calls[0][0]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "200",
      message: "Success",
      data: mockTransactions,
    });
  });

  it("should return error if there are no orders being cooked", async () => {
    TransactionModels.find.mockResolvedValue([]);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await checkOrder({}, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "No order is currently being cooked",
    });
  });
});

//TEST TAKE ORDER
describe("Unit Testing for takeOrder", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should take an order successfully", async () => {
    const id_transaction = "transaction_id";
    const id_courier = "courier_id";

    const mockTransaction = {
      _id: id_transaction,
      id_courier: null,
      transaction_status: "COOKING",
      order_type: "DELIVERY",
    };

    TransactionModels.findOneAndUpdate.mockResolvedValue(mockTransaction);

    const req = {
      params: {
        id_transaction: id_transaction,
      },
      user: {
        id: id_courier,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await takeOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "200",
      message: "Success take order",
      data: mockTransaction,
    });
  });

  it("should return an error if order is not found or already taken", async () => {
    TransactionModels.findOneAndUpdate.mockResolvedValue(null);

    const req = {
      params: {
        id_transaction: "transaction_id",
      },
      user: {
        id: "courier_id",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await takeOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "Order not found or already taken",
    });
  });
});

//TEST PICKUP ORDER
describe("Unit Testing for pickUpOrder", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should pick up an order successfully", async () => {
    const id_courier = "courier_id";

    const mockTransaction = {
      _id: "transaction_id",
      id_courier: id_courier,
      transaction_status: "READYTOPICKUP",
    };

    TransactionModels.findOneAndUpdate.mockResolvedValue(mockTransaction);

    const req = {
      user: {
        id: id_courier,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await pickUpOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "200",
      message: "Success pick up order",
      data: mockTransaction,
    });
  });

  it("should return an error if order is not found or already taken", async () => {
    TransactionModels.findOneAndUpdate.mockResolvedValue(null);

    const req = {
      user: {
        id: "courier_id",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await pickUpOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "Order not found or already taken",
    });
  });
});

//TEST COMPLETE ORDER
describe("Unit Testing for completeOrder", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should complete an order successfully", async () => {
    const id_courier = "courier_id";
    const delivery_fee = 100;

    const mockTransaction = {
      _id: "transaction_id",
      id_courier: id_courier,
      transaction_status: "ONDELIVERY",
      delivery_fee: delivery_fee,
    };

    const mockCourier = {
      _id: id_courier,
      wallet: 100,
    };

    TransactionModels.findOneAndUpdate.mockResolvedValue(mockTransaction);
    UserModels.findOneAndUpdate.mockResolvedValue(mockCourier);

    const req = {
      user: {
        id: id_courier,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await completeOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "200",
      message: "Success Delivery",
      data: mockTransaction,
      wallet: delivery_fee,
    });
  });

  it("should return an error if order is not found", async () => {
    TransactionModels.findOneAndUpdate.mockResolvedValue(null);

    const req = {
      user: {
        id: "courier_id",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await completeOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "Order not found",
    });
  });
});
