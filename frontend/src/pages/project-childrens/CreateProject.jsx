import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import InputField from "../../components/InputField";
import { LuSave, LuX, LuPlus, LuTrash2, LuUsers, LuLayoutDashboard, LuFlag } from "react-icons/lu";
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
  const [teamMembersList, setTeamMembersList] = useState([]);
  const [rolesAndResponsibilities, setRolesAndResponsibilities] = useState([
    { teamMember: "", role: "", responsibility: "" },
  ]);
  const [milestones, setMilestones] = useState([]);

  const { handleLoading } = useLoading();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.store);

  // Fetch Users for Dropdowns
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await UserApi.users();
        setTeamMembersList(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  const managerOptions = teamMembersList
    .filter(({ userRole }) => userRole?.name === "projectmanager" || userRole?.name === "admin") // Assuming admins can also be PMs
    .map(({ _id, firstName, lastName }) => ({
      value: _id,
      label: `${firstName} ${lastName}`,
    }));

  const teamOptions = teamMembersList.map(({ _id, firstName, lastName }) => ({
    value: _id,
    label: `${firstName} ${lastName}`,
  }));

  const initialValues = {
    name: "",
    key: "",
    priority: "medium",
    access: "private",
    clientName: "",
    budget: 0,
    githubRepository: "",
    status: "active",
    startDate: "",
    endDate: "",
    description: "",
    projectManager: currentUser?._id || "",
    teamMembers: currentUser?._id ? [currentUser._id] : [],
    rolesAndResponsibilities: [],
    milestones: [],
    settings: {
      enableYoutubeSearch: false,
      enableLeetCodeSearch: false,
      enableSprints: false,
      sprintDuration: 2
    }
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
            ? "Project and milestones updated successfully"
            : "Project and milestones created successfully"
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

      const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split("T")[0];
      };

      // Safely map roles to ensure teamMember is an ID
      const mappedRoles = (projectData.rolesAndResponsibilities || []).map(r => ({
          ...r,
          teamMember: r.teamMember?._id || r.teamMember || ""
      }));

      formik.setValues({
        name: projectData.name || "",
        key: projectData.key || "",
        priority: projectData.priority || "",
        access: projectData.access || "private",
        clientName: projectData.clientName || "",
        budget: projectData.budget || "",
        githubRepository: projectData.githubRepository || "",
        status: projectData.status || "active",
        startDate: formatDate(projectData.startDate),
        endDate: formatDate(projectData.endDate),
        description: projectData.description || "",
        projectManager: projectData.projectManager?._id || projectData.projectManager || currentUser?._id || "",
        teamMembers: projectData.teamMembers?.map((m) => m._id || m) || (currentUser?._id ? [currentUser._id] : []),
        rolesAndResponsibilities: mappedRoles,
        milestones: projectData.milestones || [], // Keep original objects for _id reference
        settings: projectData.settings || {
            enableYoutubeSearch: false,
            enableLeetCodeSearch: false,
            enableSprints: false,
            sprintDuration: 2
        }
      });
      setRolesAndResponsibilities(mappedRoles);
      
      // Map Milestones with formatted dates for local state (UI)
      const mappedMilestones = (projectData.milestones || []).map(m => ({
          ...m,
          commenceDate: formatDate(m.commenceDate),
          expectedDate: formatDate(m.expectedDate)
      }));
      setMilestones(mappedMilestones);
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
    <div className="min-h-screen bg-bgLight p-6 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div>
           <div className="flex items-center gap-3 text-textSub text-sm mb-2">
              <span className="cursor-pointer hover:text-primary" onClick={() => navigate('/arenas')}>Arenas</span>
              <span>/</span>
              <span className="text-textMain font-medium">{data || location.state?.project ? "Update Arena" : "New Arena"}</span>
           </div>
           <h1 className="text-3xl font-bold text-textMain flex items-center gap-3">
              <LuLayoutDashboard className="text-primary" />
              {data || location.state?.project ? "Update Arena Details" : "Create New Arena"}
           </h1>
           <p className="text-textSub mt-1">Configure arena settings and details.</p>
        </div>
        <div className="flex gap-3">
            <button
                type="button"
                onClick={() => navigate('/arenas')}
                className="px-4 py-2 border border-borderLight text-textSub rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
                <LuX /> Cancel
            </button>
            <button
                type="button"
                onClick={formik.handleSubmit}
                className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primaryHover shadow-lg shadow-primary/30 transition-all flex items-center gap-2 font-medium"
            >
                <LuSave /> {data || location.state?.project ? "Save Changes" : "Create Arena"}
            </button>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Project Details */}
        <div className="lg:col-span-2 space-y-6">
            {/* General Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-borderLight p-6">
                <h3 className="text-lg font-bold text-textMain mb-6 border-b border-borderLight pb-4">General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="Arena Name"
                        name="name"
                        type="text"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. Website Redesign"
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
                        placeholder="e.g. WEB-24"
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
                            placeholder="Describe the project goals and scope..."
                            error={formik.touched.description && formik.errors.description}
                            style="h-32"
                        />
                    </div>
                </div>
            </div>

            {/* Timeline & Budget Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-borderLight p-6">
                <h3 className="text-lg font-bold text-textMain mb-6 border-b border-borderLight pb-4">Timeline & Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="Start Date"
                        name="startDate"
                        type="date"
                        value={formik.values.startDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.startDate && formik.errors.startDate}
                        isRequired
                    />
                    <InputField
                        label="End Date"
                        name="endDate"
                        type="date"
                        value={formik.values.endDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.endDate && formik.errors.endDate}
                        isRequired
                    />
                    {false && (
                      <>
                        <InputField
                            label="Budget (Optional)"
                            name="budget"
                            type="number"
                            value={formik.values.budget}
                            onChange={formik.handleChange}
                            placeholder="0.00"
                            error={formik.touched.budget && formik.errors.budget}
                        />
                        <InputField
                            label="Client Name"
                            name="clientName"
                            type="text"
                            value={formik.values.clientName}
                            onChange={formik.handleChange}
                            placeholder="Client Company"
                            error={formik.touched.clientName && formik.errors.clientName}
                        />
                      </>
                    )}
                </div>
            </div>

            {/* Milestones Card */}
            {/* Milestones Card Hidden */}
            {false && (
                <div className="bg-white rounded-2xl shadow-sm border border-borderLight p-6">
                    {/* Hiding Milestones content to retain code */}
                </div>
            )}
            
            {/* Roles & Responsibilities Card Hidden */}
            {false && (
                <div className="bg-white rounded-2xl shadow-sm border border-borderLight p-6">
                    {/* Hiding Roles & Responsibilities content to retain code */}
                </div>
            )}
        </div>


        {/* Right Column: Settings & Team */}
        <div className="space-y-6">
            {/* Settings Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-borderLight p-6">
                <h3 className="text-lg font-bold text-textMain mb-6 border-b border-borderLight pb-4">Settings</h3>
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
                            { value: 'closed', label: 'Closed' }
                        ]}
                        isRequired
                    />
                    <InputField
                        label="Priority"
                        name="priority"
                        type="select"
                        value={formik.values.priority}
                        onChange={formik.handleChange}
                        options={[
                            { value: 'high', label: 'High' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'low', label: 'Low' }
                        ]}
                        isRequired
                    />
                    {false && (
                        <InputField
                            label="Access Level"
                            name="access"
                            type="select"
                            value={formik.values.access}
                            onChange={formik.handleChange}
                            options={[
                                { value: 'private', label: 'Private (Team Only)' },
                                { value: 'public', label: 'Public (Organization)' }
                            ]}
                            isRequired
                        />
                    )}
                    <InputField
                        label="Repository URL"
                        name="githubRepository"
                        type="text"
                        value={formik.values.githubRepository}
                        onChange={formik.handleChange}
                        placeholder="GitHub / GitLab URL"
                    />
                    
                    {/* Quick Actions Settings */}
                    <div className="pt-4 border-t border-borderLight space-y-4">
                        <h4 className="text-xs font-bold text-textSub uppercase tracking-wider">Quick Actions</h4>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-borderLight/50">
                            <span className="text-sm font-medium text-textMain">YouTube Search</span>
                            <input 
                                type="checkbox"
                                name="settings.enableYoutubeSearch"
                                checked={formik.values.settings.enableYoutubeSearch}
                                onChange={formik.handleChange}
                                className="w-4 h-4 text-primary rounded border-borderLight focus:ring-primary"
                            />
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-borderLight/50">
                            <span className="text-sm font-medium text-textMain">LeetCode Search</span>
                            <input 
                                type="checkbox"
                                name="settings.enableLeetCodeSearch"
                                checked={formik.values.settings.enableLeetCodeSearch}
                                onChange={formik.handleChange}
                                className="w-4 h-4 text-primary rounded border-borderLight focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Assignment Card Hidden */}
            {false && (
                <div className="bg-white rounded-2xl shadow-sm border border-borderLight p-6">
                    {/* Hiding Team Formation content to retain code */}
                </div>
            )}
        </div>

      </form>
    </div>
  );
};

export default CreateProject;
