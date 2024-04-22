const {
  orderStatus,
  payTransaction,
  orderMenu,
  restaurantReview,
  menuReview,
} = require("../../src/controller/customer");
const TransactionModels = require("../../src/models/transaction");
const UserModels = require("../../src/models/user");
const MenuModels = require("../../src/models/menu");
const DetailTransactionsModels = require("../../src/models/transaction_detail");
const DiscountModels = require("../../src/models/discount");
const RestaurantReviewModels = require("../../src/models/restaurant_review");
const MenuReviewModels = require("../../src/models/menu_review");

//MOCK
jest.mock("../../src/models/transaction");
jest.mock("../../src/models/user");
jest.mock("../../src/models/transaction_detail");
jest.mock("../../src/models/discount");
jest.mock("../../src/models/restaurant_review");
jest.mock("../../src/models/menu_review");

//TEST ORDER MENU
describe("Unit Testing for orderMenu", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: {
        id: "user_id",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return 400 if no menu items selected or order type specified", async () => {
    await orderMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "No menu items selected or order type specified",
    });
  });

  it("should return 400 if user still has pending order", async () => {
    req.body = {
      menu_items: [
        {
          id_menu: "menu_id",
          amount: 2,
        },
      ],
      order_type: "DELIVERY",
    };

    TransactionModels.findOne.mockResolvedValueOnce({
      id_user: "user_id",
      transaction_status: "pending",
    });

    await orderMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "You still have pending order",
    });
  });

  it("should return 400 if menu not found", async () => {
    jest.spyOn(MenuModels, "findOne").mockResolvedValueOnce(null);

    req.body = {
      menu_items: [
        {
          id_menu: "invalid_menu_id",
          amount: 2,
        },
      ],
      order_type: "DELIVERY",
    };

    await orderMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "Menu not found",
    });

    // Restore the original implementation after the test
    MenuModels.findOne.mockRestore();
  });

  it("should return 400 if requested amount exceeds available stock", async () => {
    req.body = {
      menu_items: [
        {
          id_menu: "menu_id",
          menu_name: "menu_name",
          amount: 10,
        },
      ],
      order_type: "DELIVERY",
    };

    const mockFindOne = jest.spyOn(MenuModels, "findOne");
    mockFindOne.mockResolvedValue({
      _id: "menu_id",
      menu_stock: 5,
      menu_price: 10,
    });

    await orderMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "Requested amount exceeds available stock for menu undefined",
    });

    // Cleanup
    mockFindOne.mockRestore();
  });

  it("should return 200 and place order successfully for valid input", async () => {
    req.body = {
      menu_items: [
        {
          id_menu: "menu_id",
          amount: 2,
        },
      ],
      order_type: "DELIVERY",
    };

    const mockMenu = {
      _id: "menu_id",
      menu_stock: 10, // Assuming menu stock is more than enough
      menu_price: 10, // Assuming menu price is 10
      save: jest.fn(), // Mock save function
    };

    const mockMenuFindOne = jest.spyOn(MenuModels, "findOne");
    mockMenuFindOne.mockResolvedValue(mockMenu);

    const mockTransactionsFindOne = jest.spyOn(TransactionModels, "findOne");
    mockTransactionsFindOne.mockResolvedValue(null); // Assuming no pending transaction

    const mockTransactionsCreate = jest.spyOn(TransactionModels, "create");
    mockTransactionsCreate.mockResolvedValue({
      _id: "transaction_id",
    });

    const mockDetailTransactionsInsertMany = jest.spyOn(
      DetailTransactionsModels,
      "insertMany"
    );
    mockDetailTransactionsInsertMany.mockResolvedValue([
      {
        id_menu: "menu_id",
        menu_name: "Menu Name",
        quantity: 2,
      },
    ]);

    await orderMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "200",
      message: "Order placed successfully",
    });

    // Check if save function is called
    expect(mockMenu.save).toHaveBeenCalled();

    // Cleanup
    mockMenuFindOne.mockRestore();
    mockTransactionsFindOne.mockRestore();
    mockTransactionsCreate.mockRestore();
    mockDetailTransactionsInsertMany.mockRestore();
  });
});

//TEST ORDER STATUS
describe("Unit Testing for orderStatus", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the status of the user's order successfully", async () => {
    const id_user = "user_id";

    const mockTransaction = [
      {
        _id: "transaction_id_1",
        id_user: id_user,
        transaction_status: "PENDING",
      },
      {
        _id: "transaction_id_2",
        id_user: id_user,
        transaction_status: "READYTOPICKUP",
      },
    ];

    TransactionModels.find.mockResolvedValue(mockTransaction);

    const req = {
      user: {
        id: id_user,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await orderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "200",
      message: "Success",
      data: {
        transaction: mockTransaction,
      },
    });
  });

  it("should return an error if no transaction found for the user", async () => {
    const id_user = "user_id";

    TransactionModels.find.mockResolvedValue([]);

    const req = {
      user: {
        id: id_user,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await orderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "Transaction not found",
    });
  });
});

