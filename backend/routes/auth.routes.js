import express from "express";
import {
  login,
  logout,
  protect,
  register,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

const testMiddleware = (request, response, next) => {
  console.log(request.user);
  response.send("hello");
};
router.get("/isVerified", protect, testMiddleware);

export default router;
