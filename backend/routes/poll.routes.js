import express from "express";
import {
  createPoll,
  deletePoll,
  getMyPolls,
  getPoll,
  getPolls,
  updatePollAndDeleteOption,
} from "../controllers/poll.controller.js";
import { protect } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/get-all", getPolls);

export function testingMiddleware(req, res, next) {
  console.log("I am testing middleware");
  next();
}

//protect all routes below
router.use(protect);

router.post("/create", createPoll);
router.get("/get/:id", getPoll);
router.get("/get-my-polls", getMyPolls);
router.patch("/update/:id",testingMiddleware, updatePollAndDeleteOption);
router.delete("/delete/:id", deletePoll);

export default router;
