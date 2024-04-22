const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    discount_code: {
      type: String,
      required: [true, "Please add code"],
    },

    percentage: {
      type: Number,
      required: [true, "Please add percentage"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Discount", discountSchema);
