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
 * My Products page.
 */
exports.indexMyProducts = (req, res) => {
    Product
        .find({
            creator: req.user._id
        })
        .exec((err, products) => {
            if (err) return res.send(err);
            // this will log all of the users with each of their posts
            Category.find({})
                .exec((err, categories) => {
                    if (err) console.log(err);
                    // this will log all of the users with each of their posts
                    res.render('products/my-products', {
                        title: 'My Products',
                        products,
                        categories
                    });
                });
        });
};


/**
 * GET /
 * Products route.
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
 * Delete Product.
 */
exports.delete = (req, res) => {
    const { body } = req;
    Product.deleteMany({
        _id: { $in: body.ids }
    }, (err) => {
        if (err) return res.send(err);
        // this will log all of the users with each of their posts
        res.sendStatus(200);
    });
};


/**
 * POST /
 * Add Product pethod.
 */
exports.add = (req, res) => {
    const { body, user } = req;
    Product.create({
        name: body.name,
        title: body.title,
        choice: (body.choice === 'on'),
        features: body.features,
        price: body.price,
        rating: body.rating,
        link: body.link,
        image: req.file.path,
        categories: body.categories,
        creator: user._id,
    }, (err) => {
        if (err) {
            req.flash('errors', err);
            return res.redirect('/login');
        }
        // saved!
        req.flash('success', { msg: 'Products has been added.' });
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
            res.render('products/add', {
                title: 'Add new Product',
                categories
            });
        });
};
