<template>
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-6">Your Notes</h1>
      <div class="grid grid-cols-3 gap-6">
        <NoteCard v-for="(note, index) in notes" :key="index" />
        <AddNote @click="addNewNote" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import NoteCard from './NoteCard.vue';
  import AddNote from './AddNote.vue';
  
  const notes = ref([{}]); // Initially an empty array to mimic the first empty note
  
  const addNewNote = () => {
    notes.value.push({}); // Add a new note
  };
  </script>
  