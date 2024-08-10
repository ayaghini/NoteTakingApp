console.log('notes.js loaded');

function loadNoteContent(noteId) {
    if (noteId) {
        fetch(`/notes/${noteId}/content`)
            .then(response => response.json())
            .then(data => {
                const noteContentDiv = document.getElementById('note-content');
                noteContentDiv.innerHTML = `
                    <form id="edit-note-form">
                        <div class="form-group">
                            <label for="title">Title</label>
                            <input type="text" id="title" name="title" value="${data.title}" required class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="content">Content</label>
                            <div id="editor-container">${data.content}</div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Save</button>
                    </form>
                `;

                // Initialize Quill editor
                const quill = new Quill('#editor-container', {
                    theme: 'snow'
                });

                const form = document.getElementById('edit-note-form');
                form.addEventListener('submit', function(event) {
                    event.preventDefault();
                    const content = quill.root.innerHTML;
                    updateNote(noteId, content);
                });
            })
            .catch(error => console.error('Error loading note content:', error));
    } else {
        const noteContentDiv = document.getElementById('note-content');
        noteContentDiv.innerHTML = `
            <form id="edit-note-form">
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" id="title" name="title" required class="form-control">
                </div>
                <div class="form-group">
                    <label for="content">Content</label>
                    <div id="editor-container"></div>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Save</button>
            </form>
        `;

        // Initialize Quill editor
        const quill = new Quill('#editor-container', {
            theme: 'snow'
        });

        const form = document.getElementById('edit-note-form');
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const content = quill.root.innerHTML;
            updateNote(null, content);
        });
    }
}

function updateNote(noteId, content) {
    const form = document.getElementById('edit-note-form');
    const formData = new FormData(form);
    const title = formData.get('title');

    const url = noteId ? `/notes/${noteId}/update` : '/notes/create';
    const method = noteId ? 'POST' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            //alert('Note saved successfully');
            location.reload();
        } else {
            alert('Error saving note: ' + data.message);
        }
    })
    .catch(error => console.error('Error saving note:', error));
}

function deleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        fetch(`/notes/${noteId}/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                //alert('Note deleted successfully');
                location.reload();
            } else {
                alert('Error deleting note: ' + data.message);
            }
        })
        .catch(error => console.error('Error deleting note:', error));
    }
}

function archiveNote(noteId) {
    if (true) {
        fetch(`/notes/${noteId}/archive`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                //alert('Note archived successfully');
                location.reload();
            } else {
                alert('Error archiving note: ' + data.message);
            }
        })
        .catch(error => console.error('Error archiving note:', error));
    }
}

function unarchiveNote(noteId) {
    if (true) {
        fetch(`/notes/${noteId}/unarchive`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                //alert('Note unarchived successfully');
                location.reload();
            } else {
                alert('Error unarchiving note: ' + data.message);
            }
        })
        .catch(error => console.error('Error unarchiving note:', error));
    }
}
