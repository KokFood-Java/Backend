const mongoose = require("mongoose");

const transaction_status = {
  PENDING: "PENDING",
  COOKING: "COOKING",
  READYTOPICKUP: "READYTOPICKUP",
  ONDELIVERY: "ONDELIVERY",
  DONE: "DONE",
};

const order_type = {
  DELIVERY: "DELIVERY",
  DINEIN: "DINEIN",
};

const transactionSchema = new mongoose.Schema({
  id_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  id_courier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  id_discount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Discount",
  },
  delivery_fee: {
    type: Number,
    required: [true, "Please add fee"],
  },
  transaction_date: {
    type: Date,
    default: Date.now,
  },
  total_price: {
    type: Number,
    required: [true, "Please add price"],
  },
  transaction_status: {
    type: String,
    enum: Object.values(transaction_status),
    default: transaction_status.AVAILABLE,
  },
  order_type: {
    type: String,
    enum: Object.values(order_type),
    default: order_type.DELIVERY,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
