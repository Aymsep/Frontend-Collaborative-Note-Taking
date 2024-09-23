<template>
  <nav
    style="background-color: #6800ff;"
    class="flex-no-wrap relative flex w-full items-center justify-between py-2 shadow-dark-mild dark:bg-surface-dark lg:flex-wrap lg:justify-start lg:py-4">
    <div class="flex w-full flex-wrap items-center justify-between px-3">
      <h2 class="text-white text-lg sm:text-xl md:text-2xl lg:text-4xl xl:text-4xl font-bold px-4">
          Welcome Back, {{ username }}
      </h2>


      <div class="relative flex items-center">
        <!-- Notification Icon with Counter -->
        <a
          class="me-4 flex items-center text-secondary-500 transition duration-200 hover:text-secondary-600/70 hover:ease-in-out focus:text-secondary-600/70 active:text-secondary-600/70"
          href="#"
          role="button"
          @click="toggleModal"
        >
          <!-- Notification Icon -->
          <span class="[&>svg]:w-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z"
                clip-rule="evenodd"
              />
            </svg>
          </span>

          <!-- Notification counter -->
          <span
            v-if="notificationCount > 0"
            class="absolute -mt-4 ms-2.5 rounded-full bg-danger px-[0.35em] pb-[1.15em] text-[1.2rem] font-bold leading-none text-white"
          >
            {{ notificationCount }}
          </span>
        </a>

        <!-- Modal for showing notifications -->
        <div v-if="showModal" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-md w-96">
            <h2 class="text-lg font-bold mb-4">Notifications</h2>
            <ul>
              <li v-for="(message, index) in notifications" :key="index" class="mb-2">
                {{ message }}
              </li>
            </ul>
            <div class="flex justify-end mt-4">
              <button @click="closeModal" class="px-4 py-2 bg-blue-600 text-white rounded-md">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Avatar -->
      <div class="relative">
        <a
          class="flex items-center whitespace-nowrap"
          href="#"
          role="button"
        >
          <Avatar :name="username" />
        </a>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../../Store/user.Store';
import Avatar from './Avatar.vue';

const { user, socket } = useUserStore();
const username = ref(user.username);

const notificationCount = ref(0);  // Notification count starts with 1
const notifications = ref([]);
const showModal = ref(false);

// Toggle modal visibility
const toggleModal = () => {
  showModal.value = !showModal.value;
  if (showModal.value) {
    notificationCount.value = 0; // Reset notification count when opening the modal
  }
};

// Close modal
const closeModal = () => {
  showModal.value = false;
};

// Listen for notifications via WebSocket
onMounted(() => {
  // Listen for incoming notifications
  socket.on(`noteNotification:${user.id}`, (data) => {
    notifications.value.push(data.message);
    notificationCount.value += 1;
  });

  // Clean up WebSocket listener on component unmount
  return () => {
    socket.off(`noteNotification:${user.id}`);
  };
});
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
