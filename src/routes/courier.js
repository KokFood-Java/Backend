const express = require("express");
const router = express.Router();
const CourierController = require("../controller/courier");
const MiddlewareToken = require("../middleware/auth");

//REGISTER
router.post("/register", CourierController.registerCourier);
//CHECK ORDER
router.get(
  "/order",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("courier"),
  CourierController.checkOrder
);
//TAKE ORDER
router.post(
  "/order/:id_transaction",
  MiddlewareToken.authenticateToken,
  // MiddlewareToken.checkRole("courier"),
  CourierController.takeOrder
);
//PICK UP ORDER
router.post(
  "/pickup_order",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("courier"),
  CourierController.pickUpOrder
);
//COMPLETE ORDER
router.post(
  "/complete_order",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("courier"),
  CourierController.completeOrder
);

module.exports = router;
