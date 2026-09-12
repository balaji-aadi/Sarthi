import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { UserApi } from '../../services/api/user.api';
import { useNavigate } from 'react-router-dom';
import { 
    IoSearchOutline, 
    IoShieldCheckmarkOutline, 
    IoPersonOutline, 
    IoLockClosedOutline, 
    IoCheckmarkCircleOutline, 
    IoCloseCircleOutline,
    IoCheckmarkOutline
} from 'react-icons/io5';
import { FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TeamList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const { activeBranch, currentUser } = useSelector((state) => state.store);
    const navigate = useNavigate();

    const isCurrentAdmin = currentUser?.email === "balajiaadi2000@gmail.com" ||
        currentUser?.userRole?.name?.toLowerCase() === 'admin' ||
        currentUser?.role === 'admin' ||
        (currentUser?.userRoles && currentUser.userRoles.some(r => r.name?.toLowerCase() === 'admin'));

    useEffect(() => {
        if (activeBranch) {
            fetchUsers();
        }
    }, [activeBranch]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await UserApi.users();
            setUsers(res.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user) => {
        if (actionLoading) return;
        setActionLoading(user._id);
        try {
            const nextStatus = !user.isActive;
            await UserApi.bulkUpdateStatus({ userIds: [user._id], isActive: nextStatus });
            toast.success(nextStatus ? "Member enabled successfully" : "Member disabled successfully");
            setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: nextStatus } : u));
        } catch (e) {
            toast.error("Failed to update status");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(u => {
        const full = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
        const mail = (u.email || '').toLowerCase();
        const q = search.toLowerCase();
        return full.includes(q) || mail.includes(q);
    });

    const getRoleName = (u) => {
        let rName = u.userRole?.name || null;
        if (!rName && u.userRoles && u.userRoles.length > 0) {
            rName = u.userRoles.map(r => r.name).join(", ");
        }
        if (!rName) rName = typeof u.userRole === 'string' ? u.userRole : 'Member';
        const lower = rName.toLowerCase();
        if (lower === 'employee' || lower === 'user') return 'Member';
        if (lower === 'admin') return 'Admin';
        return rName;
    };

    const isUserAdmin = (u) => {
        return u.email === "balajiaadi2000@gmail.com" ||
            u.userRole?.name?.toLowerCase() === 'admin' ||
            u.role === 'admin' ||
            (u.userRoles && u.userRoles.some(r => r.name?.toLowerCase() === 'admin'));
    };

    return (
        <div className="p-6 lg:p-8 bg-slate-50/70 dark:bg-slate-950 min-h-full transition-colors duration-200">
            {/* Main Container */}
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Page Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Members</h1>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {users.length} {users.length === 1 ? 'member' : 'members'}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Manage your workspace members and their access controls.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search members..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 w-60 sm:w-64 transition-all"
                            />
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-700 px-1 py-0.5 rounded bg-slate-50 dark:bg-slate-800 pointer-events-none">
                                ⌘K
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2-Column Responsive Layout (Inspired by Image 4) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Left Column: Member List (2 Cols on Large) */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
                        
                        {/* Table Header */}
                        <div className="grid grid-cols-12 px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            <div className="col-span-6">Member</div>
                            <div className="col-span-3">Role</div>
                            <div className="col-span-3 text-right">Actions</div>
                        </div>

                        {/* Member Rows */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <div key={i} className="p-5 animate-pulse flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                                            <div className="space-y-2">
                                                <div className="w-32 h-3.5 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                                <div className="w-48 h-3 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="w-16 h-6 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                                    </div>
                                ))
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => {
                                    const roleName = getRoleName(user);
                                    const isAdmin = isUserAdmin(user);
                                    const isActive = user.isActive !== false;
                                    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous User';

                                    return (
                                        <div 
                                            key={user._id} 
                                            className="grid grid-cols-12 px-5 py-4 items-center hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                                        >
                                            {/* Name & Avatar */}
                                            <div className="col-span-6 flex items-center gap-3 min-w-0 pr-2">
                                                <div className="relative shrink-0">
                                                    <img 
                                                        src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=E34234&color=fff`} 
                                                        alt={fullName}
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                                                    />
                                                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${isActive ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                                            {fullName}
                                                        </span>
                                                        {!isActive && (
                                                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                                                                Disabled
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                                        {user.email || 'No email provided'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Role Badge */}
                                            <div className="col-span-3 flex items-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    isAdmin 
                                                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60' 
                                                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                                                }`}>
                                                    {isAdmin ? <IoShieldCheckmarkOutline size={13} /> : <IoPersonOutline size={12} />}
                                                    <span>{roleName}</span>
                                                </span>
                                            </div>

                                            {/* Action Controls */}
                                            <div className="col-span-3 flex items-center justify-end gap-2">
                                                {/* Active / Disabled State Toggle Button */}
                                                {isCurrentAdmin && !isAdmin && (
                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        disabled={actionLoading === user._id}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                                                            isActive 
                                                                ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/30' 
                                                                : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                                                        }`}
                                                        title={isActive ? "Disable Member" : "Enable Member"}
                                                    >
                                                        {actionLoading === user._id ? (
                                                            <span className="animate-spin inline-block">⌛</span>
                                                        ) : isActive ? (
                                                            "Disable"
                                                        ) : (
                                                            "Enable"
                                                        )}
                                                    </button>
                                                )}

                                                {/* Edit Button */}
                                                {isCurrentAdmin && (
                                                    <button
                                                        onClick={() => navigate('/user/create', { state: { user } })}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary hover:border-primary/40 dark:hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                                                        title="Edit Member"
                                                    >
                                                        <FaEdit size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-12 text-center text-slate-400 dark:text-slate-500">
                                    <p className="text-sm">No members found matching "{search}"</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Access Control Explanatory Card (Image 4 Design) */}
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-colors">
                            <div className="flex items-center gap-2">
                                <IoShieldCheckmarkOutline className="text-primary text-lg" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Access control</h3>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Sarthi maintains two straightforward authorization tiers to keep learning focused and administrative governance secure.
                            </p>

                            {/* Admin Tier Box */}
                            <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400"></span>
                                    <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300">Admin</h4>
                                </div>
                                <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80 leading-normal">
                                    Full workspace authority. Can manage curricula, compile & publish problems in Studio, configure Arenas, toggle member accounts, and administer system settings.
                                </p>
                            </div>

                            {/* Member Tier Box */}
                            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                                    <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300">Member</h4>
                                </div>
                                <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 leading-normal">
                                    Learner workspace access. Can navigate active Arenas, practice company-tagged questions, run code against test suites, log focus sessions, and track consistency streaks.
                                </p>
                            </div>

                            {/* Security Note */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-start gap-1.5">
                                <IoLockClosedOutline className="shrink-0 mt-0.5 text-slate-400" />
                                <span>Administrative mutation endpoints are server-enforced with JWT authorization.</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TeamList;
