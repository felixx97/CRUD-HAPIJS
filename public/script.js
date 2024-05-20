document.addEventListener('DOMContentLoaded', () => {
    const notesList = document.getElementById('notesList');
    const addNoteForm = document.getElementById('addNoteForm');
    const editNoteForm = document.getElementById('editNoteForm');
    const cancelEdit = document.getElementById('cancelEdit');

    // Função para buscar e renderizar as notas
    const fetchNotes = async () => {
        const response = await fetch('/api/notes');
        const data = await response.json();
        renderNotesList(data.data);
    };

    // Função para renderizar a lista de notas
    const renderNotesList = (notes) => {
        notesList.innerHTML = '';
        notes.forEach(note => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${note.title}</strong> - ${note.artist} (${note.album}) <br> 
                <em>${note.description}</em> <br>
                <button class="edit-btn" data-id="${note.id}">✏️</button>
                <button class="delete-btn" data-id="${note.id}">🗑️</button>
            `;
            notesList.appendChild(li);
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEdit);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDelete);
        });
    };

    // Função para adicionar uma nova nota
    addNoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addNoteForm);
        const newNote = {
            title: formData.get('title'),
            artist: formData.get('artist'),
            description: formData.get('description'),
            composer: formData.get('composer'),
            album: formData.get('album')
        };

        await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newNote)
        });

        addNoteForm.reset();
        fetchNotes();
    });

    // Função para iniciar o processo de edição
    const handleEdit = (e) => {
        const noteId = e.target.getAttribute('data-id');
        const note = Array.from(notesList.children).find(li => li.querySelector(`.edit-btn[data-id="${noteId}"]`));
        const [title, artist, album, description] = note.innerText.split('\n')[0].split(' - ');

        document.getElementById('editId').value = noteId;
        document.getElementById('editTitle').value = title;
        document.getElementById('editArtist').value = artist.split(' (')[0];
        document.getElementById('editAlbum').value = artist.split(' (')[1].slice(0, -1);
        document.getElementById('editDescription').value = description;

        editNoteForm.style.display = 'block';
        addNoteForm.style.display = 'none';
    };

    // Função para cancelar a edição
    cancelEdit.addEventListener('click', () => {
        editNoteForm.style.display = 'none';
        addNoteForm.style.display = 'block';
        editNoteForm.reset();
    });

    // Função para salvar a nota editada
    editNoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const noteId = document.getElementById('editId').value;
        const formData = new FormData(editNoteForm);
        const updatedNote = {
            title: formData.get('editTitle'),
            artist: formData.get('editArtist'),
            description: formData.get('editDescription'),
            composer: formData.get('editComposer'),
            album: formData.get('editAlbum')
        };

        await fetch(`/api/notes/${noteId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedNote)
        });

        editNoteForm.reset();
        editNoteForm.style.display = 'none';
        addNoteForm.style.display = 'block';
        fetchNotes();
    });

    // Função para deletar uma nota
    const handleDelete = async (e) => {
        const noteId = e.target.getAttribute('data-id');

        await fetch(`/api/notes/${noteId}`, {
            method: 'DELETE'
        });

        fetchNotes();
    };

    // Carrega as notas ao iniciar
    fetchNotes();
});
