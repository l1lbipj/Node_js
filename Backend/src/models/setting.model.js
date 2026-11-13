const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
    {
        key:
        {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        value:
        {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        description:
        {
            type: String,
            trim: true
        },
        updatedBy:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)
const Setting = mongoose.model('Setting', settingSchema)