<template>
  <div
    id="Card"
    :style="{ backgroundColor: randomBgColor }"
    class="relative flex justify-between flex-col p-4 rounded-md shadow-md"
    @mouseleave="handleMouseLeave"
  >
    <!-- Show loader when isLoading is true -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <!-- Three dot menu with focus functionality -->
    <div class="absolute top-2 right-2">
      <div class="relative">
        <!-- Three dots icon -->
        <svg
          style="color:#6800ff !important"
          @click="toggleDropdown"
          xmlns="http://www.w3.org/2000/svg"
          class="h-[2.5rem] w-5 cursor-pointer text-gray-600"
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
          class="noteDropdown absolute right-0 w-32 rounded-md shadow-lg py-1 z-10"
        >
          <a
            href="#"
            @click="deleteNote"
            class="block px-4 py-2"
          >Delete</a>
          <a
            href="#"
            @click="openShareModal"
            class="block px-4 py-2 "
          >Share</a>
        </div>
      </div>
    </div>

    <!-- Editable note content inside the contenteditable div -->
    <div
      ref="contentEditableDiv"
      class="editortext w-full h-full resize-none bg-transparent border-none"
      contenteditable="true"
      @input="handleContentChange"
      @keydown="handleContentChange"
    ></div>

    <!-- Text Styling Options -->
    <div class="flex justify-between items-center mt-4">
      <div>
        <button @click="applyStyle('bold')" class="text-gray-600 hover:text-gray-900">Bold</button>
        <button @click="applyStyle('italic')" class="ml-2 text-gray-600 hover:text-gray-900">Italic</button>
        <button @click="applyStyle('foreColor', '#ff0000')" class="ml-2 text-gray-600 hover:text-gray-900">Red</button>
      </div>
      <span class="text-sm text-gray-500">{{ formatDate(note.createdAt) }}</span>
    </div>

    <!-- Share Modal -->
    <div
      v-if="isShareModalOpen"
      @click.self="closeShareModal"
      class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-md w-96">
        <h2 class="text-lg font-bold mb-4">Share this note with:</h2>
        <div class="flex flex-wrap">
          <div
            v-for="user in filteredOnlineUsers"
            :key="user.id"
            :class="['p-2 flex items-center cursor-pointer', { 'bg-blue-100': selectedUsers.includes(user.id) }]"
            @click="toggleUserSelection(user.id)"
          >
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
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { useNotesStore } from '../../Store/note.Store';
import { debounce } from '../../Utils/debounce';
import { useUserStore } from '../../Store/user.Store';
import { useToast } from 'vue-toastification';
import { formatDate } from '../../Utils/formatDate';

const toast = useToast();
const props = defineProps({ note: Object });

// Reactive references
const contentEditableDiv = ref(null); // Correctly defined ref
const noteContent = ref(props.note?.content || "");
const noteStore = useNotesStore();
const isDropdownOpen = ref(false);
const isShareModalOpen = ref(false);
const selectedUsers = ref([]);
const userStore = useUserStore();
const isLoading = ref(false); // Loading state

// Computed to filter online users excluding the current user
const filteredOnlineUsers = computed(() => userStore.onlineUsers.filter(user => user.id !== userStore.getUserId));

// WebSocket connection
const socket = userStore.socket;

// Random light background color
const randomLightColor = () => {
  const getLightHex = () => Math.floor(Math.random() * 128 + 128).toString(16).padStart(2, '0'); // Light range (128 to 255)
  let color;
  do {
    color = `#${getLightHex()}${getLightHex()}${getLightHex()}`;
  } while (color === '#ffffff'); // Exclude white color
  return color;
};

const randomBgColor = ref(randomLightColor());

// Apply styles to the contentEditable div
const applyStyle = (command, value = null) => {
  document.execCommand(command, false, value);
};

// Handle content change with WebSocket update and debounce
const debouncedSave = debounce(async (content) => {
  await noteStore.editNote(props.note.id, content);
}, 500);

// Handle content changes and apply debounce save
const handleContentChange = () => {
  const htmlContent = contentEditableDiv.value.innerHTML; // Get the content from the contentEditable div
  noteContent.value = htmlContent; // Update the reactive noteContent
  socket.emit('editNote', { noteId: props.note.id, content: htmlContent }); // Emit WebSocket event
  debouncedSave(htmlContent); // Save with debounce
};

// Set up WebSocket listeners
onMounted(() => {
  if (contentEditableDiv.value) {
    contentEditableDiv.value.innerHTML = noteContent.value; // Initialize content
  }

  socket.on(`noteUpdated:${props.note.id}`, (updatedContent) => {
    noteContent.value = updatedContent;
    if (contentEditableDiv.value) {
      contentEditableDiv.value.innerHTML = updatedContent; // Sync content if updated
    }
  });

  socket.on(`noteDeleted:${props.note.id}`, () => {
    noteStore.removeNoteWs(props.note.id);
  });

  onUnmounted(() => {
    socket.off(`noteUpdated:${props.note.id}`);
    socket.off(`noteDeleted:${props.note.id}`);
  });
});

// Handle note deletion with loading
const deleteNote = async () => {
  try {
    isLoading.value = true; // Start loading animation
    await noteStore.removeNote(props.note.id);
    isDropdownOpen.value = false; // Close dropdown after delete
    socket.emit('deleteNote', { noteId: props.note.id });
    toast.success('Note deleted successfully');
  } catch (e) {
    toast.error(e.message || 'Failed to delete note');
  } finally {
    isLoading.value = false; // Stop loading animation
  }
};

// Share the note with selected users
const shareNote = async () => {
  try {
    isLoading.value = true; // Start loading animation
    await noteStore.shareNote({
      NoteId: props.note.id,
      targetId: selectedUsers.value[0],
    });
    socket.emit('shareNote', { noteId: props.note.id, sharedWith: selectedUsers.value });
    toast.success('Note shared successfully');
    
  } catch (e) {
    toast.error(e.message || 'Failed to share note');
  } finally {
    isLoading.value = false; // Stop loading animation
    isDropdownOpen.value = false; // Close dropdown after delete
    closeShareModal();
  }
};

const handleMouseLeave = () => {
  isDropdownOpen.value = false; // Close dropdown when mouse leaves the card
  isShareModalOpen.value = false; // Close share modal if it's open
};

// Toggle dropdown and modal visibility
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  closeShareModal(); // Close modal when the user interacts with the dropdown
};
const openShareModal = () => isShareModalOpen.value = true;
const closeShareModal = () => isShareModalOpen.value = false;

// Toggle user selection for sharing
const toggleUserSelection = (userId) => {
  if (selectedUsers.value.includes(userId)) {
    selectedUsers.value = selectedUsers.value.filter(id => id !== userId);
  } else {
    selectedUsers.value.push(userId);
  }
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

.noteDropdown {
  background-color: #6800ff;
  color: white;
}

.noteDropdown a {
  font-weight: bold;
}

.noteDropdown a:hover {
  color: #6800ff;
  background-color: white;
}

.editortext:focus {
  outline: none;
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.spinner {
  border: 4px solid #f3f3f3; /* Light grey */
  border-top: 4px solid #7b7cf2; /* Blue */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
