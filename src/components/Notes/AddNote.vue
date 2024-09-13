<template>
    <div class="flex justify-center items-center h-48 w-48 bg-gray-200 rounded-full shadow-md cursor-pointer">
      <span @click="addNote" class="text-4xl font-bold">+</span>
    </div>
  </template>
  
  <script setup>
  const addNote = () => {
    // Emit an event to the parent component to add a new note
    // Placeholder for now, logic can be handled in Dashboard.vue
  };
  </script>
  