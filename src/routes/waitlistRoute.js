import express from "express";
import waitListController from "../controllers/waitListController";

const router = express.Router();

router.post("/join", waitListController.JoinWaitList);
router.get("/", waitListController.getWaitLists);
router.delete("/:id", waitListController.deleteWaitList);

export default router;
