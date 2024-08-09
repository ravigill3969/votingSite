import User from "../models/user.schema.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import checkMissingFields from "../utils/checkMissingFields.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 * 30, //30 days
      sameSite: "lax",
    })
    .status(statusCode)
    .json({
      status: "success",
      token,
      data: {
        user: user._id,
      },
    });
};


// Register
export const register = catchAsync(async (req, res, next) => {
  const { email, username, password } = req.body;

  checkMissingFields({ email, username, password });
  const user = await User.create({ email, username, password });
  sendToken(user, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  checkMissingFields({ email, password });
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.isValidPassword(password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  sendToken(user, 200, res);
});

// Log out
export const logout = (req, res) => {
  res
    .cookie("token", "loggedout", {
      httpOnly: true,
      expires: new Date(Date.now() + 10 * 1000),
      sameSite: "lax",
    })
    .status(200)
    .json({ status: "success" });
};

// Protect middleware
export const protect = catchAsync(async (req, res, next) => {
  // console.log("here is the protect middleware");
  let token = req.cookies.token;
  
  if (!token) {
    return next(new AppError("You are not logged in!", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  req.user = currentUser._id;
  next();
});
