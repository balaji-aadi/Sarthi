import React, { useState } from "react";
import { AuthApi } from "../../services/api/Auth.api";
import toast from "react-hot-toast";
import { useLoading } from "../../components/loader/LoaderContext";
import { useNavigate, Link } from "react-router-dom";

const Verification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const { handleLoading } = useLoading();
  const navigate = useNavigate();

  const email = localStorage.getItem("email");

  const payload = {
    email,
    otp: otp.join(""),
  };

  const handleOtp = async () => {
    handleLoading(true);
    try {
      await AuthApi.otpVerification(payload);
      navigate("/reset");
    } catch (err) {
      console.error(err);
      toast.error("OTP verification failed");
    }
    handleLoading(false);
  };

  const handleResend = async () => {
    try {
      await AuthApi.generateOTP({ email });
      toast.success("OTP sent successfully");
    } catch (err) {
      console.error(err);
      toast.error("Resend failed");
    }
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    const newOtp = [...otp];
    if (/[^0-9]/.test(value)) return;
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
    if (!value && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

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
          <h2 className="text-3xl font-bold mb-2 text-slate-900">Enter OTP</h2>
          <p className="text-slate-500 text-sm">
            Enter the 6-digit verification code sent to:<br/>
            <span className="font-bold text-primary">{email}</span>
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between gap-2.5">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                maxLength={1}
                className="w-12 h-14 text-2xl text-center border-2 border-slate-100 bg-slate-50 rounded-xl focus:border-primary/35 focus:bg-white outline-none transition-all font-bold text-slate-800"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleOtp}
            disabled={otp.some(d => !d)}
            className="w-full py-4 rounded-2xl bg-primary hover:bg-primaryHover text-white font-black uppercase tracking-widest shadow-md hover:shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none active:scale-[0.98]"
          >
            Verify & Proceed
          </button>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-6 text-sm">
            <button
              onClick={handleResend}
              className="text-primary font-bold hover:underline transition-colors cursor-pointer"
            >
              Resend OTP
            </button>
            <Link to="/login" className="text-slate-400 hover:text-slate-600 transition-colors font-medium">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;
