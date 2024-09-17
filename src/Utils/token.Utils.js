// src/utils/token.util.js
export function saveToken(token) {
    localStorage.setItem('token', token);
  }
  
  export function getToken() {
    return localStorage.getItem('token');
  }
  
  export function removeToken() {
    localStorage.removeItem('token');
  }
  