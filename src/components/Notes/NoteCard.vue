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
            class="block px-4 py-2"
          >Share</a>
        </div>
      </div>
    </div>

    <!-- Editable note content inside the contenteditable div -->
    <div
      ref="contentEditableDiv"
      class="w-full h-full resize-none bg-transparent border-none"
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
            <span class="font-semibold">{{ user.username }}</span> <!-- Display username -->
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
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useNotesStore } from '../../Store/note.Store';
import { debounce } from '../../Utils/debounce';
import { useUserStore } from '../../Store/user.Store';
import { useToast } from "vue-toastification";

const toast = useToast();

const props = defineProps({
  note: Object,
});

// Reactive references
const noteContent = ref(props.note?.content || "");
const contentEditableDiv = ref(null);
const noteStore = useNotesStore();
const isDropdownOpen = ref(false);
const isShareModalOpen = ref(false);
const selectedUsers = ref([]);
const userStore = useUserStore();
const userIdCurrent = userStore.getUserId;

// WebSocket connection
const socket = userStore.socket;

// Computed to filter online users excluding the current user
const filteredOnlineUsers = computed(() => {
  return userStore.onlineUsers.filter(user => user.id !== userIdCurrent);
});

// Random light background color
const randomHexColor = () => {
  const getLightHex = () => Math.floor(Math.random() * 128 + 128).toString(16).padStart(2, '0');
  return `#${getLightHex()}${getLightHex()}${getLightHex()}`;
};

const randomBgColor = ref(randomHexColor());

// Apply styles to the contentEditable div
const applyStyle = (command, value = null) => {
  document.execCommand(command, false, value);
};

// Handle content change with WebSocket update and debounce
const debouncedSave = debounce(async (content) => {
  await noteStore.editNote(props.note.id, content);
}, 500);

// Utility functions to manage cursor position
const getCaretPosition = () => {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;
  return selection.getRangeAt(0);
};

const setCaretPosition = (range) => {
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
};

const handleContentChange = () => {
  const caretPosition = getCaretPosition(); // Get the current caret position

  const htmlContent = contentEditableDiv.value.innerHTML; // Get the HTML content
  noteContent.value = htmlContent; // Update the note content
  socket.emit('editNote', { noteId: props.note.id, content: htmlContent });

  debouncedSave(htmlContent);

  setCaretPosition(caretPosition); // Restore the caret position
};

// WebSocket listeners setup
onMounted(() => {
  setupWebSocketListeners(props.note.id, userIdCurrent);

  // Set initial content when mounted
  if (contentEditableDiv.value) {
    contentEditableDiv.value.innerHTML = noteContent.value;
  }

  // Clean up listeners on unmount
  onUnmounted(() => {
    cleanupWebSocketListeners(props.note.id);
  });
});

const setupWebSocketListeners = (noteId, userId) => {
  socket.on(`noteUpdated:${noteId}`, (updatedContent) => {
    noteContent.value = updatedContent;
    if (contentEditableDiv.value) {
      contentEditableDiv.value.innerHTML = updatedContent; // Sync the content with updates
    }
  });

  socket.on(`noteDeleted:${noteId}`, () => {
    noteStore.removeNoteWs(noteId);
  });

  socket.on(`noteShared:${userId}`, (data) => {
    noteStore.addNoteWs(data.note);
  });
};

const cleanupWebSocketListeners = (noteId) => {
  socket.off(`noteUpdated:${noteId}`);
  socket.off(`noteDeleted:${noteId}`);
  socket.off(`noteShared:${userIdCurrent}`);
};

// Handle note deletion
const deleteNote = async () => {
  try {
    await noteStore.removeNote(props.note.id);
    socket.emit('deleteNote', { noteId: props.note.id });
    toast.success('Note deleted successfully');
  } catch (e) {
    toast.error(e.message || 'Failed to delete note');
  }
};

// Share the note with selected users
const shareNote = async () => {
  await noteStore.shareNote({
    NoteId: props.note.id,
    targetId: selectedUsers.value[0],
  });
  socket.emit(`shareNote`, { noteId: props.note.id, sharedWith: selectedUsers.value });
  toast.success("Note shared successfully");
  closeShareModal();
};

// Toggle dropdown menu visibility
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

// Modal handling
const openShareModal = () => {
  isShareModalOpen.value = true;
};

const closeShareModal = () => {
  isShareModalOpen.value = false;
};

// Toggle user selection for sharing
const toggleUserSelection = (userId) => {
  if (selectedUsers.value.includes(userId)) {
    selectedUsers.value = selectedUsers.value.filter(id => id !== userId);
  } else {
    selectedUsers.value.push(userId);
  }
};

// Format the date for display
const formatDate = (isoDateString) => {
  if (!isoDateString) return 'N/A';
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
</style>
