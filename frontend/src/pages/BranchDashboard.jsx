import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveBranch, setBranches } from '../store/slices/storeSlice';
import {
    IoAdd,
    IoSearchOutline,
    IoCloseOutline,
    IoPencilOutline,
    IoTrashOutline,
    IoAlertCircleOutline,
    IoArrowForwardOutline,
    IoDocumentTextOutline,
    IoEyeOutline,
    IoCodeSlashOutline,
    IoLayersOutline,
    IoTimeOutline,
    IoSyncOutline,
    IoBriefcaseOutline,
    IoSparklesOutline,
    IoGlobeOutline
} from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { BranchApi } from '../services/api/Branch.api';
import { isDsaBranch, isLldBranch } from '../utils/curriculumHelper';
import SarathiLoader from '../components/common/SarathiLoader';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';

// High-fidelity HTML & CSS Pamphlet Frame Renderer
const PamphletFrame = ({ htmlContent, className = "w-full h-[520px]" }) => {
    const sanitizedHtml = DOMPurify.sanitize(htmlContent || '', {
        ADD_TAGS: ['style', 'head', 'meta', 'link', 'title', 'header', 'footer', 'main', 'section', 'article', 'nav', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'code', 'pre', 'blockquote', 'hr', 'br', 'b', 'strong', 'i', 'em'],
        ADD_ATTR: ['target', 'style', 'class', 'id', 'href', 'rel', 'name', 'content', 'charset', 'src', 'alt', 'width', 'height']
    });

    const isFullDoc = /<!DOCTYPE|<html>|<head>|<body/i.test(sanitizedHtml);

    const docSrc = isFullDoc ? sanitizedHtml : `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <base target="_blank">
            <style>
                body { 
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; 
                    margin: 0; 
                    padding: 24px; 
                    color: #1e293b; 
                    background-color: #ffffff; 
                    line-height: 1.6;
                }
                * { box-sizing: border-box; }
                h1, h2, h3, h4 { color: #0f172a; margin-top: 1em; margin-bottom: 0.5em; }
                p { margin-bottom: 1em; }
                ul, ol { padding-left: 1.5em; margin-bottom: 1em; }
                li { margin-bottom: 0.25em; }
            </style>
        </head>
        <body>
            ${sanitizedHtml}
        </body>
        </html>
    `;

    return (
        <iframe
            srcDoc={docSrc}
            title="Module Pamphlet Showcase"
            className={`${className} border-0 rounded-xl bg-white w-full`}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
        />
    );
};

const BranchDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { branches, currentUser } = useSelector((state) => state.store);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [pamphletModalModule, setPamphletModalModule] = useState(null);
    const [dontShowAgain, setDontShowAgain] = useState(true);

    // Edit/Create Modal Tab state
    const [modalTab, setModalTab] = useState('code'); // 'code' | 'preview'

    const [selectedBranch, setSelectedBranch] = useState(null);
    const [branchStats, setBranchStats] = useState({ projectCount: 0, taskCount: 0 });
    const [deleteConfirmation, setDeleteConfirmation] = useState("");

    const [formData, setFormData] = useState({ name: "", description: "" });

    // Strictly check if user is Admin
    const isAdmin = currentUser?.email === "balajiaadi2000@gmail.com" ||
        currentUser?.userRole?.name?.toLowerCase() === "admin" ||
        (currentUser?.userRoles && currentUser.userRoles.some(r => r.name?.toLowerCase() === 'admin'));

    // Allow non-admin users to view learning modules and choose a module to enter

    const fetchBranches = async () => {
        try {
            const [branchesRes] = await Promise.all([
                BranchApi.getAllBranches(),
                BranchApi.getGlobalSettings()
            ]);
            dispatch(setBranches(branchesRes.data?.data || []));
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, [dispatch]);

    // Handle Module Entry
    const handleModuleClick = (module) => {
        if (!module) return;
        const hasDescription = module.description && module.description.trim().length > 0;
        const hasSeenPrerequisites = localStorage.getItem(`prerequisites_seen_${module._id}`) === 'true' ||
            localStorage.getItem(`pamphlet_seen_${module._id}`) === 'true';

        if (hasDescription && !hasSeenPrerequisites) {
            setPamphletModalModule(module);
            setDontShowAgain(true);
        } else {
            enterModule(module);
        }
    };

    const enterModule = (module) => {
        if (!module) return;
        dispatch(setActiveBranch(module));
        navigate('/');
    };

    const handleConfirmPamphletEntry = () => {
        if (pamphletModalModule) {
            const target = pamphletModalModule;
            if (dontShowAgain) {
                localStorage.setItem(`prerequisites_seen_${target._id}`, 'true');
                localStorage.setItem(`pamphlet_seen_${target._id}`, 'true');
            }
            setPamphletModalModule(null);
            enterModule(target);
        }
    };

    const handleCreateBranch = async (e) => {
        e.preventDefault();
        if (!isAdmin) {
            toast.error("Only administrators can create modules");
            return;
        }
        try {
            setLoading(true);
            await BranchApi.createBranch({ ...formData, visibility: "public" });
            toast.success("Module created successfully!");
            setIsCreateModalOpen(false);
            setFormData({ name: "", description: "" });
            fetchBranches();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create module");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBranch = async (e) => {
        e.preventDefault();
        if (!isAdmin) {
            toast.error("Only administrators can update modules");
            return;
        }
        try {
            setLoading(true);
            await BranchApi.updateBranch(selectedBranch._id, { ...formData, visibility: "public" });
            toast.success("Module updated successfully!");
            setIsEditModalOpen(false);
            fetchBranches();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update module");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBranch = async (e) => {
        e.preventDefault();
        if (!isAdmin) {
            toast.error("Only administrators can delete modules");
            return;
        }
        if (deleteConfirmation !== selectedBranch.name) {
            toast.error("Module name confirmation mismatch");
            return;
        }
        try {
            setLoading(true);
            await BranchApi.deleteBranch(selectedBranch._id, deleteConfirmation);
            toast.success("Module permanently deleted");
            setIsDeleteModalOpen(false);
            setDeleteConfirmation("");
            fetchBranches();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete module");
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (e, branch) => {
        e.stopPropagation();
        setSelectedBranch(branch);
        setFormData({
            name: branch.name,
            description: branch.description || ""
        });
        setModalTab('code');
        setIsEditModalOpen(true);
    };

    const openDeleteModal = async (e, branch) => {
        e.stopPropagation();
        setSelectedBranch(branch);
        setDeleteConfirmation("");
        setIsDeleteModalOpen(true);
        try {
            const res = await BranchApi.getBranchStats(branch._id);
            setBranchStats(res.data?.data || { projectCount: 0, taskCount: 0 });
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const filteredBranches = (branches || []).filter(b =>
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-slate-950 overflow-y-auto custom-scrollbar w-full transition-colors duration-200">
            {/* Top Product Header */}
            <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-6 sm:px-10 py-7 transition-colors">
                <div className="max-w-[1360px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1.5">
                            <img src="/momentum_logo.svg" alt="Sarthi" className="w-6 h-6 object-contain" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-primary">
                                Sarthi Learning Environments
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-xs font-bold px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200/60 dark:border-slate-700">
                                {branches?.length || 0} Tracks Active
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Your Structured Technical Workspace
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-1 max-w-2xl leading-relaxed">
                            Select a dedicated learning environment to enter its workspace. Deconstruct algorithmic patterns, master low-level system design, and retain mastery with daily spaced revision.
                        </p>
                    </div>

                    {/* Search & Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="relative w-56 sm:w-64">
                            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search tracks or modules..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-primary text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 transition-all shadow-xs"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    <IoCloseOutline size={14} />
                                </button>
                            )}
                        </div>

                        {/* Link to Public Overview */}
                        <button
                            onClick={() => navigate('/landing')}
                            className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                            title="View Public Story & Founder Vision"
                        >
                            <IoGlobeOutline size={14} />
                            <span>Public Story</span>
                        </button>

                        {/* Admin Only Create Module Button */}
                        {isAdmin && (
                            <button
                                onClick={() => {
                                    setFormData({ name: "", description: "" });
                                    setModalTab('code');
                                    setIsCreateModalOpen(true);
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primaryHover text-white font-bold rounded-xl shadow-xs transition-all text-xs whitespace-nowrap cursor-pointer active:scale-95"
                            >
                                <IoAdd size={16} />
                                <span>Create Module</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="px-6 sm:px-10 py-8 flex-1">
                <div className="max-w-[1360px] mx-auto space-y-12">
                    {/* SECTION 1: CORE MODULES */}
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                                    Learning Environments
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                                    Select a structured track to enter your active workspace.
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <SarathiLoader message="Loading learning tracks..." size="md" />
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredBranches.map((module) => {
                                    const hasPamphlet = module.description && module.description.trim().length > 0;
                                    const isDsa = isDsaBranch(module);
                                    const isLld = isLldBranch(module);

                                    return (
                                        <div
                                            key={module._id}
                                            className="bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-sm hover:shadow-lg border border-slate-200/90 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between relative group"
                                        >
                                            <div>
                                                {/* Top Row: Track Icon & Admin Actions */}
                                                <div className="flex items-center justify-between mb-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center shadow-xs font-bold text-xl group-hover:bg-primary group-hover:text-white transition-colors">
                                                            {module.logo ? (
                                                                <img src={module.logo} alt={module.name} className="w-full h-full object-cover rounded-2xl" />
                                                            ) : isDsa ? (
                                                                <IoCodeSlashOutline size={22} />
                                                            ) : isLld ? (
                                                                <IoLayersOutline size={22} />
                                                            ) : (
                                                                <span>{module.name.charAt(0).toUpperCase()}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                                {isDsa ? "Algorithmic Track" : isLld ? "System Architecture" : "Module Environment"}
                                                            </span>
                                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-primary transition-colors">
                                                                {isDsa ? "Data Structures & Algorithms (DSA)" : isLld ? "Low-Level Design & Systems (LLD)" : module.name}
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    {/* Admin Quick Actions */}
                                                    {isAdmin && (
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                            <button
                                                                onClick={(e) => openEditModal(e, module)}
                                                                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                                                                title="Edit Module"
                                                            >
                                                                <IoPencilOutline size={13} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => openDeleteModal(e, module)}
                                                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                                                                title="Delete Module"
                                                            >
                                                                <IoTrashOutline size={13} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Narrative Purpose Statement */}
                                                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mt-2">
                                                    {isDsa 
                                                        ? "Systematic pattern recognition, algorithmic problem solving, and in-browser Monaco IDE execution with curated company sheets."
                                                        : isLld
                                                        ? "Master Object-Oriented Design, architectural patterns, and real machine coding drills across 5 phased curriculum milestones."
                                                        : (module.description ? module.description.replace(/<[^>]*>?/gm, '').slice(0, 120) + "..." : "Dedicated learning environment with interactive task boards and tracking.")
                                                    }
                                                </p>

                                                {/* Real Highlights / Features */}
                                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                                    {isDsa && (
                                                        <>
                                                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-lg">
                                                                Pattern Trees
                                                            </span>
                                                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-lg">
                                                                Monaco Code Editor
                                                            </span>
                                                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-lg">
                                                                Company Question Kits
                                                            </span>
                                                        </>
                                                    )}
                                                    {isLld && (
                                                        <>
                                                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-lg">
                                                                5 Curriculum Phases
                                                            </span>
                                                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-lg">
                                                                Level A/B/C Drills
                                                            </span>
                                                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-lg">
                                                                Action Verbs (Build, Refactor)
                                                            </span>
                                                        </>
                                                    )}
                                                    {!isDsa && !isLld && (
                                                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-lg">
                                                            Interactive Workspace
                                                        </span>
                                                    )}

                                                    {hasPamphlet && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPamphletModalModule(module);
                                                            }}
                                                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                                        >
                                                            <IoDocumentTextOutline size={13} className="text-slate-600 dark:text-slate-400" />
                                                            <span>Prerequisites Guide</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Bottom Action Row */}
                                            <div className="pt-5 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                <div className="text-xs">
                                                    <span className="text-slate-400 dark:text-slate-500 font-medium">Status: </span>
                                                    <span className="text-slate-900 dark:text-slate-100 font-bold">
                                                        {isDsa ? "System Ready" : isLld ? "Curriculum Active" : "Operational"}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => handleModuleClick(module)}
                                                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-primary dark:hover:bg-primaryHover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                                                >
                                                    <span>Enter Workspace</span>
                                                    <IoArrowForwardOutline size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Admin "Add New Module" Card */}
                                {isAdmin && (
                                    <div
                                        onClick={() => {
                                            setFormData({ name: "", description: "" });
                                            setModalTab('code');
                                            setIsCreateModalOpen(true);
                                        }}
                                        className="bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-xs border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-800 dark:hover:border-slate-600 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-900 dark:group-hover:bg-primary group-hover:text-white flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors shadow-2xs">
                                                <IoAdd size={22} />
                                            </div>
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-bold uppercase">
                                                Admin Action
                                            </span>
                                        </div>

                                        <div className="my-4">
                                            <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
                                                Create New Module
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                                Establish a dedicated custom workspace with HTML/CSS prerequisites guide for new curricula.
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <span className="text-xs text-slate-400 font-medium">Click to configure</span>
                                            <button className="px-5 py-2.5 bg-slate-900 dark:bg-primary text-white text-xs font-bold rounded-xl cursor-pointer">
                                                Create Track
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: PREPARATION TOOLKIT */}
                    <div>
                        <div className="mb-4">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                                Preparation Toolkit
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                                Quick access to Sarthi's integrated practice utilities.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div 
                                onClick={() => navigate('/focus-timer')}
                                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between cursor-pointer group shadow-2xs"
                            >
                                <div>
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 mb-3 group-hover:text-primary transition-colors">
                                        <IoTimeOutline size={18} />
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Focus Timer</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                        Deep work blocks with automatic session logging and extension recovery.
                                    </p>
                                </div>
                                <span className="text-[11px] font-bold text-primary flex items-center gap-1 mt-4">
                                    Launch Timer →
                                </span>
                            </div>

                            <div 
                                onClick={() => navigate('/revision')}
                                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between cursor-pointer group shadow-2xs"
                            >
                                <div>
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 mb-3 group-hover:text-primary transition-colors">
                                        <IoSyncOutline size={18} />
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Revision Protocol</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                        Spaced retrieval algorithm preventing algorithmic concept decay.
                                    </p>
                                </div>
                                <span className="text-[11px] font-bold text-primary flex items-center gap-1 mt-4">
                                    Open Revision →
                                </span>
                            </div>

                            <div 
                                onClick={() => navigate('/arenas')}
                                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between cursor-pointer group shadow-2xs"
                            >
                                <div>
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 mb-3 group-hover:text-primary transition-colors">
                                        <IoBriefcaseOutline size={18} />
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Milestone Arenas</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                        Kanban, Spreadsheet, Timeline, and Sprint milestone boards.
                                    </p>
                                </div>
                                <span className="text-[11px] font-bold text-primary flex items-center gap-1 mt-4">
                                    Browse Arenas →
                                </span>
                            </div>

                            {isAdmin ? (
                                <div 
                                    onClick={() => navigate('/dsa-management/problems')}
                                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between cursor-pointer group shadow-2xs"
                                >
                                    <div>
                                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 mb-3 group-hover:text-primary transition-colors">
                                            <IoCodeSlashOutline size={18} />
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">DSA Studio</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                            Curated problems categorized by companies, topics, and patterns.
                                        </p>
                                    </div>
                                    <span className="text-[11px] font-bold text-primary flex items-center gap-1 mt-4">
                                        Explore Studio →
                                    </span>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => navigate('/companies')}
                                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between cursor-pointer group shadow-2xs"
                                >
                                    <div>
                                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 mb-3 group-hover:text-primary transition-colors">
                                            <IoBriefcaseOutline size={18} />
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Company Questions</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                            Explore interview questions tagged by target tech employers.
                                        </p>
                                    </div>
                                    <span className="text-[11px] font-bold text-primary flex items-center gap-1 mt-4">
                                        Explore Companies →
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION 3: METHODOLOGY FLOW */}
                    <div className="p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 transition-colors">
                        <div className="mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                The Sarthi System
                            </span>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                                Learn → Practice → Revise → Master
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-600 dark:text-slate-400">
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                                <strong className="text-slate-900 dark:text-white block mb-1">01 Learn</strong>
                                Deconstruct foundational concepts and pattern blueprints from structured curriculum phases.
                            </div>
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                                <strong className="text-slate-900 dark:text-white block mb-1">02 Practice</strong>
                                Implement solutions in the in-browser IDE or machine coding canvases with test case verification.
                            </div>
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                                <strong className="text-slate-900 dark:text-white block mb-1">03 Revise</strong>
                                Reinforce algorithmic patterns with the mandatory daily spaced repetition protocol.
                            </div>
                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                                <strong className="text-slate-900 dark:text-white block mb-1">04 Master</strong>
                                Measure execution velocity with the Focus Timer and Sprint Arenas for interview readiness.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PAMPHLET SHOWCASE MODAL WITH FULL HTML & CSS RENDERING */}
            <AnimatePresence>
                {pamphletModalModule && (
                    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setPamphletModalModule(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
                        ></motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 10 }}
                            className="relative bg-white rounded-[1.75rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 z-10 my-auto"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                                        {pamphletModalModule.logo ? (
                                            <img src={pamphletModalModule.logo} alt={pamphletModalModule.name} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <span>{pamphletModalModule.name.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">
                                            {pamphletModalModule.name} — Prerequisites Guide
                                        </h2>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setPamphletModalModule(null)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-200/60 cursor-pointer"
                                >
                                    <IoCloseOutline size={20} />
                                </button>
                            </div>

                            {/* Modal Body: High Fidelity HTML/CSS Iframe Renderer */}
                            <div className="p-4 flex-1 bg-slate-100 overflow-hidden flex flex-col min-h-0">
                                <PamphletFrame
                                    htmlContent={pamphletModalModule.description}
                                    className="w-full flex-1 min-h-[380px] h-full rounded-xl shadow-inner"
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4 shrink-0">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={dontShowAgain}
                                        onChange={(e) => setDontShowAgain(e.target.checked)}
                                        className="w-4 h-4 rounded text-black focus:ring-black border-slate-300 cursor-pointer"
                                    />
                                    <span className="text-xs text-slate-600 font-medium">
                                        Don't show prerequisites automatically on entry
                                    </span>
                                </label>

                                <button
                                    type="button"
                                    onClick={handleConfirmPamphletEntry}
                                    className="px-6 py-2.5 bg-black hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 text-xs cursor-pointer active:scale-95 z-20"
                                >
                                    <span>Enter Module</span>
                                    <IoArrowForwardOutline size={14} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CREATE / EDIT MODULE MODAL (ADMIN ONLY) */}
            <AnimatePresence>
                {isAdmin && (isCreateModalOpen || isEditModalOpen) && (
                    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                setIsEditModalOpen(false);
                            }}
                            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
                        ></motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 10 }}
                            className="relative bg-white rounded-[1.75rem] shadow-xl p-6 w-full max-w-3xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col"
                        >
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setIsEditModalOpen(false);
                                }}
                                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100 z-10"
                            >
                                <IoCloseOutline size={18} />
                            </button>

                            <div className="mb-4">
                                <h2 className="text-lg font-bold text-slate-900">
                                    {isCreateModalOpen ? "Create Module" : "Edit Module"}
                                </h2>
                                <p className="text-slate-500 text-xs mt-0.5">
                                    Configure module name and HTML/CSS prerequisites guide.
                                </p>
                            </div>

                            <form onSubmit={isCreateModalOpen ? handleCreateBranch : handleUpdateBranch} className="space-y-4 flex-1 flex flex-col overflow-hidden">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Module Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-medium outline-none focus:border-black focus:ring-1 focus:ring-black/20 transition-all"
                                        placeholder="e.g. Software Development or Revision"
                                    />
                                </div>

                                {/* Description Field with Source Code / Live Pamphlet Preview Tabs */}
                                <div className="flex-1 flex flex-col min-h-0">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Module Prerequisites Content (HTML / CSS Supported)
                                        </label>
                                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() => setModalTab('code')}
                                                className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${modalTab === 'code' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                            >
                                                <IoCodeSlashOutline size={13} />
                                                <span>HTML Source</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setModalTab('preview')}
                                                className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${modalTab === 'preview' ? 'bg-black text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                            >
                                                <IoEyeOutline size={13} />
                                                <span>Live Preview</span>
                                            </button>
                                        </div>
                                    </div>

                                    {modalTab === 'code' ? (
                                        <textarea
                                            rows="10"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full flex-1 bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-xl border border-slate-800 outline-none focus:ring-1 focus:ring-slate-700 transition-all resize-none min-h-[300px]"
                                            placeholder="<!DOCTYPE html>&#10;<html>&#10;<head>&#10;  <style>h1 { color: #000; }</style>&#10;</head>&#10;<body>&#10;  <h1>Module Guide</h1>&#10;</body>&#10;</html>"
                                        />
                                    ) : (
                                        <div className="w-full flex-1 border border-slate-200 rounded-xl overflow-hidden min-h-[300px]">
                                            <PamphletFrame
                                                htmlContent={formData.description}
                                                className="w-full h-full min-h-[300px]"
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-black hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-all active:scale-98 disabled:opacity-50 text-xs cursor-pointer mt-2"
                                >
                                    {loading ? "Saving..." : (isCreateModalOpen ? "Create Module" : "Save Changes")}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DELETE CONFIRMATION MODAL (ADMIN ONLY) */}
            <AnimatePresence>
                {isAdmin && isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
                        ></motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 10 }}
                            className="relative bg-white rounded-[1.75rem] shadow-xl p-6 w-full max-w-md overflow-hidden border border-slate-200"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 shrink-0 border border-rose-100">
                                    <IoAlertCircleOutline size={24} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">Delete Module</h2>
                                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                                        This action cannot be undone. All projects and tasks in this module will be permanently removed.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleDeleteBranch} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                        Type <span className="text-rose-600 font-bold">"{selectedBranch?.name}"</span> to confirm:
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={deleteConfirmation}
                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                        className="w-full bg-white border border-rose-200 rounded-xl px-3.5 py-2.5 text-rose-600 font-semibold text-xs outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
                                        placeholder={selectedBranch?.name}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || deleteConfirmation !== selectedBranch?.name}
                                        className="flex-[2] py-2.5 bg-rose-600 text-white font-bold rounded-xl shadow-xs hover:bg-rose-700 transition-all disabled:opacity-50 text-xs cursor-pointer"
                                    >
                                        {loading ? "Deleting..." : "Confirm Deletion"}
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
