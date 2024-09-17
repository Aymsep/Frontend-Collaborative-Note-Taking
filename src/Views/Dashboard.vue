<template>
   <div class="dashboard-container">
     <ProfileDrop />
     <!-- <button @click="showToast">Show Success Toast</button> -->
     <Toast />
     <div class="content-container">
       <NoteContainer />
     </div>
   </div>
 </template>
 
 <script setup>
 import ProfileDrop from '../components/common/ProfileDrop.vue';
 import NoteContainer from '../components/Notes/NoteContainer.vue';



 </script>
 
 <style scoped>
 .dashboard-container {
   background-color: #ececec;
   height: 100vh;
   display: flex;
   flex-direction: column;
   align-items: center;
 }
 
 .content-container {
   width: 100%;
   padding: 2rem;
 }
 </style>
 