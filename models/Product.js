const mongoose = require('mongoose');

const { Schema } = mongoose;

const productSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: mongoose.Types.ObjectId
    },
    name: String,
    choice: {
        type: Schema.Types.Boolean,
        default: false
    },
    title: String,
    features: [{
        type: String
    }],
    price: Number,
    rating: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5]
    },
    link: String,
    image: String,
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

}, { timestamps: true });


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
