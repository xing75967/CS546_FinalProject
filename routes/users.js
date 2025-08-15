import { Router } from 'express';
import { createUser, checkUser } from '../data/users.js';

const router = Router();

router.route('/register')
    .post(async (req, res) => {
        const { username, email, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            req.session.errorMessage = 'Passwords do not match.';
            return res.status(400).render('register', { title: 'Register', hasError: true, error: req.session.errorMessage, username, email });
        }
        try {
            const result = await createUser(username, email, password);
            if (result.insertedUser) {
                req.session.successMessage = 'Registration successful! You can now log in.';
                res.redirect('/users/login');
            }
        } catch (e) {
            req.session.errorMessage = typeof e === 'string' ? e : 'An unknown error occurred during registration.';
            res.status(400).render('register', { title: 'Register', hasError: true, error: req.session.errorMessage, username, email });
        }
    })
    .get(async (req, res) => {
        res.render('register', { title: 'Register' });
    });

router.route('/login')
    .post(async (req, res) => {
        const { email, password } = req.body;
        try {
            const authenticatedUser = await checkUser(email, password);
            req.session.user = authenticatedUser;
            req.session.successMessage = 'Login successful!';
            res.redirect('/');
        } catch (e) {
            req.session.errorMessage = typeof e === 'string' ? e : 'An unknown error occurred during login.';
            res.status(400).render('login', { title: 'Login', hasError: true, error: req.session.errorMessage, email });
        }
    })
    .get(async (req, res) => {
        res.render('login', { title: 'Login' });
    });

router.route('/logout').get(async (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

export default router;
