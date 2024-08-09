// const optionSchema = new mongoose.Schema({
//   option: {
//     type: String,
//     required: [true, "Option is required"],
//     minLength: [1, "Option must be at least 1 character"],
//   },
//   votes: {
//     type: Number,
//     default: 0,
//   },
// });

// // Poll Schema
// const pollSchema = new Schema({
//   title: { type: String, required: true },
//   description: { type: String },
//   creator: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   options: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Option",
//     },
//   ],
//   startDate: { type: Date, default: Date.now },
//   endDate: { type: Date, required: true },
//   isActive: { type: Boolean, default: true },
//   totalVotes: { type: Number, default: 0 },
//   createdAt: { type: Date, default: Date.now },
// });

import catchAsync from "../utils/catchAsync.js";
import checkMissingFields from "../utils/checkMissingFields.js";
import Poll from "../models/poll.schema.js";
import { Option } from "../models/poll.schema.js";
import AppError from "../utils/AppError.js";

const sendResponse = (status, res, data, message) => {
  res.status(status).json({
    status: "success",
    message: message,
    data: {
      data,
    },
  });
};

///create poll
export const createPoll = catchAsync(async (req, res, next) => {
  console.log("body");

  const { title, description, options, startDate, endDate, correctAnswer } =
    req.body;
  checkMissingFields({ title, description, options, endDate });
  const creator = req.user;
  if (!creator) {
    return next(new AppError("You are not authorized to create a poll", 403));
  }
  console.log(options);
  const optionDocs = await Option.insertMany(
    options.map((option) => ({ option })) // Create and insert options
  );

  console.log(optionDocs);

  const poll = await Poll.create({
    title,
    description,
    creator,
    options: optionDocs.map((doc) => doc._id),
    startDate,
    endDate,
    correctAnswer,
  });

  console.log(poll);

  sendResponse(201, res, poll, "Poll created successfully");
});

//get all polls
export const getPolls = catchAsync(async (req, res, next) => {
  const polls = await Poll.find();
  if (!polls) {
    return next(new AppError("No polls found", 404));
  }
  sendResponse(200, res, polls, "Polls retrieved successfully");
});

///get poll by id
export const getPoll = catchAsync(async (req, res, next) => {
  const poll = await Poll.findById(req.params.id);

  if (!poll) {
    return next(new AppError("Poll not found", 404));
  }

  sendResponse(200, res, poll, "Poll retrieved successfully");
});

//get poll created by me
export const getMyPolls = catchAsync(async (req, res, next) => {
  console.log(req.user);
  const polls = await Poll.find({ creator: req.user });
  if (!polls) {
    return next(new AppError("No polls found", 404));
  }
  sendResponse(200, res, polls, "Polls retrieved successfully");
});

//update poll

export const updatePollAndDeleteOption = catchAsync(async (req, res, next) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) {
    return next(new AppError("Poll not found", 404));
  }

  if (!req.user._id.equals(poll.creator._id)) {
    return next(
      new AppError("You are not authorized to update or delete this poll", 403)
    );
  }

  const {
    title,
    description,
    options,
    optionIdsToDelete,
    startDate,
    endDate,
    correctAnswer,
  } = req.body;

  // Deleting specified options
  if (Array.isArray(optionIdsToDelete) && optionIdsToDelete.length > 0) {
    for (const optionId of optionIdsToDelete) {
      const optionIndex = poll.options.findIndex((optId) =>
        optId.equals(mongoose.Types.ObjectId(optionId))
      );

      if (optionIndex !== -1) {
        poll.options.splice(optionIndex, 1); // Remove the option from the poll's options array
        await Option.findByIdAndDelete(optionId); // Delete the option from the database
        console.log(`Option ${optionId} deleted from poll.`);
      } else {
        return next(new AppError(`Option with ID ${optionId} not found`, 404));
      }
    }
    await poll.save();
  }

  // Handle updates to poll fields
  if (title) poll.title = title;
  if (description) poll.description = description;
  if (startDate) poll.startDate = startDate;
  if (endDate) poll.endDate = endDate;
  if (correctAnswer) poll.correctAnswer = correctAnswer;

  // Updating options if provided
  if (options && options.length > 0) {
    const optionDocs = await Option.insertMany(
      options.map((option) => ({ option }))
    );
    poll.options.push(...optionDocs.map((doc) => doc._id));
  }

  await poll.save();

  sendResponse(200, res, poll, "Poll updated successfully");
});

//delete poll
export const deletePoll = catchAsync(async (req, res, next) => {
  console.log(req.params.id);
  await Poll.findByIdAndDelete(req.params.id);
  sendResponse(200, res, null, "Poll deleted successfully");
});
