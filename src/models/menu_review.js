const mongoose = require("mongoose");

const menu_reviewSchema = new mongoose.Schema({
  id_transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
  },
  id_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  id_menu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
  },
  review_desc: String,
  review_pict: String,
});

module.exports = mongoose.model("Menu_Review", menu_reviewSchema);
