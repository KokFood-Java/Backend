const mongoose = require("mongoose");

const menu_type = {
  APPETIZER: "APPETIZER",
  MAINCOURSE: "MAINCOURSE",
  DESSERT: "DESSERT",
  DRINKS: "DRINKS",
};

const menuSchema = new mongoose.Schema({
  menu_name: {
    type: String,
    required: [true, "Please add menu name"],
  },
  menu_price: {
    type: Number,
    required: [true, "Please add menu price"],
  },
  menu_pict: {
    type: String,
  },
  menu_type: {
    type: String,
    required: [true, "Please add menu type"],
    enum: Object.values(menu_type),
    default: menu_type.MAINCOURSE,
  },
  menu_stock: {
    type: Number,
    required: [true, "Please add menu stock"],
  },
});

module.exports = mongoose.model("Menu", menuSchema);
