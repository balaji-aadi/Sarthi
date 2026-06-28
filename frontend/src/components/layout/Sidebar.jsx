import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IoGridOutline,
    IoBriefcaseOutline,
    IoPeopleOutline,
    IoSettingsOutline,
    IoLogOutOutline,
    IoAdd,
    IoChevronDown,
    IoAnalyticsOutline,
    IoCalendarOutline,
    IoTimeOutline,
    IoSyncOutline,
    IoBusinessOutline,
    IoArrowForwardOutline,
    IoDocumentTextOutline
} from 'react-icons/io5';
import { ProjectApi } from '../../services/api/Project.api';
import { useSelector } from 'react-redux';
import GlobalTimerWidget from './GlobalTimerWidget';

const Sidebar = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const { currentUser, activeBranch, globalSettings } = useSelector((state) => state.store);

    const { slug } = useParams();
    const currentProjectId = searchParams.get('projectId');

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const res = await ProjectApi.getAllProjects();
                setProjects(res.data?.data || []);
            } catch (error) {
                console.error("Failed to fetch sidebar projects", error);
            } finally {
                setLoading(false);
            }
        };

        if (activeBranch) {
            fetchProjects();
        }

        // Listen for project creation events to trigger a refresh
        const handleProjectUpdate = () => {
            if (activeBranch) fetchProjects();
        };
        window.addEventListener('projectCreated', handleProjectUpdate);

        return () => {
            window.removeEventListener('projectCreated', handleProjectUpdate);
        };
    }, [activeBranch]);

    const hiddenRoles = ["developer", "tester", "employee"];

    let menuItems = [
        { icon: <IoGridOutline />, label: 'Dashboard', path: '/' },
        { icon: <IoBusinessOutline />, label: 'Branches', path: '/branch' },
        { icon: <IoTimeOutline />, label: 'Focus Timer', path: '/focus-timer' },
        { icon: <IoAnalyticsOutline />, label: 'Performance', path: '/performance' },
        { icon: <IoSyncOutline />, label: 'Revision', path: '/revision' },
        { icon: <IoDocumentTextOutline />, label: 'Notes', path: '/notes' },
        { icon: <IoBriefcaseOutline />, label: 'Arenas', path: '/arenas' },
        { icon: <IoPeopleOutline />, label: 'Users', path: '/user' },
        { icon: <IoTimeOutline />, label: 'Pricing', path: '/pricing' },
    ];

    const isAdmin = currentUser?.email === "balajiaadi2000@gmail.com";

    if (hiddenRoles.includes(currentUser?.userRole?.name?.toLowerCase())) {
        menuItems = menuItems.filter(item => item.label !== 'Arenas' && item.label !== 'Users');
    }

    if (!isAdmin) {
        menuItems = menuItems.filter(item => item.label !== 'Users');
        if (globalSettings?.subscriptionType !== 'paid') {
            menuItems = menuItems.filter(item => item.label !== 'Pricing');
        }
    } else {
        menuItems = menuItems.filter(item => item.label !== 'Pricing');
    }

    const topMenuItems = menuItems.filter(item => ['Branches', 'Users'].includes(item.label));
    const mainMenuItems = menuItems.filter(item => !['Branches', 'Users', 'Pricing'].includes(item.label));
    const pricingItem = menuItems.find(item => item.label === 'Pricing');

    return (
        <aside className="w-72 bg-surface border-r border-borderLight h-full flex flex-col absolute left-0 top-0 overflow-y-auto z-20">
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3 pb-2">
                <img src="/momentum_logo.svg" alt="Sarathi Logo" className="w-8 h-8 object-contain drop-shadow-md" />
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-textMain tracking-tight leading-none">Sarathi</h1>
                    {activeBranch && (
                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mt-1 opacity-70">
                            {activeBranch.name}
                        </span>
                    )}
                </div>
            </div>

            {/* Global Timer Active Widget */}
            <GlobalTimerWidget />

            {/* Main Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                {/* Top Section: Branches & Teams */}
                <div className="mt-4 space-y-1">
                    {topMenuItems.map((item, idx) => (
                        <NavLink
                            key={`top-${idx}`}
                            to={item.path}
                            className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 transition-all duration-200 group relative ${isActive ? 'active text-primary' : 'text-textSub hover:text-textMain'}`}
                        >
                            <div className="flex items-center gap-2.5">
                                <span className="text-lg opacity-70 group-[.active]:opacity-100 group-[.active]:text-primary">{item.icon}</span>
                                <span className={`text-[13px] font-bold group-[.active]:text-primary transition-all uppercase tracking-wider`}>
                                    {item.label}
                                </span>
                            </div>
                        </NavLink>
                    ))}
                </div>

                {/* Thin Line Separator */}
                <div className="h-[1px] bg-slate-100/80 my-6 mx-2"></div>

                {/* Main Section */}
                <div className="space-y-1">
                    {mainMenuItems.map((item, idx) => (
                        <NavLink
                            key={`main-${idx}`}
                            to={item.path}
                            onClick={() => {
                                if (item.label === 'Dashboard') {
                                    navigate('/');
                                }
                            }}
                            className={({ isActive }) => `flex items-center gap-3 px-4 py-2 transition-all duration-200 group relative ${isActive ? 'active text-primary' : 'text-textSub hover:text-textMain'}`}
                        >
                            <span className={`w-1 h-1 rounded-full transition-all group-[.active]:bg-primary bg-transparent`}></span>
                            <div className="flex items-center gap-2.5">
                                <span className="text-base opacity-70 group-[.active]:opacity-100">{item.icon}</span>
                                <span className={`text-[13px] font-semibold group-[.active]:underline underline-offset-4 decoration-primary/40 group-hover:underline transition-all`}>
                                    {item.label}
                                </span>
                            </div>
                        </NavLink>
                    ))}

                    {/* Pricing (Conditional) */}
                    {pricingItem && (
                        <NavLink
                            to={pricingItem.path}
                            className={({ isActive }) => `flex items-center gap-3 px-4 py-2 transition-all duration-200 group relative ${isActive ? 'active text-primary' : 'text-textSub hover:text-textMain'}`}
                        >
                            <span className={`w-1 h-1 rounded-full transition-all group-[.active]:bg-primary bg-transparent`}></span>
                            <div className="flex items-center gap-2.5">
                                <span className="text-base opacity-70 group-[.active]:opacity-100">{pricingItem.icon}</span>
                                <span className={`text-[13px] font-semibold group-[.active]:underline underline-offset-4 decoration-primary/40 group-hover:underline transition-all`}>
                                    {pricingItem.label}
                                </span>
                            </div>
                        </NavLink>
                    )}
                </div>

                {/* Favorites/Projects Section */}
                {/* Favorites/Projects Section */}
                <div className="mt-8">
                    <div className="flex items-center justify-between px-4 mb-2">
                        <p className="text-xs font-semibold text-textSub uppercase tracking-wider">Arenas</p>
                        {!hiddenRoles.includes(currentUser?.userRole?.name?.toLowerCase()) && (
                            <button
                                className="text-textSub hover:text-primary transition-colors"
                                onClick={() => navigate('/arenas/create-project')}
                                title="Create Arena"
                            >
                                <IoAdd size={16} />
                            </button>
                        )}
                    </div>
                    <div className="space-y-1">
                        {loading ? (
                            <p className="px-4 text-xs text-textSub">Loading...</p>
                        ) : projects.length > 0 ? (
                            projects.slice(0, 10).map((project, idx) => {
                                const projectSlug = project.key?.toLowerCase() || project.name.toLowerCase().replace(/\s+/g, '-');
                                const isActive = slug ? slug === projectSlug : currentProjectId === project._id;
                                return (
                                    <div
                                        key={project._id || idx}
                                        onClick={() => navigate(`/arena/${projectSlug}`)}
                                        className={`w-full flex items-center gap-3 px-4 py-1.5 cursor-pointer transition-all group ${isActive ? 'text-primary' : 'text-textSub/80 hover:text-textMain'}`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${isActive ? 'bg-primary shadow-[0_0_8px_rgba(79,70,229,0.5)]' : 'bg-slate-300'}`}></span>
                                        <span className={`text-xs font-bold truncate ${isActive ? 'underline underline-offset-4 decoration-primary/30' : 'group-hover:underline underline-offset-4 decoration-slate-200'}`}>
                                            {project.name}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="px-4 text-xs text-textSub italic">No arenas found</p>
                        )}
                        {projects.length > 5 && (
                            <button
                                onClick={() => navigate('/arenas')}
                                className="w-full px-4 py-1 text-xs text-primary hover:underline text-left"
                            >
                                View all
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Bottom Actions */}
            <div className="px-4 py-6 mt-auto space-y-4 border-t border-slate-100/50">
                <MenuItem icon={<IoSettingsOutline />} label="Settings" path="/settings" isActive={window.location.pathname === '/settings'} />

                {/* User Profile Section - Premium Light */}
                <div className="p-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden">
                    {/* Subtle Gradient Glow */}
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-colors duration-700"></div>

                    <div className="relative flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-tr from-primary to-accent rounded-full opacity-20 group-hover:opacity-100 transition-opacity blur-[1px]"></div>
                            {currentUser?.profileImage ? (
                                <img src={currentUser.profileImage} alt="Profile" className="relative w-10 h-10 rounded-full object-cover border border-white" />
                            ) : (
                                <img
                                    src={`https://ui-avatars.com/api/?name=${currentUser ? (currentUser.firstName + "+" + (currentUser.lastName || "")) : "User"}&background=E34234&color=fff&bold=true`}
                                    alt="Profile"
                                    className="relative w-10 h-10 rounded-full border border-white shadow-sm"
                                />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-black text-slate-800 truncate tracking-tight leading-none">
                                {currentUser ? `${currentUser.firstName} ${currentUser.lastName || ''}` : 'User'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-widest rounded-md border border-slate-200/50">
                                    {isAdmin ? "System Admin" : "Premium Member"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = "/login";
                        }}
                        className="mt-4 w-full py-2.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border border-slate-200/50"
                    >
                        <IoLogOutOutline size={14} />
                        Logout Session
                    </button>
                </div>
            </div>
        </aside>
    );
};

const MenuItem = ({ icon, label, path, isActive }) => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${isActive
                    ? 'text-primary font-black'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
        >
            {isActive && (
                <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/5 border-l-4 border-primary"
                />
            )}
            <span className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>
                {React.cloneElement(icon, { size: 18 })}
            </span>
            <span className="relative z-10 text-[13px] tracking-tight font-bold">{label}</span>
        </button>
    );
};

export default Sidebar;
