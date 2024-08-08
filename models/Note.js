const mongoose = require("mongoose");
const { Schema } = mongoose;

const NoteSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Note = mongoose.model('Note', NoteSchema);
module.exports = Note;
