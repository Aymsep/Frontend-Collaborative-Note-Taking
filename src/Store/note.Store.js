import { defineStore } from 'pinia';
import { getMyNotes, createNote, deleteNote, updateNote, shareNote } from '../api/notes.api';  // Import the note-related API functions

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: [],
    loading: false,
    error: null,
  }),

  actions: {
    // Fetch all notes
    async fetchNotes() {
      this.loading = true;
      try {
        const response = await getMyNotes();
        this.notes = response.data.notes;
      } catch (err) {
        this.error = 'Failed to fetch notes';
        console.error('Error fetching notes:', err);
      } finally {
        this.loading = false;
      }
    },

    // Add a new note
    async addNote(content) {
      this.loading = true;
      try {
        const response = await createNote(content);
        this.notes.push(response.data.note);  // Add the new note to the notes list
      } catch (err) {
        this.error = 'Failed to add note';
        console.error('Error adding note:', err);
      } finally {
        this.loading = false;
      }
    },

    // Delete a note
    async removeNote(noteId) {
      this.loading = true;
      try {
         await deleteNote(noteId);
        const noteIndex = this.notes.findIndex(note => note.id === noteId);
        if (noteIndex !== -1) {
          this.notes.splice(noteIndex, 1);  // Remove the note by index
        }
      } catch (err) {
        this.error = err.response.data.message;
        throw err.response.data.message;
      } finally {
        this.loading = false;
      }
    },

    async editNote(noteId, content) {
        this.loading = true;
        try {
          await updateNote(noteId, content);  // Call API to update the note
          const note = this.notes.find(note => note.id === noteId);
          if (note) note.content = content;  // Update the note in the store
        } catch (err) {
          this.error = 'Failed to edit note';
          console.error(err.message);
        } finally {
          this.loading = false;
        }
      },

    async shareNote(data){
        this.loading = true;
        try {
            await shareNote(data);
        } catch (err) {
            throw err.response.data.message
        } finally {
            this.loading = false;
    }
  },

  addNoteWs(newNote) {
    // Check if a note with the same ID already exists
    const existingNote = this.notes.find(note => note.id === newNote.id);
    if (!existingNote) {
      this.notes.push(newNote); // Add the note if it's not already in the store
    } else {
      console.log('Note already exists, skipping:', newNote.id);
    }
  },
  async removeNoteWs(noteId) {
    try {
      const noteIndex = this.notes.findIndex(note => note.id === noteId);
      if (noteIndex !== -1) {
        this.notes.splice(noteIndex, 1);  // Remove the note by index
      }
    } catch (err) {
      this.error = 'Failed to delete note';
      console.error('Error deleting note:', err);
    } finally {
      this.loading = false;
    }
  },
    },
});
