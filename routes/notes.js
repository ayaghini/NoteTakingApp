const express = require('express');
const passport = require('passport');
const Note = require('../models/Note');
const router = express.Router();

// Get all notes and display them
router.get('/', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
            return res.render('login', { message: null });
        }
        req.user = user;
        next();
    })(req, res, next);
}, async (req, res) => {
    try {
        const notes = await Note.find({ owner: req.user._id });
        res.render('notes', { notes, currentPath: req.path });
    } catch (err) {
        console.error('Error fetching notes:', err.message);
        res.status(500).send('Server Error: Could not fetch notes.');
    }
});

// Get note content by ID
router.get('/:id/content', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
            return res.render('login', { message: null });
        }
        req.user = user;
        next();
    })(req, res, next);
}, async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json(note);
    } catch (err) {
        console.error('Error fetching note content:', err.message);
        res.status(500).json({ error: 'Server Error: Could not fetch note content.' });
    }
});

// Create a new note
router.get('/create', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
            return res.render('login', { message: null });
        }
        req.user = user;
        next();
    })(req, res, next);
}, (req, res) => {
    res.render('create-note', { message: null });
});

router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user._id;

    try {
        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required' });
        }

        const newNote = new Note({
            title,
            content,
            owner: userId
        });

        await newNote.save();

        res.status(200).json({ success: true, message: 'Note created successfully' });
    } catch (err) {
        console.error('Error creating note:', err.message);
        res.status(500).json({ success: false, message: 'Could not create note due to a server error.' });
    }
});

// Delete note
router.delete('/:id/delete', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found or you\'re not authorized to delete it.' });
        }
        res.json({ success: true, message: 'Note deleted successfully' });
    } catch (err) {
        console.error('Error deleting note:', err.message);
        res.status(500).json({ success: false, message: 'Could not delete note.' });
    }
});

// Edit note
router.get('/:id/edit', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
            return res.render('login', { message: null });
        }
        req.user = user;
        next();
    })(req, res, next);
}, async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });

        if (!note) {
            return res.status(404).send('Note not found');
        }

        res.render('note-detail', { note, message: null });
    } catch (err) {
        console.error('Error fetching note:', err.message);
        res.status(500).send('Server Error: Could not fetch note.');
    }
});

router.post('/:id/update', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { title, content } = req.body;

    try {
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            { title, content },
            { new: true, runValidators: true }
        );

        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found or you\'re not authorized to edit it.' });
        }

        res.json({ success: true, message: 'Note updated successfully' });
    } catch (err) {
        console.error('Error updating note:', err.message);
        res.status(500).json({ success: false, message: 'Could not update note.' });
    }
});

module.exports = router;
