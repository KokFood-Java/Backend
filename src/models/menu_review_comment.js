const mongoose = require("mongoose");

const menu_review_commentSchema = new mongoose.Schema({
  id_menu_review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu_Review",
  },
  id_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comment: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "Menu_Review_Comment",
  menu_review_commentSchema
);
