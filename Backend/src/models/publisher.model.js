const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema(
    {
        userId:
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        name:
        {
            type: String,
            required: true,
            trim: true
        },
        description:
        {
            type: String,
            required: true,
            trim: true
        },
        email:
        {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
        },
        phone:
        {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^\d{10,11}$/, 'Số điện thoại không hợp lệ']
        },
        address:
        {
            type: String,
            required: true,
            trim: true
        },

    },
    {
        timestamps: true,
        versionKey: false
    }
)

const Publisher = mongoose.model('Publisher', publisherSchema)
module.exports = Publisher