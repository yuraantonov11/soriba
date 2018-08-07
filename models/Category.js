const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
