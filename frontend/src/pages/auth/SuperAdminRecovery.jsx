import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { recoverSuperAdmin } from "../../store/slices/storeSlice";
import toast from "react-hot-toast";
import { useLoading } from "../../components/loader/LoaderContext";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { FiShield, FiAlertOctagon, FiLock } from "react-icons/fi";

const SuperAdminRecovery = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { handleLoading } = useLoading();

  const [recoverySecret, setRecoverySecret] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    const secret = recoverySecret.trim();
    if (!secret) {
      toast.error("Please enter the configured Super Admin recovery secret");
      return;
    }
    if (!credentialResponse?.credential) {
      toast.error("Google authentication failed: missing credential");
      return;
    }

    try {
      handleLoading(true);
      await dispatch(
        recoverSuperAdmin({
          recoverySecret: secret,
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
          : error?.message || "Super Admin recovery failed";
      toast.error(errMsg);
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google sign-in was cancelled or encountered an error");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 p-6 relative overflow-hidden selection:bg-rose-500 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-slate-900/90 border border-rose-500/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 relative z-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-center text-rose-400">
            <FiShield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Super Admin Recovery
            </h1>
            <p className="text-xs text-slate-400">
              Emergency Identity Replacement Protocol
            </p>
          </div>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-6 text-xs text-rose-200/90 leading-relaxed flex items-start gap-3">
          <FiAlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong>Identity Replacement:</strong> If the original Super Admin Google account
            is lost, this authorized recovery replaces the trusted identity with your new Google account.
            All sessions for the prior Super Admin will be revoked immediately.
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Super Admin Recovery Secret
            </label>
            <div className="relative">
              <FiLock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={recoverySecret}
                onChange={(e) => setRecoverySecret(e.target.value)}
                placeholder="Enter server-configured recovery secret"
                className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono transition-colors outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Configured on the server host via <code className="text-rose-400 bg-slate-950 px-1.5 py-0.5 rounded">SUPER_ADMIN_RECOVERY_SECRET</code>
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-300 text-center font-medium mb-3">
            Authenticate With Your Replacement Google Account:
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

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
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

export default SuperAdminRecovery;
