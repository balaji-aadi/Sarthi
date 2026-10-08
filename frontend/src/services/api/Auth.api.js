import Api from "../axiosConfig";

export const AuthApi = {
  googleLogin: (payload) => Api.post("user/google-login", payload),
  bootstrapSuperAdmin: (payload) => Api.post("user/bootstrap-super-admin", payload),
  recoveryChallenge: (payload) => Api.post("user/super-admin/recovery-challenge", payload),
  recoverSuperAdmin: (payload) => Api.post("user/super-admin/recover", payload),
  refreshToken: () => Api.post("user/refresh-token"),
  getCurrentUser: () => Api.get("user/current-user"),
  logout: () => Api.post("user/logout"),
};
