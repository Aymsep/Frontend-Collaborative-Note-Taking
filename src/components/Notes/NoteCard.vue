<template>
  <div
    :id="`Card-${note.id}`"
    :style="{ backgroundColor: randomBgColor }"
    class="relative flex justify-between flex-col p-4 rounded-md shadow-md h-[260px]"
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
          class="h-[3.5rem] w-5 cursor-pointer text-gray-600"
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
          class="noteDropdown absolute right-0 w-32 rounded-md shadow-lg  z-10"
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

    <!-- Quill Editor for rich text editing -->
    <quill-editor
      :id="`editor-${note.id}`"
      v-model="noteContent"
      :options="editorOptions"
      class="editortext w-full h-full no-border overflow-y-auto"
      @text-change="handleContentChange"
      style="border: none !important; outline:none !important; max-height: 180px;" 
    />

    <!-- Text Styling Options -->
    <div class="flex justify-between items-center mt-4">
      <span class="text-sm text-gray-500">{{ formatDate(note.createdAt) }}</span>
    </div>

    <!-- Share Modal -->
    <div
      v-if="isShareModalOpen"
      @click.self="closeShareModal"
      class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
    >
      <!-- Main modal -->
      <div id="crypto-modal" tabindex="-1" aria-hidden="true" class=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div class="absolute ml-auto mr-auto right-0 left-0 top-[25%] p-4 w-full max-w-md max-h-full">
              <!-- Modal content -->
              <div class="relative bg-white rounded-lg shadow ">
                  <!-- Modal header -->
                  <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t" style="border-bottom:1px solid #6800ff !important">
                      <h3 style="color: #6800ff !important;" class="text-lg font-semibold text-gray-900 dark:text-white">
                          Select User
                      </h3>
                      <button @click="closeShareModal" type="button" class="text-gray-400 bg-transparent  hover:text-gray-900 rounded-lg text-sm h-8 w-8 ms-auto inline-flex justify-center items-center  dark:hover:text-white" data-modal-toggle="crypto-modal">
                          <svg class="w-3 h-3" style="color: #6800ff !important;" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                          </svg>
                          <span  class="sr-only">Close modal</span>
                      </button>
                  </div>
                  <!-- Modal body -->
                  <div class="p-4 md:p-5">
                      <ul
                      class="my-4 space-y-3">
                      <li
                          v-for="user in filteredOnlineUsers"
                          :class="['w-full p-2  items-center  cursor-pointer']"
                          :key="user.id"
                          >
                              <a
                              :class="['flex items-center p-3 text-base font-bold text-gray-900 rounded-lg  group hover:bg-[#6800ff57]', { 'bg-blue-100': selectedUsers.includes(user.id) }]"
                              @click="shareNote(user.id)"
                              style="border:1px solid #6800ff !important"
                              href="#" class="flex items-center p-3 text-base font-bold text-gray-900 rounded-lg  group hover:shadow  text-white">
                                <div class="avatar-container">
                                  <div class="avatar-circle">
                                    <span >{{ user.username.charAt(0).toUpperCase() }}</span>
                                  </div>
                                </div>
                                <span class="flex-1 ms-3 whitespace-nowrap" style="color: #6800ff !important;">{{ user.username }}</span>
                              </a>
                          </li>
                      </ul>
                  </div>
              </div>
          </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useNotesStore } from '../../Store/note.Store';
import { debounce } from '../../Utils/debounce';
import { useUserStore } from '../../Store/user.Store';
import { useToast } from 'vue-toastification';
import { formatDate } from '../../Utils/formatDate';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const toast = useToast();
const props = defineProps({ note: Object });

// Quill editor options
const editorOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'], // Basic formatting options
      [{ 'color': [] }, { 'background': [] }], // Color and background options
      [{ 'align': [] }], // Alignment options
      [{ 'list': 'ordered' }, { 'list': 'bullet' }], // List options
      ['clean'], // Clear formatting
    ],
  },
  theme: 'snow', // Default theme for Quill
};

// Reactive references
const noteContent = ref(props.note?.content || "");
const noteStore = useNotesStore();
const isDropdownOpen = ref(false);
const isShareModalOpen = ref(false);
const selectedUsers = ref([]);
const userStore = useUserStore();
const isLoading = ref(false); // Loading state
const isRemoteUpdate = ref(false); // Flag to prevent re-emission of WebSocket updates

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

// Handle content change with WebSocket update and debounce
const debouncedSave = debounce(async (content) => {
  await noteStore.editNote(props.note.id, content);
}, 500);

const handleContentChange = () => {
  if (isRemoteUpdate.value) {
    // If the update was from WebSocket, skip emitting it again
    isRemoteUpdate.value = false;
    return;
  }

  const quillEditor = document.querySelector(`#editor-${props.note.id} .ql-editor`);
  if (quillEditor) {
    const quillEditorHtml = quillEditor.innerHTML;

    console.log('Sending HTML content:', quillEditorHtml);

    // Emit the HTML content as a string through WebSocket
    socket.emit('editNote', { noteId: props.note.id, content: quillEditorHtml });

    // Debounced save with the HTML content
    debouncedSave(quillEditorHtml);
  }
};

// Set up WebSocket listeners
onMounted(() => {
  const quillEditor = document.querySelector(`#editor-${props.note.id} .ql-editor`);

  if (quillEditor && props.note.content) {
    quillEditor.innerHTML = props.note.content; // Initialize content for the current note
  }

  // Handle incoming updates from other users via WebSocket
  socket.on(`noteUpdated:${props.note.id}`, (updatedContent) => {
    // Mark this as a remote update to avoid triggering the change event
    isRemoteUpdate.value = true;
    noteContent.value = updatedContent;
    if (quillEditor) {
      quillEditor.innerHTML = updatedContent; // Sync content if updated
    }
  });

  // Handle note deletion via WebSocket
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
const shareNote = async (id) => {
  try {
    isLoading.value = true; // Start loading animation
    await noteStore.shareNote({
      NoteId: props.note.id,
      targetId: id,
    });

    socket.emit('shareNote', { noteId: props.note.id, sharedWith: id });
    toast.success('Note shared successfully');
    
  } catch (e) {
    toast.error(e.message || 'Failed to share note');
  } finally {
    isLoading.value = false; // Stop loading animation
    isDropdownOpen.value = false; // Close dropdown after delete
    selectedUsers.value = []
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

// // Toggle user selection for sharing
// const toggleUserSelection = (userId) => {
//   if (selectedUsers.value.includes(userId)) {
//     selectedUsers.value = selectedUsers.value.filter(id => id !== userId);
//   } else {
//     selectedUsers.value.push(userId);
//   }
// };
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

.editortext{
  height: 250px !important;
}
.editortext:focus {
  outline: none;
}
.ql-toolbar.ql-snow{
  border: none !important;
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
  background-color: white;
  z-index: 8;
  border-radius: 0.375rem;
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

.avatar-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .avatar-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #6800ff;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
  }
</style>
