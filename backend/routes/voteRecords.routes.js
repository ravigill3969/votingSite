import express from "express";
import {
  castVote,
  getAllVoteRecords,
  getRecordWithId,
  voteRecordActiveMiddleware,
  setVoteRecordToZero,
} from "../controllers/voteRecord.controller.js";
import { protect } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/create", protect, voteRecordActiveMiddleware, castVote);
router.get("/getall", protect, getAllVoteRecords);
router.get("/getone/:id", protect, getRecordWithId);
router.get("/reset/:id", protect, setVoteRecordToZero);
export default router;
