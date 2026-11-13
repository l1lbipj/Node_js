const mongoose = require('mongoose')

const forumTopicSchema = new mongoose.Schema(
    {
        userId:
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        title:
        {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        content:
        {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000
        },
        category:
        {
            type: String,
            required: true,
            trim: true,
            enum: ['Discussion', 'Recommendation', 'Question', 'Other']
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

const ForumTopic = mongoose.model('ForumTopic', forumTopicSchema)
module.exports = ForumTopic