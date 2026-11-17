const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
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
            enum: ['Review', 'ForumTopic']
        },
        targetId:
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'targetType'
        },
        content:
        {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },
        parentCommentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false   
    }
)
const Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment