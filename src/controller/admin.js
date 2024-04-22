require("dotenv").config();

const MenuModels = require("../models/menu");
const DiscountModels = require("../models/discount");
const TransactionModels = require("../models/transaction");

exports.insertDiscount = async (req, res) => {
  try {
    const { discount_code, percentage } = req.body;

    const existingDiscountCode = await DiscountModels.findOne({
      discount_code,
    });
    if (existingDiscountCode) {
      return res.status(400).json({
        status: "400",
        message: "Code is already exist",
      });
    }

    const discount = await DiscountModels.create({
      discount_code,
      percentage,
    });

    res.status(200).json({
      status: "200",
      message: `Discount ${discount.discount_code} successfully added`,
      discount: discount,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.updateDiscount = async (req, res) => {
  try {
    const id_discount = req.params.id_discount;
    const { discount_code, percentage } = req.body;

    if (!discount_code || !percentage) {
      return res.status(400).json({
        status: "400",
        message: "Fill all fields",
      });
    }

    const checkExist = await DiscountModels.findOne({ _id: id_discount });
    if (!checkExist) {
      return res.status(400).json({
        status: "400",
        message: "Discount not found",
      });
    }

    const updatedDiscount = await DiscountModels.findOneAndUpdate(
      { _id: id_discount },
      { discount_code, percentage },
      { new: true }
    );

    res.status(200).json({
      status: "200",
      message: `Success update ${updatedDiscount.discount_code}`,
      discount: updatedDiscount,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.deleteDiscount = async (req, res) => {
  try {
    const id_discount = req.params.id_discount;
    const deletedDiscount = await DiscountModels.findByIdAndDelete(id_discount);
    if (!deletedDiscount) {
      return res.status(400).json({
        status: "400",
        message: "Discount not found",
      });
    }
    res.status(200).json({
      status: "200",
      message: `Success delete discount with ID ${id_discount}`,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.insertMenu = async (req, res) => {
  try {
    const { menu_name, menu_price, menu_type, menu_stock } = req.body;

    if (
      menu_type !== "APPETIZER" &&
      menu_type !== "MAINCOURSE" &&
      menu_type !== "DESSERT" &&
      menu_type !== "DRINKS"
    ) {
      return res.status(400).json({
        status: "400",
        message:
          "Menu Type must be 'appetizer' or 'maincourse' or 'dessert' or 'drinks'",
      });
    }

    const menu_pict = req.file ? req.file.filename : null;

    const menu = await MenuModels.create({
      menu_name,
      menu_price,
      menu_pict,
      menu_type,
      menu_stock,
    });

    res.status(200).json({
      status: "200",
      message: `Menu ${menu.menu_name} successfully added`,
      menu: menu,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const id_menu = req.params.id_menu;
    const { menu_name, menu_price, menu_type, menu_stock } = req.body;

    let menu_pict;
    if (req.file) {
      menu_pict = req.file.filename;
    }

    const updatedFields = {};
    if (menu_name) updatedFields.menu_name = menu_name;
    if (menu_price) updatedFields.menu_price = menu_price;
    if (menu_type) updatedFields.menu_type = menu_type;
    if (menu_stock) updatedFields.menu_stock = menu_stock;
    if (menu_pict) updatedFields.menu_pict = menu_pict;

    const checkExist = await MenuModels.findOne({ _id: id_menu });
    if (!checkExist) {
      return res.status(400).json({
        status: "400",
        message: "Menu not found",
      });
    }

    const updatedMenu = await MenuModels.findOneAndUpdate(
      { _id: id_menu },
      { $set: updatedFields },
      { new: true }
    );

    res.status(200).json({
      status: "200",
      message: `Success update ${updatedMenu.menu_name}`,
      menu: updatedMenu,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    const id_menu = req.params.id_menu;
    const deletedMenu = await MenuModels.findByIdAndDelete(id_menu);
    if (!deletedMenu) {
      return res.status(400).json({
        status: "400",
        message: "Menu not found",
      });
    }
    res.status(200).json({
      status: "200",
      message: `Success delete menu with ID ${id_menu}`,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const id_transaction = req.params.id_transaction;
    const updatedTransaction = await TransactionModels.findOneAndUpdate(
      {
        _id: id_transaction,
        transaction_status: { $in: ["COOKING"] },
        order_type: { $in: ["DELIVERY"] },
      },
      { transaction_status: "READYTOPICKUP" },
      { new: true }
    );
    return res.status(200).json({
      status: "200",
      message: "Success",
      data: updatedTransaction,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.getAllTransaction = async (req, res) => {
  try {
    const transaction = await TransactionModels.find();
    res.status(200).json({
      status: "200",
      message: "Success",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};
