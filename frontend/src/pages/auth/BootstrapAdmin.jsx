import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { bootstrapSuperAdmin } from "../../store/slices/storeSlice";
import toast from "react-hot-toast";
import { useLoading } from "../../components/loader/LoaderContext";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { FiShield, FiKey, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

const BootstrapAdmin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleLoading } = useLoading();

  const [bootstrapToken, setBootstrapToken] = useState(
    searchParams.get("token") || ""
  );

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setBootstrapToken(urlToken);
      // Immediately scrub the token from browser URL bar and history
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch {}
    }
  }, [searchParams]);

  const handleGoogleSuccess = async (credentialResponse) => {
    const token = bootstrapToken.trim();
    if (!token) {
      toast.error("Please enter the single-use bootstrap authorization token");
      return;
    }
    if (!credentialResponse?.credential) {
      toast.error("Google authentication failed: missing credential");
      return;
    }

    try {
      handleLoading(true);
      await dispatch(
        bootstrapSuperAdmin({
          bootstrapToken: token,
          credential: credentialResponse.credential,
        })
      ).unwrap();
      handleLoading(false);
      navigate("/");
    } catch (error) {
      handleLoading(false);
      const errMsg =
        typeof error === "string"
          ? error
          : error?.message || "Super Admin bootstrap failed";
      toast.error(errMsg);
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google sign-in was cancelled or encountered an error");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-slate-100 p-6 relative overflow-hidden selection:bg-amber-500 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-slate-800/80 border border-slate-700/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 relative z-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400">
            <FiShield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Super Admin Provisioning
            </h1>
            <p className="text-xs text-slate-400">
              One-Time Trusted Bootstrap Ceremony
            </p>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
          <FiAlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Strict Security Invariant:</strong> Sarthi enforces exactly ONE Super Admin.
            This single-use bootstrap establishes your verified Google identity as the ONLY authoritative Super Admin.
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Bootstrap Authorization Token
            </label>
            <div className="relative">
              <FiKey className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={bootstrapToken}
                onChange={(e) => setBootstrapToken(e.target.value)}
                placeholder="Paste the 64-char CLI bootstrap token"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono tracking-wider transition-colors outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Generated in terminal via <code className="text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded">npm run bootstrap:admin</code>
            </p>
          </div>
        </div>

        <div className="border-t border-slate-700/60 pt-6">
          <p className="text-xs text-slate-300 text-center font-medium mb-3">
            Authenticate With Your Authorized Google Account:
          </p>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              useOneTap={false}
              theme="filled_blue"
              shape="pill"
              text="continue_with"
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700/40 text-center">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            &larr; Return to Standard Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BootstrapAdmin;
