import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { zohoLogin } from "../../store/slices/storeSlice";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const ZohoCallback = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const accountsServer = searchParams.get("accounts-server");

    // CSRF Protection Check
    const storedState = sessionStorage.getItem("zoho_oauth_state");
    sessionStorage.removeItem("zoho_oauth_state"); // Immediately consume state

    if (!state || state !== storedState) {
      console.error("CSRF State Mismatch. Stored:", storedState, "Received:", state);
      toast.error("Security Check Failed: State verification mismatch.");
      navigate("/login");
      return;
    }

    if (!code || !accountsServer) {
      toast.error("Authorization code or accounts server is missing from Zoho response.");
      navigate("/login");
      return;
    }

    const performLogin = async () => {
      try {
        await dispatch(zohoLogin({ code, accountsServer })).unwrap();
        navigate("/");
      } catch (error) {
        console.error("Zoho authentication error:", error);
        // Error toast is already triggered inside the Redux extraReducers
        navigate("/login");
      }
    };

    performLogin();
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen font-sans relative flex items-center justify-center p-6 select-none overflow-hidden">
      {/* Ambient background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
      </div>

      <div className="text-center relative z-10 space-y-6 max-w-sm">
        {/* Animated Zoho Logo Blocks */}
        <div className="flex justify-center items-center gap-3">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1], 
              rotate: [0, 10, -10, 0] 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2.5, 
              ease: "easeInOut" 
            }}
            className="w-16 h-16 grid grid-cols-2 gap-1.5 p-2 bg-white rounded-2xl shadow-lg border border-slate-100"
          >
            <div className="bg-[#E21A22] rounded-md" />
            <div className="bg-[#00A250] rounded-md" />
            <div className="bg-[#1877F2] rounded-md" />
            <div className="bg-[#F4B400] rounded-md" />
          </motion.div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Authenticating
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Please wait while we establish a secure connection with Zoho...
          </p>
        </div>

        {/* Loading dots animation */}
        <div className="flex justify-center items-center gap-1.5 pt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -6, 0] }}
              transition={{
                repeat: Infinity,
                duration: 0.6,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-primary rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ZohoCallback;
