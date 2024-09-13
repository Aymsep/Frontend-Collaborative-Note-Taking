import { useRouter } from 'vue-router';
import useApiHandler from './useApiHandler';  // Import the generic API handler
import { register as registerApi, login as loginApi } from '../api/auth.api';  // Import the API functions

export default function useAuth() {
  const router = useRouter();
  const { loading, error, handleApiCall } = useApiHandler();  // Use the generic API handler

  const register = async (formData) => {
    try {
      const response = await handleApiCall(registerApi, formData); 
      console.log('response',response.data);
      const { access_token } = response.data;

      localStorage.setItem('token', access_token);  // Save token to local storage

      router.push('/');
    } catch (err) {
      console.error('Registration failed', err);
    }
  };

  const login = async (formData) => {
    try {
      const response = await handleApiCall(loginApi, formData);  // Pass API function and data
      const { access_token } = response.data;

      localStorage.setItem('token', access_token);  // Save token to local storage

      router.push('/');
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  return {
    register,
    login,
    loading,
    error,
  };
}
