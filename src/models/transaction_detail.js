const mongoose = require("mongoose");

const transaction_detailSchema = new mongoose.Schema({
  id_transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
  },
  id_menu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
  },
  quantity: Number,
});

module.exports = mongoose.model("Transaction_Detail", transaction_detailSchema);
