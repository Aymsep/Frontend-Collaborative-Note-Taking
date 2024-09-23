// composables/useWebSocket.js
import { ref, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '../Store/user.Store';

export const useWebSocket = (noteId) => {
  const userStore = useUserStore();
  const socket = userStore.socket;
  const noteContent = ref('');

  const setupListeners = () => {
    socket.on(`noteUpdated:${noteId}`, (updatedContent) => {
      noteContent.value = updatedContent;
    });

    socket.on(`noteDeleted:${noteId}`, () => {
      // Handle note deletion
    });

    socket.on(`noteShared:${userStore.getUserId}`, (data) => {
      // Handle note shared
    });
  };

  const cleanupListeners = () => {
    socket.off(`noteUpdated:${noteId}`);
    socket.off(`noteDeleted:${noteId}`);
    socket.off(`noteShared:${userStore.getUserId}`);
  };

  onMounted(() => {
    setupListeners();
  });

  onUnmounted(() => {
    cleanupListeners();
  });

  return {
    noteContent,
    socket,
  };
};
