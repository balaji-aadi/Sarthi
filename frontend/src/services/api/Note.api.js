import Api from "../axiosConfig";

export const NoteApi = {
  getNotes: () => Api.get("note"),
  createNote: (data) => Api.post("note", data),
  updateNote: (id, data) => Api.put(`note/${id}`, data),
  deleteNote: (id) => Api.delete(`note/${id}`),
  aiEnhance: (data) => Api.post("note/ai-enhance", data),
  aiSuggest: (data) => Api.post("note/ai-suggest", data),
};
