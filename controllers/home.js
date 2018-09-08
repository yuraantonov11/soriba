const Product = require('../models/Product');
const Category = require('../models/Category');
/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
    const { query } = req;
    const categoryQuery = query.category;
    const searchQuery = query.search;
    const qry = {};

    if (searchQuery) {
        qry.$text = { $search: searchQuery };
    }
    if (categoryQuery) {
        qry.categories = categoryQuery;
    }
    Product
        .find(qry)
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
                        categoryQuery,
                        url: req.url
                    });
                });
        });
};

/**
 * GET /
 * Savvy List
 */
exports.savvyList = (req, res) => {
    const categoryQuery = req.query.category;
    console.log(req.user.savedProducts);
    const query = { _id: { $in: req.user.savedProducts } };
    if (categoryQuery) {
        query.categories = categoryQuery;
    }
    Product
        .find(query)
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
                        savvyList: true,
                        categoryQuery
                    });
                });
        });
};

/**
 * GET /
 * Home page.
 */
exports.publishingPage = (req, res) => {
    const categoryQuery = req.query.category;
    const query = {};
    if (categoryQuery) {
        query.categories = categoryQuery;
    }
    Product
        .find(query)
        .where('imported').equals(true)
        .exec((err, products) => {
            if (err) return res.send(err);
            // this will log all of the users with each of their posts
            Category.find({})
                .exec((err, categories) => {
                    if (err) console.error(err);
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
