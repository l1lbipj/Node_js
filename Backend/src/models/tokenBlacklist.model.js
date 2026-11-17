
const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema(
    {
        tokenHash: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        expiresAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Tự động xóa bản ghi khi token hết hạn
tokenBlacklistSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

const TokenBlacklist = mongoose.model(
    'TokenBlacklist',
    tokenBlacklistSchema
);

module.exports = TokenBlacklist;
