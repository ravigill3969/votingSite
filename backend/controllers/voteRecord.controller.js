// pollId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Poll",
//     required: true,
//   },
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   optionIndex: {
//     type: Number, // Index of the option chosen by the voter
//     required: true,
//   },
//   ipAddress: {
//     type: String,
//     required: true,
//   },
//   votedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

import Poll from "../models/poll.schema.js";
import VoteRecord from "../models/voteRecord.schema.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { Option } from "../models/poll.schema.js";

const sendResponse = (status, res, data, message) => {
  res.status(status).json({
    status: "success",
    message: message,
    data: {
      data,
    },
  });
};

//create vote record
//URL : /api/v1/voteRecord/create
export const castVote = catchAsync(async (req, res) => {
  const { pollId, optionId } = req.body;
  const userId = req.user;

  // Prevent duplicate votes
  // await VoteRecord.preventDuplicateVotes(pollId, userId);

  // Find the poll and option
  let poll = await Poll.findById(pollId);
  let option = await Option.findById(optionId);

  if (!poll || !option) {
    return res.status(404).json({ message: "Poll or Option not found" });
  }
  const containsOption = poll.options.some((optId) => optId.equals(optionId));
  if (!containsOption) {
    return next(new AppError("Option does not belong to this poll", 400));
  }

  // Record the vote
  const newVoteRecord = await VoteRecord.create({
    pollId,
    userId,
    optionId,
    ipAddress: req.ip,
  });

  // Update the vote count for the chosen option
  option = await Option.findByIdAndUpdate(
    optionId,
    { $inc: { votes: 1 } },
    {
      new: true,
    }
  );

  // Now update the total votes for the poll
  poll = await Poll.findByIdAndUpdate(
    pollId,
    { $inc: { totalVotes: 1 } },
    {
      new: true,
    }
  );

  const pollTotalVotes = poll.totalVotes; // Updated total votes

  // Re-fetch all options to get the most accurate vote counts
  const pollOptions = await Option.find({ _id: { $in: poll.options } });

  // Calculate votes and percentages for each option
  let pollOptionsWithVotesAndPercentage = pollOptions.map((option) => {
    return {
      _id: option._id,
      option: option.option,
      votes: option.votes,
      percentage: (option.votes / pollTotalVotes) * 100,
    };
  });

  sendResponse(
    201,
    res,
    { newVoteRecord, pollTotalVotes, pollOptionsWithVotesAndPercentage },
    "Vote recorded successfully"
  );
});

//get all vote records
//URL : /api/v1/voteRecord/getAll
export const getAllVoteRecords = catchAsync(async (req, res, next) => {
  const voteRecords = await VoteRecord.find();
  if (!voteRecords) {
    return next(new AppError("No vote records found", 404));
  }
  sendResponse(200, res, voteRecords, "Vote records fetched successfully");
});

//delete vote record
//URL : /api/v1/voteRecord/delete/:id
export const deleteVoteRecord = catchAsync(async (req, res, next) => {
  const voteRecord = await VoteRecord.findByIdAndDelete(req.params.id);
  if (!voteRecord) {
    return next(new AppError("No vote record found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    message: "Vote record deleted successfully",
  });
});
