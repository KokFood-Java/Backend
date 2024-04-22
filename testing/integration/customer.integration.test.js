const request = require("supertest");
const app = require("../../src/server"); // Ubah sesuai dengan lokasi server.js Anda
const UserModels = require("../../src/models/user"); // Ubah sesuai dengan lokasi model user.js Anda
const MenuModels = require("../../src/models/menu"); // Ubah sesuai dengan lokasi model user.js Anda
const TransactionModels = require("../../src/models/transaction"); // Ubah sesuai dengan lokasi model user.js Anda
const bcrypt = require("bcrypt");

describe("Integration testing for orderMenu and payTransaction", () => {
  let token;

  beforeAll(async () => {
    // Buat user baru untuk testing
    const hashedPassword = await bcrypt.hash("password", 10);
    user = await UserModels.create({
      first_name: "Nama Depan",
      last_name: "Nama Belakang",
      phone_number: "Nomor Telepon",
      address: "Alamat",
      email: "test@example.com",
      password: hashedPassword,
      wallet: 1000,
    });

    const userLoginResponse = await request(app).post("/user/login").send({
      email: "test@example.com",
      password: "password",
    });

    token = userLoginResponse.body.data.token;
  });

  afterAll(async () => {
    // Hapus user yang dibuat untuk testing
    await UserModels.deleteOne({ email: "test@example.com" });
    app.close();
  });

  it("should not allow ordering without login", async () => {
    const response = await request(app)
      .post("/customer/order")
      .send({
        order_type: "DELIVERY",
        menu_items: [
          { id_menu: "menu_id_1", amount: 2 },
          { id_menu: "menu_id_2", amount: 1 },
        ],
      });

    expect(response.status).toBe(401);
  });

  it("should order menu and pay transaction successfully", async () => {
    // Create a test menu
    const menu = await MenuModels.create({
      menu_name: "Test Menu",
      menu_price: 10,
      menu_type: "APPETIZER",
      menu_stock: 100,
    });

    const responseOrder = await request(app)
      .post("/customer/order")
      .set("Cookie", `token=${token}`)
      .send({
        order_type: "DELIVERY",
        menu_items: [{ id_menu: menu._id, amount: 2 }],
      });

    expect(responseOrder.status).toBe(200);
    expect(responseOrder.body.message).toBe("Order placed successfully");

    // Pay the transaction
    const responsePay = await request(app)
      .post("/customer/pay_transaction")
      .set("Cookie", `token=${token}`);

    expect(responsePay.status).toBe(200);
    expect(responsePay.body.message).toBe("Thank you for your order!");

    // Cleanup: Delete the test menu
    await MenuModels.deleteOne({ _id: menu._id });
  });

  it("should not allow paying without ordering", async () => {
    const response = await request(app)
      .post("/customer/pay_transaction")
      .set("Cookie", `token=${token}`);

    expect(response.status).toBe(400);
  });

  afterAll(async () => {
    // Cleanup: Delete the user's pending transactions
    await TransactionModels.deleteMany({
      id_user: user._id, // Assuming id_user is the ObjectId of the user
      transaction_status: "PENDING",
    });
    app.close();
  });
});
