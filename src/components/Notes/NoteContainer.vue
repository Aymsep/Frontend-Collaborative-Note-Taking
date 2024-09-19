<template>
  <div class="notes-container">
    <h1 class="title">Your Notes</h1>
    <div class="notes-grid">
      <NoteCard v-for="note in notes" :note="note" :key="note.id" />
      <AddNote @click="addNewNote" />
    </div>
  </div>
</template>

<script setup>
import NoteCard from './NoteCard.vue';
import AddNote from './AddNote.vue';
import { useNotesStore } from '../../Store/note.Store';
import { useUserStore } from '../../Store/user.Store';
import { onMounted, onUnmounted } from 'vue'; 

const { notes, addNote, addNoteWs } = useNotesStore();  // Add addNoteWs to handle WebSocket notes
const { socket, getUserId } = useUserStore();



// Listen for new shared notes via WebSocket when mounted
onMounted(() => {
  socket.on(`noteShared:${getUserId}`, (data) => {
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
</style>
