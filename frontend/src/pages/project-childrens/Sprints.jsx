import React, { useCallback, useEffect, useState } from "react";
import InputField from "../../components/InputField";
import { Table } from "../../components/Table/Table";
import { MdDelete, MdAdd } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { IoAdd, IoAnalyticsOutline } from "react-icons/io5";
import moment from "moment/moment";
import { SprintApi } from "../../services/api/Sprint.api";
import { TaskApi } from "../../services/api/Task.api";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import Board from "../task-childrens/Board";
import { useSelector } from "react-redux";

const ActiveSprintBoard = ({ projectId, sprints, onSprintChange, selectedSprintId }) => {
    const navigate = useNavigate();
    const activeSprints = sprints.filter(s => s.status === 'active');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSprint, setActiveSprint] = useState(null);

    useEffect(() => {
        const fetchSprintData = async () => {
            if (!projectId) return;
            setLoading(true);
            try {
                // Determine which sprint to show
                const currentSprint = selectedSprintId 
                    ? sprints.find(s => s._id === selectedSprintId)
                    : activeSprints[0];
                
                setActiveSprint(currentSprint);

                if (currentSprint) {
                    const tRes = await TaskApi.getAllTasks({ filter: { projectName: projectId, sprint: currentSprint._id } });
                    setTasks(tRes.data?.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch sprint data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSprintData();
    }, [projectId, selectedSprintId, sprints]);

    if (loading) return <div className="p-10 text-center text-textSub">Loading sprint data...</div>;
    
    if (!activeSprint && activeSprints.length === 0) return (
        <div className="p-10 text-center border-2 border-dashed border-borderLight rounded-xl">
            <h3 className="text-xl font-bold text-textMain">No Active Sprints</h3>
            <p className="text-textSub mt-2">Start a sprint from the "Manage Sprints" tab to see it here.</p>
        </div>
    );

    // Calculate Velocity/Progress
    const totalPoints = tasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
    const completedPoints = tasks
        .filter(t => t.status === 'done')
        .reduce((acc, t) => acc + (t.storyPoints || 0), 0);
    const progress = totalPoints ? Math.round((completedPoints / totalPoints) * 100) : 0;

    const handleCreateTask = () => {
        navigate(`/task/create-task?projectId=${projectId}&sprintId=${activeSprint._id}`);
    };

    return (
        <div className="space-y-6">
            {/* Header / Stats */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-borderLight space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        {activeSprints.length > 1 ? (
                            <select 
                                value={activeSprint?._id || ""} 
                                onChange={(e) => onSprintChange(e.target.value)}
                                className="w-[20rem] text-2xl font-bold text-textMain bg-transparent border-b-2 border-primary focus:outline-none py-1"
                            >
                                <option value="">Select Sprint</option>
                                {activeSprints.map(s => (
                                    <option key={s._id} value={s._id}>{s.name}</option>
                                ))}
                            </select>
                        ) : (
                            <h2 className="text-2xl font-bold text-textMain flex items-center gap-3">
                                {activeSprint?.name}
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full uppercase tracking-wider">Active</span>
                            </h2>
                        )}
                    </div>
                    
                    <button 
                        onClick={handleCreateTask}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                    >
                        <IoAdd size={18} /> Create Task
                    </button>
                </div>

                {activeSprint && (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4 border-t border-borderLight">
                        <div>
                            <p className="text-sm text-textSub">
                                {moment(activeSprint.startDate).format("MMM D")} - {moment(activeSprint.endDate).format("MMM D, YYYY")}
                                <span className="mx-2">•</span>
                                {activeSprint.goal || "No Goal Set"}
                            </p>
                        </div>
                        
                        <div className="flex gap-8">
                            <div className="text-center">
                                <p className="text-xs text-textSub uppercase font-bold">Time Left</p>
                                <p className="text-xl font-bold text-textMain">
                                    {moment(activeSprint.endDate).diff(moment(), 'days') > 0 
                                        ? `${moment(activeSprint.endDate).diff(moment(), 'days')} Days` 
                                        : "Ended"}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-textSub uppercase font-bold">Velocity</p>
                                <p className="text-xl font-bold text-primary">{totalPoints} pts</p>
                            </div>
                            <div className="text-center min-w-[100px]">
                                <p className="text-xs text-textSub uppercase font-bold mb-1">Progress</p>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                                </div>
                                <p className="text-xs text-right mt-1 font-bold">{progress}%</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Board */}
            <div className="flex-1 overflow-x-auto pb-4">
                 <Board 
                    tasks={tasks} 
                    setTasks={setTasks} 
                    selectedProject={projectId} 
                    sprintStarted={activeSprint ? new Date() >= new Date(activeSprint.startDate) : false}
                 />
            </div>
        </div>
    );
};


const ReportModal = ({ isOpen, onClose, sprintId }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && sprintId) {
            const fetchReport = async () => {
                setLoading(true);
                try {
                    const res = await SprintApi.getSprintReport(sprintId);
                    setReport(res.data?.data);
                } catch (error) {
                    console.error("Failed to fetch sprint report", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchReport();
        }
    }, [isOpen, sprintId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col scale-in-center transition-all duration-300">
                <div className="p-6 border-b border-borderLight flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-bold text-textMain">{report?.sprint?.name} Performance Report</h2>
                        <p className="text-sm text-textSub">{moment(report?.sprint?.dates?.start).format("MMM D")} - {moment(report?.sprint?.dates?.end).format("MMM D, YYYY")}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-textSub">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-xs text-blue-600 font-bold uppercase">Tasks</p>
                                    <p className="text-2xl font-bold text-blue-900">{report?.stats?.completedTasks} / {report?.stats?.totalTasks}</p>
                                    <p className="text-sm text-blue-700">{report?.stats?.completionPercentage}% Done</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                    <p className="text-xs text-green-600 font-bold uppercase">Points</p>
                                    <p className="text-2xl font-bold text-green-900">{report?.stats?.completedStoryPoints} / {report?.stats?.totalStoryPoints}</p>
                                    <p className="text-sm text-green-700">{report?.stats?.burnDownPercentage}% Burndown</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                    <p className="text-xs text-purple-600 font-bold uppercase">Backlog</p>
                                    <p className="text-2xl font-bold text-purple-900">{report?.backlog?.length}</p>
                                    <p className="text-sm text-purple-700">Tasks carried over</p>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                    <p className="text-xs text-amber-600 font-bold uppercase">Health</p>
                                    <p className="text-2xl font-bold text-amber-900">{report?.stats?.completionPercentage > 80 ? "Great" : "Needs Attention"}</p>
                                    <p className="text-sm text-amber-700">Sprint overall state</p>
                                </div>
                            </div>

                            {/* Performance Table */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <IoAnalyticsOutline /> Employee Performance
                                </h3>
                                <div className="overflow-x-auto border border-borderLight rounded-xl">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="p-3">Employee</th>
                                                <th className="p-3">Assigned</th>
                                                <th className="p-3">Completed</th>
                                                <th className="p-3">Points</th>
                                                <th className="p-3">Active (Mins)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report?.userPerformance?.map(user => (
                                                <tr key={user.id} className="border-b last:border-none">
                                                    <td className="p-3 font-medium">{user.name}</td>
                                                    <td className="p-3">{user.tasksAssigned}</td>
                                                    <td className="p-3">{user.tasksCompleted}</td>
                                                    <td className="p-3 font-bold text-primary">{user.totalPointsCompleted}</td>
                                                    <td className="p-3 text-textSub">{user.totalInProgressMinutes}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Rankings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-5 rounded-xl border border-borderLight shadow-sm">
                                    <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">🏆 Top Contributors</h4>
                                    <div className="space-y-3">
                                        {report?.topPerformers?.map((u, i) => (
                                            <div key={u.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-none">
                                                <span>{i+1}. {u.name}</span>
                                                <span className="font-bold">{u.totalPointsCompleted} pts</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-xl border border-borderLight shadow-sm">
                                    <h4 className="font-bold text-amber-700 mb-3 flex items-center gap-2">⚠️ High Backlog</h4>
                                    <div className="space-y-3">
                                        {report?.lowerPerformers?.map((u, i) => (
                                            <div key={u.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-none">
                                                <span>{i+1}. {u.name}</span>
                                                <span className="text-textSub">{u.tasksAssigned - u.tasksCompleted} pending</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                
                <div className="p-4 bg-gray-50 border-t flex justify-end">
                    <button onClick={onClose} className="bg-white border border-borderLight px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors">Close Report</button>
                </div>
            </div>
        </div>
    );
};


const SprintManagement = ({ projectId, sprints, fetchSprints }) => {
    const [editingId, setEditingId] = useState(null);
    const [reportSprintId, setReportSprintId] = useState(null);
  
    const validationSchema = Yup.object({
      name: Yup.string().required("Sprint Name is required"),
      startDate: Yup.date().required("Start Date is required"),
      endDate: Yup.date().required("End Date is required")
        .min(Yup.ref('startDate'), "End Date must be after Start Date"),
      status: Yup.string().required("Status is required")
    });
  
    const formik = useFormik({
        initialValues: {
            name: "",
            goal: "",
            startDate: "",
            endDate: "",
            status: "planned"
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
               if (editingId) {
                   await SprintApi.updateSprint(editingId, values);
                   toast.success("Sprint updated successfully");
               } else {
                   await SprintApi.createSprint({ ...values, projectId });
                   toast.success("Sprint created successfully");
               }
               fetchSprints();
               resetForm();
               setEditingId(null);
            } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || (editingId ? "Failed to update sprint" : "Failed to create sprint"));
            }
        }
    });

    const handleEdit = (sprint) => {
        if (new Date() >= new Date(sprint.startDate)) {
            toast.error("Cannot edit a sprint that has already started.");
            return;
        }
        setEditingId(sprint._id);
        formik.setValues({
            name: sprint.name,
            goal: sprint.goal || "",
            startDate: moment(sprint.startDate).format("YYYY-MM-DD"),
            endDate: moment(sprint.endDate).format("YYYY-MM-DD"),
            status: sprint.status
        });
    };

    const handleDelete = async (id, startDate) => {
        if (new Date() >= new Date(startDate)) {
            toast.error("Cannot delete a sprint that has already started.");
            return;
        }
        if (window.confirm("Are you sure you want to delete this sprint?")) {
            try {
                await SprintApi.deleteSprint(id);
                toast.success("Sprint deleted successfully");
                fetchSprints();
            } catch (error) {
                toast.error("Failed to delete sprint");
            }
        }
    };
  
    const handleCancel = () => {
        setEditingId(null);
        formik.resetForm();
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
             <h2 className="text-xl font-bold mb-6">{editingId ? "Edit Sprint" : "Create Sprint"}</h2>
             <form onSubmit={formik.handleSubmit} className="space-y-6 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Name" name="name" type="text" value={formik.values.name} onChange={formik.handleChange} error={formik.touched.name && formik.errors.name} />
                    <InputField label="Start Date" name="startDate" type="date" value={formik.values.startDate} onChange={formik.handleChange} error={formik.touched.startDate && formik.errors.startDate} />
                    <InputField label="End Date" name="endDate" type="date" value={formik.values.endDate} onChange={formik.handleChange} error={formik.touched.endDate && formik.errors.endDate} />
                    <div className="md:col-span-3">
                         <InputField label="Goal" name="goal" type="textarea" value={formik.values.goal} onChange={formik.handleChange} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select name="status" value={formik.values.status} onChange={formik.handleChange} className="w-full p-2 border rounded">
                            <option value="planned">Planned</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    {editingId && <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>}
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                </div>
             </form>

             <h3 className="text-lg font-bold mb-4">All Sprints</h3>
             <div className="overflow-x-auto border border-borderLight rounded-xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 uppercase text-xs font-bold text-textSub border-b">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Dates</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sprints.map(s => (
                            <tr key={s._id} className="border-b last:border-none hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-semibold text-textMain">{s.name}</td>
                                <td className="p-4 text-xs">
                                    <span className={`px-2 text-xs py-1 rounded-full font-bold uppercase ${
                                        s.status === 'active' ? 'bg-green-100 text-green-700' : 
                                        s.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-textSub'
                                    }`}>
                                        {s.status}
                                    </span>
                                </td>
                                <td className="p-4 text-textSub">{moment(s.startDate).format("MMM D")} - {moment(s.endDate).format("MMM D")}</td>
                                <td className="p-4">
                                     <div className="flex gap-4">
                                        <button onClick={() => setReportSprintId(s._id)} className="text-primary hover:scale-110 transition-transform" title="Performance Report"><IoAnalyticsOutline size={18} /></button>
                                        <button onClick={() => handleEdit(s)} className={`text-blue-600 hover:scale-110 transition-transform ${new Date() >= new Date(s.startDate) ? 'opacity-30 cursor-not-allowed' : ''}`} title="Edit Sprint"><FaEdit size={16} /></button>
                                        <button onClick={() => handleDelete(s._id, s.startDate)} className={`text-red-600 hover:scale-110 transition-transform ${new Date() >= new Date(s.startDate) ? 'opacity-30 cursor-not-allowed' : ''}`} title="Delete Sprint"><MdDelete size={18}/></button>
                                     </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>

             <ReportModal isOpen={!!reportSprintId} onClose={() => setReportSprintId(null)} sprintId={reportSprintId} />
        </div>
    );
};

const Sprints = ({ projectId: propsProjectId }) => {
  const { projectId: paramProjectId } = useParams();
  const projectId = propsProjectId || paramProjectId;
  const [activeTab, setActiveTab] = useState('board');
  const [selectedActiveSprintId, setSelectedActiveSprintId] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { currentUser } = useSelector((state) => state.store);
  const isManager = currentUser?.userRole?.name === "projectmanager";
  const isAdmin = currentUser?.userRole?.name === "admin";
  const canManage = isManager || isAdmin;

  const fetchSprints = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
        const res = await SprintApi.getSprintsByProject(projectId);
        setSprints(res.data?.data || []);
    } catch (error) {
        console.error("Failed to fetch sprints", error);
    } finally {
        setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  if (!projectId) return <div className="p-6 text-center text-gray-500">Please select a project.</div>;

  return (
    <main className="w-full relative h-full flex flex-col">
        {/* Tabs */}
        <div className="flex items-center gap-6 px-6 pt-4 border-b border-borderLight bg-white">
            <button 
                onClick={() => setActiveTab('board')}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'board' ? 'text-primary' : 'text-textSub hover:text-textMain'}`}
            >
                Sprint Board
                {activeTab === 'board' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
            </button>
            {canManage && (
                <button 
                    onClick={() => setActiveTab('manage')}
                    className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'manage' ? 'text-primary' : 'text-textSub hover:text-textMain'}`}
                >
                    Manage Sprints
                    {activeTab === 'manage' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
                </button>
            )}
        </div>

        <div className="flex-1 overflow-auto p-6">
            {activeTab === 'board' ? (
                <ActiveSprintBoard 
                    projectId={projectId} 
                    sprints={sprints} 
                    onSprintChange={setSelectedActiveSprintId}
                    selectedSprintId={selectedActiveSprintId}
                />
            ) : (
                canManage ? <SprintManagement projectId={projectId} sprints={sprints} fetchSprints={fetchSprints} /> : <div className="text-red-500 font-bold p-10 text-center">Unauthorized Access</div>
            )}
        </div>
    </main>
  );
};

export default Sprints;
