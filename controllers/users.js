const User = require('../models/User');

/**
 * GET /
 * Users page.
 */
exports.index = (req, res) => {
    User
        .find({})
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
 * GET /
 * all Users.
 */
exports.getAllUsers = (req, res) => {
    User
        .find({})
        .exec((err, users) => {
            if (err) return res.send(err);
            // this will log all of the users with each of their posts
            res.send(users);
        });
};

/**
 * POST /
 * Add Users method.
 */
exports.add = (req, res) => {
    if (!req.body.name) {
        return res.status(500).send({ error: 'Bad request!' });
    }
    User.create({
        name: req.body.name
    }, (err) => {
        console.log(err);
        if (err) return res.status(500).send({ error: 'Something failed!' });
        // saved!
        res.redirect('/user-page');
    });
};

/**
 * GET /
 * Remove user
 */
exports.removeUser = (req, res) => {
    User.remove({ _id: req.params.userId })
        .exec((err, user) => {
            if (err) return res.send(err);
            // this will log all of the users with each of their posts
            res.send(user);
        });
};
