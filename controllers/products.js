const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * GET /
 * Products page.
 */
exports.index = (req, res) => {
    Product
        .find({})
        .exec((err, products) => {
            if (err) return res.send(err);
            // this will log all of the users with each of their posts
            Category.find({})
                .exec((err, categories) => {
                    if (err) console.log(err);
                    // this will log all of the users with each of their posts
                    res.render('products', {
                        title: 'All Products',
                        products,
                        categories
                    });
                });
        });
};


/**
 * GET /
 * Products page.
 */
exports.getAll = (req, res) => {
    Product
        .find({})
        .exec((err, products) => {
            if (err) return res.send(err);
            // this will log all of the users with each of their posts
            res.send(products);
        });
};

/**
 * GET /
 * Product page.
 */
exports.product = (req, res) => {
    res.render('products/product', {
        title: 'Product',
        // products: products[0]
    });
};


/**
 * POST /
 * Add Product pethod.
 */
exports.add = (req, res) => {
    const { body, user } = req;
    // return res.send(body)
    Product.create({
        name: body.name,
        title: body.title,
        features: body.features,
        price: body.price,
        rating: body.rating,
        link: body.link,
        image: req.file.path,
        categories: body.categories,
        creator: user._id,
    }, (err, product) => {
        if (err) {
            req.flash('errors', err);
            return res.redirect('/login');
        }
        // saved!
        // return res.redirect(`/products-page/${product._id}`);
        return res.redirect('/products-page/');
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
    Category.find({})
        .exec((err, categories) => {
            if (err) console.log(err);
            // this will log all of the users with each of their posts
            console.log(categories);
            res.render('products/add', {
                title: 'Add new Product',
                categories
            });
        });
};
