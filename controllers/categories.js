const Category = require('../models/Category');

/**
 * GET /
 * Products page.
 */
exports.index = (req, res) => {
  Category
    .find({})
    .exec(function (err, categories) {
      if (err) console.log(err);
      // this will log all of the users with each of their posts
      res.render('categories', {
        title: 'All categories',
        categories
      });
    });
};

/**
 * GET /
 * Product page.
 */
exports.product = (req, res) => {
  res.render('products/product', {
    title: 'Product',
    products: products[0]
  });
};


/**
 * POST /
 * Add Product pethod.
 */
exports.add = (req, res) => {
  console.log(req.body)
  console.log(req.file)
  Product.create({
    size: 'small'
  }, function (err, small) {
    if (err) return handleError(err);
    // saved!
    res.send('OK')
  });
  // res.render('products/product', {
  //   title: 'Add new Product'
  // });
};

/**
 * GET /
 * Add Product page.
 */
exports.addPage = (req, res) => {
  res.render('products/add', {
    title: 'Add new Product'
  });
};
