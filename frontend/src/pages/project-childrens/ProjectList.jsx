import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ProjectApi } from '../../services/api/Project.api';
import { useNavigate } from 'react-router-dom';
import { IoAdd, IoSearchOutline, IoFlagOutline } from 'react-icons/io5';
import moment from 'moment';
import { FaEdit } from 'react-icons/fa';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import InputField from '../../components/InputField';
import ArenaConsistencyModal from '../../components/analytics/ArenaConsistencyModal';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [consistencyModalProject, setConsistencyModalProject] = useState(null);
    const { activeBranch, currentUser } = useSelector((state) => state.store);
    const navigate = useNavigate();

    const isAdmin = currentUser?.email === "balajiaadi2000@gmail.com" ||
        currentUser?.userRole?.name?.toLowerCase() === 'admin' ||
        currentUser?.role === 'admin' ||
        (currentUser?.userRoles && currentUser.userRoles.some(r => r.name?.toLowerCase() === 'admin'));

    useEffect(() => {
        if (activeBranch) {
            fetchProjects();
        }
    }, [activeBranch]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await ProjectApi.getAllProjects();
            const list = res.data?.data || [];
            list.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' }));
            setProjects(list);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase()) || 
        p.description?.toLowerCase().includes(search.toLowerCase())
    );

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProjects = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleEditProject = (project) => {
        navigate('/arenas/create-project', { state: { project } });
    };

    const openMilestoneModal = (projectId) => {
        setSelectedProjectId(projectId);
        setIsMilestoneModalOpen(true);
    };

    const closeMilestoneModal = () => {
        setIsMilestoneModalOpen(false);
        setSelectedProjectId(null);
        milestoneFormik.resetForm();
    };

    return (
        <div className="p-6 bg-bgLight dark:bg-slate-950 min-h-full flex flex-col transition-colors duration-200">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-textMain dark:text-white">Arenas</h1>
                    <p className="text-textSub dark:text-slate-400 text-sm mt-1">Manage and track all your ongoing arenas</p>
                </div>
                 <div className="flex items-center gap-3">
                     <div className="relative">
                         <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                         <input 
                             type="text" 
                             placeholder="Search arenas..." 
                             className="pl-10 pr-4 py-2 rounded-xl border border-borderLight dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-white placeholder-slate-400 w-64 transition-colors"
                             value={search}
                             onChange={(e) => setSearch(e.target.value)}
                         />
                     </div>
                     
                     {isAdmin && (
                         <button 
                             onClick={() => navigate('/arenas/create-project')}
                             className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-xl font-semibold shadow-lg shadow-primary/30 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
                         >
                             <IoAdd size={18} />
                             <span>New Arena</span>
                         </button>
                     )}
                 </div>
            </div>

            {/* Content: Clean Arena Card Grid */}
            <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-900 h-48 rounded-2xl shadow-sm border border-borderLight dark:border-slate-800 animate-pulse"></div>
                                ))
                            ) : currentProjects.length > 0 ? (
                                currentProjects.map((project) => {
                                    const isHidden = project.status === 'hide' || project.status === 'hidden';
                                    const isCompleted = project.status === 'completed';

                                    return (
                                    <div 
                                        key={project._id} 
                                        className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-borderLight dark:border-slate-800 hover:shadow-md transition-all group flex flex-col justify-between relative"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/5 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primaryLight font-black text-sm border border-primary/10 dark:border-primary/30 tracking-tighter">
                                                    {project.key || project.name.substring(0, 3).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        isCompleted 
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' 
                                                            : isHidden
                                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                                                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800'
                                                    }`}>
                                                        {isHidden ? 'Hidden' : (project.status || 'Active')}
                                                    </span>
                                                    {isCompleted && project.completedAt && (() => {
                                                        const completed = moment(project.completedAt);
                                                        const due = moment(project.endDate);
                                                        const completedStr = completed.format("DD MMM YYYY");
                                                        if (completed.isAfter(due)) {
                                                            const diffMonths = completed.diff(due, 'months', true);
                                                            const delayText = diffMonths >= 0.1 ? `+${diffMonths.toFixed(1)} mo` : `+${completed.diff(due, 'days')} d`;
                                                            return (
                                                                <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 px-2 py-0.5 rounded-md" title={`Due: ${due.format("DD MMM YYYY")}`}>
                                                                    Done: {completedStr} ({delayText})
                                                                </span>
                                                            );
                                                        } else {
                                                            return (
                                                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 px-2 py-0.5 rounded-md" title={`Due: ${due.format("DD MMM YYYY")}`}>
                                                                    Done: {completedStr} (On Time)
                                                                </span>
                                                            );
                                                        }
                                                    })()}
                                                </div>
                                            </div>
                                            <h3 className="text-base font-black text-slate-800 dark:text-white mb-1.5 line-clamp-1 pr-10">{project.name}</h3>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[3em] mb-4">
                                                {project.description ? project.description.replace(/<[^>]*>?/gm, '') : "No description provided for this protocol."}
                                            </p>
                                            
                                            {/* Progress Section */}
                                            <div className="mb-4">
                                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-tight">
                                                    <span>Phase Progress</span>
                                                    <span className="text-slate-700 dark:text-slate-300">
                                                        {project.taskStats?.percentage || 0}%
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100/50 dark:border-slate-700">
                                                    <div 
                                                        className="h-full bg-primary transition-all duration-700 ease-out"
                                                        style={{ width: `${project.taskStats?.percentage || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        {isAdmin && (
                                            <div className="absolute top-6 right-6 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10 translate-x-2 group-hover:translate-x-0">
                                                 <button 
                                                     onClick={(e) => { e.stopPropagation(); handleEditProject(project); }}
                                                     className="w-8 h-8 flex items-center justify-center text-primary bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-primary/5 transition-colors"
                                                     title="Edit Arena"
                                                 >
                                                    <FaEdit size={14} />
                                                 </button>
                                            </div>
                                        )}

                                        <div className="mt-2 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex -space-x-2.5">
                                                 {(project.teamMembers || []).slice(0, 3).map((member, idx) => (
                                                     <img 
                                                        key={idx}
                                                        src={member.profileImage || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=E34234&color=fff`}
                                                        alt={member.firstName}
                                                        className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 object-cover shadow-sm"
                                                        title={`${member.firstName} ${member.lastName}`}
                                                     />
                                                 ))}
                                                 {(project.teamMembers?.length || 0) > 3 && (
                                                     <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[9px] font-black text-slate-500 dark:text-slate-400 shadow-sm">
                                                         +{project.teamMembers.length - 3}
                                                     </div>
                                                 )}
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Timeline</span>
                                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">
                                                    {project.startDate && project.endDate 
                                                        ? `${moment(project.startDate).format("DD MMM")} - ${moment(project.endDate).format("DD MMM, YY")}`
                                                        : (project.startDate ? `Starts ${moment(project.startDate).format("DD MMM, YY")}` : 'Flexible Schedule')
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full text-center py-20 text-textSub dark:text-slate-400">
                                    <p>No arenas found. Create one to get started!</p>
                                </div>
                            )}
                        </div>
                        {/* Pagination for Grid */}
                        {!loading && totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center gap-2">
                                <button 
                                    onClick={() => paginate(currentPage - 1)} 
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 bg-white dark:bg-slate-900 border border-borderLight dark:border-slate-800 rounded-lg text-sm text-textSub dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Previous
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => paginate(i + 1)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                            currentPage === i + 1 
                                                ? 'bg-primary text-white shadow-sm' 
                                                : 'bg-white dark:bg-slate-900 border border-borderLight dark:border-slate-800 text-textSub dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => paginate(currentPage + 1)} 
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 bg-white dark:bg-slate-900 border border-borderLight dark:border-slate-800 rounded-lg text-sm text-textSub dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
            </div>
            {/* Milestone Modal */}
            {isMilestoneModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add Milestone</h2>
                            <button onClick={closeMilestoneModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                ✕
                            </button>
                        </div>
                        <form onSubmit={milestoneFormik.handleSubmit} className="space-y-4">
                            <InputField
                                label="Milestone Name"
                                name="milestoneName"
                                type="text"
                                placeholder="Enter milestone name..."
                                value={milestoneFormik.values.milestoneName}
                                onChange={milestoneFormik.handleChange}
                                onBlur={milestoneFormik.handleBlur}
                                error={milestoneFormik.touched.milestoneName && milestoneFormik.errors.milestoneName}
                                isRequired
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="Start Date"
                                    name="commenceDate"
                                    type="date"
                                    value={milestoneFormik.values.commenceDate}
                                    onChange={milestoneFormik.handleChange}
                                    onBlur={milestoneFormik.handleBlur}
                                    error={milestoneFormik.touched.commenceDate && milestoneFormik.errors.commenceDate}
                                    isRequired
                                />
                                <InputField
                                    label="End Date"
                                    name="expectedDate"
                                    type="date"
                                    value={milestoneFormik.values.expectedDate}
                                    onChange={milestoneFormik.handleChange}
                                    onBlur={milestoneFormik.handleBlur}
                                    error={milestoneFormik.touched.expectedDate && milestoneFormik.errors.expectedDate}
                                    isRequired
                                />
                            </div>
                            <InputField
                                label="Summary"
                                name="summary"
                                type="textarea"
                                placeholder="Describe the milestone..."
                                value={milestoneFormik.values.summary}
                                onChange={milestoneFormik.handleChange}
                                onBlur={milestoneFormik.handleBlur}
                                error={milestoneFormik.touched.summary && milestoneFormik.errors.summary}
                            />
                            <InputField
                                label="Deliverables (comma separated)"
                                name="deliverables"
                                type="text"
                                placeholder="e.g. Design, API, Testing"
                                value={milestoneFormik.values.deliverables}
                                onChange={milestoneFormik.handleChange}
                                onBlur={milestoneFormik.handleBlur}
                                error={milestoneFormik.touched.deliverables && milestoneFormik.errors.deliverables}
                            />
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeMilestoneModal}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover shadow-lg shadow-primary/30 transition-colors"
                                >
                                    Add Milestone
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Arena Consistency Modal */}
            <ArenaConsistencyModal
                isOpen={!!consistencyModalProject}
                onClose={() => setConsistencyModalProject(null)}
                project={consistencyModalProject}
            />
        </div>
    );
};


export default ProjectList;
