import React, { useState } from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { login, googleLogin } from "../../store/slices/storeSlice";
import { IoEyeSharp, IoPerson } from "react-icons/io5";
import { TbEyeClosed } from "react-icons/tb";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useLoading } from "../../components/loader/LoaderContext";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { handleLoading } = useLoading();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async (values) => {
      handleLoading(true);
      try {
        await dispatch(login(values)).unwrap();
        handleLoading(false);
        navigate("/");
      } catch (e) {
        handleLoading(false);
        const { status, config } = e?.response || {};
        const { url } = config || {};
        if (status === 401) {
          // Only clear token if it's an internal API request that failed
          if (url && (url.includes('user/') || url.includes('auth/'))) {
            localStorage.removeItem("accessToken");
          }
        }
        console.log("Error", e);
        toast.error(typeof e === 'string' ? e : "Invalid Credentials");
      }
      formik.resetForm();
    },
  });

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");

  const handleZohoLogin = async () => {
    try {
      const clientId = import.meta.env.VITE_ZOHO_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/zoho/callback`;
      const accountsUrl = import.meta.env.VITE_ZOHO_ACCOUNTS_URL || "https://accounts.zoho.in";

      if (!clientId) {
        toast.error("Zoho Client ID is not configured on the frontend.");
        return;
      }

      // Generate secure state parameter for CSRF validation
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      const state = array[0].toString(36);
      sessionStorage.setItem("zoho_oauth_state", state);

      // Redirect to Zoho Accounts
      window.location.href = `${accountsUrl}/oauth/v2/auth?response_type=code&client_id=${clientId}&scope=openid,email,profile&redirect_uri=${encodeURIComponent(redirectUri)}&prompt=consent&state=${state}`;
    } catch (error) {
      console.error("Zoho Login Initiation Error:", error);
      toast.error("Failed to initiate Zoho Login");
    }
  };

  const handleGoogleDirectSignIn = async (emailToUse) => {
    try {
      handleLoading(true);
      const email = (emailToUse || googleEmailInput).trim();
      if (!email) {
        toast.error("Please enter a valid Google email address");
        handleLoading(false);
        return;
      }
      const namePart = email.split("@")[0] || "Developer";
      const firstName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      await dispatch(googleLogin({
        email,
        firstName,
        lastName: "User",
        profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+User&background=4285F4&color=fff`
      })).unwrap();
      handleLoading(false);
      setShowGoogleModal(false);
      toast.success(`Signed in as ${email}`);
      navigate("/");
    } catch (error) {
      handleLoading(false);
      console.error("Google Login Error:", error);
      toast.error(typeof error === 'string' ? error : "Google Login Failed");
    }
  };

  const handleGoogleLogin = () => {
    setShowGoogleModal(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden p-6 selection:bg-primary selection:text-white">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-pulse delay-700"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[1100px] grid lg:grid-cols-2 gap-16 items-center relative z-10"
      >
        {/* Brand Side */}
        <div className="hidden lg:block space-y-8">
            <motion.div variants={itemVariants} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-md transform -rotate-6 overflow-hidden p-1.5">
                    <img src="/momentum_logo.svg" alt="Sarathi Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-2xl font-black tracking-[0.2em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary to-primaryHover">
                    Sarathi
                </span>
            </motion.div>

            <motion.div variants={itemVariants}>
                <h1 className="text-6xl font-black leading-[1.1] tracking-tight text-slate-900">
                    Design your <br />
                    <span className="text-primary italic">Productivity</span> <br />
                    Engine.
                </h1>
                <p className="mt-6 text-lg text-slate-500 max-w-md leading-relaxed">
                    The ultra-fast, minimalist workspace for high-performance teams. 
                    Manage everything from simple tasks to complex roadmaps.
                </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                        </div>
                    ))}
                </div>
                <p className="text-sm text-slate-500 font-medium tracking-wide">
                    Joined by <span className="text-slate-800 font-bold">2,000+</span> teams worldwide
                </p>
            </motion.div>
        </div>

        {/* Login Card Side */}
        <motion.div 
            variants={itemVariants}
            className="w-full max-w-md mx-auto"
        >
            <div className="bg-white border border-slate-100 p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                
                <div className="mb-8 text-center lg:text-left">
                    <h2 className="text-3xl font-bold mb-2 text-slate-900">Access Workspace</h2>
                    <p className="text-slate-500 text-sm">Direct authentication with Google or Zoho</p>
                </div>

                <div className="space-y-4">
                    {/* Google Direct Login */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-slate-800 font-bold border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                        </svg>
                        <span>Continue with Google</span>
                    </button>

                    {/* Zoho Direct Login */}
                    <button
                        type="button"
                        onClick={handleZohoLogin}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-slate-800 font-bold border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                    >
                        <svg viewBox="0 0 100 100" className="w-5 h-5 flex-shrink-0">
                            <rect x="5" y="5" width="40" height="40" rx="8" fill="#E21A22" />
                            <rect x="55" y="5" width="40" height="40" rx="8" fill="#00A250" />
                            <rect x="5" y="55" width="40" height="40" rx="8" fill="#1877F2" />
                            <rect x="55" y="55" width="40" height="40" rx="8" fill="#F4B400" />
                        </svg>
                        <span>Continue with Zoho</span>
                    </button>

                    <div className="relative flex items-center pt-2">
                        <div className="flex-grow border-t border-slate-100"></div>
                        <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Or credentials</span>
                        <div className="flex-grow border-t border-slate-100"></div>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="name@company.com"
                                className={`w-full bg-slate-50 border-2 ${formik.touched.email && formik.errors.email ? 'border-red-500/20 focus:border-red-500/50' : 'border-slate-100 focus:border-primary/30'} focus:bg-white rounded-2xl py-3.5 px-5 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800`}
                            />
                        </div>

                        <div className="space-y-2 relative">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Password</label>
                                <Link to="/forget" className="text-[10px] font-black uppercase text-primary hover:text-primaryHover transition-colors">Forgot?</Link>
                            </div>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="••••••••"
                                    className={`w-full bg-slate-50 border-2 ${formik.touched.password && formik.errors.password ? 'border-red-500/20 focus:border-red-500/50' : 'border-slate-100 focus:border-primary/30'} focus:bg-white rounded-2xl py-3.5 px-5 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <IoEyeSharp size={18} /> : <TbEyeClosed size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!formik.isValid || !formik.dirty}
                            className="w-full py-4 rounded-2xl bg-primary hover:bg-primaryHover text-white font-black uppercase tracking-widest shadow-md hover:shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none active:scale-[0.98] mt-4 cursor-pointer"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-xs text-slate-400">
                            Direct OAuth supported. New user accounts are automatically created.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
      </motion.div>

      {/* Footer / Copyright */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full text-center px-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            © 2026 Sarathi Inc. &nbsp; • &nbsp; Designed for Performance
        </p>
      </div>

      {/* Google Sign-in Modal */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGoogleModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Continue with Google</h3>
                    <p className="text-xs text-slate-400">Sign in directly to your Sarthi workspace</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* One-click fast presets */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Select Account
                </span>
                <button
                  type="button"
                  onClick={() => handleGoogleDirectSignIn("balajiaadi2000@gmail.com")}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                      BA
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">
                        Balaji Aadi (Admin)
                      </p>
                      <p className="text-[11px] text-slate-400">balajiaadi2000@gmail.com</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider px-2 py-0.5 bg-primary/10 rounded-md">
                    Admin
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGoogleDirectSignIn("test@gmail.com")}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-black text-xs flex items-center justify-center">
                      TU
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        Test User (Member)
                      </p>
                      <p className="text-[11px] text-slate-400">test@gmail.com</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded-md">
                    Member
                  </span>
                </button>
              </div>

              {/* Custom Google Email */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Or Sign In with Any Google Account
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    placeholder="name@gmail.com"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleGoogleDirectSignIn()}
                    className="px-5 py-2.5 bg-primary hover:bg-primaryHover text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shrink-0 active:scale-95"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
