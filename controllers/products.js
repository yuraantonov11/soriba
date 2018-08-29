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
                    res.render('products/index', {
                        title: 'All Products',
                        products,
                        categories: JSON.stringify(categories),
                        importBtn: true,
                        controls: true,
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
                    const categories = c.map(e => ({
                        name: e.name,
                        _id: e._id.toString()
                    }));
                    product.categories = product.categories.map(c => c._id);
                    res.render('products/edit', {
                        title: 'Edit Product',
                        categories: JSON.parse(JSON.stringify(categories)),
                        productData: JSON.parse(JSON.stringify(product))
                    });
                });
        });
};

/**
 * GET /
 * Unpublish Product.
 */
exports.unpublishProduct = (req, res) => {
    const { productId } = req.params;
    Product.update({ _id: productId }, { $set: { published: false } }, (err) => {
        if (err) {
            console.error(err);
            req.flash('errors', 'Can not unpublish product.');
        } else {
            req.flash('success', { msg: 'Product has been unpublished.' });
        }

        res.redirect('/#unpublished');
    });
};

/**
 * GET /
 * Publish Product.
 */
exports.publishProduct = (req, res) => {
    const { productId } = req.params;
    Product.update({ _id: productId }, { $set: { published: true } }, (err) => {
        if (err) {
            console.error(err);
            req.flash('errors', 'Can not publish product.');
        } else {
            req.flash('success', { msg: 'Product has been published.' });
        }
        res.redirect('/#published');
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
    if (!req.user || !req.user._id) {
        req.flash('info', { msg: 'You need to authorize.' });
        return res.redirect('/');
    }

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
                        categories,
                        controls: true
                    });
                });
        });
};


/**
 * GET /
 * Products route.
 */
exports.getAll = (req, res) => {
    const queries = {};
    for (const query in req.query) {
        if (req.query[query]) queries[query] = req.query[query];
    }
    Product
        .find(queries)
        .populate('categories', 'name')
        .select({
            name: 1,
            title: 1,
            rating: 1,
            price: 1,
            link: 1,
            imported: 1,
            createdAt: 1,
            categories: 1,
        })
        .exec((err, products) => {
            if (err) return res.send(err);
            // this will log all of the users with each of their posts
            console.log(products);
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
        .exec((err, data) => {
            if (err) return res.send(500, err);
            // this will log all of the users with each of their posts
            res.sendStatus(200);
        });
};
/**
 * POST /
 * Import Product.
 */
exports.importProduct = (req, res) => {
    const { productId } = req.params;
    Product.update({ _id: productId }, { $set: { imported: true } }, (err) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    });
};
/**
 * POST /
 * Export Product.
 */
exports.exportProduct = (req, res) => {
    const { productId } = req.params;
    Product.update({ _id: productId }, { $set: { imported: false } }, (err) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    });
};

/**
 * GET /
 * Export Products.
 */
exports.exportProducts = (req, res) => {
    const { products } = req.body;
    if (!products) {
        // bad request!
        req.flash('error', { msg: 'Products not selected.' });
        return res.redirect('/products-page/');
    }

    Product.update({ _id: { $in: products } }, { $set: { imported: false } }, (err) => {
        if (err) {
            // error!
            console.error(err);
            req.flash('error', { msg: 'Error.' });
        } else {
            // saved!
            req.flash('success', { msg: 'Products are imported.' });
        }
        return res.redirect('/products-page/');
    });
};

/**
 * POST /
 * Export Products.
 */
exports.importProducts = (req, res) => {
    const { products } = req.body;
    if (!products) {
        // bad request!
        req.flash('errors', { msg: 'Products are not selected.' });
        return res.redirect('/products-page/');
    }

    Product.update({ _id: { $in: products } }, { $set: { imported: true } }, (err) => {
        if (err) {
            // error!
            console.error(err);
            req.flash('errors', { msg: 'Error.' });
        } else {
            // saved!
            req.flash('success', { msg: 'Products are imported.' });
        }
        return res.redirect('/products-page/');
    });
};
/**
 * POST /
 * Export Products.
 */
exports.deleteProducts = (req, res) => {
    const { products } = req.body;
    if (!products) {
        // bad request!
        req.flash('errors', { msg: 'Products are not selected.' });
        return res.redirect('/products-page/');
    }
    Product.deleteMany({
        _id: { $in: products }
    })
        .exec((err, data) => {
            // this will log all of the users with each of their posts
            if (err) {
                // error!
                console.error(err);
                req.flash('errors', { msg: 'Error.' });
            } else {
                // saved!
                req.flash('success', { msg: 'Products are deleted.' });
            }
            return res.redirect('/products-page/');
        });
};


/**
 * POST /
 * Add Product method.
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
