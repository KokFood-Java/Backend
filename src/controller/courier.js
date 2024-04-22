require("dotenv").config();

const UserModels = require("../models/user");
const TransactionModels = require("../models/transaction");
const bcrypt = require("bcrypt");

exports.registerCourier = async (req, res) => {
  try {
    const { first_name, last_name, phone_number, address, email, password } =
      req.body;
    if (
      !first_name ||
      !last_name ||
      !phone_number ||
      !address ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        status: "400",
        message: "Fill all fields",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUserEmail = await UserModels.findOne({ email });
    if (existingUserEmail) {
      return res.status(400).json({
        status: "400",
        message: "Email is already registered",
      });
    }

    const user = await UserModels.create({
      first_name,
      last_name,
      phone_number,
      address,
      email,
      password: hashedPassword,
      role: "courier",
      wallet: 0,
    });

    res.status(200).json({
      status: "200",
      message: `Register courier success`,
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.checkOrder = async (req, res) => {
  try {
    const transactions = await TransactionModels.find({
      transaction_status: { $in: ["COOKING", "READYTOPICKUP"] },
      id_courier: null,
      order_type: "DELIVERY",
    });

    if (transactions.length === 0) {
      return res.status(400).json({
        status: "400",
        message: "No order is currently being cooked",
      });
    }

    res.status(200).json({
      status: "200",
      message: "Success",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.takeOrder = async (req, res) => {
  try {
    const id_transaction = req.params.id_transaction;
    const id_courier = req.user.id;

    const updatedTransaction = await TransactionModels.findOneAndUpdate(
      {
        _id: id_transaction,
        id_courier: null,
        transaction_status: { $in: ["COOKING", "READYTOPICKUP"] },
        order_type: { $in: ["DELIVERY"] },
      },
      { id_courier: id_courier },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(400).json({
        status: "400",
        message: "Order not found or already taken",
      });
    }

    return res.status(200).json({
      status: "200",
      message: "Success take order",
      data: updatedTransaction,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.pickUpOrder = async (req, res) => {
  try {
    const id_courier = req.user.id;

    const updatedTransaction = await TransactionModels.findOneAndUpdate(
      {
        id_courier: id_courier,
        transaction_status: { $in: ["READYTOPICKUP"] },
      },
      { transaction_status: "ONDELIVERY" },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(400).json({
        status: "400",
        message: "Order not found or already taken",
      });
    }
    return res.status(200).json({
      status: "200",
      message: "Success pick up order",
      data: updatedTransaction,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.completeOrder = async (req, res) => {
  try {
    const id_courier = req.user.id;

    const updatedTransaction = await TransactionModels.findOneAndUpdate(
      {
        id_courier: id_courier,
        transaction_status: { $in: ["ONDELIVERY"] },
      },
      { transaction_status: "DONE" },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(400).json({
        status: "400",
        message: "Order not found",
      });
    }
    const updatedCourier = await UserModels.findOneAndUpdate(
      {
        _id: id_courier,
      },
      { $inc: { wallet: updatedTransaction.delivery_fee } },
      { new: true }
    );

    return res.status(200).json({
      status: "200",
      message: "Success Delivery",
      data: updatedTransaction,
      wallet: updatedCourier.wallet,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};
