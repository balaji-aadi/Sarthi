import Api from "../axiosConfig";

export const QuestionFactoryApi = {
  generateDraft: (payload) => Api.post("/question-factory/generate", payload),
  getDrafts: (params) => Api.get("/question-factory/drafts", { params }),
  getDraftById: (id) => Api.get(`/question-factory/drafts/${id}`),
  validateDraft: (id) => Api.post(`/question-factory/drafts/${id}/validate`),
  approveDraft: (id, payload = {}) => Api.post(`/question-factory/drafts/${id}/approve`, payload),
  rejectDraft: (id, payload = {}) => Api.post(`/question-factory/drafts/${id}/reject`, payload)
};
