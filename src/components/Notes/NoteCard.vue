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
    v-model="noteContent"
      ref="textarea"
      class="w-full h-full resize-none bg-transparent border-none"
      placeholder="Write your note here..."
      @input="handleContentChange"
    >{{ noteContent }}</textarea>

    <div class="flex justify-between items-center mt-4">
      <div>
        <button @click="applyStyle('bold')" class="text-gray-600 hover:text-gray-900">Bold</button>
        <button @click="applyStyle('italic')" class="ml-2 text-gray-600 hover:text-gray-900">Italic</button>
      </div>
      <span class="text-sm text-gray-500">{{ formatDate(note.createdAt) }}</span>
    </div>

    <!-- Share Modal -->
    <div
      v-if="isShareModalOpen"
      class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-md w-96">
        <h2 class="text-lg font-bold mb-4">Share this note with:</h2>
        <div class="flex flex-wrap">
          <div
            v-for="user in users"
            :key="user.id"
            :class="['p-2 flex items-center cursor-pointer', { 'bg-blue-100': selectedUsers.includes(user.id) }]"
            @click="toggleUserSelection(user.id)"
          >
            <!-- <img :src="getAvatar(user.email)" class="w-10 h-10 rounded-full mr-3" alt="User Avatar" /> -->
            <span class="font-semibold">{{ user.username }}</span>
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button @click="closeShareModal" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md mr-2">Cancel</button>
          <button @click="shareNote" class="px-4 py-2 bg-blue-600 text-white rounded-md">Share</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useNotesStore } from '../../Store/note.Store';
import { debounce } from '../../Utils/debounce';
import { io } from 'socket.io-client';
import { getUsers } from '../../api/user.api';
import { useUserStore } from '../../Store/user.Store';

// Initialize WebSocket connection
const socket = io('http://localhost:3000', { transports: ['websocket'] });

// Log WebSocket connection status
socket.on('connect', () => {
  console.log('WebSocket connection established');
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
});

const props = defineProps({
  note: Object,
});



// Reactive references
const noteContent = ref(props.note.content);
const noteStore = useNotesStore();
const isDropdownOpen = ref(false);
const isShareModalOpen = ref(false);
const users = ref([]);
const selectedUsers = ref([]);
const userStore = useUserStore();

// Random light color generator
const randomHexColor = () => {
  const getLightHex = () => Math.floor(Math.random() * 128 + 128).toString(16).padStart(2, '0');
  return `#${getLightHex()}${getLightHex()}${getLightHex()}`;
};

const randomBgColor = ref(randomHexColor());

// Fetch users and set up WebSocket listeners
onMounted(async () => {
  const response = await getUsers();
  users.value = response.data;
  setupWebSocketListeners(props.note.id);  // Set up WebSocket listeners
});

// Set up WebSocket listeners
const setupWebSocketListeners = (noteId) => {
  socket.on(`noteUpdated:${noteId}`, (updatedContent) => {
    console.log('A note is editing');
    noteContent.value = updatedContent;
  });
  socket.on(`noteDeleted:${noteId}`, () => {
    console.log('A note is deleted');
    noteStore.removeNoteWs(noteId);
  });

  socket.on(`noteShared:${userStore.user.id}`, (data) => {
    console.log('A note has been shared with you:', data.note);
    // noteStore.notes.push(data.note);  // Add shared note to the user's list
    noteStore.addNoteWs(data.note);
  });
};

// Clean up WebSocket listeners
onUnmounted(() => {
  cleanupWebSocketListeners(props.note.id);
});

const cleanupWebSocketListeners = (noteId) => {
  socket.off(`noteUpdated:${noteId}`);
  socket.off(`noteDeleted:${noteId}`);
  socket.off(`noteShared:${userStore.user.id}`);
};

// Watch for changes in note ID to re-setup WebSocket listeners
watch(() => props.note.id, (newNoteId, oldNoteId) => {
  cleanupWebSocketListeners(oldNoteId);
  setupWebSocketListeners(newNoteId);
});

// Toggle dropdown menu visibility
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const openShareModal = () => {
  isShareModalOpen.value = true;
};

// Handle note content changes (with debounced save and WebSocket update)
const debouncedSave = debounce(async (content) => {
  await noteStore.editNote(props.note.id, content);
}, 500);

const handleContentChange = () => {
  debouncedSave(noteContent.value);
  socket.emit('editNote', { noteId: props.note.id, content: noteContent.value });
};

// Handle note deletion
const deleteNote = async () => {
  console.log('Deleting note:', props.note.id);
  await noteStore.removeNote(props.note.id);
  socket.emit('deleteNote', { noteId: props.note.id });
};

// Toggle user selection for sharing
const toggleUserSelection = (userId) => {
  if (selectedUsers.value.includes(userId)) {
    selectedUsers.value = selectedUsers.value.filter(id => id !== userId);
  } else {
    selectedUsers.value.push(userId);
  }
};

// Share the note with selected users
const shareNote = async () => {
  await noteStore.shareNote({
    NoteId: props.note.id,
    targetId: selectedUsers.value[0],
  });
  socket.emit('shareNote', { noteId: props.note.id, sharedWith: selectedUsers.value });
  closeShareModal();
};

// Close the share modal
const closeShareModal = () => {
  isShareModalOpen.value = false;
};

// Format the date for display
const formatDate = (isoDateString) => {
  if(!isoDateString) return 'N/A'
  const date = new Date(isoDateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
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
