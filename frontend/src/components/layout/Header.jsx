import React, { useEffect, useState, useRef, useContext } from 'react';
import { IoNotificationsOutline, IoSearchOutline, IoCalendarOutline, IoTimeOutline, IoCloseCircleOutline, IoLinkOutline, IoMenuOutline, IoSunnyOutline, IoMoonOutline } from 'react-icons/io5';
import { LuTrophy } from 'react-icons/lu';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { ProjectApi } from '../../services/api/Project.api';
import { ProblemApi } from '../../services/api/Problem.api';
import { useSocket } from '../../SocketProvider';
import { NotificationApi } from '../../services/api/notification.api';
import { UserApi } from '../../services/api/user.api';
import { TaskApi } from '../../services/api/Task.api';
import { messaging } from '../../firebaseConfig';
import { getToken } from 'firebase/messaging';
import { useSelector, useDispatch } from 'react-redux';
import { useLoading } from '../loader/LoaderContext';
import { setShowConsistencyModal, setGlobalSearch } from '../../store/slices/storeSlice';
import { isLldBranch, isDsaBranch } from '../../utils/curriculumHelper';
import { ThemeContext } from '../../ThemeContext';
import moment from 'moment';
import toast from 'react-hot-toast';

const Header = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [projectName, setProjectName] = useState("");
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notificationRef = useRef();
  const searchRef = useRef();

  const [userXp, setUserXp] = useState(() => Number(localStorage.getItem('sarthi_user_xp') || 0));

  useEffect(() => {
    const syncXp = () => {
      const saved = localStorage.getItem('sarthi_user_xp');
      setUserXp(saved !== null ? Number(saved) : 0);
    };
    window.addEventListener('storage', syncXp);
    return () => window.removeEventListener('storage', syncXp);
  }, []);

  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const { globalSearch, activeBranch, currentUser, dailyRevision } = useSelector((state) => state.store);
  // Phase 3: Daily revision lockout removed in favor of learner-driven spaced revision workspace
  const isLocked = false;

  const {
    isNotification,
    setIsNotification,
    notificationData,
    getAllNotification,
  } = useSocket();

  const { handleLoading } = useLoading();

  useEffect(() => {
    const fetchProjectName = async () => {
      if (projectId && activeBranch) {
        try {
          const res = await ProjectApi.project(projectId);
          setProjectName(res.data?.data?.name || "Project");
        } catch (error) {
          console.error("Failed to fetch project name", error);
          setProjectName("Project");
        }
      } else {
        setProjectName("");
      }
    };
    fetchProjectName();
  }, [projectId]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/arenas')) return 'Arenas';
    if (path.includes('/task')) return 'Tasks';
    if (path.includes('/user')) return 'Users';
    if (path.includes('/testing')) return 'Testing';
    if (path.includes('/dsa-management') || path.includes('/dsa')) return 'Studio';
    return 'Dashboard';
  };

  // Notification Logic
  const handleNavigateToNotification = () => {
    navigate("/notification");
    setShowDropdown(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationApi.markAllAsRead();
      getAllNotification();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const groupNotificationsByDay = (notifications) => {
    if (!notifications) return [];
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'days').startOf('day');

    const groups = [];
    let currentDate = null;
    let currentGroup = null;

    notifications.forEach(notification => {
      const notificationDate = moment(notification.createdAt);
      let dateLabel;

      if (notificationDate.isSame(today, 'd')) {
        dateLabel = 'Today';
      } else if (notificationDate.isSame(yesterday, 'd')) {
        dateLabel = 'Yesterday';
      } else if (notificationDate.isAfter(moment().subtract(7, 'days'))) {
        dateLabel = notificationDate.format('dddd');
      } else {
        dateLabel = notificationDate.format('MMM D, YYYY');
      }

      if (dateLabel !== currentDate) {
        currentDate = dateLabel;
        currentGroup = {
          dateLabel,
          notifications: []
        };
        groups.push(currentGroup);
      }

      currentGroup.notifications.push(notification);
    });

    return groups;
  };

  const handleUpdateNotify = async (data) => {
    const id = data?._id;

    if (
      data?.title === "Task created for you" ||
      data?.title === "Task updated for you"
    ) {
      navigate(`/task/dashboard?projectId=${data?.projectId?._id}`);
    } else if (
      data?.title === "Test created for you" ||
      data?.title === "Test updated for you"
    ) {
      navigate(
        `/testing/my-task?type=Test Case&projectId=${data?.projectId?._id}`
      );
    } else if (
      data?.title === "Bug created for you" ||
      data?.title === "Bug updated for you"
    ) {
      navigate(
        `/testing/my-task?type=Bug Reporting&projectId=${data?.projectId?._id}`
      );
    }
    try {
      await NotificationApi.updateStatus(id);
      setTimeout(() => {
        getAllNotification();
      }, 1000);
      setShowDropdown(false);
    } catch (err) {
      console.log(err);
    }
  };

  const requestPermission = async (userId) => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      console.log("Service Worker registered successfully:", registration);

      if (!messaging) {
        console.log("Messaging instance not yet initialized.");
        return;
      }

      const token = await getToken(messaging, {
        vapidKey:
          "BPuhQ5iZ4rOcxGmyJ5mEcItRY2RlzEKhzwHC9RwTIbvD694R4p_xdGen-C--tULAPhVUmb_kfMOQcjy5NIOzKzw",
      });

      if (token) {
        const payload = {
          user_id: userId || null,
          fcm_token: token,
          device_type: "web",
        };

        (async () => {
          try {
            const res = await UserApi.saveFcmToken(payload);
            console.log("This is the response of the fcm token ", res.data);
          } catch (err) {
            console.log(err);
          }
        })();
      } else {
        console.log("No registration token available.");
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
  };

  useEffect(() => {
    if (activeBranch) {
      getAllNotification();
    }
  }, [activeBranch]);

  useEffect(() => {
    if (currentUser?._id && activeBranch) {
      requestPermission(currentUser._id);
    }
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, [currentUser, activeBranch]);

  // Enhanced debounced suggestion fetching across DSA Problems, Tasks, and Arenas
  useEffect(() => {
    const trimmed = (globalSearch || '').trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const results = [];

        // 1. Fetch DSA Problems
        try {
          const problemRes = await ProblemApi.getProblems({ search: trimmed, limit: 5 });
          const problemItems = (problemRes.data?.data || []).slice(0, 4).map(p => ({
            type: 'dsa_problem',
            label: p.title,
            id: p._id,
            slug: p.slug
          }));
          results.push(...problemItems);
        } catch (e) {
          console.error("DSA problem search error", e);
        }

        // 2. Fetch Tasks with Arena metadata
        try {
          const taskRes = await TaskApi.getAllTasks({}, trimmed);
          const taskItems = (taskRes.data?.data || [])
            .filter(t => t.taskName?.toLowerCase().includes(trimmed.toLowerCase()))
            .slice(0, 4)
            .map(t => {
              const projObj = typeof t.projectId === 'object' ? t.projectId : (typeof t.projectName === 'object' ? t.projectName : null);
              const projId = projObj ? (projObj._id || projObj.id) : (t.projectId || t.projectName);
              const projName = projObj ? projObj.name : null;
              const projSlug = projObj ? (projObj.key?.toLowerCase() || projObj.name?.toLowerCase().replace(/\s+/g, '-')) : null;
              return {
                type: 'task',
                label: t.taskName,
                id: t._id,
                projectId: projId,
                projectName: projName,
                projectSlug: projSlug
              };
            });
          results.push(...taskItems);
        } catch (e) {
          console.error("Task search error", e);
        }

        // 3. Fetch Arenas / Projects
        try {
          const projectRes = await ProjectApi.getAllProjects();
          const projectItems = (projectRes.data?.data || [])
            .filter(p => p.name?.toLowerCase().includes(trimmed.toLowerCase()))
            .slice(0, 3)
            .map(p => ({
              type: 'project',
              label: p.name,
              id: p._id,
              key: p.key,
              slug: p.key?.toLowerCase() || p.name.toLowerCase().replace(/\s+/g, '-')
            }));
          results.push(...projectItems);
        } catch (e) {
          console.error("Project search error", e);
        }

        setSuggestions(results);
      } catch (err) {
        console.error("Suggestion fetch failed", err);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [globalSearch]);

  const handleSearchChange = (val) => {
    dispatch(setGlobalSearch(val));
    setIsTyping(true);
  };

  const saveToHistory = (query) => {
    if (!query || query.trim() === "") return;
    const cleanQuery = query.trim();
    const updated = [cleanQuery, ...recentSearches.filter(s => s !== cleanQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleClearSearch = () => {
    dispatch(setGlobalSearch(''));
  };

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!globalSearch || !globalSearch.trim()) return;
    const term = globalSearch.trim();
    saveToHistory(term);
    setShowSearchDropdown(false);

    // If already on an Arena board, Task board, or Studio page, filter in place (keep URL clean!)
    if (
      location.pathname.startsWith('/arena/') ||
      location.pathname.startsWith('/task/dashboard') ||
      location.pathname.startsWith('/dsa-management')
    ) {
      return;
    }

    // If on another page (Focus Timer, Settings, etc.), route to the clean Arena URL for matching task
    try {
      const taskRes = await TaskApi.getAllTasks({}, term);
      const foundTasks = (taskRes.data?.data || []).filter(t => t.taskName?.toLowerCase().includes(term.toLowerCase()));
      if (foundTasks.length > 0) {
        const topTask = foundTasks[0];
        const projObj = typeof topTask.projectId === 'object' ? topTask.projectId : (typeof topTask.projectName === 'object' ? topTask.projectName : null);
        if (projObj) {
          const arenaSlug = projObj.key?.toLowerCase() || projObj.name?.toLowerCase().replace(/\s+/g, '-');
          navigate(`/arena/${arenaSlug}`);
          return;
        }
      }
    } catch (err) {
      console.error("Task search routing failed", err);
    }

    // Fallback to task dashboard cleanly
    navigate('/task/dashboard');
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch(err => {
      console.error("Copy failed", err);
      toast.error("Failed to copy link");
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const notificationIconClass = isNotification ? "shake" : "";

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-[100] transition-colors duration-200">
      {/* Breadcrumbs / Page Title */}
      <div className="flex items-center gap-1 sm:gap-4 overflow-hidden">
        {/* Hamburger Menu Toggler */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-xl transition-all shrink-0"
          aria-label="Toggle Sidebar"
        >
          <IoMenuOutline size={22} />
        </button>

        <div className="flex items-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap overflow-hidden">
          {activeBranch && (
            <span className={`mr-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0 ${isLldBranch(activeBranch) ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'}`}>
              {isLldBranch(activeBranch) ? 'LLD' : isDsaBranch(activeBranch) ? 'DSA' : 'TRACK'}
            </span>
          )}
          <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer shrink-0">{getPageTitle()}</span>
          {projectName && (
            <div className="flex items-center min-w-0 ml-1 sm:ml-2">
              <span className="mx-1 sm:mx-2 shrink-0">/</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1 sm:gap-2 truncate max-w-[100px] sm:max-w-none">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary shrink-0"></span>
                <span className="truncate">{projectName}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">

        {/* Theme Toggle Button (Light / Dark Mode) */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-amber-400 hover:text-primary dark:hover:text-amber-300 hover:border-primary/40 dark:hover:border-amber-400/40 transition-all shrink-0 shadow-2xs"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <IoSunnyOutline size={20} className="text-amber-400 hover:rotate-45 transition-transform duration-300" />
          ) : (
            <IoMoonOutline size={19} className="text-slate-600 hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        <button
          onClick={() => { if (!isLocked) dispatch(setShowConsistencyModal(true)); }}
          disabled={isLocked}
          className={`w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shrink-0 ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
          title={isLocked ? "Complete Revision to Unlock 🔒" : "Performance View"}
        >
          <IoCalendarOutline size={20} />
        </button>

        <div className="relative shrink-0" ref={notificationRef}>
          <button
            onClick={() => {
              if (isLocked) return;
              setShowDropdown(!showDropdown);
              if (isNotification) setIsNotification(false);
            }}
            disabled={isLocked}
            className={`w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all relative ${notificationIconClass} ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
            title={isLocked ? "Complete Revision to Unlock 🔒" : "Notifications"}
          >
            <IoNotificationsOutline size={20} />
            {notificationData?.length > 0 && !isLocked && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900"></span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute top-12 right-0 w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                <div className="font-semibold text-slate-900 dark:text-slate-100">Notifications</div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-primary hover:underline font-medium"
                    disabled={notificationData?.length === 0}
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={handleNavigateToNotification}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    View all
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
                {notificationData?.length > 0 ? (
                  groupNotificationsByDay(notificationData).map((group, groupIndex) => (
                    <div key={groupIndex}>
                      <div className="sticky top-0 px-4 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider backdrop-blur-sm border-y border-slate-200/60 dark:border-slate-800/60">
                        {group.dateLabel}
                      </div>
                      {group.notifications.map((data, index) => (
                        <div
                          key={index}
                          onClick={() => handleUpdateNotify(data)}
                          className={`p-4 cursor-pointer border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!data.notificationStatus ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div className="relative flex-shrink-0">
                              {data.senderId?.profileImage ? (
                                <img
                                  src={data.senderId.profileImage}
                                  alt="Avatar"
                                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center font-semibold border border-primary/20 dark:border-primary/40">
                                  {data.senderId?.firstName?.charAt(0) || 'U'}
                                </div>
                              )}
                              {!data.notificationStatus && (
                                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-white dark:border-slate-900"></span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-0.5">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {data.senderId?.firstName} {data.senderId?.lastName}
                                </p>
                                <span className="text-xs text-slate-400 dark:text-slate-500 ml-2 whitespace-nowrap">
                                  {moment(data.createdAt).fromNow(true)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                                {data.title}
                                {data.projectId?.name && (
                                  <span className="text-slate-400 dark:text-slate-500 ml-1 block text-xs mt-0.5">
                                    in {data.projectId.name}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <IoNotificationsOutline size={48} className="mb-3 opacity-20" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => { if (!isLocked) handleShare(); }}
          disabled={isLocked}
          className={`p-2 sm:px-4 sm:py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primaryHover transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 shrink-0 ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
          title={isLocked ? "Complete Revision to Unlock 🔒" : "Share Link"}
        >
          <IoLinkOutline size={18} />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </header>
  );
};


export default Header;
