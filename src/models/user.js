const mongoose = require("mongoose");

const roles = {
  ADMIN: "admin",
  CUSTOMER: "customer",
  COURIER: "courier",
};

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "Please add first name"],
    },
    last_name: {
      type: String,
      required: [true, "Please add last name"],
    },
    phone_number: {
      type: String,
      required: [true, "Please add phone number"],
    },
    address: {
      type: String,
      required: [true, "Please add address"],
    },
    email: {
      type: String,
      required: [true, "Please add user email"],
    },
    password: {
      type: String,
      required: [true, "Please add user password"],
    },
    role: {
      type: String,
      enum: Object.values(roles),
      default: roles.CUSTOMER,
    },
    wallet: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
