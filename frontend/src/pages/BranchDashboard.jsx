import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveBranch, setBranches } from '../store/slices/storeSlice';
import { IoAdd, IoSearchOutline, IoBusinessOutline, IoCloseOutline, IoPencilOutline, IoTrashOutline, IoAlertCircleOutline, IoStatsChartOutline, IoCalendarOutline, IoShieldCheckmarkOutline, IoArrowForwardOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { BranchApi } from '../services/api/Branch.api';
import toast from 'react-hot-toast';

const BranchDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { branches, currentUser } = useSelector((state) => state.store);
    const [loading, setLoading] = React.useState(true);
    const [settings, setSettings] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [branchStats, setBranchStats] = useState({ projectCount: 0, taskCount: 0 });
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    
    const [formData, setFormData] = useState({ name: "", description: "", visibility: "private" });

    const isAdmin = currentUser?.email === "balajiaadi2000@gmail.com" || 
                    ["admin", "project manager"].includes(currentUser?.userRole?.name?.toLowerCase());

    const fetchBranches = async () => {
        try {
            const [branchesRes, settingsRes] = await Promise.all([
                BranchApi.getAllBranches(),
                BranchApi.getGlobalSettings()
            ]);
            dispatch(setBranches(branchesRes.data?.data || []));
            setSettings(settingsRes.data?.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchBranches();
    }, [dispatch]);

    const handleBranchSelect = (branch) => {
        dispatch(setActiveBranch(branch));
        navigate('/'); // Navigate to main dashboard after selection
    };

    const handleCreateBranch = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await BranchApi.createBranch(formData);
            toast.success("Branch created successfully!");
            setIsCreateModalOpen(false);
            setFormData({ name: "", description: "", visibility: "private" });
            fetchBranches();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create branch");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBranch = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await BranchApi.updateBranch(selectedBranch._id, formData);
            toast.success("Branch updated successfully!");
            setIsEditModalOpen(false);
            fetchBranches();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update branch");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBranch = async (e) => {
        e.preventDefault();
        if (deleteConfirmation !== selectedBranch.name) {
            toast.error("Branch name confirmation mismatch");
            return;
        }
        try {
            setLoading(true);
            await BranchApi.deleteBranch(selectedBranch._id, deleteConfirmation);
            toast.success("Branch permanently deleted");
            setIsDeleteModalOpen(false);
            setDeleteConfirmation("");
            fetchBranches();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete branch");
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (e, branch) => {
        e.stopPropagation();
        setSelectedBranch(branch);
        setFormData({ 
            name: branch.name, 
            description: branch.description || "",
            visibility: branch.visibility || "private"
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = async (e, branch) => {
        e.stopPropagation();
        setSelectedBranch(branch);
        setDeleteConfirmation("");
        setIsDeleteModalOpen(true);
        try {
            const res = await BranchApi.getBranchStats(branch._id);
            setBranchStats(res.data?.data);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const filteredBranches = (branches || []).filter(b => 
        b.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-y-auto custom-scrollbar">
            {/* Header Section */}
            <div className=" pb-6">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-1 h-1 rounded-full bg-primary"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Workspace Management</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Branch Dashboard</h1>
                        <p className="text-slate-500 text-sm font-medium">Manage your isolated data hubs and team environments.</p>
                        
                        {isAdmin && (
                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-emerald-700 text-[10px] font-black uppercase tracking-widest">Individual Data Vault Active</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search hubs..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 pr-6 py-2 bg-white border border-slate-200 rounded-xl w-full md:w-64 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-600 shadow-sm text-sm"
                            />
                        </div>
                        <button 
                            onClick={() => {
                                setFormData({ name: "", description: "", visibility: "private" });
                                setIsCreateModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-black rounded-xl shadow-xl shadow-primary/20 hover:bg-primaryHover transition-all active:scale-95 whitespace-nowrap uppercase tracking-widest text-[10px]"
                        >
                            <IoAdd size={18} />
                            <span>Create Hub</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid Section */}
            <div className="p-10 pt-0">
                <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredBranches.map((branch, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.5 }}
                            key={branch._id}
                            onClick={() => handleBranchSelect(branch)}
                            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col h-[280px]"
                        >
                            {/* Actions Overlay */}
                            <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                                <button 
                                    onClick={(e) => openEditModal(e, branch)}
                                    className="p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 text-slate-400 hover:text-primary transition-all"
                                >
                                    <IoPencilOutline size={14} />
                                </button>
                                <button 
                                    onClick={(e) => openDeleteModal(e, branch)}
                                    className="p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 text-slate-400 hover:text-rose-500 transition-all"
                                >
                                    <IoTrashOutline size={14} />
                                </button>
                            </div>

                            <div className="flex flex-col h-full">
                                {/* Top Section: Icon & Name */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="relative shrink-0">
                                        <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative w-14 h-14 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-inner">
                                            {branch.logo ? (
                                                <img src={branch.logo} alt={branch.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <IoBusinessOutline size={24} className="text-primary/60" />
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 pt-1">
                                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-primary transition-colors tracking-tight line-clamp-2 leading-tight">
                                            {branch.name}
                                        </h3>
                                    </div>
                                </div>
                                
                                <div className="mt-auto space-y-4">
                                    {/* Badges */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                            branch.visibility === "public" 
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-200/50" 
                                            : "bg-slate-50 text-slate-500 border-slate-200/50"
                                        }`}>
                                            {branch.visibility || "private"}
                                        </span>
                                        
                                        {settings?.subscriptionType === '1-year' && (
                                            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/50">
                                                <IoCalendarOutline size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                                    Exp: {new Date(new Date(currentUser?.createdAt).setFullYear(new Date(currentUser?.createdAt).getFullYear() + 1)).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}

                                        {settings?.subscriptionType === 'free' && (
                                            <div className="flex items-center gap-1.5 text-primary bg-primary/5 px-2.5 py-1 rounded-md border border-primary/10">
                                                <IoShieldCheckmarkOutline size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Free Access</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex h-2 w-2">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </div>
                                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Operational</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-slate-50 group-hover:text-primary transition-colors">
                                            <IoArrowForwardOutline size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Add New Hub Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (filteredBranches.length || 0) * 0.05 }}
                        onClick={() => {
                            setFormData({ name: "", description: "", visibility: "private" });
                            setIsCreateModalOpen(true);
                        }}
                        className="group border-2 border-dashed border-slate-300 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer h-[280px]"
                    >
                        <div className="w-12 h-12 mb-4 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                            <IoAdd size={24} />
                        </div>
                        <h4 className="text-base font-bold text-slate-700 mb-1 tracking-tight">Add New Hub</h4>
                        <p className="text-slate-400 text-xs font-medium max-w-[180px]">Create a new dedicated workspace.</p>
                    </motion.div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {(isCreateModalOpen || isEditModalOpen) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                setIsEditModalOpen(false);
                            }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-lg overflow-hidden"
                        >
                            <button 
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setIsEditModalOpen(false);
                                }}
                                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <IoCloseOutline size={24} />
                            </button>

                            <div className="mb-8">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                    {isCreateModalOpen ? "Create New Hub" : "Update Hub Details"}
                                </h2>
                                <p className="text-slate-500 text-sm font-medium mt-1">
                                    {isCreateModalOpen ? "Scale your productivity with a new branch." : "Refine your workspace environment."}
                                </p>
                            </div>

                            <form onSubmit={isCreateModalOpen ? handleCreateBranch : handleUpdateBranch} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Hub Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-800 font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                                        placeholder="e.g. Software Development"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                                    <textarea 
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-800 font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner resize-none"
                                        placeholder="What will you focus on here?"
                                    />
                                </div>
                                
                                {currentUser?.email === "balajiaadi2000@gmail.com" && (
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Access Visibility</label>
                                        <div className="flex gap-4">
                                            {['private', 'public'].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, visibility: type})}
                                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                        formData.visibility === type 
                                                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                                                        : "bg-white border-slate-200 text-slate-400 hover:border-primary/40"
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-medium mt-3 px-1 italic">
                                            {formData.visibility === 'public' 
                                                ? "Visible to all registered users in the platform." 
                                                : "Only you can see and access this hub."}
                                        </p>
                                    </div>
                                )}

                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:bg-primaryHover transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 uppercase tracking-widest text-xs"
                                >
                                    {loading ? "Processing..." : (isCreateModalOpen ? "Establish Hub" : "Save Changes")}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-xl overflow-hidden border border-rose-50"
                        >
                            <div className="flex items-start gap-6 mb-8">
                                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shrink-0">
                                    <IoAlertCircleOutline size={40} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Permanent Deletion</h2>
                                    <p className="text-slate-500 text-sm font-medium mt-1 leading-relaxed">
                                        This action is irreversible. All associated projects and tasks will be wiped from existence.
                                    </p>
                                </div>
                            </div>

                            {/* Branch Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <IoStatsChartOutline size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Projects</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-800">{branchStats.projectCount}</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <IoStatsChartOutline size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Total Tasks</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-800">{branchStats.taskCount}</p>
                                </div>
                            </div>

                            <form onSubmit={handleDeleteBranch} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">
                                        Type <span className="text-rose-500 font-bold">"{selectedBranch?.name}"</span> to confirm deletion
                                    </label>
                                    <input 
                                        required
                                        type="text" 
                                        value={deleteConfirmation}
                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                        className="w-full bg-rose-50/30 border border-rose-100 rounded-2xl px-6 py-4 text-rose-600 font-bold outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all placeholder:text-rose-200"
                                        placeholder={selectedBranch?.name}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={loading || deleteConfirmation !== selectedBranch?.name}
                                        className="flex-[2] py-4 bg-rose-500 text-white font-black rounded-2xl shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 uppercase tracking-widest text-xs"
                                    >
                                        {loading ? "Wiping Data..." : "Confirm Deletion"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BranchDashboard;
