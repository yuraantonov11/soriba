const Category = require('../models/Category');

/**
 * GET /
 * Categories page.
 */
exports.index = (req, res) => {
  Category
    .find({})
    .exec((err, categories) => {
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
 * all Categories.
 */
exports.getAllCategories = (req, res) => {
  Category
    .find({})
    .exec((err, categories) => {
      if (err) return res.send(err);
      // this will log all of the users with each of their posts
      res.send(categories);
    });
};

/**
 * POST /
 * Add Categories method.
 */
exports.add = (req, res) => {
  if (!req.body.name) {
    return res.status(500).send({ error: 'Bad request!' });
  }
  Category.create({
    name: req.body.name
  }, (err, small) => {
    if (err) return res.status(500).send({ error: 'Something failed!' });
    // saved!
    res.sendStatus(201);
  });
};

/**
 * GET /
 * Add Product page.
 */
exports.removeCategory = (req, res) => {
  Category.remove({ _id: req.body.categoryId })
    .exec((err, categories) => {
      if (err) return res.send(err);
      // this will log all of the users with each of their posts
      res.send(categories);
    });
};
