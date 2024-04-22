const request = require("supertest");
const app = require("../../src/server"); // Ubah sesuai dengan lokasi server.js Anda
const MenuModels = require("../../src/models/menu"); // Ubah sesuai dengan lokasi model menu.js Anda

describe("Integration testing for Menu CRUD operations", () => {
  let token;
  let addedMenuId;

  beforeAll(async () => {
    // Login as admin to get the token
    const adminLoginResponse = await request(app).post("/user/login").send({
      email: "admin@gmail.com",
      password: "admin",
    });

    token = adminLoginResponse.body.data.token;
  });

  it("should not add a new menu if user is not logged in", async () => {
    const newMenuData = {
      menu_name: "New Menu",
      menu_price: 10,
      menu_type: "APPETIZER",
      menu_stock: 100,
      menu_pict: "menu_pict.jpg",
    };

    const response = await request(app).post("/admin/menu").send(newMenuData);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("No token provided");
  });

  it("should add a new menu if user is logged in", async () => {
    if (!addedMenuId) {
      const newMenuData = {
        menu_name: "New Menu",
        menu_price: 10,
        menu_type: "APPETIZER",
        menu_stock: 100,
        menu_pict: "menu_pict.jpg",
      };

      const response = await request(app)
        .post("/admin/menu")
        .set("Cookie", `token=${token}`)
        .send(newMenuData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Menu New Menu successfully added");
      expect(response.body.menu.menu_name).toBe("New Menu");

      addedMenuId = response.body.menu._id;
    }
  });

  it("should update an existing menu if user is logged in", async () => {
    if (addedMenuId) {
      const updatedMenuData = {
        menu_price: 25,
      };

      const response = await request(app)
        .patch(`/admin/menu/${addedMenuId}`)
        .set("Cookie", `token=${token}`)
        .send(updatedMenuData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Success update New Menu");
    }
  });

  it("should delete an existing menu if user is logged in", async () => {
    if (addedMenuId) {
      const response = await request(app)
        .delete(`/admin/menu/${addedMenuId}`)
        .set("Cookie", `token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        `Success delete menu with ID ${addedMenuId}`
      );
    }
  });

  afterAll(async () => {
    // Cleanup: Delete the added menu
    if (addedMenuId) {
      await MenuModels.deleteOne({ _id: addedMenuId });
    }
    app.close();
  });
});
