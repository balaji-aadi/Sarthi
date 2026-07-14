import Api from "../axiosConfig";

export const TaskApi = {
  createTask: (payload) => Api.post("task/create-task", payload),
  updateTask: (id, payload) => Api.put(`task/update-task/${id}`, payload),
  taskLogs: (id, payload) => Api.patch(`/task/update-task-log/${id}`, payload),
  getAllTasks: (filter, search) => Api.post(`task/get-all-tasks${search ? `?search=${search}` : ""}`, filter),
  getDependencies: () => Api.post("task/get-alltask-free"),
   getTaskById: (id) => Api.get(`task/get-tasks/${id}`),
   task: (id) => Api.get(`task/get-tasks/${id}`),
   taskImport: (payload) => Api.post(`task/task-import`, payload),
   getLastCreatedTask: () => Api.get("task/get-last-created"),
   addRevision: (id, payload) => Api.post(`task/add-revision/${id}`, payload),
   getRevisionStats: (timezoneOffset) => Api.get(`task/revision-stats?timezoneOffset=${timezoneOffset}`),
   getCompletedParents: () => Api.get("task/completed-parents"),
   suggestRevisionChallenge: (payload) => Api.post("task/suggest-challenge", payload),
   getDailyRevision: (timezoneOffset) => Api.get(`task/daily-revision?timezoneOffset=${timezoneOffset}`),
   startDailyRevision: (timezoneOffset) => Api.post(`task/daily-revision/start`, { timezoneOffset }),
   toggleDailyRevisionTimer: (timezoneOffset) => Api.post(`task/daily-revision/toggle-timer`, { timezoneOffset }),
   syncDailyRevisionTimer: (payload) => Api.post(`task/daily-revision/sync-timer`, payload),
   toggleReviseTomorrow: (payload) => Api.post(`task/daily-revision/toggle-revise-tomorrow`, payload),
};
