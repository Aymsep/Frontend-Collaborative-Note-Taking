<template>
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-6">Your Notes</h1>
      <div class="grid grid-cols-3 gap-6">
        <NoteCard v-for="(note, index) in notes" :note="note" :key="note.id" />
        <AddNote @click="addNewNote" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref,onMounted } from 'vue';
  import NoteCard from './NoteCard.vue';
  import AddNote from './AddNote.vue';
  import { useUserStore } from '../../Store/user.Store';
  import {useNotesStore} from '../../Store/note.Store'

  const {notes,addNote} = useNotesStore()





  
  
  const addNewNote = async() => {
    const newNote = {
      content: '',
    }
    await addNote(newNote.content)
  };
  </script>
  