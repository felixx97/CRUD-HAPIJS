document.addEventListener('DOMContentLoaded', async () => {
    const notesListElement = document.getElementById('notesList');

    const fetchNotes = async () => {
        const response = await fetch('/api/notes');
        const data = await response.json();
        renderNotes(data.data);
    };

    const renderNotes = (notes) => {
        notesListElement.innerHTML = '';
        notes.forEach(note => {
            const li = document.createElement('li');
            li.textContent = `${note.title} - ${note.artist} (${note.album})`;
            notesListElement.appendChild(li);
        });
    };

    fetchNotes();

    const addNoteForm = document.getElementById('addNoteForm');
    addNoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addNoteForm);
        const payload = Object.fromEntries(formData.entries());

        const response = await fetch('/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            fetchNotes(); // Atualiza a lista de notas após adicionar uma nova
            addNoteForm.reset();
        } else {
            const errorData = await response.json();
            alert(`Erro ao adicionar nota: ${errorData.error}`);
        }
    });
});
