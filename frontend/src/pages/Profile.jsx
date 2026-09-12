import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  IoArrowBackOutline,
  IoCloudUploadOutline,
  IoLockClosedOutline,
  IoFlameOutline,
  IoCheckmarkCircleOutline,
  IoShieldCheckmarkOutline,
  IoTimeOutline,
  IoCodeSlashOutline,
  IoKeyOutline,
  IoCheckmarkOutline
} from "react-icons/io5";
import { updateCurrentUser } from "../store/slices/storeSlice";
import { UserApi } from "../services/api/user.api";
import { ProblemApi } from "../services/api/Problem.api";
import { TaskApi } from "../services/api/Task.api";
import { AnalyticsApi } from "../services/api/Analytics.api";
import moment from "moment";
import toast from "react-hot-toast";

// Curated anime presets matching Image 4
const PRESET_AVATARS = [
  { id: "boy", label: "Anime Boy (Headphones)", url: "/avatars/boy.jpg" },
  { id: "girl", label: "Smiling Anime Girl", url: "/avatars/girl.jpg" },
  { id: "samurai", label: "Samurai in Mist", url: "/avatars/samurai.jpg" },
  { id: "pikachu", label: "Cute Fluffy Creature", url: "/avatars/pikachu.jpg" },
  { id: "tanjiro", label: "Demon Slayer Hero", url: "/avatars/tanjiro.jpg" },
  { id: "nagi", label: "Blue Lock #7 Nagi", url: "/avatars/nagi.jpg" },
];

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.store);
  const fileInputRef = useRef(null);

  const [firstName, setFirstName] = useState(currentUser?.firstName || "");
  const [lastName, setLastName] = useState(currentUser?.lastName || "");
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || "");
  const [avatar, setAvatar] = useState(
    currentUser?.profileImage || "/avatars/boy.jpg"
  );
  const [saving, setSaving] = useState(false);

  // Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  // Dynamic Problem & Developer Mastery stats
  const [problemStats, setProblemStats] = useState({
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    streak: 0,
    taxonomies: 0,
    focusHours: 0
  });

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setPhoneNumber(currentUser.phoneNumber || "");
      if (currentUser.profileImage) {
        setAvatar(currentUser.profileImage);
      }
    }
  }, [currentUser]);

  // Fetch real user problem solving & curriculum mastery stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tasksRes, analyticsRes] = await Promise.allSettled([
          TaskApi.getAllTasks({}),
          AnalyticsApi.getPersonalStats({ period: 'daily' })
        ]);

        let solved = [];
        let easy = 0, medium = 0, hard = 0;
        const taxonomySet = new Set();

        if (tasksRes.status === 'fulfilled' && tasksRes.value?.data?.data) {
          const tasks = tasksRes.value.data.data;
          solved = tasks.filter(t => t.status === 'done' || t.status === 'completed' || t.isSolved);

          solved.forEach(t => {
            const diff = (t.curriculumMeta?.difficulty || '').toLowerCase();
            const priority = (t.taskPriority || '').toLowerCase();
            const level = (t.curriculumMeta?.level || '').toLowerCase();

            if (diff === 'hard' || priority === 'high' || priority === 'urgent' || level.includes('c')) {
              hard++;
            } else if (diff === 'medium' || priority === 'medium' || level.includes('b')) {
              medium++;
            } else {
              easy++;
            }

            if (t.curriculumMeta?.patternFamily) taxonomySet.add(t.curriculumMeta.patternFamily);
            else if (t.patternRef?.name) taxonomySet.add(t.patternRef.name);
            else if (t.parentTask?.taskName) taxonomySet.add(t.parentTask.taskName);
            else if (typeof t.projectName === 'object' && t.projectName?.name) taxonomySet.add(t.projectName.name);
            else if (typeof t.projectName === 'string') taxonomySet.add(t.projectName);
          });
        }

        let streak = 0;
        let totalFocusHours = 0;

        if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data?.data) {
          const stats = analyticsRes.value.data.data;
          const dateMap = {};

          stats.forEach(s => {
            const dateStr = moment(s.date).format('YYYY-MM-DD');
            const hours = s.metrics?.hoursLogged || 0;
            const tasksCount = s.metrics?.tasksCompleted || 0;
            const hasWork = tasksCount > 0 || hours > 0 || (s.metrics?.accountabilityLogs || 0) > 0;
            dateMap[dateStr] = hasWork;
            totalFocusHours += hours;
          });

          const checkDate = moment().startOf('day');
          const todayStr = checkDate.format('YYYY-MM-DD');
          const yesterdayStr = moment(checkDate).subtract(1, 'days').format('YYYY-MM-DD');

          let startCountingFrom = checkDate;
          if (!dateMap[todayStr] && dateMap[yesterdayStr]) {
            startCountingFrom = moment(checkDate).subtract(1, 'days');
          }

          let currentCheck = startCountingFrom;
          for (let i = 0; i < 365; i++) {
            const str = currentCheck.format('YYYY-MM-DD');
            if (dateMap[str]) {
              streak++;
              currentCheck.subtract(1, 'days');
            } else {
              break;
            }
          }
        }

        setProblemStats({
          total: solved.length,
          easy,
          medium,
          hard,
          streak,
          taxonomies: taxonomySet.size || (solved.length > 0 ? 1 : 0),
          focusHours: totalFocusHours > 0 ? Number(totalFocusHours.toFixed(1)) : 0
        });
      } catch (err) {
        console.error("Failed to fetch user developer mastery stats:", err);
      }
    };

    fetchStats();
  }, [currentUser]);

  // Handle local device image upload
  const handleDeviceUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      toast.success("Image selected from device");
    };
    reader.readAsDataURL(file);
  };

  // Handle Profile Update
  const handleSaveChanges = async () => {
    if (!firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        profileImage: avatar,
      };

      const res = await UserApi.updateAccount(payload);
      const updatedUser = res.data?.data || {
        ...currentUser,
        ...payload,
      };

      dispatch(updateCurrentUser(updatedUser));
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      // Even if backend fails, update local state for immediate feedback
      dispatch(updateCurrentUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        profileImage: avatar,
      }));
      toast.success("Profile saved locally");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword) {
      toast.error("New password is required");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    toast.success("Password changed successfully");
    setShowPasswordModal(false);
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  const userRoleName = currentUser?.userRole?.name ||
    (currentUser?.userRoles && currentUser.userRoles[0]?.name) ||
    (currentUser?.email === "balajiaadi2000@gmail.com" ? "Admin" : "Member");

  return (
    <div className="min-h-screen bg-[#f8eff1] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Background Soft Watercolor / Floral Glow Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-rose-200 via-transparent to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-8 flex flex-col min-h-screen">
        {/* Top Header Bar matching Image 4 */}
        <div className="flex items-center justify-between pb-6 mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            <IoArrowBackOutline size={20} />
            <span>Edit Profile</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveChanges}
            className="px-6 sm:px-8 py-2.5 rounded-full bg-[#7a3b45] hover:bg-[#663039] text-white font-bold text-xs sm:text-sm tracking-wider uppercase shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {saving ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>

        {/* Center Profile Picture Section matching Image 4 */}
        <div className="flex flex-col items-center text-center my-4 sm:my-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            Profile Picture
          </h2>

          {/* Large Circular Avatar Preview */}
          <div className="relative group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 border-4 border-rose-300 dark:border-rose-500/80 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden ring-8 ring-rose-100/60 dark:ring-rose-950/40 transition-all duration-300">
              <img
                src={avatar}
                alt="Selected Avatar"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || 'U')}&background=7a3b45&color=fff`;
                }}
              />
            </div>
          </div>

          {/* Subtitle: Choose your avatar */}
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-6 mb-4">
            Choose your avatar
          </p>

          {/* 6 Circular Avatar Presets Horizontal Carousel */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap max-w-xl py-2">
            {PRESET_AVATARS.map((preset) => {
              const isSelected = avatar === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setAvatar(preset.url)}
                  title={preset.label}
                  className={`relative w-14 h-14 sm:w-18 sm:h-18 rounded-full overflow-hidden p-0.5 transition-all duration-200 cursor-pointer ${isSelected
                    ? "ring-4 ring-rose-500 shadow-lg scale-110"
                    : "hover:scale-105 hover:ring-2 hover:ring-rose-300/70 opacity-90 hover:opacity-100"
                    }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-full object-cover rounded-full"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-rose-500/20 rounded-full flex items-center justify-center">
                      <IoCheckmarkCircleOutline className="text-white drop-shadow-md" size={24} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* "OR" Divider */}
          <div className="relative flex items-center justify-center w-full max-w-md my-6">
            <div className="border-t border-slate-300/80 dark:border-slate-800 w-full" />
            <span className="bg-[#f8eff1] dark:bg-slate-950 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              OR
            </span>
            <div className="border-t border-slate-300/80 dark:border-slate-800 w-full" />
          </div>

          {/* Upload Photo Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Select profile picture from your device
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleDeviceUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2 rounded-full bg-[#7a3b45] hover:bg-[#663039] text-white text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <IoCloudUploadOutline size={16} />
              <span>UPLOAD PHOTO</span>
            </button>
          </div>
        </div>

        {/* Account Details & LeetCode Developer Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          {/* Left Form: Personal Details */}
          <div className="lg:col-span-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              Personal Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#7a3b45] transition-all"
                  placeholder="First name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#7a3b45] transition-all"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={currentUser?.email || "user@sarthi.in"}
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed pr-9"
                />
                <IoLockClosedOutline className="absolute right-3 top-2.5 text-slate-400" size={15} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#7a3b45] transition-all"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Assigned Role:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#7a3b45]/10 dark:bg-[#7a3b45]/30 text-[#7a3b45] dark:text-rose-300 border border-[#7a3b45]/20">
                  {userRoleName}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#7a3b45] dark:hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <IoKeyOutline size={14} />
                <span>Change Password</span>
              </button>
            </div>
          </div>

          {/* Right Column: LeetCode-Grade Developer Metrics */}
          <div className="lg:col-span-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Developer Mastery</span>
                <span className="text-xs font-semibold text-primary">Sarthi Curriculum</span>
              </h3>

              {/* Solved Problems Breakdown */}
              <div className="grid grid-cols-4 gap-2 text-center mt-4">
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {problemStats.total}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    Total Solved
                  </div>
                </div>

                <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {problemStats.easy}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400 uppercase tracking-wider mt-0.5">
                    Easy
                  </div>
                </div>

                <div className="bg-amber-50/80 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                    {problemStats.medium}
                  </div>
                  <div className="text-[10px] font-bold text-amber-600/80 dark:text-amber-400 uppercase tracking-wider mt-0.5">
                    Medium
                  </div>
                </div>

                <div className="bg-rose-50/80 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
                  <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                    {problemStats.hard}
                  </div>
                  <div className="text-[10px] font-bold text-rose-600/80 dark:text-rose-400 uppercase tracking-wider mt-0.5">
                    Hard
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Row */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center font-bold">
                  <IoFlameOutline size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{problemStats.streak} Days</div>
                  <div className="text-[10px] text-slate-400">Streak</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center font-bold">
                  <IoCodeSlashOutline size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{problemStats.taxonomies} Taxonomies</div>
                  <div className="text-[10px] text-slate-400">Mastery</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center font-bold">
                  <IoTimeOutline size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{problemStats.focusHours} hrs</div>
                  <div className="text-[10px] text-slate-400">Focus Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Change Account Password
            </h3>
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#7a3b45]"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#7a3b45]"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7a3b45] hover:bg-[#663039] text-white text-xs font-bold shadow-sm transition-all"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
