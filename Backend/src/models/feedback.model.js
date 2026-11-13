const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
    {
        userId:
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        content:
        {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },
        status:
        {
            type: String,
            required: true,
            enum: ['pending', 'resolved'],
            default: 'pending'
        },
        adminId:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        adminResponse:
        {
            type: String,
            trim: true,
            maxlength: 2000,
            default: null
        },

    },
    {
        timestamps: true,
        versionKey: false
    }
)
const Feedback = mongoose.model('Feedback', feedbackSchema)
module.exports = Feedback