<template>
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-6">Your Notes</h1>
      <div class="grid grid-cols-3 gap-6">
        <NoteCard v-for="(note, index) in notes" :note="note" :key="index" />
        <AddNote @click="addNewNote" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref,onMounted } from 'vue';
  import NoteCard from './NoteCard.vue';
  import AddNote from './AddNote.vue';
  import { useUserStore } from '../../Store/user.Store';

  const {notes} = useUserStore()




  
  
  const addNewNote = () => {
    notes.value.push({}); // Add a new note
  };
  </script>
  