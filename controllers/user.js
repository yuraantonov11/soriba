const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const passport = require('passport');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('account/login', {
        title: 'Login'
    });
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
    req.assert('email', 'Email is not valid')
        .isEmail();
    req.assert('password', 'Password cannot be blank')
        .notEmpty();
    req.sanitize('email')
        .normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/login');
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('errors', info);
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', { msg: 'Success! You are logged in.' });
            if (user.role === 'admin') {
                return res.redirect('/');
            }
            if (user.role === 'researcher') {
                return res.redirect('/my-products-page');
            }
            return res.redirect(req.session.returnTo || '/');
        });
    })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
    req.logout();
    req.session.destroy((err) => {
        if (err) console.log('Error : Failed to destroy the session during logout.', err);
        req.user = null;
        res.redirect('/');
    });
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
    if (req.user && (req.user.role !== 'admin')) {
        return res.redirect('/');
    }
    res.render('account/signup', {
        title: 'Register'
    });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
    req.assert('email', 'Email is not valid')
        .isEmail();
    req.assert('password', 'Password must be at least 4 characters long')
        .len(4);
    req.assert('confirmPassword', 'Passwords do not match')
        .equals(req.body.password);
    req.sanitize('email')
        .normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/signup');
    }

    const userData = {
        email: req.body.email,
        password: req.body.password
    };
    if (req.user && (req.user.role !== 'admin')) {
        if (req.body.role === 'on') {
            userData.role = 'admin';
        } else {
            userData.role = 'researcher';
        }
    }
    const user = new User(userData);

    User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (err) {
            return next(err);
        }
        if (existingUser) {
            req.flash('errors', { msg: 'Account with that email address already exists.' });
            return res.redirect('/signup');
        }
        user.save((err) => {
            if (err) {
                return next(err);
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                sgMail.setSubstitutionWrappers('{{', '}}'); // Configure the substitution tag wrappers globally
                const msg = {
                    to: user.email,
                    from: 'info@sansavvy.com',
                    subject: 'You are registered on Sansavvy.com',
                    templateId: process.env.SENDGRID_TEMPLATE_REGISTER,
                };
                sgMail.send(msg);
                res.redirect('/');
            });
        });
    });
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
    res.render('account/profile', {
        title: 'Account Management'
    });
};
/**
 * GET /account
 * Profile page Main.
 */
