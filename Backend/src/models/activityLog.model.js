const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
    {
        userId:
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        action:
        {
            type: String,
            required: true,
            trim: true
        },
        entityType:
        {
            type: String,
            required: true,
            enum: [
                'user',
                'book',
                'review',
                'comment',
                'forumTopic',
                'feedback',
                'report',
                'publisher',
                'system'
            ]
        },
        description:
        {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000         
        },
        ipAddress:
        {
            type: String,
            trim: true,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema)
module.exports = ActivityLog