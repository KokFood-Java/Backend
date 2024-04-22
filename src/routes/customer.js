const express = require("express");
const router = express.Router();
const CustomerController = require("../controller/customer");
const MiddlewareToken = require("../middleware/auth");
const reviewUpload = require("../config/reviewMulterConfig");

//REGISTER
router.post("/register", CustomerController.registerCustomer);
//GET ALL MENU
router.get(
  "/menu",
  MiddlewareToken.authenticateToken,
  CustomerController.getAllMenu
);
//GET ALL DISCOUNT
router.get(
  "/discount",
  MiddlewareToken.authenticateToken,
  CustomerController.getAllDiscount
);
//ORDER MENU
router.post(
  "/order",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("customer"),
  CustomerController.orderMenu
);
//GET HISTORY TRANSACTION
router.get(
  "/order",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("customer"),
  CustomerController.orderStatus
);
//PAY TRANSACTION
router.post(
  "/pay_transaction",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("customer"),
  CustomerController.payTransaction
);
//TOP UP WALLET
router.post(
  "/wallet",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("customer"),
  CustomerController.topUp
);
//REVIEW RESTAURANT
router.post(
  "/review/restaurant",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("customer"),
  CustomerController.restaurantReview
);
//REVIEW MENU
router.post(
  "/review/menu/:id_transaction",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("customer"),
  reviewUpload,
  CustomerController.menuReview
);
//REVIEW MENU LIKES
router.post(
  "/review/menu_like/:id_menu_review",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("customer"),
  CustomerController.menuReviewLike
);
//REVIEW MENU UNLIKES
router.post(
  "/review/menu_unlike/:id_menu_review",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("customer"),
  CustomerController.menuReviewUnlike
);
//REVIEW MENU COMMENT
router.post(
  "/review/menu_comment/:id_menu_review",
  MiddlewareToken.authenticateToken,
  MiddlewareToken.checkRole("customer"),
  CustomerController.menuReviewComment
);

module.exports = router;
