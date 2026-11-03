
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import issueRoutes from "./routes/issueRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to CloudTrack API",
    status: "Running"
  });
});

app.use("/api/issues", issueRoutes);

// Handle invalid JSON
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON request" });
  }

  next(err);
});

app.listen(PORT, () => {
  console.log(`CloudTrack API running on http://localhost:${PORT}`);
});
