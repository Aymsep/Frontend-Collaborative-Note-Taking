<template>
  <div class="relative inline-block text-right p-[50px]">
    <div 
      class="flex items-center space-x-2 cursor-pointer"
      @mouseover="isDropdownOpen = true" 
      @mouseleave="isDropdownOpen = false"
    >
     <div class="avatar">
      {{ user.username.toUpperCase().charAt(0) }}
     </div>
      <span class="text-black font-medium">{{user.username}}</span><br>
      <span class="text-black font-medium">{{user.email}}</span>
      <svg 
      xmlns="http://www.w3.org/2000/svg" 
      class="h-5 w-5 text-gray-400" 
      viewBox="0 0 20 20" 
      fill="currentColor"
      >
      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
  </div>
  <a href="#" @click="logout" class="text-black font-medium">Logout</a>

    <!-- Dropdown Menu -->
    <div 
      v-if="isDropdownOpen" 
      class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10" 
      @mouseleave="isDropdownOpen = false"
    >
      <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
      <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
      <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '../../Store/user.Store';
import { useRouter } from 'vue-router';

const isDropdownOpen = ref(false);
const {user,logout} = useUserStore();
const router = useRouter();
const handleLogout = async () => {
   logout(router);
}
console.log('user: ' + user.email)


</script>

<style scoped>
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f3f4f6;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 1.2rem;
}
</style>

