import { ref } from 'vue';

export default function useApiHandler() {
  const loading = ref(false);
  const error = ref(null);

  const handleApiCall = async (apiFunction, data = null) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiFunction(data); 
      return response;  
    } catch (err) {
      error.value = err.response?.data?.message || 'An error occurred';
      throw err;  
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    handleApiCall,
  };
}
