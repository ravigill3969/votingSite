// models/VoteRecord.js
import mongoose from "mongoose";
import AppError from "../utils/AppError.js";

const voteRecordSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Poll",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  optionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Option", // Index of the option chosen by the voter
    required: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  votedAt: {
    type: Date,
    default: Date.now,
  },
});

voteRecordSchema.statics.preventDuplicateVotes = async function (
  pollId,
  userId,
  next
) {
  const existingVoteRecord = await this.findOne({ pollId, userId });
  if (existingVoteRecord) {
    throw new AppError("You have already voted in this poll.", 400);
  }

  
};

voteRecordSchema.statics.findVotesByUser = function (userId) {
  return this.find({ userId }).populate("pollId", "title");
};

const VoteRecord = mongoose.model("VoteRecord", voteRecordSchema);

export default VoteRecord;
