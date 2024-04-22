require("dotenv").config();

const UserModels = require("../models/user");
const MenuModels = require("../models/menu");
const DiscountModels = require("../models/discount");
const TransactionsModels = require("../models/transaction");
const DetailTransactionsModels = require("../models/transaction_detail");
const RestaurantReviewModels = require("../models/restaurant_review");
const MenuReviewModels = require("../models/menu_review");
const MenuReviewLikeModels = require("../models/menu_review_like");
const MenuReviewCommentModels = require("../models/menu_review_comment");

const bcrypt = require("bcrypt");

exports.registerCustomer = async (req, res) => {
  try {
    const { first_name, last_name, phone_number, address, email, password } =
      req.body;
    if (
      !first_name ||
      !last_name ||
      !phone_number ||
      !address ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        status: "400",
        message: "Fill all fields",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUserEmail = await UserModels.findOne({ email });
    if (existingUserEmail) {
      return res.status(400).json({
        status: "400",
        message: "Email is already registered",
      });
    }

    const user = await UserModels.create({
      first_name,
      last_name,
      phone_number,
      address,
      email,
      password: hashedPassword,
      role: "customer",
      wallet: 0,
    });

    res.status(200).json({
      status: "200",
      message: `Register customer success`,
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.getAllMenu = async (req, res) => {
  try {
    const menus = await MenuModels.find();
    res.status(200).json({
      status: "200",
      message: "Success",
      data: menus,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.getAllDiscount = async (req, res) => {
  try {
    const discounts = await DiscountModels.find();
    if (discounts.length === 0) {
      return res.status(400).json({
        status: "404",
        message: "Discounts not found",
      });
    }
    return res.status(200).json({
      status: "200",
      message: "Success",
      data: discounts,
    });
  } catch (error) {
    return res.status(500).json({
      status: "500",
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.orderMenu = async (req, res) => {
  try {
    const { order_type, menu_items } = req.body;
    if (!menu_items || menu_items.length === 0 || !order_type) {
      return res.status(400).json({
        status: "400",
        message: "No menu items selected or order type specified",
      });
    }

    const id_user = req.user.id;

    const checkTransactionStatus = await TransactionsModels.findOne({
      id_user: id_user,
      transaction_status: "pending",
    });

    if (checkTransactionStatus) {
      return res.status(400).json({
        status: "400",
        message: "You still have pending order",
      });
    }

    let total_price = 0;
    const orderItems = [];

    for (const { id_menu, amount } of menu_items) {
      const menu = await MenuModels.findOne({ _id: id_menu });
      if (!menu) {
        return res.status(400).json({
          status: "400",
          message: "Menu not found",
        });
      }

      if (amount > menu.menu_stock) {
        return res.status(400).json({
          status: "400",
          message:
            "Requested amount exceeds available stock for menu " +
            menu.menu_name,
        });
      }

      menu.menu_stock -= amount;
      await menu.save();

      const itemTotalPrice = menu.menu_price * amount;
      total_price += itemTotalPrice;

      orderItems.push({
        id_menu,
        amount,
        menu_name: menu.menu_name,
      });
    }
    if (order_type === "DELIVERY") {
      const transaction = await TransactionsModels.create({
        id_user: id_user,
        id_courier: null,
        id_discount: null,
        delivery_fee: 100,
        total_price: total_price,
        transaction_status: "PENDING",
        order_type: order_type,
      });

      const detailTransactions = orderItems.map(
        ({ id_menu, amount, menu_name }) => ({
          id_transaction: transaction._id,
          id_menu,
          menu_name: menu_name,
          quantity: amount,
        })
      );

      await DetailTransactionsModels.insertMany(detailTransactions);
    } else {
      const transaction = await TransactionsModels.create({
        id_user: id_user,
        id_courier: null,
        id_discount: null,
        delivery_fee: 0,
        total_price: total_price,
        transaction_status: "PENDING",
        order_type: order_type,
      });

      const detailTransactions = orderItems.map(
        ({ id_menu, amount, menu_name }) => ({
          id_transaction: transaction._id,
          id_menu,
          menu_name: menu_name,
          quantity: amount,
        })
      );

      await DetailTransactionsModels.insertMany(detailTransactions);
    }

    res.status(200).json({
      status: "200",
      message: "Order placed successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.orderStatus = async (req, res) => {
  try {
    const id_user = req.user.id;
    const transaction = await TransactionsModels.find({
      id_user: id_user,
    });

    if (!transaction || transaction.length === 0) {
      return res.status(400).json({
        status: "400",
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      status: "200",
      message: "Success",
      data: {
        transaction,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.payTransaction = async (req, res) => {
  try {
    const id_user = req.user.id;
    const customer = await UserModels.findOne({
      _id: id_user,
    });
    const customer_wallet = customer.wallet;
    var pendingTransaction = await TransactionsModels.findOne({
      id_user: id_user,
      transaction_status: "PENDING",
    });

    if (!pendingTransaction) {
      return res.status(400).json({
        status: "400",
        message: "There are no pending transaction!",
      });
    }

    let dump_total_price = pendingTransaction.total_price;
    let delivery_fee = pendingTransaction.delivery_fee;
    let discount_amount = 0;
    let discount_id = null;
    const { discount_code } = req.body;

    // if customer use discount code
    if (discount_code) {
      const discount = await DiscountModels.findOne({
        discount_code: discount_code,
      });
      discount_id = discount._id;

      if (!discount) {
        return res.status(400).json({
          status: "400",
          message: "Discount Code Invalid!",
        });
      }

      discount_amount = dump_total_price * (discount.percentage / 100);

      if (customer_wallet < discount_amount) {
        return res.status(400).json({
          status: "400",
          message: "There are not enough funds in your wallet!",
          Price: dump_total_price - discount_amount + delivery_fee,
          Current_Wallet: customer_wallet,
        });
      }
    }

    //cek wallet cukup atau tidak - tidak pakai discount -
    dump_total_price = dump_total_price - discount_amount + delivery_fee;
    if (customer_wallet < dump_total_price) {
      return res.status(400).json({
        status: "400",
        message: "There are not enough funds in your wallet!",
        Price: dump_total_price,
        Current_Wallet: customer_wallet,
      });
    }

    //update customer's data
    await UserModels.updateOne(
      {
        _id: id_user,
      },
      {
        wallet: customer_wallet - dump_total_price,
      },
      {
        upsert: true,
      }
    );

    // update admin's data
    await UserModels.findOneAndUpdate(
      { role: "admin" },
      { $inc: { wallet: dump_total_price - delivery_fee } },
      { new: true }
    );

    await TransactionsModels.updateOne(
      {
        _id: pendingTransaction._id,
      },
      {
        id_discount: discount_id,
        total_price: dump_total_price,
        transaction_status: "COOKING",
      },
      {
        upsert: true,
      }
    );

    const payedTransaction = await TransactionsModels.findOne({
      _id: pendingTransaction._id,
    });
    const transactionDetail = await DetailTransactionsModels.find({
      id_transaction: pendingTransaction._id,
    });
    return res.status(200).json({
      status: "200",
      message: "Thank you for your order!",
      order: payedTransaction,
      orderDetail: transactionDetail,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.topUp = async (req, res) => {
  try {
    const id_user = req.user.id;
    const { amount } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        status: "400",
        message: "Invalid top-up amount",
      });
    }

    const updatedWallet = await UserModels.findOneAndUpdate(
      { _id: id_user },
      { $inc: { wallet: amount } },
      { new: true }
    );

    if (!updatedWallet) {
      return res.status(404).json({
        status: "404",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "200",
      message: `Success top up. New wallet balance: ${updatedWallet.wallet}`,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.restaurantReview = async (req, res) => {
  try {
    const id_user = req.user.id;
    const { review_stars, review_desc } = req.body;

    const check_review = await RestaurantReviewModels.findOne({
      id_user: id_user,
    });
    if (check_review) {
      return res.status(400).json({
        status: "400",
        message: "You Already Reviewed The Restaurant!",
      });
    }

    await RestaurantReviewModels.create({
      id_user,
      review_stars,
      review_desc,
    });
    return res.status(200).json({
      status: "200",
      message: "Thank you for your review!",
      stars: review_stars,
      review: review_desc,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.menuReview = async (req, res) => {
  try {
    const id_user = req.user.id;
    const id_transaction = req.params.id_transaction;
    const { review_desc } = req.body;
    const review_pict = req.file ? req.file.filename : null;

    const transaction = await TransactionsModels.findOne({
      _id: id_transaction,
      id_user: id_user,
      transaction_status: "DONE",
    });
    if (!transaction) {
      return res.status(400).json({
        status: "400",
        message: "Transaction not found or is not done yet!",
      });
    }
    const checkExist = await MenuReviewModels.findOne({
      id_transaction: id_transaction,
    });
    if (checkExist) {
      return res.status(400).json({
        status: "400",
        message: "You already review this transaction",
      });
    }

    const review_menu = await MenuReviewModels.create({
      id_transaction: id_transaction,
      id_user: id_user,
      review_desc: review_desc,
      review_pict: review_pict,
    });

    res.status(200).json({
      status: "200",
      message: "Success add review",
      data: review_menu,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.menuReviewLike = async (req, res) => {
  try {
    const id_menu_review = req.params.id_menu_review;
    const id_user = req.user.id;

    const checkReviewLike = await MenuReviewLikeModels.findOne({
      id_menu_review: id_menu_review,
      id_user: id_user,
    });
    if (checkReviewLike) {
      return res.status(400).json({
        status: "400",
        message: "You already liked this review!",
      });
    }
    await MenuReviewLikeModels.create({
      id_menu_review: id_menu_review,
      id_user: id_user,
    });
    res.status(200).json({
      status: "200",
      message: "Like review success",
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.menuReviewUnlike = async (req, res) => {
  try {
    const id_menu_review = req.params.id_menu_review;
    const id_user = req.user.id;

    const checkReviewLike = await MenuReviewLikeModels.findOne({
      id_menu_review: id_menu_review,
      id_user: id_user,
    });
    if (!checkReviewLike) {
      return res.status(400).json({
        status: "400",
        message: "You haven't liked this review yet!",
      });
    }
    await MenuReviewLikeModels.deleteOne({
      id_menu_review: id_menu_review,
      id_user: id_user,
    });
    res.status(200).json({
      status: "200",
      message: "Unlike review success",
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.menuReviewComment = async (req, res) => {
  try {
    const id_menu_review = req.params.id_menu_review;
    const { comment } = req.body;
    const id_user = req.user.id;

    const checkExist = await MenuReviewModels.findOne({ _id: id_menu_review });
    if (!checkExist) {
      return res.status(400).json({
        status: "400",
        message: "Review not found",
      });
    }

    const menu_review_comment = await MenuReviewCommentModels.create({
      id_menu_review: id_menu_review,
      id_user: id_user,
      comment: comment,
      created_at: Date.now(),
    });

    res.status(200).json({
      status: "200",
      message: "Comment added successfully",
      data: menu_review_comment,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};
