import api from './axiosInstance';

export const createNote = (content) => {
  return api.post('/notes', { content });
};

export const getMyNotes = () => {
  return api.get('/notes');
};

export const getSingleNote = (noteId) => {
  return api.get(`/notes/${noteId}`);
};

export const updateNote = (noteId,content) => {
  console.log('entred')
  return api.patch(`/notes/${noteId}`, {content} );
};

export const deleteNote = (noteId) => {
  return api.delete(`/notes/${noteId}`);
};

export const shareNote = (data) => {
  return api.post('/notes/share', data);
};
