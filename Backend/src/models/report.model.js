const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
    {
        userId:
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        targetType:
        {
            type: String,
            required: true,
            enum: ['Review', 'ForumTopic', 'Comment']
        },
        targetId:
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'targetType'
        },
        reason:
        {
            type: String,
            required: true,
            trim: true
        },
        adminId:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        static:
        {
            type: String,
            enum: ['pending', 'resolved', 'rejected'],
            default: 'pending'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

const Report = mongoose.model('Report', reportSchema)
module.exports = Report