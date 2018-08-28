const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const mime = require('mime');

const router = express.Router();
/**
 * API keys and Passport configuration.
 */
const passportConfig = require('../config/passport');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename(req, file, cb) {
        crypto.pseudoRandomBytes(16, (err, raw) => {
            cb(null, `${raw.toString('hex') + Date.now()}.${mime.getExtension(file.mimetype)}`);
        });
    }
});
const upload = multer({ storage });


/**
 * Controllers (route handlers).
 */
const homeController = require('../controllers/home');
const userController = require('../controllers/user');
const productsController = require('../controllers/products');
const contactController = require('../controllers/contact');
const categoriesController = require('../controllers/categories');


router.get('*/uploads', express.static('uploads'));
router.use((req, res, next) => {
    console.log(req.isAuthenticated());
    if (!req.isAuthenticated()) {
        res.redirect(301, `http://${process.env.DOMAIN}`);
    }

    next();
});

/**
 * Primary app routes.
 */
router.get('/', homeController.publishedPage);
router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);
router.get('/logout', userController.logout);
router.get('/forgot', userController.getForgot);
router.post('/forgot', userController.postForgot);
router.get('/reset/:token', userController.getReset);
router.post('/reset/:token', userController.postReset);
router.get('/signup', userController.getSignup);
router.post('/signup', userController.postSignup);
router.get('/contact', contactController.getContact);
router.post('/contact', contactController.postContact);
router.get('/account', passportConfig.isAuthenticated, userController.getAccount);
router.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
router.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
router.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
router.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * API examples routes.
 */

/**
 * Products routes.
 */
router.get('/my-products-page', productsController.indexMyProducts);
router.get('/products-page', productsController.index);
router.post('/delete-products', productsController.delete);
router.get('/products/add', productsController.addPage);
router.post('/products/import', productsController.importProducts);
router.post('/products/delete', productsController.deleteProducts);
router.get('/products/product', productsController.product);
router.get('/products/:productId', productsController.editProductPage);
router.get('/products/:productId/publish', productsController.publishProduct);
router.get('/products/:productId/unpublish', productsController.unpublishProduct);
router.get('/products/:productId/import', productsController.importProduct);
router.post('/products/:productId/export', productsController.exportProduct);
router.post('/product-edit/:productId', upload.single('product-image'), productsController.editProduct);
router.get('/products', productsController.getAll);
router.post('/products', upload.single('product-image'), productsController.add);


/**
 * Categories routes.
 */
router.get('/categories-page', categoriesController.index);
router.get('/categories', categoriesController.getAllCategories);
router.post('/categories', categoriesController.add);
router.delete('/categories/:categoryId', categoriesController.removeCategory);

/**
 * Users routes.
 */
router.get('/users-page', userController.index);
router.post('/users/:userId', userController.updateRole);
router.get('/users/:userId/products', userController.getUserProducts);
// router.post('/users', categoriesController.add);
// router.delete('/users/:userId', categoriesController.removeCategory);
/**
 * OAuth authentication routes. (Sign in)
 */
// router.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
// router.get('/auth/google/callback',
// passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
//   res.redirect(req.session.returnTo || '/');
// });
module.exports = router;
