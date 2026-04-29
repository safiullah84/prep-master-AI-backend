import User from "../models/user-model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
  return token;
};

// register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all required fields" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      _id: user._id,
      user: { name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        success: true,
        _id: user._id,
        user: { name: user.name, email: user.email },
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
