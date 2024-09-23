<template>
  <div class="notes-container">
    <h1 class="title font-bold">Your Notes</h1>
    <div class="notes-grid">
      <NoteCard v-for="note in notes" :note="note" :key="note.id" />
      <AddNote @click="addNewNote" />
    </div>





  </div>
</template>

<script setup>
import Avatar from '../common/Avatar.vue'
import NoteCard from './NoteCard.vue';
import AddNote from './AddNote.vue';
import { useNotesStore } from '../../Store/note.Store';
import { useUserStore } from '../../Store/user.Store';
import { onMounted, onUnmounted } from 'vue'; 

const { notes, addNote, addNoteWs } = useNotesStore();  // Add addNoteWs to handle WebSocket notes
const { socket, getUserId } = useUserStore();

// Listen for new shared notes via WebSocket when mounted
onMounted(() => {
  console.log('notes',notes)
  socket.on(`noteShared:${getUserId}`, (data) => {
    console.log('notes shared',data)
     addNoteWs(data.note);
  });

  // Cleanup WebSocket listener on unmount
  onUnmounted(() => {
    socket.off(`noteShared:${getUserId}`);
  });
});

const addNewNote = async () => {
  const newNote = {
    content: '',
  };
  await addNote(newNote.content);
};
</script>

<style scoped>
.notes-container {
  padding: 2rem;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

/* Responsive Design for Notes Grid */
@media (max-width: 1200px) {
  .notes-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 columns on medium screens */
  }
}

@media (max-width: 768px) {
  .notes-grid {
    grid-template-columns: repeat(1, 1fr); /* 1 column on smaller screens */
    gap: 1rem; /* Smaller gap between notes on smaller screens */
  }

  .title {
    font-size: 2rem; /* Adjust title size on smaller screens */
  }
}

@media (max-width: 576px) {
  .notes-container {
    padding: 1rem;
  }

  .title {
    font-size: 1.75rem; /* Smaller title for very small screens */
  }

  .notes-grid {
    gap: 1rem; /* Smaller gap between notes on mobile */
  }
}
</style>
