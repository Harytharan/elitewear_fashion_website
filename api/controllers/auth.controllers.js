import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

const JWT_SECRET =  process.env.JWT_SECRET ||"a3d8c1f7e2b49c9e5f7f86b1e7a3d8c1f7e2b49c9e5f7f86b1e7a3d8c1f7e2b49"; // Replace with a strong random key


// Helper function to ensure the JWT secret is availiabel
const getJwtSecret = () => {
  const secret = JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is missing! Please check your environment variables.");
  }
  return secret;
};

export const signup = async (req, res, next) => {
  const { username, email, password, ismanager, usertype } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    usertype,
    ismanager,
  });
  try {
    await newUser.save();
    res.status(201).json("User created successfully!!!");
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  console.log("Received sign-in request for email:", email); // Debugging

  try {
    // Convert email to lowercase to handle case sensitivity
    const validUser = await User.findOne({ email: email.toLowerCase() });
    console.log("Valid user:", validUser); // Debugging

    if (!validUser) {
      console.log("User not found."); // Debugging
      return next(errorHandler(404, "User not found"));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      console.log("Password mismatch."); // Debugging
      return next(errorHandler(401, "Email or Password incorrect"));
    }

    const secretKey = getJwtSecret();  // Ensure the secret is available
    const token = jwt.sign({ id: validUser._id }, secretKey);
    
    const { password: pass, ...rest } = validUser._doc;
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(rest);
  } catch (error) {
    console.error("Sign-in error:", error); // Debugging
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const secretKey = getJwtSecret();  // Ensure the secret is available
      const token = jwt.sign({ id: user._id }, secretKey);
      const { password: pass, ...rest } = user._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
        usertype: "customer",
      });
      await newUser.save();
      const secretKey = getJwtSecret();  // Ensure the secret is available
      const token = jwt.sign({ id: newUser._id }, secretKey);
      const { password: pass, ...rest } = newUser._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signOut = (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json("User has been signed out!");
  } catch (error) {
    next(error);
  }
};