exports.getAccountMain = (req, res) => {
    Category.find({})
        .exec((err, categories) => {
            if (err) console.log(err);
            res.render('account/profile', {
                title: 'Account Management',
                main: true,
                categories
            });
        });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
    req.assert('email', 'Please enter a valid email address.')
        .isEmail();
    req.sanitize('email')
        .normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/account');
    }

    User.findById(req.user.id, (err, user) => {
        if (err) {
            return next(err);
        }
        user.email = req.body.email || '';
        user.profile.name = req.body.name || '';
        user.profile.gender = req.body.gender || '';
        user.profile.location = req.body.location || '';
        user.profile.website = req.body.website || '';
        user.save((err) => {
            if (err) {
                if (err.code === 11000) {
                    req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
                    return res.redirect('/account');
                }
                return next(err);
            }
            req.flash('success', { msg: 'Profile information has been updated.' });
            res.redirect('/account');
        });
    });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
    req.assert('password', 'Password must be at least 4 characters long')
        .len(4);
    req.assert('confirmPassword', 'Passwords do not match')
        .equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/account');
    }

    User.findById(req.user.id, (err, user) => {
        if (err) {
            return next(err);
        }
        user.password = req.body.password;
        user.save((err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', { msg: 'Password has been changed.' });
            res.redirect('/account');
        });
    });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
    User.remove({ _id: req.user.id }, (err) => {
        if (err) {
            return next(err);
        }
        req.logout();
        req.flash('info', { msg: 'Your account has been deleted.' });
        res.redirect('/');
    });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = (req, res, next) => {
    const { provider } = req.params;
    User.findById(req.user.id, (err, user) => {
        if (err) {
            return next(err);
        }
        user[provider] = undefined;
        user.tokens = user.tokens.filter(token => token.kind !== provider);
        user.save((err) => {
            if (err) {
                return next(err);
            }
            req.flash('info', { msg: `${provider} account has been unlinked.` });
            res.redirect('/account');
        });
    });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    User
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires')
        .gt(Date.now())
        .exec((err, user) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
                return res.redirect('/forgot');
            }
            res.render('account/reset', {
                title: 'Password Reset'
            });
        });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
    req.assert('password', 'Password must be at least 4 characters long.')
        .len(4);
    req.assert('confirm', 'Passwords must match.')
        .equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('back');
    }

    const resetPassword = () =>
        User
            .findOne({ passwordResetToken: req.params.token })
            .where('passwordResetExpires')
            .gt(Date.now())
            .then((user) => {
                if (!user) {
                    req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
                    return res.redirect('back');
                }
                user.password = req.body.password;
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                return user.save()
                    .then(() => new Promise((resolve, reject) => {
                        req.logIn(user, (err) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve(user);
                        });
                    }));
            });

    const sendResetPasswordEmail = (user) => {
        if (!user) {
            return;
        }
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        sgMail.setSubstitutionWrappers('{{', '}}'); // Configure the substitution tag wrappers globally
        const msg = {
            to: user.email,
            from: 'info@sansavvy.com',
            subject: 'Your Sansavvy password has been changed',
            templateId: process.env.SENDGRID_TEMPLATE_CHANGE,
            dynamicTemplateData: {
                userEmail: user.email,
            },
        };
        return sgMail.send(msg)
            .then(() => {
                req.flash('success', { msg: 'Success! Your password has been changed.' });
            });
    };

    resetPassword()
        .then(sendResetPasswordEmail)
        .then(() => {
            if (!res.finished) res.redirect('/');
        })
        .catch(err => next(err));
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('account/forgot', {
        title: 'Forgot Password'
    });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
    req.assert('email', 'Please enter a valid email address.')
        .isEmail();
    req.sanitize('email')
        .normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/forgot');
    }

    const createRandomToken = new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
            if (err) {
                reject(err);
            } else {
                resolve(buf.toString('hex'));
            }
        });
    });

    const setRandomToken = token =>
        User
            .findOne({ email: req.body.email })
            .then((user) => {
                if (!user) {
                    req.flash('errors', { msg: 'Account with that email address does not exist.' });
                } else {
                    user.passwordResetToken = token;
                    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
                    user = user.save();
                }
                return user;
            });

    const sendForgotPasswordEmail = (user) => {
        if (!user) {
            return;
        }
        const token = user.passwordResetToken;
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        sgMail.setSubstitutionWrappers('{{', '}}'); // Configure the substitution tag wrappers globally
        const msg = {
            to: user.email,
            from: 'info@sansavvy.com',
            subject: 'Reset your password on Sansavvy.com',
            templateId: process.env.SENDGRID_TEMPLATE_RESET,
            dynamicTemplateData: {
                link: `http://${req.headers.host}/reset/${token}`,
            },
        };
        return sgMail.send(msg)
            .then(() => {
                req.flash('info', { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
            });
    };

    createRandomToken
        .then(setRandomToken)
        .then(sendForgotPasswordEmail)
        .then(() => res.redirect('/forgot'))
        .catch(next);
};


/**
 * GET /
 * Users page.
 */

exports.index = (req, res) => {
    User
        .find({})
        // .where('role').in(['researcher', 'admin'])
        .exec((err, users) => {
            if (err) console.log(err);
            // this will log all of the users with each of their posts
            res.render('users', {
                title: 'All users',
                users
            });
        });
};

/**
 * put /
 * Change User role.
 */


exports.updateRole = (req, res) => {
    if (req.user && (req.user.role !== 'admin')) {
        return res.sendStatus(403);
    }
    if (!req.body.role) {
        return res.status(500)
            .send({ error: 'Bad request!' });
    }

    User.findById(req.params.userId, (err, user) => {
        if (err) return res.sendStatus(500);
        user.set({ role: req.body.role });
        user.save((err, updatedUser) => {
            if (err) return res.sendStatus(500);
            res.send(updatedUser);
        });
    });
};

/**
 * get /
 * User products.
 */

exports.getUserProducts = (req, res) => {
    Product
        .find({})
        .where('creator').equals(req.params.userId)
        .exec((err, products) => {
            if (err) return res.send(err);
            // this will log all of the users with each of their posts
            Category.find({})
                .exec((err, categories) => {
                    if (err) console.log(err);
                    // this will log all of the users with each of their posts
                    res.render('products', {
                        title: 'User Products',
                        products,
                        categories
                    });
                });
        });
};
