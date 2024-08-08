const express = require('express');
const passport = require('passport');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: './.env' });

const User = require('./models/User'); // Import the User model
const Note = require('./models/Note'); // Import the Note model
const connectDB = require('./config/db'); // Import the database connection

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));    // For parsing form data
app.use(methodOverride('_method'));                // Use method-override middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// Passport configuration
const { Strategy, ExtractJwt } = require('passport-jwt');

const options = {
    jwtFromRequest: req => req.cookies.jwt, // Extract JWT from cookies
    secretOrKey: process.env.SECRET || 'default-secret-key',
};

passport.use(new Strategy(options, async (payload, done) => {
    try {
        const user = await User.findById(payload.id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        console.error("Error during user lookup:", err);
        return done(err, false);
    }
}));

app.use(passport.initialize());

// Import routes
const userRoutes = require('./routes/users');
const noteRoutes = require('./routes/notes');

// Use Routes
app.use('/users', userRoutes);
app.use('/notes', noteRoutes);

// Landing Page
app.get('/', (req, res) => {
    if (req.cookies.jwt) {
        passport.authenticate('jwt', { session: false }, (err, user) => {
            if (user) {
                return res.redirect('/notes');
            } else {
                return res.render('login', { message: null });
            }
        })(req, res);
    } else {
        res.render('login', { message: null });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
