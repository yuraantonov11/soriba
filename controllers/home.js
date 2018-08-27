const Product = require('../models/Product');
const Category = require('../models/Category');
/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
    const categoryQuery = req.query.category;
    Product
        .find({ categories: categoryQuery })
        .where('imported').equals(true)
        .where('published').equals(true)
        .exec((err, products) => {
            if (err) return res.send(err);
            // this will log all of the users with each of their posts
            Category.find({})
                .exec((err, categories) => {
                    if (err) console.log(err);
                    // this will log all of the users with each of their posts
                    res.render('products', {
                        title: '',
                        products,
                        categories,
                        main: true,
                        categoryQuery
                    });
                });
        });
};

/**
 * GET /
 * Home page.
 */
exports.publishedPage = (req, res) => {
    const categoryQuery = req.query.category;
    Product
        .find({ categories: categoryQuery })
        .where('imported').equals(true)
        .exec((err, products) => {
            if (err) return res.send(err);
            // this will log all of the users with each of their posts
            Category.find({})
                .exec((err, categories) => {
                    if (err) console.log(err);
                    // this will log all of the users with each of their posts
                    res.render('products', {
                        title: '',
                        products,
                        categories,
                        controls: true,
                        publish: true,
                        main: true,
                        categoryQuery
                    });
                });
        });
};
