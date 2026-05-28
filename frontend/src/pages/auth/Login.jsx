import React, { useState } from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { login, googleLogin } from "../../store/slices/storeSlice";
import { IoEyeSharp, IoLogoGoogle, IoPerson } from "react-icons/io5";
import { TbEyeClosed } from "react-icons/tb";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useLoading } from "../../components/loader/LoaderContext";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";

googleProvider.addScope('email');
googleProvider.addScope('profile');

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

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await dispatch(googleLogin(user)).unwrap();
      navigate("/");
    } catch (error) {
        console.error("Google Login Error:", error);
        toast.error("Google Login Failed");
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
    <div className="bg-[#03030b] text-white min-h-screen overflow-hidden font-sans relative flex items-center justify-center p-6 selection:bg-primary/30">
      {/* Immersive Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
            animate={{ 
                x: [0, 100, 0], 
                y: [0, -50, 0],
                scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" 
        />
        <motion.div 
            animate={{ 
                x: [0, -80, 0], 
                y: [0, 100, 0],
                scale: [1, 1.1, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent/20 rounded-full blur-[140px]" 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03]"></div>
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
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg transform -rotate-6 overflow-hidden p-1.5">
                    <img src="/momentum_logo.svg" alt="Momentum Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-2xl font-black tracking-[0.2em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Momentum
                </span>
            </motion.div>

            <motion.div variants={itemVariants}>
                <h1 className="text-6xl font-black leading-[1.1] tracking-tight">
                    Design your <br />
                    <span className="text-primary italic">Productivity</span> <br />
                    Engine.
                </h1>
                <p className="mt-6 text-lg text-gray-400 max-w-md leading-relaxed">
                    The ultra-fast, minimalist workspace for high-performance teams. 
                    Manage everything from simple tasks to complex roadmaps.
                </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#03030b] bg-gray-800 flex items-center justify-center overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                        </div>
                    ))}
                </div>
                <p className="text-sm text-gray-400 font-medium tracking-wide">
                    Joined by <span className="text-white font-bold">2,000+</span> teams worldwide
                </p>
            </motion.div>
        </div>

        {/* Login Card Side */}
        <motion.div 
            variants={itemVariants}
            className="w-full max-w-md mx-auto"
        >
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                
                <div className="mb-10 text-center lg:text-left">
                    <h2 className="text-3xl font-bold mb-2">Access Workspace</h2>
                    <p className="text-gray-400 text-sm">Welcome back! Please enter your details.</p>
                </div>

                <div className="space-y-6">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all active:scale-[0.98] shadow-xl"
                    >
                        <IoLogoGoogle className="text-xl" />
                        <span>Continue with Google</span>
                    </button>

                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-white/5"></div>
                        <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Or use email</span>
                        <div className="flex-grow border-t border-white/5"></div>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 ml-1">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="name@company.com"
                                className={`w-full bg-white/[0.05] border-2 ${formik.touched.email && formik.errors.email ? 'border-red-500/50' : 'border-white/5'} focus:border-primary/50 focus:bg-white/[0.1] rounded-2xl py-3.5 px-5 outline-none transition-all placeholder:text-gray-600 font-medium`}
                            />
                        </div>

                        <div className="space-y-2 relative">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">Password</label>
                                <Link to="/forget" className="text-[10px] font-black uppercase text-primary hover:text-accent transition-colors">Forgot?</Link>
                            </div>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="••••••••"
                                    className={`w-full bg-white/[0.05] border-2 ${formik.touched.password && formik.errors.password ? 'border-red-500/50' : 'border-white/5'} focus:border-primary/50 focus:bg-white/[0.1] rounded-2xl py-3.5 px-5 outline-none transition-all placeholder:text-gray-600 font-medium`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <IoEyeSharp size={18} /> : <TbEyeClosed size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!formik.isValid || !formik.dirty}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-black uppercase tracking-widest shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:translate-y-0 active:scale-[0.98] mt-4"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-sm text-gray-500">
                            Don't have an account? <Link to="/register" className="text-white font-bold hover:underline">Join Momentum</Link>
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
      </motion.div>

      {/* Footer / Copyright */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full text-center px-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
            © 2026 Momentum Inc. &nbsp; • &nbsp; Designed for Performance
        </p>
      </div>
    </div>
  );
};

export default Login;
