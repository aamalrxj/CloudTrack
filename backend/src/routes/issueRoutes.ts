
import { Router } from "express";

import {
  getIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue
} from "../controllers/issueController";

const router = Router();

router.get("/", getIssues);
router.get("/:id", getIssueById);
router.post("/", createIssue);
router.put("/:id", updateIssue);
router.delete("/:id", deleteIssue);

export default router;
