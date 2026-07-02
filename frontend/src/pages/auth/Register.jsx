import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { AuthApi } from "../../services/api/Auth.api";
import { userValidationSchema } from "../../validationSchema";
import { IoEyeSharp, IoPerson, IoMail, IoPhonePortrait, IoLockClosed } from "react-icons/io5";
import { TbEyeClosed } from "react-icons/tb";
import toast from "react-hot-toast";
import { useLoading } from "../../components/loader/LoaderContext";
import { motion } from "framer-motion";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [defaultRoleId, setDefaultRoleId] = useState(null);
  const { handleLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDefaultRole = async () => {
      try {
        const res = await AuthApi.roleType();
        if (res.data?.data) {
          const employeeRole = res.data.data.find(
            (role) => role.name === "employee" || role.name === "user"
          );
          if (employeeRole) {
            setDefaultRoleId(employeeRole._id);
          }
        }
      } catch (err) {
        console.error("Error fetching default role:", err);
      }
    };
    fetchDefaultRole();
  }, []);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: userValidationSchema(false),
    onSubmit: async (values) => {
      handleLoading(true);
      try {
        const { confirmPassword, ...payload } = values;
        // Inject default user roles so that user creation succeeds on backend
        payload.userRole = defaultRoleId;
        payload.userRoles = defaultRoleId ? [defaultRoleId] : [];

        await AuthApi.register(payload);
        toast.success("Registration Successful! Please sign in.");
        navigate("/login");
      } catch (error) {
        console.error("Registration Error:", error);
        toast.error(error.response?.data?.message || "Registration Failed");
      } finally {
        handleLoading(false);
      }
    },
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen overflow-y-auto font-sans relative flex items-center justify-center p-6 selection:bg-primary/20">
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
        className="w-full max-w-[1100px] grid lg:grid-cols-2 gap-12 items-center relative z-10 py-10"
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
            <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-slate-900">
              Create your <br />
              <span className="text-primary italic">Workspace</span> Account <br />
              today.
            </h1>
            <p className="mt-6 text-base text-slate-500 max-w-sm leading-relaxed">
              Join thousands of high-performance developers and managers. Configure your profile and get started in seconds.
            </p>
          </motion.div>
        </div>

        {/* Register Card Side */}
        <motion.div variants={itemVariants} className="w-full max-w-lg mx-auto">
          <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

            <div className="mb-6 text-center lg:text-left">
              <h2 className="text-2xl font-bold mb-1 text-slate-900">Join Sarathi</h2>
              <p className="text-slate-500 text-sm">Please fill out your details to get started.</p>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">First Name</label>
                  <div className="relative">
                    <input
                      name="firstName"
                      type="text"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Jane"
                      className={`w-full bg-slate-50 border-2 ${formik.touched.firstName && formik.errors.firstName ? "border-red-500/20 focus:border-red-500/50" : "border-slate-100 focus:border-primary/30"} focus:bg-white rounded-2xl py-3 px-4 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 text-sm`}
                    />
                  </div>
                  {formik.touched.firstName && formik.errors.firstName && (
                    <span className="text-[10px] text-red-500 ml-1">{formik.errors.firstName}</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Last Name</label>
                  <input
                    name="lastName"
                    type="text"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Doe"
                    className={`w-full bg-slate-50 border-2 ${formik.touched.lastName && formik.errors.lastName ? "border-red-500/20 focus:border-red-500/50" : "border-slate-100 focus:border-primary/30"} focus:bg-white rounded-2xl py-3 px-4 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 text-sm`}
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <span className="text-[10px] text-red-500 ml-1">{formik.errors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="jane.doe@company.com"
                  className={`w-full bg-slate-50 border-2 ${formik.touched.email && formik.errors.email ? "border-red-500/20 focus:border-red-500/50" : "border-slate-100 focus:border-primary/30"} focus:bg-white rounded-2xl py-3 px-4 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 text-sm`}
                />
                {formik.touched.email && formik.errors.email && (
                  <span className="text-[10px] text-red-500 ml-1">{formik.errors.email}</span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Phone Number</label>
                <input
                  name="phoneNumber"
                  type="text"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="10-digit number"
                  className={`w-full bg-slate-50 border-2 ${formik.touched.phoneNumber && formik.errors.phoneNumber ? "border-red-500/20 focus:border-red-500/50" : "border-slate-100 focus:border-primary/30"} focus:bg-white rounded-2xl py-3 px-4 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 text-sm`}
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                  <span className="text-[10px] text-red-500 ml-1">{formik.errors.phoneNumber}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Password</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="••••••••"
                      className={`w-full bg-slate-50 border-2 ${formik.touched.password && formik.errors.password ? "border-red-500/20 focus:border-red-500/50" : "border-slate-100 focus:border-primary/30"} focus:bg-white rounded-2xl py-3 px-4 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 text-sm pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <IoEyeSharp size={16} /> : <TbEyeClosed size={16} />}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <span className="text-[10px] text-red-500 ml-1 block max-w-[200px] leading-tight">{formik.errors.password}</span>
                  )}
                </div>

                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="••••••••"
                      className={`w-full bg-slate-50 border-2 ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-500/20 focus:border-red-500/50" : "border-slate-100 focus:border-primary/30"} focus:bg-white rounded-2xl py-3 px-4 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 text-sm pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <IoEyeSharp size={16} /> : <TbEyeClosed size={16} />}
                    </button>
                  </div>
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <span className="text-[10px] text-red-500 ml-1">{formik.errors.confirmPassword}</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!formik.isValid || !formik.dirty}
                className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primaryHover text-white font-black uppercase tracking-widest shadow-md hover:shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none active:scale-[0.98] mt-4 text-xs"
              >
                Create Account
              </button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm text-slate-400">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-bold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full text-center px-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          © 2026 Sarathi Inc. &nbsp; • &nbsp; Designed for Performance
        </p>
      </div>
    </div>
  );
};

export default Register;
