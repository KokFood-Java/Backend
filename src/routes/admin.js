const express = require("express");
const router = express.Router();
const UserController = require("../controller/user");
const AdminController = require("../controller/admin");
const MiddlewareToken = require("../middleware/auth");
const menuUpload = require("../config/menuMulterConfig");

//GET USER
router.get(
  "/",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("admin"),
  UserController.getUser
);
// INSERT MENU
router.post(
  "/menu",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("admin"),
  menuUpload,
  AdminController.insertMenu
);
// UPDATE MENU
router.patch(
  "/menu/:id_menu",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("admin"),
  menuUpload,
  AdminController.updateMenu
);
// DELETE MENU
router.delete(
  "/menu/:id_menu",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("admin"),
  AdminController.deleteMenu
);
// INSERT DISCOUNT
router.post(
  "/discount",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("admin"),
  AdminController.insertDiscount
);
// UPDATE DISCOUNT
router.patch(
  "/discount/:id_discount",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("admin"),
  AdminController.updateDiscount
);
// DELETE MENU
router.delete(
  "/discount/:id_discount",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("admin"),
  AdminController.deleteDiscount
);
// UPDATE ORDER
router.post(
  "/order/:id_transaction",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("admin"),
  AdminController.updateOrder
);
// GET ALL TRANSACTION
router.get(
  "/transaction",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("admin"),
  AdminController.getAllTransaction
);
module.exports = router;
