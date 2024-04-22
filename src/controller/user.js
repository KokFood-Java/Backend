require("dotenv").config();

const UserModels = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET_KEY;

function generateToken(user) {
  const payload = { email: user.email, id: user._id, role: user.role };
  const token = jwt.sign(payload, secretKey, { expiresIn: "60m" });
  return token;
}

exports.getUser = async (req, res) => {
  try {
    const email = req.body;
    const user = await UserModels.findOne(email);
    if (!user) {
      return res.status(400).json({
        status: "400",
        message: "User does not exist",
      });
    }
    res.status(200).json({
      status: "200",
      message: "Success Get User",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModels.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: "400",
        message: "Wrong email",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: "400",
        message: "Wrong password",
      });
    }

    const token = generateToken(user);
    res.cookie("token", token, { httpOnly: true });
    return res.status(200).json({
      status: "200",
      message: "Login user success",
      data: {
        token: token,
        user: user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.logoutUser = async (req, res) => {
  if (!req.cookies.token) {
    return res.status(400).json({
      status: "400",
      message: "Already Logout",
    });
  }
  res.clearCookie("token");
  res.status(200).json({
    status: "200",
    message: "Logout user success",
  });
};

exports.updateUser = async (req, res) => {
  try {
    const { first_name, last_name, phone_number, address } = req.body;

    const user_id = req.user.id;

    const updatedFields = {};
    if (first_name) updatedFields.first_name = first_name;
    if (last_name) updatedFields.last_name = last_name;
    if (phone_number) updatedFields.phone_number = phone_number;
    if (address) updatedFields.address = address;

    const updatedUser = await UserModels.findByIdAndUpdate(
      user_id,
      { $set: updatedFields },
      { new: true }
    );

    res.status(200).json({
      status: "200",
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};

exports.checkWallet = async (req, res) => {
  try {
    const id_user = req.user.id;
    const wallet = await UserModels.findOne({ _id: id_user });
    res.status(200).json({
      status: "200",
      message: "Succes get wallet",
      wallet: wallet.wallet,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: `${error.message}`,
    });
  }
};