//TEST PAY TRANSACTION
describe("Unit Testing for payTransaction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully process payment for a transaction with no discount", async () => {
    const req = {
      user: {
        id: "user_id",
      },
      body: {},
    };

    const mockCustomer = {
      _id: "user_id",
      wallet: 100,
    };

    const mockPendingTransaction = {
      _id: "transaction_id",
      id_user: "user_id",
      total_price: 50,
      delivery_fee: 10,
      transaction_status: "PENDING",
    };

    UserModels.findOne.mockResolvedValue(mockCustomer);
    TransactionModels.findOne.mockResolvedValue(mockPendingTransaction);
    DiscountModels.findOne.mockResolvedValue(null);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await payTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "200",
      message: "Thank you for your order!",
      order: expect.objectContaining(mockPendingTransaction),
      orderDetail: undefined,
    });
  });

  it("should return 400 if the discount code is invalid", async () => {
    const req = {
      user: {
        id: "user_id",
      },
      body: {
        discount_code: "invalid_discount_code",
      },
    };

    const mockCustomer = {
      _id: "user_id",
      wallet: 100,
    };

    const mockPendingTransaction = {
      _id: "transaction_id",
      id_user: "user_id",
      total_price: 50,
      delivery_fee: 10,
      transaction_status: "PENDING",
    };

    UserModels.findOne.mockResolvedValue(mockCustomer);
    TransactionModels.findOne.mockResolvedValue(mockPendingTransaction);
    DiscountModels.findOne.mockResolvedValue("");

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await payTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "Discount Code Invalid!",
    });
  });

  it("should return 400 if there are not enough funds in the wallet", async () => {
    const req = {
      user: {
        id: "user_id",
      },
      body: {},
    };

    const mockCustomer = {
      _id: "user_id",
      wallet: 40,
    };

    const mockPendingTransaction = {
      _id: "transaction_id",
      id_user: "user_id",
      total_price: 50,
      delivery_fee: 10,
      transaction_status: "PENDING",
    };

    UserModels.findOne.mockResolvedValue(mockCustomer);
    TransactionModels.findOne.mockResolvedValue(mockPendingTransaction);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await payTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "There are not enough funds in your wallet!",
      Price: 60,
      Current_Wallet: 40,
    });
  });

  it("should successfully process payment for a transaction with a valid discount", async () => {
    const req = {
      user: {
        id: "user_id",
      },
      body: {
        discount_code: "valid_discount_code",
      },
    };

    const mockCustomer = {
      _id: "user_id",
      wallet: 100,
    };

    const mockPendingTransaction = {
      _id: "transaction_id",
      id_user: "user_id",
      total_price: 100,
      delivery_fee: 10,
      transaction_status: "PENDING", // Ubah status menjadi "COOKING"
    };

    UserModels.findOne.mockResolvedValue(mockCustomer);
    TransactionModels.findOne.mockResolvedValue(mockPendingTransaction);
    DiscountModels.findOne.mockResolvedValue({
      _id: "valid_discount_id",
      percentage: 10,
    });

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await payTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "200",
      message: "Thank you for your order!",
      order: expect.objectContaining(mockPendingTransaction),
      orderDetail: undefined,
    });
  });

  it("should return 400 if there is no pending transaction", async () => {
    const req = {
      user: {
        id: "user_id",
      },
      body: {},
    };

    // Simulate no pending transaction
    TransactionModels.findOne.mockResolvedValue(null);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await payTransaction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "There are no pending transaction!",
    });
  });
});

//TEST RESTAURANT REVIEW
describe("Unit Testing for restaurantReview", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        id: "user_id",
      },
      body: {
        review_stars: 5,
        review_desc: "Great food and service!",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return 200 and create a new review if user hasn't reviewed yet", async () => {
    RestaurantReviewModels.findOne.mockResolvedValueOnce(null);

    await restaurantReview(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "200",
      message: "Thank you for your review!",
      stars: 5,
      review: "Great food and service!",
    });
  });

  it("should return 400 if user has already reviewed", async () => {
    RestaurantReviewModels.findOne.mockResolvedValueOnce({});

    await restaurantReview(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "You Already Reviewed The Restaurant!",
    });
  });

  it("should return 500 if an error occurs", async () => {
    RestaurantReviewModels.findOne.mockRejectedValueOnce(
      new Error("Database error")
    );

    await restaurantReview(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "500",
      message: "Database error",
    });
  });
});

//TEST MENU REVIEW
describe("Unit Testing for menuReview", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        id: "user_id",
      },
      params: {
        id_transaction: "transaction_id",
      },
      body: {
        review_desc: "Delicious food!",
      },
      file: {
        filename: "review.jpg",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return 200 and create a new menu review", async () => {
    TransactionModels.findOne.mockResolvedValueOnce({
      _id: "transaction_id",
      id_user: "user_id",
      transaction_status: "DONE",
    });

    MenuReviewModels.findOne.mockResolvedValueOnce(null);
    MenuReviewModels.create.mockResolvedValueOnce({});

    await menuReview(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "200",
      message: "Success add review",
      data: {},
    });
  });

  it("should return 400 if transaction is not found or not done yet", async () => {
    TransactionModels.findOne.mockResolvedValueOnce(null);

    await menuReview(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "Transaction not found or is not done yet!",
    });
  });

  it("should return 400 if user has already reviewed the transaction", async () => {
    TransactionModels.findOne.mockResolvedValueOnce({
      _id: "transaction_id",
      id_user: "user_id",
      transaction_status: "DONE",
    });

    MenuReviewModels.findOne.mockResolvedValueOnce({});

    await menuReview(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "400",
      message: "You already review this transaction",
    });
  });

  it("should return 500 if an error occurs", async () => {
    TransactionModels.findOne.mockRejectedValueOnce(
      new Error("Database error")
    );

    await menuReview(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "500",
      message: "Database error",
    });
  });
});
