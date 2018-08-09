const mongoose = require('mongoose');

const { Schema } = mongoose;

const productSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: mongoose.Types.ObjectId
  },
  name: String,
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
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }]

}, { timestamps: true });

/**
 * Password hash middleware.
 */
productSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
productSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 */
productSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
