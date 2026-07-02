import React, { useState } from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../store/slices/storeSlice";
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

  const handleZohoLogin = async () => {
    try {
      const clientId = import.meta.env.VITE_ZOHO_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_ZOHO_REDIRECT_URI;
      const accountsUrl = import.meta.env.VITE_ZOHO_ACCOUNTS_URL || "https://accounts.zoho.com";

      if (!clientId || !redirectUri) {
        toast.error("Zoho Client ID or Redirect URI is not configured on the frontend.");
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
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen overflow-hidden font-sans relative flex items-center justify-center p-6 selection:bg-primary/20">
      {/* Ambient background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
      </div>

      {/* Main Content */}
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
                
                <div className="mb-10 text-center lg:text-left">
                    <h2 className="text-3xl font-bold mb-2 text-slate-900">Access Workspace</h2>
                    <p className="text-slate-500 text-sm">Welcome back! Please enter your details.</p>
                </div>

                <div className="space-y-6">
                    <button
                        type="button"
                        onClick={handleZohoLogin}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-slate-800 font-bold border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] shadow-sm"
                    >
                        <svg viewBox="0 0 100 100" className="w-5 h-5 flex-shrink-0">
                            <rect x="5" y="5" width="40" height="40" rx="8" fill="#E21A22" />
                            <rect x="55" y="5" width="40" height="40" rx="8" fill="#00A250" />
                            <rect x="5" y="55" width="40" height="40" rx="8" fill="#1877F2" />
                            <rect x="55" y="55" width="40" height="40" rx="8" fill="#F4B400" />
                        </svg>
                        <span>Continue with Zoho</span>
                    </button>

                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-slate-100"></div>
                        <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Or use email</span>
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
                            className="w-full py-4 rounded-2xl bg-primary hover:bg-primaryHover text-white font-black uppercase tracking-widest shadow-md hover:shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none active:scale-[0.98] mt-4"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-sm text-slate-400">
                            Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Join Sarathi</Link>
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
    </div>
  );
};

export default Login;
