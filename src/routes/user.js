const express = require("express");
const router = express.Router();
const UserController = require("../controller/user");
const MiddlewareToken = require("../middleware/auth");

//LOGIN
router.post("/login", UserController.loginUser);
//LOGOUT
router.post("/logout", UserController.logoutUser);
//UPDATE USER
router.patch(
  "/update",
  MiddlewareToken.authenticateToken,
  UserController.updateUser
);
//CHECK WALLET
router.get(
  "/wallet",
  MiddlewareToken.authenticateToken,
  UserController.checkWallet
);

module.exports = router;
