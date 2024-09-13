<template>
  <div
    id="Card"
    :style="{ backgroundColor: randomBgColor }"
    class="relative flex justify-between flex-col p-4 rounded-md shadow-md"
    @mouseleave="closeDropdown"
  >
    <!-- Three dot menu with focus functionality -->
    <div class="absolute top-2 right-2">
      <div class="relative">
        <!-- Three dots icon -->
        <svg
          @click="toggleDropdown"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 cursor-pointer text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v.01M12 12v.01M12 18v.01"
          />
        </svg>

        <!-- Dropdown -->
        <div
          v-if="isDropdownOpen"
          class="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-10"
        >
          <a
            href="#"
            @click="deleteNote"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >Delete</a>
          <a
            href="#"
            @click="openShareModal"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >Share</a>
        </div>
      </div>
    </div>

    <textarea
      ref="textarea"
      v-model="noteContent"
      class="w-full h-full resize-none bg-transparent border-none"
      placeholder="Write your note here..."
    ></textarea>

    <div class="flex justify-between items-center mt-4">
      <div>
        <button @click="applyStyle('bold')" class="text-gray-600 hover:text-gray-900">Bold</button>
        <button @click="applyStyle('italic')" class="ml-2 text-gray-600 hover:text-gray-900">Italic</button>
      </div>
      <span class="text-sm text-gray-500">{{ date }}</span>
    </div>

    <!-- Share Modal -->
    <div
      v-if="isShareModalOpen"
      class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-md w-96">
        <h2 class="text-lg font-bold mb-4">Share this note with:</h2>
        <ul class="mb-4">
          <li v-for="user in users" :key="user.id" class="mb-2">
            <input type="checkbox" :id="'user-' + user.id" class="mr-2">
            <label :for="'user-' + user.id">{{ user.name }}</label>
          </li>
        </ul>
        <div class="flex justify-end">
          <button @click="closeShareModal" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md mr-2">Cancel</button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md">Share</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const noteContent = ref('');
const date = new Date().toLocaleDateString();

const randomHexColor = () => {
  const getLightHex = () => Math.floor(Math.random() * 128 + 128).toString(16).padStart(2, '0');
  return `#${getLightHex()}${getLightHex()}${getLightHex()}`;
};

const randomBgColor = ref(randomHexColor());

const isDropdownOpen = ref(false);
const isShareModalOpen = ref(false);

const users = ref([
  { id: 1, name: 'Alice Johnson' },
  { id: 2, name: 'Bob Smith' },
  { id: 3, name: 'Charlie Davis' },
  { id: 4, name: 'Diana Roberts' },
]);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const openShareModal = () => {
  isDropdownOpen.value = false; // Close dropdown
  isShareModalOpen.value = true;
};

const closeShareModal = () => {
  isShareModalOpen.value = false;
};

const deleteNote = () => {
  // Logic to delete the note (for now, just close dropdown)
  isDropdownOpen.value = false;
};
</script>

<style scoped>
textarea {
  font-family: inherit;
  font-size: 16px;
}

#Card {
  min-height: 250px;
}
</style>
