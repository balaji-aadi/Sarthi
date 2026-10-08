import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AuthApi } from "../../services/api/Auth.api";
import toast from "react-hot-toast";
import { clearUserStorageOnLogout } from "../../utils/userStorage";

export const login = createAsyncThunk(
  "login",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await AuthApi.login(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data.message || "Registration failed"
      );
    }
  }
);

export const logout = createAsyncThunk("logout", async () => {
  try {
    const response = await AuthApi.logout();
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message || "Logout failed");
  }
});

export const zohoLogin = createAsyncThunk(
  "auth/zohoLogin",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await AuthApi.zohoLogin(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Zoho Login failed"
      );
    }
  }
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await AuthApi.googleLogin(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Google Login failed"
      );
    }
  }
);

export const bootstrapSuperAdmin = createAsyncThunk(
  "auth/bootstrapSuperAdmin",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await AuthApi.bootstrapSuperAdmin(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Super Admin bootstrap failed"
      );
    }
  }
);

export const recoverSuperAdmin = createAsyncThunk(
  "auth/recoverSuperAdmin",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await AuthApi.recoverSuperAdmin(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Super Admin recovery failed"
      );
    }
  }
);

const storeSlice = createSlice({
  name: "store",
  initialState: {
    token: !!localStorage.getItem("currentUser"),
    currentUser: (() => {
      try {
        return JSON.parse(localStorage.getItem("currentUser")) || null;
      } catch (e) {
        return null;
      }
    })(),
    loading: false,
    error: false,
    success: false,
    isAuthenticated: !!localStorage.getItem("currentUser"),
    showConsistencyModal: false,
    activeBranch: (() => {
      try {
        return JSON.parse(localStorage.getItem("activeBranch")) || null;
      } catch (e) {
        return null;
      }
    })(),
    globalSettings: {
        subscriptionType: "free"
    },
    dailyRevision: null,
    isSidebarCollapsed: localStorage.getItem("isSidebarCollapsed") === "true"
  },
  reducers: {
    toggleSidebarCollapsed: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
      localStorage.setItem("isSidebarCollapsed", state.isSidebarCollapsed);
    },
    setDailyRevision: (state, action) => {
      state.dailyRevision = action.payload;
    },
    setGlobalSettings: (state, action) => {
      state.globalSettings = action.payload;
    },
    setShowConsistencyModal: (state, action) => {
      state.showConsistencyModal = action.payload;
    },
    setGlobalSearch: (state, action) => {
      state.globalSearch = action.payload;
    },
    setActiveBranch: (state, action) => {
      state.activeBranch = action.payload;
      localStorage.setItem("activeBranch", JSON.stringify(action.payload));
    },
    setBranches: (state, action) => {
      state.branches = action.payload;
    },
    updateCurrentUser: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
      try {
        localStorage.setItem("currentUser", JSON.stringify(state.currentUser));
      } catch (e) {
        console.error("Failed to save currentUser to localStorage", e);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.success = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.error = false;
        state.success = true;
        state.token = true;
        state.isAuthenticated = true;
        state.currentUser = action.payload.data.user || null;
        localStorage.setItem("currentUser", JSON.stringify(action.payload.data.user));
        toast.success(`Welcome Back, ${action.payload.data?.user?.firstName || 'User'}`);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.success = false;
      })
      .addCase(zohoLogin.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.success = false;
      })
      .addCase(zohoLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.error = false;
        state.success = true;
        state.token = true;
        state.isAuthenticated = true;
        state.currentUser = action.payload.data.user || null;
        localStorage.setItem("currentUser", JSON.stringify(action.payload.data.user));
        toast.success(`Welcome ${action.payload.data?.user?.firstName || 'User'}`);
      })
      .addCase(zohoLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.success = false;
        toast.error(action.payload || "Zoho Login Failed");
      })

      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.success = false;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.error = false;
        state.success = true;
        state.token = true;
        state.isAuthenticated = true;
        state.currentUser = action.payload.data.user || null;
        localStorage.setItem("currentUser", JSON.stringify(action.payload.data.user));
        toast.success(`Welcome ${action.payload.data?.user?.firstName || 'User'}`);
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.success = false;
        toast.error(action.payload || "Google Login Failed");
      })

      .addCase(bootstrapSuperAdmin.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.success = false;
      })
      .addCase(bootstrapSuperAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.error = false;
        state.success = true;
        state.token = true;
        state.isAuthenticated = true;
        state.currentUser = action.payload.data.user || null;
        localStorage.setItem("currentUser", JSON.stringify(action.payload.data.user));
        toast.success(`Super Admin Provisioned: Welcome ${action.payload.data?.user?.firstName || 'Admin'}`);
      })
      .addCase(bootstrapSuperAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.success = false;
        toast.error(action.payload || "Super Admin bootstrap failed");
      })

      .addCase(recoverSuperAdmin.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.success = false;
      })
      .addCase(recoverSuperAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.error = false;
        state.success = true;
        state.token = true;
        state.isAuthenticated = true;
        state.currentUser = action.payload.data.user || null;
        localStorage.setItem("currentUser", JSON.stringify(action.payload.data.user));
        toast.success(`Super Admin Recovered: Welcome ${action.payload.data?.user?.firstName || 'Admin'}`);
      })
      .addCase(recoverSuperAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.success = false;
        toast.error(action.payload || "Super Admin recovery failed");
      })

      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = false;
        state.success = false;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.loading = false;
        state.error = false;
        state.success = true;
        state.currentUser = null;
        state.token = false;
        state.isAuthenticated = false;
        state.activeBranch = null;

        // Securely scrub all user-specific and sensitive items from browser storage
        clearUserStorageOnLogout();

        toast.success("Logout successfully");
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        state.error = true;
        state.success = false;
      });
  },
});

export const { toggleSidebarCollapsed, setDailyRevision, setGlobalSettings, setShowConsistencyModal, setGlobalSearch, setActiveBranch, setBranches, updateCurrentUser } = storeSlice.actions;
export default storeSlice.reducer;
