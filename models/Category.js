const mongoose = require('mongoose');

const { Schema } = mongoose;

const categorySchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: mongoose.Types.ObjectId
    },
    name: String,
    image: String,
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
