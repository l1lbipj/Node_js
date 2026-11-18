const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const requestLogger = require("./middlewares/requestLogger");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const apiResponse = require("./utils/apiResponse");
const app = express();

// Routes
const commentRoutes = require("./routes/comment.routes");
const bookRoutes = require("./routes/book.routes");
const authRoutes = require("./routes/auth.routes");
const reviewRoutes = require("./routes/review.routes");
const userRoutes = require("./routes/user.routes");
const publisherRoutes = require("./routes/publisher.routes");
const reportRoutes = require("./routes/report.routes");
const forumTopicRoutes = require("./routes/forumTopic.routes");
const activityLogRoutes = require("./routes/activityLog.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: `http://localhost:${process.env.PORT_FRONTEND || 5173}`,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(requestLogger);

// Health check
app.get("/api/health", (req, res) => {
  return apiResponse.successResponse(
    res,
    "Book Review & Publisher Portal API is running",
    null,
  );
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/publishers", publisherRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/forum-topics", forumTopicRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
