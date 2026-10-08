import React from "react";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../../store/slices/storeSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useLoading } from "../../components/loader/LoaderContext";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { handleLoading } = useLoading();

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error("Google authentication failed: missing credential");
      return;
    }

    try {
      handleLoading(true);
      await dispatch(
        googleLogin({ credential: credentialResponse.credential })
      ).unwrap();
      handleLoading(false);
      navigate("/");
    } catch (error) {
      handleLoading(false);
      const errMsg =
        typeof error === "string"
          ? error
          : error?.message || "Google Authentication Failed";
      toast.error(errMsg);
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google sign-in was cancelled or encountered an error");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden p-6 selection:bg-primary selection:text-white">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-pulse delay-700"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[1050px] grid lg:grid-cols-2 gap-16 items-center relative z-10"
      >
        {/* Brand Side */}
        <div className="hidden lg:block space-y-8">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-md transform -rotate-6 overflow-hidden p-1.5">
              <img
                src="/momentum_logo.svg"
                alt="Sarathi Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-black tracking-[0.2em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary to-primaryHover">
              Sarthi
            </span>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h1 className="text-6xl font-black leading-[1.1] tracking-tight text-slate-900">
              Master DSA <br />
              <span className="text-primary italic">Engineered</span> <br />
              for Excellence.
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-md leading-relaxed">
              Your focused, production-grade learning platform. Real-time judge, spaced revision schedules, and isolated personal progress.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden"
                >
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user avatar" />
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 font-medium tracking-wide">
              Trusted by engineering learners worldwide
            </p>
          </motion.div>
        </div>

        {/* Login Card Side */}
        <motion.div variants={itemVariants} className="w-full max-w-md mx-auto">
          <div className="bg-white border border-slate-200/80 p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

            <div className="mb-8 text-center">
              <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm p-1">
                  <img src="/momentum_logo.svg" alt="Sarathi Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-xl font-black tracking-wider uppercase text-slate-900">Sarthi</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome</h2>
              <p className="text-slate-500 text-sm">Sign in with your Google account to access your workspace</p>
            </div>

            <div className="space-y-6">
              {/* Google Identity Services Login */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50/80 border border-slate-200 rounded-2xl min-h-[70px]">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  useOneTap={false}
                  theme="outline"
                  shape="pill"
                  size="large"
                  text="continue_with"
                  width="100%"
                />
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Authentication is secured authoritatively via Google identity verification. One active session per user.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer / Copyright */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full text-center px-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          © 2026 Sarthi &nbsp; • &nbsp; Production Authentication V1
        </p>
      </div>
    </div>
  );
};

export default Login;
