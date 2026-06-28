import React from "react";
import { useFormik } from "formik";
import { AuthApi } from "../../services/api/Auth.api";
import { useLoading } from "../../components/loader/LoaderContext";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const email = localStorage.getItem("email");
  const { handleLoading } = useLoading();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email,
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async (values) => {
      if (values.newPassword !== values.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      const { confirmPassword, ...val } = values;
      handleLoading(true);
      try {
        await AuthApi.ResetPassword(val);
        toast.success("Password reset successfully");
        navigate("/login");
      } catch (err) {
        console.error(err);
        toast.error("Failed to reset password");
      }
      handleLoading(false);
      formik.resetForm();
    },
  });

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen relative flex items-center justify-center p-6 selection:bg-primary/20">
      {/* Ambient background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
      </div>

      <div className="bg-white border border-slate-100 p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 w-full max-w-md relative overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2 text-slate-900">Reset Password</h2>
          <p className="text-slate-500 text-sm">Please set a new secure password for your workspace.</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">New Password</label>
            <input
              name="newPassword"
              type="password"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter new password"
              required
              className="w-full bg-slate-50 border-2 border-slate-100 focus:border-primary/30 focus:bg-white rounded-2xl py-3.5 px-5 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Confirm new password"
              required
              className="w-full bg-slate-50 border-2 border-slate-100 focus:border-primary/30 focus:bg-white rounded-2xl py-3.5 px-5 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={!formik.values.newPassword || !formik.values.confirmPassword}
            className="w-full py-4 rounded-2xl bg-primary hover:bg-primaryHover text-white font-black uppercase tracking-widest shadow-md hover:shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none active:scale-[0.98]"
          >
            Change Password
          </button>
        </form>

        <div className="text-center pt-6 border-t border-slate-100 mt-6">
          <Link to="/login" className="text-sm text-primary font-bold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
