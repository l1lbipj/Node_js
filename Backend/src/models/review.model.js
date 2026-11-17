const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        userId:
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        bookId:
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Book'
        },
        rating:
        {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment:
        {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
)
reviewSchema.index(
    { userId: 1, bookId: 1 },
    { unique: true }
);

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review