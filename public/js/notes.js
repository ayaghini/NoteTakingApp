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
                            <textarea id="content" name="content" rows="10" required class="form-control">${data.content}</textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Save</button>
                    </form>
                `;

                const form = document.getElementById('edit-note-form');
                form.addEventListener('submit', function(event) {
                    event.preventDefault();
                    updateNote(noteId);
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
                    <textarea id="content" name="content" rows="10" required class="form-control"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Save</button>
            </form>
        `;

        const form = document.getElementById('edit-note-form');
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            updateNote();
        });
    }
}

function updateNote(noteId) {
    const form = document.getElementById('edit-note-form');
    const formData = new FormData(form);
    const title = formData.get('title');
    const content = formData.get('content');

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
                alert('Note deleted successfully');
                location.reload();
            } else {
                alert('Error deleting note: ' + data.message);
            }
        })
        .catch(error => console.error('Error deleting note:', error));
    }
}
