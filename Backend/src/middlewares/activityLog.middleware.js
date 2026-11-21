const ActivityLog = require("../models/activityLog.model");

const actionByMethod = {
  POST: "CREATE",
  PUT: "UPDATE",
  PATCH: "UPDATE",
  DELETE: "DELETE",
};

const entityTypeByRoute = {
  users: "user",
  books: "book",
  reviews: "review",
  comments: "comment",
  "forum-topics": "forumTopic",
  reports: "report",
  publishers: "publisher",
};

const activityLogMiddleware = (req, res, next) => {
  const action = actionByMethod[req.method];
  const pathSegments = req.path.split("/").filter(Boolean);
  const routeName = pathSegments[1];

  if (!action || pathSegments[0] !== "api" || routeName === "activity-logs") {
    return next();
  }

  res.once("finish", () => {
    if (res.statusCode < 200 || res.statusCode >= 300 || !req.user) {
      return;
    }

    const entityType =
      routeName === "comments" && pathSegments[2] === "reports"
        ? "report"
        : entityTypeByRoute[routeName] || "system";

    ActivityLog.create({
      userId: req.user._id,
      action,
      entityType,
      description: `${req.method} ${req.path}`,
      ipAddress: req.ip,
    }).catch((error) => {
      console.error("Create Activity Log Error:", error);
    });
  });

  return next();
};

module.exports = activityLogMiddleware;
