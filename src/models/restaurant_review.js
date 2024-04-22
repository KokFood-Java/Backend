const mongoose = require("mongoose");

const restaurant_reviewSchema = new mongoose.Schema(
  {
    id_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    review_star: Number,
    review_desc: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Restaurant_Review", restaurant_reviewSchema);
