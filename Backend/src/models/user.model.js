const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
    fullName:
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
    password:
    {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },
    role:
    {
        type: String,
        enum: ['admin', 'reader', 'publisher'],
        default: 'reader'
    },
    avartar:
    {
        type: String,
        default: null
    },
    status:
    {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },   
},
{
    timestamps: true,
    versionKey: false
}
)

const User = mongoose.model('User', userSchema)
module.exports = User
