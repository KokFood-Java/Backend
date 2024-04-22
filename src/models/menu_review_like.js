const mongoose = require("mongoose");

const menu_review_likeSchema = new mongoose.Schema({
  id_menu_review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu_Review",
  },
  id_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Menu_Review_Like", menu_review_likeSchema);
