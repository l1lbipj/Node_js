const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title:
    {
        type: String,
        required: true
    },
    author:
    {
        type: [String],
        required: true,
    },
    publisherId:           //ID nhà phát hành
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Publisher'
    },
    category:         //thể loại
    {
        type: [String],
        required: true
    },
    description:
    {
        type: String,
        required: true
    },
    coverImage:
    {
        type: String,
        required: true
    },
    publishDate:
    {
        type: Date,
        required: true
    },
    averageRating:
    {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReview:
    {
        type: Number,
        default: 0,
        min: 0
    }
},
{
    timestamps: true,
    versionKey: false
}
)

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;