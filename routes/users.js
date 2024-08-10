const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../models/User');
const Note = require('../models/Note'); // Import the Note model

const router = express.Router();

// Set up nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

// User registeration
router.get("/register", (req, res) => {
    return res.render('register', { message: 'Please register using your email adress' });
});

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with an email and password. The password will be hashed before storing in the database.
 *     tags: 
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Registration successful, user prompted to login
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML page prompting the user to log in
 *       400:
 *         description: Email and password are required or email already exists
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML page displaying the error message
 *       500:
 *         description: Server error
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML page displaying the server error message
 */

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.render('register', { message: 'Email and password are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword });

        res.render('login', { message: 'Please login using your email and password' });
    } catch (err) {
        console.error('Error during user registration:', err.message);
        res.render('register', { message: 'Could not register due to a server error.' });
    }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Log in a user
 *     description: Log in a user with their email and password. On success, a JWT token is issued and stored in a cookie.
 *     tags: 
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       302:
 *         description: Login successful, redirect to notes page
 *         headers:
 *           Set-Cookie:
 *             description: JWT token set in an HTTP-only cookie
 *             schema:
 *               type: string
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: Redirect to the notes page
 *       400:
 *         description: Email and password are required
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML page displaying the error message
 *       401:
 *         description: Wrong password or user not found
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML page displaying the error message
 *       500:
 *         description: Server error
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML page displaying the server error message
 */

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.render('login', { message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { message: 'User not found' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.render('login', { message: 'Wrong password' });
        }

        const accessToken = jwt.sign(
            { id: user._id },
            process.env.SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('jwt', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.redirect('/notes');
    } catch (err) {
        console.error('Login error:', err.message);
        res.render('login', { message: 'Could not log in due to a server error.' });
    }
});

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
            return res.render('login', { message: null });
        }
        req.user = user;
        next();
    })(req, res, next);
};

// Logout route
router.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/');
});

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get the user profile
 *     description: Retrieve the profile information of the authenticated user, including the count of their notes.
 *     tags: 
 *       - Users
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML page displaying the user profile and note count
 *       401:
 *         description: Unauthorized, user not authenticated
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: Redirect to login page
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Server Error, Could not fetch profile.
 */
router.get('/profile', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
            return res.render('login', { message: null });
        }
        req.user = user;
        next();
    })(req, res, next);
}, async (req, res) => {
    //console.log(req.path);
    try {
        const noteCount = await Note.countDocuments({ owner: req.user._id });
        res.render('profile', { user: req.user, noteCount, message: null, successMessage: null, currentPath: req.path });
    } catch (err) {
        console.error('Error fetching profile:', err.message);
        res.status(500).send('Server Error: Could not fetch profile.');
    }
});

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     summary: Change the user's password
 *     description: Allows the authenticated user to change their password by providing the current password and a new password.
 *     tags: 
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: currentPassword123
 *               newPassword:
 *                 type: string
 *                 example: newPassword456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML page indicating the password was changed successfully
 *       400:
 *         description: Current password is incorrect
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML page indicating the current password is incorrect
 *       401:
 *         description: Unauthorized, user not authenticated
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: Redirect to login page
 *       500:
 *         description: Server error
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML page displaying a server error message
 */
router.post('/change-password', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
            return res.render('login', { message: null });
        }
        req.user = user;
        next();
    })(req, res, next);
}, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.render('profile', { user: req.user, noteCount: await Note.countDocuments({ owner: req.user._id }), message: 'Current password is incorrect', successMessage: null, currentPath: req.path });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.render('profile', { user: req.user, noteCount: await Note.countDocuments({ owner: req.user._id }), message: null, successMessage: 'Password changed successfully', currentPath: req.path });
    } catch (err) {
        console.error('Error changing password:', err.message);
        res.render('profile', { user: req.user, noteCount: await Note.countDocuments({ owner: req.user._id }), message: 'Could not change password due to a server error.', successMessage: null, currentPath: req.path });
    }
});

// Forgot Password route
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { message: null, successMessage: null });
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('forgot-password', { message: 'No account with that email address exists.', successMessage: null });
        }

        const token = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                `http://${req.headers.host}/users/reset-password/${token}\n\n` +
                `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await transporter.sendMail(mailOptions);

        res.render('forgot-password', { message: null, successMessage: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
    } catch (err) {
        console.error('Error during password reset request:', err.message);
        res.render('forgot-password', { message: 'Could not send reset email due to a server error.', successMessage: null });
    }
});

router.get('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render('forgot-password', { message: 'Password reset token is invalid or has expired.', successMessage: null });
        }

        res.render('reset-password', { token: req.params.token, message: null });
    } catch (err) {
        console.error('Error during password reset:', err.message);
        res.render('forgot-password', { message: 'Could not reset password due to a server error.', successMessage: null });
    }
});

router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render('forgot-password', { message: 'Password reset token is invalid or has expired.', successMessage: null });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL,
            subject: 'Your password has been changed',
            text: `Hello,\n\n` +
                `This is a confirmation that the password for your account ${user.email} has just been changed.\n`
        };

        await transporter.sendMail(mailOptions);

        res.render('login', { message: null, successMessage: 'Success! Your password has been changed.' });
    } catch (err) {
        console.error('Error during password reset:', err.message);
        res.render('forgot-password', { message: 'Could not reset password due to a server error.', successMessage: null });
    }
});

// Delete User Profile
router.post('/delete-user-profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Find and delete all notes for the user
        await Note.deleteMany({ owner: req.user._id });
        
        // Find and delete the user
        await User.findByIdAndDelete(req.user._id);

        // Clear the JWT cookie
        res.clearCookie('jwt');

        res.render('login', { message: 'Your profile and all associated notes have been deleted.', successMessage: null });
    } catch (err) {
        console.error('Error deleting user profile:', err.message);
        res.status(500).send('Server Error: Could not delete profile.');
    }
});

module.exports = router;
