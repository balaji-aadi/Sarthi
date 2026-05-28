import Api from "../axiosConfig";

export const BranchApi = {
    getAllBranches: async () => {
        return await Api.get("/branch");
    },
    createBranch: async (data) => {
        return await Api.post("/branch", data);
    },
    getGlobalSettings: async () => {
        return await Api.get("/branch/settings");
    },
    updateGlobalSettings: async (data) => {
        return await Api.patch("/branch/settings", data);
    },
    getBranchStats: async (branchId) => {
        return await Api.get(`/branch/stats/${branchId}`);
    },
    updateBranch: async (branchId, data) => {
        return await Api.patch(`/branch/update/${branchId}`, data);
    },
    deleteBranch: async (branchId, confirmationName) => {
        return await Api.post(`/branch/delete/${branchId}`, { confirmationName });
    }
};
