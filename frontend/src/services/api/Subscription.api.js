import Api from "../axiosConfig";

export const SubscriptionApi = {
    createOrder: async (data) => {
        return await Api.post("/subscription/create-order", data);
    },
    verifyPayment: async (data) => {
        return await Api.post("/subscription/verify-payment", data);
    },
    syncTime: async (remainingTime) => {
        return await Api.post("/subscription/sync-time", { remainingTime });
    }
};
