import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import InputField from "../../components/InputField";
import { LuSave, LuX, LuLayoutDashboard } from "react-icons/lu";
import { useLoading } from "../../components/loader/LoaderContext";
import { ProjectApi } from "../../services/api/Project.api";
import { UserApi } from "../../services/api/user.api";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

const CreateProject = ({
  data,
  isUpdating,
  id,
  setIsUpdating,
  setProjectData,
}) => {
  const { handleLoading } = useLoading();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.store);

  const initialValues = {
    name: "",
    key: "",
    access: "private",
    status: "active",
    description: "",
    projectManager: currentUser?._id || "",
    teamMembers: currentUser?._id ? [currentUser._id] : [],
    rolesAndResponsibilities: [],
    milestones: []
  };

  const formik = useFormik({
    initialValues,
    onSubmit: async (values) => {
      handleLoading(true);
      try {
        const { milestones, ...projectPayload } = values;
        
        if (!projectPayload.projectManager && currentUser?._id) {
            projectPayload.projectManager = currentUser._id;
        }
        if ((!projectPayload.teamMembers || projectPayload.teamMembers.length === 0) && currentUser?._id) {
            projectPayload.teamMembers = [currentUser._id];
        }
        
        const projectId = id || location.state?.project?._id;
        const isUpdateMode = isUpdating || !!projectId;

        let res;
        if (isUpdateMode) {
          res = await ProjectApi.updateProject(projectId, projectPayload);
        } else {
          res = await ProjectApi.createProject(projectPayload);
        }

        const activeProjectId = isUpdateMode ? projectId : res.data?.data?._id; // Adjust based on actual API response

        // Handle Milestones
        if (milestones && milestones.length > 0 && activeProjectId) {
            await Promise.all(milestones.map(async (m) => {
                // Format payload for milestone
                const milestonePayload = {
                    projectId: activeProjectId,
                    milestoneName: m.milestoneName,
                    summary: m.summary,
                    deliverables: m.deliverables,
                    commenceDate: m.commenceDate,
                    expectedDate: m.expectedDate
                };

                if (m._id) {
                    // Update existing milestone
                    return ProjectApi.updateMileStones(m._id, milestonePayload);
                } else {
                    // Create new milestone
                    return ProjectApi.createMileStone(activeProjectId, milestonePayload);
                }
            }));
        }

        toast.success(
          isUpdateMode
            ? "Arena updated successfully"
            : "Arena created successfully"
        );
        
        // Dispatch event for Sidebar to refresh
        window.dispatchEvent(new Event('projectCreated'));

        if (setIsUpdating) {
            setIsUpdating(false);
            if (setProjectData) setProjectData();
        } else {
            navigate("/arenas");
        }
        formik.resetForm();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "An error occurred");
      } finally {
        handleLoading(false);
      }
    },
  });

  // Populate Data for Edit Mode
  useEffect(() => {
    const projectData = data || location.state?.project;
    
    if (projectData) {
      if(setIsUpdating) setIsUpdating(true);

      formik.setValues({
        name: projectData.name || "",
        key: projectData.key || "",
        access: projectData.access || "private",
        status: projectData.status || "active",
        description: projectData.description || "",
        projectManager: projectData.projectManager?._id || projectData.projectManager || currentUser?._id || "",
        teamMembers: projectData.teamMembers?.map((m) => m._id || m) || (currentUser?._id ? [currentUser._id] : []),
        rolesAndResponsibilities: [],
        milestones: []
      });
    }
  }, [data, location.state]);

  // Roles Logic
  const handleAddRow = () => {
    const newRoles = [...rolesAndResponsibilities, { teamMember: "", role: "", responsibility: "" }];
    setRolesAndResponsibilities(newRoles);
    formik.setFieldValue("rolesAndResponsibilities", newRoles);
  };

  const handleRemoveRow = (index) => {
    const updated = [...rolesAndResponsibilities];
    updated.splice(index, 1);
    setRolesAndResponsibilities(updated);
    formik.setFieldValue("rolesAndResponsibilities", updated);
  };

  const handleRoleChange = (e, index, field) => {
    const updated = [...rolesAndResponsibilities];
    const val = e.target ? e.target.value : e; 
    
    updated[index][field] = val;

    setRolesAndResponsibilities(updated);
    formik.setFieldValue("rolesAndResponsibilities", updated);
  };

  // Milestones Logic
  const handleAddMilestone = () => {
      const newMilestones = [...milestones, { milestoneName: "", commenceDate: "", expectedDate: "", deliverables: "", summary: "" }];
      setMilestones(newMilestones);
      formik.setFieldValue("milestones", newMilestones);
  };

  const handleRemoveMilestone = (index) => {
      const updated = [...milestones];
      updated.splice(index, 1);
      setMilestones(updated);
      formik.setFieldValue("milestones", updated);
  };

  const handleMilestoneChange = (val, index, field) => {
      const updated = [...milestones];
      updated[index][field] = val;
      setMilestones(updated);
      formik.setFieldValue("milestones", updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 pb-20 transition-colors duration-200">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div>
           <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm mb-2">
              <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/arenas')}>Arenas</span>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-medium">{data || location.state?.project ? "Update Arena" : "New Arena"}</span>
           </div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <LuLayoutDashboard className="text-primary" />
              {data || location.state?.project ? "Update Arena Details" : "Create New Arena"}
           </h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Configure arena settings and operational details.</p>
        </div>
        <div className="flex gap-3">
            <button
                type="button"
                onClick={() => navigate('/arenas')}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 font-medium text-sm"
            >
                <LuX /> Cancel
            </button>
            <button
                type="button"
                onClick={formik.handleSubmit}
                className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primaryHover shadow-lg shadow-primary/30 transition-all flex items-center gap-2 font-medium text-sm"
            >
                <LuSave /> {data || location.state?.project ? "Save Changes" : "Create Arena"}
            </button>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: General Info */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-6 transition-colors">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="Arena Name"
                        name="name"
                        type="text"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. DSA phase 1"
                        error={formik.touched.name && formik.errors.name}
                        isRequired
                    />
                    <InputField
                        label="Arena Key"
                        name="key"
                        type="text"
                        value={formik.values.key}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. DSA"
                        error={formik.touched.key && formik.errors.key}
                        isRequired
                    />
                    <div className="md:col-span-2">
                        <InputField
                            label="Description"
                            name="description"
                            type="textarea"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Describe the arena objectives, problem sets, and scope..."
                            error={formik.touched.description && formik.errors.description}
                            style="h-32"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Settings */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-6 transition-colors">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Settings</h3>
                <div className="space-y-4">
                    <InputField
                        label="Status"
                        name="status"
                        type="select"
                        value={formik.values.status}
                        onChange={formik.handleChange}
                        options={[
                            { value: 'active', label: 'Active' },
                            { value: 'hold', label: 'On Hold' },
                            { value: 'completed', label: 'Completed' },
                            { value: 'closed', label: 'Closed' },
                            { value: 'hide', label: 'Hidden (Admin Only)' }
                        ]}
                        isRequired
                    />
                </div>
            </div>
        </div>

      </form>
    </div>
  );
};

export default CreateProject;
