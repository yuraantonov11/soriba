const Product = require('../models/Product');
const Category = require('../models/Category');
/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
    Product
        .find({})
        .where('imported').equals(true)
        .exec((err, products) => {
            if (err) return res.send(err);
            // this will log all of the users with each of their posts
            Category.find({})
                .exec((err, categories) => {
                    if (err) console.log(err);
                    // this will log all of the users with each of their posts
                    res.render('products', {
                        title: 'Publishing',
                        products,
                        categories,
                        controls: true,
                        publish: true,
                        main: true,
                    });
                });
        });
};
