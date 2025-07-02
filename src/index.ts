import express from "express";
import helmet from "helmet";
import cors from "cors";
import { notFoundHandler } from "./middleware/notFoundMiddleware";
import { errorHandler } from "./middleware/errorMiddleware";
import cookieParser from "cookie-parser";

import assignmentRoutes from "./routes/assignmentRoutes";
import examSubmissionRoutes from "./routes/examSubmissionRoutes";
import examinerRoutes from "./routes/examinerRoutes";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(helmet());

app.use(express.json());
app.use(cookieParser());

app.get("/", async (_, res) => res.send({ message: "Gama Learn, Hello APIs" }));

app.use("/api/assignments", assignmentRoutes);
app.use("/api/exam-submissions", examSubmissionRoutes);
app.use("/api/examiners", examinerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
