
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"],
    },

    password: {
      type: String,
      default: null,
      minlength: 8,
      select: false,
    },

    googleId: {
      type: String,
      default: undefined,
      trim: true,
    },

    role: {
      type: String,
      enum: ["admin", "reader", "publisher"],
      default: "reader",
    },

    avatar: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Đảm bảo mỗi Google ID chỉ thuộc về một tài khoản
userSchema.index(
  { googleId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      googleId: { $type: "string" },
    },
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
