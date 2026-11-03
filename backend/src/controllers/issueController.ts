
import { Request, Response } from "express";
import { randomUUID } from "crypto";
import {
  ScanCommand,
  GetCommand,
  PutCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";

import { dynamoDB, TABLE_NAME } from "../config/dynamodb";
import { Issue, IssueStatus } from "../types/issue";

const validStatuses: IssueStatus[] = [
  "Open",
  "In Progress",
  "Resolved"
];

// GET all issues
export const getIssues = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: TABLE_NAME
      })
    );

    const issues = (result.Items ?? []) as Issue[];

    issues.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    res.json(issues);
  } catch (error) {
    console.error("Get issues error:", error);
    res.status(500).json({ message: "Failed to fetch issues" });
  }
};

// GET issue by ID
export const getIssueById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await dynamoDB.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: req.params.id }
      })
    );

    if (!result.Item) {
      res.status(404).json({ message: "Issue not found" });
      return;
    }

    res.json(result.Item);
  } catch (error) {
    console.error("Get issue error:", error);
    res.status(500).json({ message: "Failed to fetch issue" });
  }
};

// CREATE issue
export const createIssue = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, description } = req.body ?? {};

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      res.status(400).json({
        message: "Title and description are required"
      });
      return;
    }

    const issue: Issue = {
      id: randomUUID(),
      title: title.trim(),
      description: description.trim(),
      status: "Open",
      createdAt: new Date().toISOString()
    };

    await dynamoDB.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: issue
      })
    );

    res.status(201).json(issue);
  } catch (error) {
    console.error("Create issue error:", error);
    res.status(500).json({ message: "Failed to create issue" });
  }
};

// UPDATE issue
export const updateIssue = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const { title, description, status } = req.body ?? {};

    const result = await dynamoDB.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id }
      })
    );

    if (!result.Item) {
      res.status(404).json({ message: "Issue not found" });
      return;
    }

    const existing = result.Item as Issue;

    if (
      title !== undefined &&
      (typeof title !== "string" || !title.trim())
    ) {
      res.status(400).json({ message: "Invalid title" });
      return;
    }

    if (
      description !== undefined &&
      (typeof description !== "string" || !description.trim())
    ) {
      res.status(400).json({ message: "Invalid description" });
      return;
    }

    if (
      status !== undefined &&
      !validStatuses.includes(status)
    ) {
      res.status(400).json({ message: "Invalid issue status" });
      return;
    }

    const updatedIssue: Issue = {
      ...existing,
      title: title !== undefined ? title.trim() : existing.title,
      description:
        description !== undefined
          ? description.trim()
          : existing.description,
      status: status !== undefined ? status : existing.status
    };

    await dynamoDB.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: updatedIssue
      })
    );

    res.json(updatedIssue);
  } catch (error) {
    console.error("Update issue error:", error);
    res.status(500).json({ message: "Failed to update issue" });
  }
};

// DELETE issue
export const deleteIssue = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

    const result = await dynamoDB.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id }
      })
    );

    if (!result.Item) {
      res.status(404).json({ message: "Issue not found" });
      return;
    }

    await dynamoDB.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id }
      })
    );

    res.json({ message: "Issue deleted successfully" });
  } catch (error) {
    console.error("Delete issue error:", error);
    res.status(500).json({ message: "Failed to delete issue" });
  }
};
