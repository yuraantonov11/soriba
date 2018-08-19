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
 * Edit Product page.
 */
exports.editProductPage = (req, res) => {
    const { productId } = req.params;
    Product
        .findById(productId)
        .populate('categories', '_id')
        .exec((err, product) => {
            if (err) return res.send(err);
            // this will log all of the users with each of their posts
            // product.categories.map(c => c._id);
            Category.find({})
                .exec((err, c) => {
                    if (err) console.log(err);
                    // this will log all of the users with each of their posts
                    const categories = c.map(e => ({ name: e.name, _id: e._id.toString() }));
                    product.categories = product.categories.map(c => c._id);
                    console.log(product);
                    console.log();
                    res.render('products/edit', {
                        title: 'Edit Product',
                        categories: JSON.parse(JSON.stringify(categories)),
                        productData: JSON.parse(JSON.stringify(product))
                    });
                });
        });
};

/**
 * POST /
 * Save Product method.
 */
exports.editProduct = (req, res) => {
    const { body, user } = req;
    const { productId } = req.params;

    Product.findById(productId, (err, product) => {
        if (err) return res.sendStatus(500);
        if (product.creator.toString() !== user._id.toString()) {
            req.flash('errors', 'You do not have permission to edit this product');
            return res.redirect(`/products/${productId}`);
        }
        console.log(body);
        const data = {
            name: body.name,
            title: body.title,
            choice: (body.choice === 'on'),
            features: body.features,
            price: body.price,
            rating: body.rating,
            link: body.link,
            categories: body.categories,
            creator: user._id,
        };
        if (req.file && req.file.path) {
            data.image = req.file.path;
        }
        product.set(data);
        product.save((err, result) => {
            if (err) {
                req.flash('errors', err);
                return res.redirect(`/products/${productId}`);
            }
            console.log(result);
            // saved!
            req.flash('success', { msg: 'Product has been saved.' });
            return res.redirect('/my-products-page/');
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
    })
        .exec((err, response) => {
            if (err) return res.send(err);
            // this will log all of the users with each of their posts
            res.sendStatus(200);
        });
};


/**
 * POST /
 * Add Product method.
 */
exports.add = (req, res) => {
    const { body, user } = req;
    console.log(body);
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
