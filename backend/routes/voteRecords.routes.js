import express from "express";
import { castVote } from "../controllers/voteRecord.controller.js";
import { protect } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/create", protect, castVote);

export default router;
