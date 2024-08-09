import express from "express";
import { castVote, getAllVoteRecords, getRecordWithId } from "../controllers/voteRecord.controller.js";
import { protect } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/create", protect, castVote);
router.get("/getall", protect, getAllVoteRecords);
router.get("/getone/:id", protect, getRecordWithId);

export default router;
