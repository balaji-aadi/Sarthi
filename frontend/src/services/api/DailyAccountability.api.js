import Api from "../axiosConfig";

export const DailyAccountabilityApi = {
  getBoard: () => Api.get("daily-accountability"),
  saveBoard: (data) => Api.post("daily-accountability", data),
};
