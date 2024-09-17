<template>
    <div class="avatar-container">
      <div class="avatar-circle">
        <span>{{ firstLetter }}</span>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "AvatarContainer",
    props: {
      name: {
        type: String,
        required: true,
      },
    },
    computed: {
      firstLetter() {
        return this.name.charAt(0).toUpperCase();
      },
    },
  };
  </script>
  
  <style scoped>
  .avatar-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .avatar-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #6800ff;
    font-size: 24px;
    font-weight: bold;
  }
  </style>
  