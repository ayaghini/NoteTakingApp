const express = require('express');
const passport = require('passport');
const Note = require('../models/Note');
const router = express.Router();

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Get all non-archived notes
 *     description: Retrieve all non-archived notes for the authenticated user.
 *     tags: 
 *       - Notes
 *     responses:
 *       200:
 *         description: Successfully retrieved all non-archived notes
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML page rendering the list of notes
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Server Error, Could not fetch notes.
 */

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
        const notes = await Note.find({ owner: req.user._id, archived: false });
        res.render('notes', { notes, currentPath: req.path });
    } catch (err) {
        console.error('Error fetching notes:', err.message);
        res.status(500).send('Server Error: Could not fetch notes.');
    }
});

/**
 * @swagger
 * /notes/archived:
 *   get:
 *     summary: Get all archived notes
 *     description: Retrieve all archived notes for the authenticated user.
 *     tags: 
 *       - Notes
 *     responses:
 *       200:
 *         description: Successfully retrieved all archived notes
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: HTML page rendering the list of archived notes
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Server Error, Could not fetch archived notes.
 */

router.get('/archived', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
            return res.render('login', { message: null });
        }
        req.user = user;
        next();
    })(req, res, next);
}, async (req, res) => {
    try {
        const notes = await Note.find({ owner: req.user._id, archived: true });
        res.render('archived-notes', { notes, currentPath: req.path });
        //res.json({ success: true, message: 'Note Archived successfully' });

    } catch (err) {
        console.error('Error fetching archived notes:', err.message);
        res.status(500).send('Server Error: Could not fetch archived notes.');
    }
});

/**
 * @swagger
 * /notes/{id}/content:
 *   get:
 *     summary: Get the content of a specific note
 *     description: Retrieve the content of a note by its ID. The note must belong to the authenticated user.
 *     tags: 
 *       - Notes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the note to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved note content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 612e35e10c7b2c001cbba8ea
 *                 title:
 *                   type: string
 *                   example: My Note Title
 *                 content:
 *                   type: string
 *                   example: This is the content of the note.
 *                 owner:
 *                   type: string
 *                   example: 612e35e10c7b2c001cbba8eb
 *       404:
 *         description: Note not found or not authorized to view it
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Note not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server Error, Could not fetch note content.
 */

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

/**
 * @swagger
 * /notes/create:
 *   post:
 *     summary: Create a new note
 *     description: Create a new note with a title and content. The note will be associated with the authenticated user.
 *     tags: 
 *       - Notes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: My New Note
 *               content:
 *                 type: string
 *                 example: This is the content of my new note.
 *     responses:
 *       200:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Note created successfully
 *       400:
 *         description: Title and content are required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Title and content are required
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Could not create note due to a server error.
 */

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

/**
 * @swagger
 * /notes/{id}/delete:
 *   delete:
 *     summary: Delete a note
 *     description: Delete a note by its ID. The note must belong to the authenticated user.
 *     tags: 
 *       - Notes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the note to delete
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Note deleted successfully
 *       404:
 *         description: Note not found or not authorized to delete it
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Note not found or you're not authorized to delete it.
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Could not delete note.
 */

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

/**
 * @swagger
 * /notes/{id}/update:
 *   post:
 *     summary: Update a note
 *     description: Update the title and content of a note by its ID. The note must belong to the authenticated user.
 *     tags: 
 *       - Notes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the note to update
 *       - in: body
 *         name: note
 *         description: The new title and content of the note
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *               example: Updated Note Title
 *             content:
 *               type: string
 *               example: Updated note content here...
 *     responses:
 *       200:
 *         description: Note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Note updated successfully
 *       404:
 *         description: Note not found or not authorized to edit it
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Note not found or you're not authorized to edit it.
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Could not update note.
 */

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

/**
 * @swagger
 * /notes/{id}/archive:
 *   post:
 *     summary: Archive a note
 *     description: Archive a note by its ID. The note must belong to the authenticated user.
 *     tags: 
 *       - Notes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the note to archive
 *     responses:
 *       200:
 *         description: Note archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Note Archived successfully
 *       404:
 *         description: Note not found or not authorized to archive it
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Note not found or you are not authorized to archive it.
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Server Error, Could not archive note.
 */
router.post('/:id/archive', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            { archived: true },
            { new: true }
        );
        if (!note) {
            return res.status(404).send('Note not found or you are not authorized to archive it.');
        }
        res.json({ success: true, message: 'Note Archived successfully' });
    } catch (err) {
        console.error('Error archiving note:', err.message);
        res.status(500).send('Server Error: Could not archive note.');
    }
});


/**
 * @swagger
 * /notes/{id}/unarchive:
 *   post:
 *     summary: Unarchive a note
 *     description: Unarchive a note by its ID. The note must belong to the authenticated user.
 *     tags: 
 *       - Notes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the note to unarchive
 *     responses:
 *       200:
 *         description: Note unarchived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Note UnArchived successfully
 *       404:
 *         description: Note not found or not authorized to unarchive it
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Note not found or you are not authorized to unarchive it.
 */
router.post('/:id/unarchive', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            { archived: false },
            { new: true }
        );
        if (!note) {
            return res.status(404).send('Note not found or you are not authorized to unarchive it.');
        }
        //res.redirect('/notes');
        res.json({ success: true, message: 'Note UnArchived successfully' });

    } catch (err) {
        console.error('Error unarchiving note:', err.message);
        res.status(500).send('Server Error: Could not unarchive note.');
    }
});



module.exports = router;
