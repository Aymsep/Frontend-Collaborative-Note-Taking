import { useRouter } from 'vue-router';
import useApiHandler from './useApiHandler';  // Import the generic API handler
import { register as registerApi, login as loginApi } from '../api/auth.api';  // Import the API functions
import { saveToken } from '../Utils/token.Utils';  // Token utility for saving token

export default function useAuth() {
  const router = useRouter();
  const { loading, error, handleApiCall } = useApiHandler();  // Use the generic API handler

  // Common logic for handling login and registration
  const handleAuthSuccess = (response) => {
    const { access_token } = response.data;
    saveToken(access_token);  // Save token to local storage
    router.push('/');  // Redirect to home after successful authentication
  };

  const authAction = async (apiFunction, formData) => {
    try {
      const response = await handleApiCall(apiFunction, formData);  // Handle API call
      handleAuthSuccess(response);  // Handle success
    } catch (err) {
      console.error(`${apiFunction.name} failed`, err);  // General error handling
    }
  };

  const register = async (formData) => {
    await authAction(registerApi, formData);  // Call register API
  };

  const login = async (formData) => {
    await authAction(loginApi, formData);  // Call login API
  };

  return {
    register,
    login,
    loading,
    error,
  };
}
