import Api from "../axiosConfig";

export const FocusApi = {
  createSession: (data) => Api.post("focus/session", data),
  deleteSession: (id) => Api.delete(`focus/session/${id}`),
  getSessions: (params) => Api.get("focus/sessions", { params }),
  getTodayStats: () => Api.get("focus/today-stats"),
};
