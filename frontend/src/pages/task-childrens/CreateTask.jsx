import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import InputField from "../../components/InputField";
import { taskValidationSchema } from "../../validationSchema";
import moment from "moment";
import { MdLooksOne } from "react-icons/md";
import { PiNumberThreeFill, PiNumberTwoFill } from "react-icons/pi";
import { ProjectApi } from "../../services/api/Project.api";
import { useLoading } from "../../components/loader/LoaderContext";
import { TaskApi } from "../../services/api/Task.api";
import { SprintApi } from "../../services/api/Sprint.api"; // Imported SprintApi
import toast from "react-hot-toast";
import { UserApi } from "../../services/api/user.api";
import { useSelector } from "react-redux";
import Logs from "./Logs";
import Breadcrumbs from "../../components/Breadcrumbs";
import { CommonApi } from "../../services/api/Common.api";
import { server } from "../../services/config";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmationModal from "../../components/ConfirmationModal";

// expose moment globally for legacy scripts/components that expect it
window.moment = moment; // Polyfill for any loose scripts/components

const dependencyTypes = [
  { value: "Finish-to-Start", label: "Finish-to-Start" },
  { value: "Start-to-Start", label: "Start-to-Start" },
  { value: "Finish-to-Finish", label: "Finish-to-Finish" },
  { value: "Start-to-Finish", label: "Start-to-Finish" },
];

const CreateTask = ({
  task,
  id,
  setId,
  setTask,
  setProjectTasks,
  selectedMember,
  milestoneId,
  setTaskProject,
  modalMode = false,
}) => {
  const [selectedProject, setSelectedProject] = useState("");
  const [validProjectMembers, setValidProjectMembers] = useState([]); // Array of User IDs
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { handleLoading } = useLoading();
  const { currentUser } = useSelector((state) => state.store);
  const userRole = currentUser?.userRole?.name;
  const canEditRestrictedFields = userRole === "projectmanager" || userRole === "admin" || userRole === "hr";
  const [manager, setManager] = useState(canEditRestrictedFields);

  useEffect(() => {
    setManager(canEditRestrictedFields);
  }, [userRole]);


  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state || {}; // { parentTask: { _id, name, projectId ... }, project: ... }
  const handleClose = () => {
    setId();
    setTask([]);
  };

  const breadcrumbs = [
    id
      ? { label: "My Task", handleClicked: handleClose }
      : { label: "My Task", path: "/" },
    id
      ? {
        label: "Update Task",
        path: "/",
      }
      : {
        label: "Create Task",
        path: "/task/create-task",
      },
  ];

  const [teamMembers, setTeamMembers] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([])
  const [sprints, setSprints] = useState([]); // State for sprints
  const [parentTaskOptions, setParentTaskOptions] = useState([]); // State for potential parent tasks

  const handleProjectOption = async () => {
    handleLoading(true);
    try {
      const res = await ProjectApi.getAllProjects();
      setProjects(res.data?.data);
    } catch (err) {
      console.log(err);
    }
    handleLoading(false);
  };

  const [parentTaskData, setParentTaskData] = useState(null);

  const fetchParentTaskDetails = async (parentId) => {
    if (!parentId) {
      setParentTaskData(null);
      return;
    }
    try {
      const res = await TaskApi.getTaskById(parentId);
      setParentTaskData(res.data?.data || null);
    } catch (error) {
      console.error("Failed to fetch parent task details", error);
    }
  };

  const handleTeamMemberOption = async () => {
    handleLoading(true);
    try {
      const res = await UserApi.users();
      setTeamMembers(res.data?.data);
    } catch (err) {
      console.log(err);
    }
    handleLoading(false);
  };

  const handleTaskList = async () => {
    handleLoading(true);
    try {
      const res = await TaskApi.getDependencies();
      setTasksList(res.data?.data);
    } catch (err) {
      console.log(err);
    }
    handleLoading(false);
  };

  const projectOptions = projects.map((item) => {
    return { value: item._id, label: item.name };
  });

  const teamMemberOptions = teamMembers.map((item) => {
    // Check if user is in validProjectMembers OR is the project manager (if applicable, but PM is usually in teamMembers or handled separately)
    // Actually, let's strictly check validProjectMembers if project is selected.
    // If no project selected, all are valid (or invalid? usually project is required first).
    // Assuming if no project selected, we don't enforce yet, or we enforce when project selected.

    // Check if user is valid (exists in project team or is PM)
    // We'll need to check against the *currently selected project* details.
    // Since we store validProjectMembers IDs:
    const isMember = !selectedProject || validProjectMembers.includes(item._id);

    return {
      value: item?._id,
      label: `${item?.firstName} ${" "} ${item?.lastName} ${!isMember ? "(Not in Project)" : ""}`,
      isMember: isMember,
      // For visual styling, we might need to pass this data to InputField -> ReactSelect
      // React-Select uses `data` prop in styles.
    };
  });

  const tasksOptions = tasksList.map((item) => {
    return {
      value: item?._id,
      label: item?.taskName,
    };
  });

  useEffect(() => {
    handleProjectOption();
    handleTeamMemberOption();
    handleTaskList();
  }, []);

  // Effect to update validProjectMembers whenever project or projects list changes
  useEffect(() => {
    if (selectedProject && projects.length > 0) {
      const proj = projects.find(p => p._id === selectedProject);
      if (proj) {
        const members = new Set();
        if (proj.projectManager?._id) members.add(proj.projectManager._id);
        if (proj.projectManager && typeof proj.projectManager === 'string') members.add(proj.projectManager);

        proj.teamMembers?.forEach(m => {
          if (m._id) members.add(m._id);
          else members.add(m);
        });
        proj.rolesAndResponsibilities?.forEach(r => {
          if (r.teamMember?._id) members.add(r.teamMember._id);
          else if (r.teamMember) members.add(r.teamMember);
        });
        setValidProjectMembers(Array.from(members));
      }
    } else {
      setValidProjectMembers([]);
    }
  }, [selectedProject, projects]);

  const fetchTasks = async () => {
    if (selectedProject) {
      const filter = {
        projectName: selectedProject,
        ...(selectedMember && { assignee: selectedMember }),
        ...(milestoneId && { "milestone": milestoneId })
      };
      try {
        const res = await TaskApi.getAllTasks({ filter });
        console.log("Projects Tasks", res.data);
        setProjectTasks(res.data?.data);

        // Populate parent task options from project tasks
        // Filter out current task if editing to avoid circular dependency
        const potentialParents = res.data?.data.filter(t => t._id !== id).map(t => ({
          value: t._id,
          label: t.taskName
        }));
        setParentTaskOptions(potentialParents);

      } catch (err) {
        console.log(err);
      }
    }
  };

  // Fetch sprints when project changes
  const fetchSprints = async (projectId) => {
    if (!projectId) {
      setSprints([]);
      return;
    }
    try {
      const res = await SprintApi.getSprintsByProject(projectId);
      setSprints(res.data?.data || []);
    } catch (err) {
      console.log("Error fetching sprints", err);
      setSprints([]);
    }
  };

  const formik = useFormik({
    initialValues: {
      projectName: "",
      taskName: "",
      taskDescription: "",
      taskPriority: "",
      estimatedHours: "",
      estHours: "",
      estMinutes: "",
      taskType: "",
      milestone: "",
      sprint: "", // New Field
      parentTask: "", // New Field
      attachments: null,
      additionalNotes: "",
      youtubeUrl: "",
      assignee: currentUser?._id || "",
      taskStartDate: "",
      taskDueDate: "",
      dependentTasks: [],
      dependencyType: "",
      progress: 0,
    },
    enableReinitialize: true,
    validationSchema: taskValidationSchema,
    validate: (values) => {
      const errors = {};
      if (parentTaskData) {
        const start = values.taskStartDate ? new Date(values.taskStartDate) : null;
        const due = values.taskDueDate ? new Date(values.taskDueDate) : null;
        const pStart = parentTaskData.taskStartDate ? new Date(parentTaskData.taskStartDate) : null;
        const pDue = parentTaskData.taskDueDate ? new Date(parentTaskData.taskDueDate) : null;

        if (pStart && start && start < pStart) {
          errors.taskStartDate = `Cannot be before parent start date (${moment(pStart).format("ll")})`;
        }
        if (pDue && due && due > pDue) {
          errors.taskDueDate = `Cannot be after parent due date (${moment(pDue).format("ll")})`;
        }
      }

      if (values.sprint) {
        const selectedSprint = sprints.find(s => s._id === values.sprint);
        if (selectedSprint) {
          const sEnd = selectedSprint.endDate ? new Date(selectedSprint.endDate) : null;
          const due = values.taskDueDate ? new Date(values.taskDueDate) : null;
          if (sEnd && due && due > sEnd) {
            errors.taskDueDate = `Cannot be after sprint end date (${moment(sEnd).format("ll")})`;
          }
        }
      }

      return errors;
    },
    onSubmit: async (values) => {
      handleLoading(true);
      console.log("Form Values:", values);
      const { milestone, sprint, parentTask, estHours, estMinutes, ...restValues } = values;

      // Calculate total decimal hours for storage
      const totalHours = parseFloat(estHours || 0) + (parseFloat(estMinutes || 0) / 60);

      // Construct payload dynamically
      const payload = { ...restValues, estimatedHours: totalHours };
      if (milestone) payload.milestone = milestone;
      if (sprint) payload.sprint = sprint;
      if (parentTask) payload.parentTask = parentTask;

      // Remove empty projectName to avoid ObjectId CastError
      if (!payload.projectName) {
        delete payload.projectName;
      }

      try {
        // Handle File Upload First
        let uploadedUrls = [];
        if (selectedFiles.length > 0) {
          const fileFormData = new FormData();
          selectedFiles.forEach((file) => {
            fileFormData.append("file", file);
          });
          try {
            const fileRes = await CommonApi.uploadFile(fileFormData);
            console.log("Files Upload Res:", fileRes.data);

            // Backend returns { filenames: [...] }
            const filenames = fileRes.data?.data?.filenames || [];
            if (filenames.length > 0) {
              const apiBase = server || "http://localhost:5003/api/v1";
              const newUrls = filenames.map(name => `${apiBase}/file/get-file/${name}`);
              uploadedUrls = [...uploadedUrls, ...newUrls];
            }
          } catch (fileErr) {
            console.error("Files upload failed", fileErr);
            toast.error("Files upload failed, saving task without new attachments.");
          }
        }

        payload.attachments = [...existingAttachments, ...uploadedUrls];

        const res = id
          ? await TaskApi.updateTask(id, payload)
          : await TaskApi.createTask(payload);

        toast.success(
          id ? "Task updated successfully" : "Task created successfully"
        );

        if (!id) {
          navigate(`/`);
        }
        formik.resetForm();
        setSelectedFiles([]);
        setExistingAttachments([]);

        if (id) {
          fetchTasks(); // Refresh tasks
          handleClose();
        }

        // Removed potential duplicate upload code that was here before

      } catch (err) {
        console.log(err);
        toast.error(err.response?.data?.message || "An error occurred");
      }
      handleLoading(false);
    },
  });

  const handleMilestone = async (projectId) => {
    try {
      const milestones = await ProjectApi.getAllmileStones(projectId);
      setMilestones(milestones?.data?.data?.milestones)
    }
    catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    // Only populate form from task if it's a single object (not the list array)
    // AND if we are editing (id present), ensure the task actually matches that id.
    const isEditing = !!id;
    const isCorrectTask = task && !Array.isArray(task) && (!isEditing || task._id === id);

    if (isCorrectTask) {
      const formatDate = (dateString) => {
        if (!dateString) return "";
        return moment(dateString).format("YYYY-MM-DD");
      }

      const pId = task.projectName?._id || "";
      setSelectedProject(pId);

      if (typeof setTaskProject === "function") {
        setTaskProject(pId)
      }

      const initialAttachments = task.attachments
        ? (Array.isArray(task.attachments) ? task.attachments : [task.attachments])
        : [];
      setExistingAttachments(initialAttachments.filter(f => f));
      setSelectedFiles([]);

      formik.setValues({
        projectName: pId,
        milestone: task.milestone?._id || task.milestone || "",
        sprint: task.sprint?._id || task.sprint || "",
        // Set parentTask initially, but it might be reset if options aren't ready. 
        // The fetch logic below will handle robust setting.
        parentTask: task.parentTask?._id || task.parentTask || "",
        taskName: task.taskName || "",
        taskDescription: task.taskDescription || "",
        taskPriority: task.taskPriority || "",
        estimatedHours: task.estimatedHours || 0,
        estHours: task.estimatedHours ? Math.floor(task.estimatedHours) : "",
        estMinutes: task.estimatedHours ? Math.round((task.estimatedHours % 1) * 60) : "",
        progress: task.progress || 0,
        additionalNotes: task?.additionalNotes || "",
        youtubeUrl: task?.youtubeUrl || "",
        taskType: task.taskType || "",
        attachments: task.attachments || "",
        assignee: task.assignee?._id || task.assignee || currentUser?._id || "",
        taskStartDate: formatDate(task.taskStartDate),
        taskDueDate: formatDate(task.taskDueDate),
        dependentTasks: task.dependentTasks || [],
        dependencyType: task.dependencyType || "",
      });

      if (pId) {
        handleMilestone(pId);
        fetchSprints(pId);
        // Fetch tasks for parent options
        const fetchProjectTasksForOptions = async () => {
          try {
            const res = await TaskApi.getAllTasks({ filter: { projectName: pId } });
            const potentialParents = res.data?.data.filter(t => t._id !== task._id).map(t => ({
              value: t._id,
              label: t.taskName
            }));

            console.log("DEBUG: task.parentTask", task.parentTask);
            console.log("DEBUG: potentialParents", potentialParents);

            // Robustly ensure parent task is in options if executing an edit
            if (task.parentTask) {
              const parentId = task.parentTask._id || task.parentTask;
              console.log("DEBUG: parentId extracted", parentId);

              // If parent is not in options (e.g. unlisted/archived?), add it manually if we have details
              const exists = potentialParents.some(p => p.value === parentId);
              console.log("DEBUG: exists in options?", exists);

              if (!exists && task.parentTask.taskName) {
                potentialParents.push({ value: parentId, label: task.parentTask.taskName });
              }

              // Update state options
              setParentTaskOptions(potentialParents);

              // Explicitly set value AFTER options are updated.
              // Using setTimeout to allow React to process state update (rendering options)
              setTimeout(() => {
                console.log("DEBUG: Setting parentTask to", parentId);
                formik.setFieldValue("parentTask", parentId);
              }, 0);
            } else {
              setParentTaskOptions(potentialParents);
            }

          } catch (err) { console.log(err); }
        };
        fetchProjectTasksForOptions();
      }

    } else if (locationState?.parentTask || locationState?.project || location.search) {
      console.log("CreateTask: Inheriting Context", locationState);

      // Handle URL Params (e.g. from Sprint Board "Create Task" button)
      const params = new URLSearchParams(location.search);
      const urlProject = params.get("projectId");
      const urlSprint = params.get("sprintId");

      // Handle Pre-fill from Navigation state (e.g. "Add Subtask")
      const prefillProject = urlProject || locationState.project?._id || locationState.parentTask?.projectName?._id || locationState.parentTask?.projectName || "";
      const prefillParent = locationState.parentTask?._id || "";
      const prefillSprint = urlSprint || "";

      if (prefillProject) {
        setSelectedProject(prefillProject);
        handleMilestone(prefillProject);
        fetchSprints(prefillProject);

        // Fetch tasks for parent options (async)
        const fetchProjectTasksForOptions = async () => {
          try {
            const res = await TaskApi.getAllTasks({ filter: { projectName: prefillProject } });
            const potentialParents = res.data?.data.map(t => ({
              value: t._id,
              label: t.taskName
            }));
            setParentTaskOptions(potentialParents);
          } catch (err) { console.log(err); }
        };
        fetchProjectTasksForOptions();
      }

      if (prefillParent) {
        fetchParentTaskDetails(prefillParent);
      }

      formik.setValues({
        ...formik.initialValues, // Keep defaults
        projectName: prefillProject,
        parentTask: prefillParent,
        sprint: prefillSprint,
      });
    } else if (!id) {
      // Autofill from last created task
      const fetchLastTask = async () => {
        try {
          const res = await TaskApi.getLastCreatedTask();
          const lastTask = res.data?.data;
          if (lastTask) {
            const formatDate = (dateString) => {
              if (!dateString) return "";
              const date = new Date(dateString);
              return date.toISOString().split("T")[0];
            }

            const pId = lastTask.projectName?._id || lastTask.projectName || "";
            setSelectedProject(pId);

            formik.setValues({
              ...formik.initialValues,
              projectName: pId,
              milestone: lastTask.milestone?._id || lastTask.milestone || "",
              sprint: lastTask.sprint?._id || lastTask.sprint || "",
              parentTask: lastTask.parentTask?._id || lastTask.parentTask || "",
              estimatedHours: lastTask.estimatedHours || 0,
              estHours: lastTask.estimatedHours ? Math.floor(lastTask.estimatedHours) : "",
              estMinutes: lastTask.estimatedHours ? Math.round((lastTask.estimatedHours % 1) * 60) : "",
              assignee: lastTask.assignee?._id || lastTask.assignee || "",
              taskStartDate: formatDate(lastTask.taskStartDate),
              taskDueDate: formatDate(lastTask.taskDueDate),
              taskPriority: lastTask.taskPriority || "",
              taskType: lastTask.taskType || "",
            });

            if (pId) {
              handleMilestone(pId);
              fetchSprints(pId);
              // Fetch Tasks for Parent Options
              const resTasks = await TaskApi.getAllTasks({ filter: { projectName: pId } });
              const potentialParents = resTasks.data?.data.map(t => ({
                value: t._id,
                label: t.taskName
              }));
              setParentTaskOptions(potentialParents);
            }
          }
        } catch (err) {
          console.log("Error fetching last task for autofill", err);
        }
      };
      fetchLastTask();
    }
  }, [task, location.state, location.search, id]);

  const handleProjectChange = async (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);

    formik.setFieldValue("projectName", projectId);

    // Reset dependent fields
    formik.setFieldValue("milestone", "");
    formik.setFieldValue("sprint", "");
    formik.setFieldValue("parentTask", "");

    try {
      if (projectId) {
        const milestones = await ProjectApi.getAllmileStones(projectId);
        setMilestones(milestones?.data?.data?.milestones);
        fetchSprints(projectId);

        // Fetch Tasks for Parent Options
        const res = await TaskApi.getAllTasks({ filter: { projectName: projectId } });
        const potentialParents = res.data?.data.map(t => ({
          value: t._id,
          label: t.taskName
        }));
        setParentTaskOptions(potentialParents);
      } else {
        setMilestones([]);
        setSprints([]);
        setParentTaskOptions([]);
      }
    }
    catch (err) {
      console.log(err)
    }
  };

  const handleAssigneeChange = (e) => {
    const selectedUserId = e.target.value;
    const selectedOption = teamMemberOptions.find(opt => opt.value === selectedUserId);

    if (selectedOption && !selectedOption.isMember && selectedProject) {
      setIsConfirmModalOpen(true);
      return;
    }

    // Proceed with normal change
    formik.handleChange(e);
  };

  const handleConfirmAddMember = () => {
    setIsConfirmModalOpen(false);
    navigate(`/project/${selectedProject}/settings`);
  };

  const milestoneOptions = milestones.map((item) => {
    return { value: item?._id, label: item.milestoneName };
  });

  const sprintOptions = sprints.map((item) => {
    return { value: item._id, label: `${item.name} (${item.status})` };
  });


  const handleFileChange = (event) => {
    const files = Array.from(event.currentTarget.files);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  return (
    <main className="flex flex-col min-h-screen">
      {/* update logic here */}
      <div className={`flex-1 p-6 dark:text-themeText overflow-y-auto pb-72 w-full`}>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-themeText mb-6 text-center md:text-left">
          {id ? "Update New Task" : "Create New Task"}
        </h2>

        <div className={`max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-6 items-start ${id ? 'h-[calc(100vh-40vh)] overflow-auto pr-[2rem]' : ''} `}>
          {/* Left: Form */}
          <div className="w-full md:flex-1">
            <div className="bg-white dark:bg-themeBG rounded-2xl shadow-md p-6">
              <div className="mb-6 w-full">
                <InputField
                  label="Arena"
                  name="projectName"
                  type="select"
                  value={selectedProject}
                  onChange={handleProjectChange}
                  options={projectOptions}
                  error={formik.touched.projectName && formik.errors.projectName}
                />
              </div>

              <form id="create-task-form" onSubmit={formik.handleSubmit} className="w-full">
                {/* Task Details Section */}
                <div className="space-y-6">
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Work Name"
                        name="taskName"
                        type="text"
                        value={formik.values.taskName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter work name..."
                        error={formik.touched.taskName && formik.errors.taskName}
                        isRequired
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <InputField
                          label="Hours"
                          name="estHours"
                          type="number"
                          value={formik.values.estHours}
                          onChange={formik.handleChange}
                          readOnly={!canEditRestrictedFields && id ? true : false}
                          onBlur={() => {
                            formik.handleBlur("estHours");
                            const total = parseFloat(formik.values.estHours || 0) + (parseFloat(formik.values.estMinutes || 0) / 60);
                            formik.setFieldValue("estimatedHours", total);
                          }}
                          placeholder="Hours"
                          error={formik.touched.estHours && formik.errors.estHours}
                          isRequired
                        />
                        <InputField
                          label="Minutes"
                          name="estMinutes"
                          type="number"
                          value={formik.values.estMinutes}
                          onChange={formik.handleChange}
                          readOnly={!canEditRestrictedFields && id ? true : false}
                          onBlur={() => {
                            formik.handleBlur("estMinutes");
                            const total = parseFloat(formik.values.estHours || 0) + (parseFloat(formik.values.estMinutes || 0) / 60);
                            formik.setFieldValue("estimatedHours", total);
                          }}
                          placeholder="Mins"
                          error={formik.touched.estMinutes && formik.errors.estMinutes}
                          isRequired
                        />
                      </div>
                      {formik.touched.estimatedHours && formik.errors.estimatedHours && (
                        <div className="text-red-500 text-xs mt-[-10px] ml-1">{formik.errors.estimatedHours}</div>
                      )}
                      {false && (
                        <InputField
                          label="Progress (%)"
                          name="progress"
                          type="number"
                          value={formik.values.progress}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="0-100"
                          min="0"
                          max="100"
                          error={
                            formik.touched.progress &&
                            formik.errors.progress
                          }
                        />
                      )}

                      <div className="mb-4">
                        <label className="block text-gray-700 dark:text-themeText font-medium mb-2">
                          Attachments
                        </label>
                        <input
                          type="file"
                          name="attachments"
                          onChange={handleFileChange}
                          multiple
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:bg-slate-50 transition-colors"
                        />

                        {/* Combined Preview Tray */}
                        {(existingAttachments.length > 0 || selectedFiles.length > 0) && (
                          <div className="mt-4 border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected & Current Attachments</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Render Existing Attachments */}
                              {existingAttachments.map((fileUrl, index) => {
                                const filename = fileUrl.split('/').pop() || `Attachment ${index + 1}`;
                                const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileUrl);
                                const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${server}file/get-file/${fileUrl}`;
                                
                                return (
                                  <div key={`existing-${index}`} className="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-xl shadow-2xs group relative">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-150 shrink-0 flex items-center justify-center">
                                      {isImage ? (
                                        <img src={fullUrl} className="w-full h-full object-cover" alt={filename} />
                                      ) : (
                                        <span className="text-slate-400 text-xs font-black">FILE</span>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-slate-700 truncate" title={filename}>{filename}</p>
                                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wide">Saved attachment</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setExistingAttachments(prev => prev.filter(url => url !== fileUrl))}
                                      className="p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors mr-1 cursor-pointer"
                                      title="Remove attachment"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                );
                              })}

                              {/* Render Newly Selected Files */}
                              {selectedFiles.map((file, index) => {
                                const filename = file.name;
                                const isImage = file.type.startsWith('image/');
                                const sizeStr = file.size > 1024 * 1024 
                                  ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
                                  : `${Math.round(file.size / 1024)} KB`;
                                
                                return (
                                  <div key={`new-${index}`} className="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-xl shadow-2xs group relative">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-150 shrink-0 flex items-center justify-center">
                                      {isImage ? (
                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt={filename} />
                                      ) : (
                                        <span className="text-slate-400 text-xs font-black">FILE</span>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-slate-700 truncate" title={filename}>{filename}</p>
                                      <span className="text-[9px] font-black text-primary uppercase tracking-wide">Ready to upload • {sizeStr}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                                      className="p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors mr-1 cursor-pointer"
                                      title="Cancel attachment"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>


                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Priority"
                        name="taskPriority"
                        type="select"
                        value={formik.values.taskPriority}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        options={[
                          { value: "high", label: "High" },
                          { value: "medium", label: "Medium" },
                          { value: "low", label: "Low" },
                        ]}
                        error={
                          formik.touched.taskPriority && formik.errors.taskPriority
                        }
                        isRequired
                      />

                      <InputField
                        label="Work Type"
                        name="taskType"
                        type="select"
                        value={formik.values.taskType}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        options={[
                          { value: "Development", label: "Development" },
                          { value: "Testing", label: "Testing" },
                          { value: "Design", label: "Design" },
                          { value: "Documentation", label: "Documentation" },
                          { value: "Preparation", label: "Preparation" },
                          { value: "Other", label: "Other" },
                        ]}
                        error={formik.touched.taskType && formik.errors.taskType}
                        isRequired
                      />

                      {false && (
                        <>
                          <InputField
                            label="Select Milestone"
                            name="milestone"
                            type="select"
                            value={formik.values.milestone}
                            onChange={formik.handleChange}
                            options={milestoneOptions}
                            onBlur={formik.handleBlur}
                            placeholder="Select Milestone..."
                            error={
                              formik.touched.milestone && formik.errors.milestone
                            }

                          />

                          {/* Sprint Selector */}
                          <InputField
                            label="Select Sprint"
                            name="sprint"
                            type="select"
                            value={formik.values.sprint}
                            onChange={formik.handleChange}
                            options={sprintOptions}
                            onBlur={formik.handleBlur}
                            placeholder="Select Sprint..."
                            error={formik.touched.sprint && formik.errors.sprint}
                          />
                        </>
                      )}

                      {/* Parent Task Selector */}
                      <div className="md:col-span-1">
                        <InputField
                          label="Parent Task (Optional)"
                          name="parentTask"
                          type="select"
                          value={formik.values.parentTask}
                          onChange={(e) => {
                            formik.handleChange(e);
                            fetchParentTaskDetails(e.target.value);
                          }}
                          options={parentTaskOptions}
                          onBlur={formik.handleBlur}
                          placeholder="Select Parent Task..."
                          error={formik.touched.parentTask && formik.errors.parentTask}
                        />
                        {parentTaskData && (
                          <div className="mt-1 flex flex-col gap-1 px-3 py-2 bg-vermilion-50 border border-vermilion-100 rounded-lg shadow-inner">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Parent Constraints</p>
                            <div className="flex justify-between text-[11px] font-semibold text-textMain">
                              <span>Start: {moment(parentTaskData.taskStartDate).format("MMM DD, YYYY")}</span>
                              <span>Due: {moment(parentTaskData.taskDueDate).format("MMM DD, YYYY")}</span>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                    <InputField
                      label="Description"
                      name="taskDescription"
                      type="quill"
                      value={formik.values.taskDescription}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Provide a detailed description of the work..."
                      error={
                        formik.touched.taskDescription &&
                        formik.errors.taskDescription
                      }
                      isRequired
                    />

                  </div>

                  {/* Assignment Details Section */}
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {false && (
                        <InputField
                          label="Assignee"
                          name="assignee"
                          type="select"
                          value={formik.values.assignee}
                          onChange={handleAssigneeChange}
                          onBlur={formik.handleBlur}
                          options={teamMemberOptions}
                          error={formik.touched.assignee && formik.errors.assignee}
                          isRequired
                        />
                      )}
                      <InputField
                        label="Start Date"
                        name="taskStartDate"
                        type="date"
                        value={formik.values.taskStartDate}
                        onChange={formik.handleChange}
                        readOnly={!canEditRestrictedFields && id ? true : false}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.taskStartDate &&
                          formik.errors.taskStartDate
                        }
                        isRequired
                      />
                      <InputField
                        label="Due Date"
                        name="taskDueDate"
                        type="date"
                        value={formik.values.taskDueDate}
                        onChange={formik.handleChange}
                        readOnly={!canEditRestrictedFields && id ? true : false}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.taskDueDate &&
                          formik.errors.taskDueDate
                        }
                        isRequired
                      />
                    </div>
                    <InputField
                      label="Additional Notes"
                      name="additionalNotes"
                      type="quill"
                      value={formik.values.additionalNotes}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter specific instructions or notes..."
                    />
                    <InputField
                      label="YouTube Video URL"
                      name="youtubeUrl"
                      type="text"
                      value={formik.values.youtubeUrl}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.youtubeUrl && formik.errors.youtubeUrl}
                      placeholder="Paste YouTube video URL here (e.g. https://www.youtube.com/watch?v=...)"
                    />
                  </div>


                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
                  {id && (
                    <button
                      type="button"
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primaryHover focus:outline-none"
                      onClick={handleClose}
                    >
                      Close
                    </button>
                  )}
                  <div className="flex items-center space-x-2">
                    {!id && (
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 focus:outline-none font-medium"
                      >
                        Close
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => formik.resetForm()}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formik.isSubmitting}
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primaryHover focus:outline-none disabled:opacity-50"
                    >
                      {id ? "Update" : "Create"} Task
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Logs / Activity (sticky on desktop) */}
          <div className="w-full md:w-[36%] flex flex-col gap-4">
            <div className="bg-white dark:bg-themeBG rounded-2xl shadow-md p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-700">Summary</h4>
                  <p className="text-[11px] text-slate-500">Quick task info</p>
                </div>
                <div className="text-sm font-black px-3 py-1 bg-vermilion-50 text-primary rounded-full">{formik.values.progress}%</div>
              </div>

              <div className="space-y-3 text-sm text-slate-700">
                <div>
                  <div className="text-[11px] text-slate-500 font-bold">Parent Task</div>
                  <div className="mt-1">{parentTaskData?.taskName || (formik.values.parentTask ? parentTaskOptions.find(p => p.value === formik.values.parentTask)?.label : '—')}</div>
                </div>

                {false && (
                  <>
                    <div>
                      <div className="text-[11px] text-slate-500 font-bold">Milestone</div>
                      <div className="mt-1">{milestoneOptions.find(m => m.value === formik.values.milestone)?.label || '—'}</div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-500 font-bold">Sprint</div>
                      <div className="mt-1">{sprintOptions.find(s => s.value === formik.values.sprint)?.label || '—'}</div>
                    </div>
                  </>
                )}

                <div>
                  <div className="text-[11px] text-slate-500 font-bold">Attachments</div>
                  <div className="mt-1 break-words">{selectedFiles.length > 0 ? (
                    selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} files selected`
                  ) : (
                    existingAttachments.length > 0 ? (
                      existingAttachments.length === 1 ? existingAttachments[0].split('/').pop() : `${existingAttachments.length} attachments`
                    ) : (
                      Array.isArray(task?.attachments)
                        ? (task.attachments.length === 1 ? task.attachments[0].split('/').pop() : `${task.attachments.length} attachments`)
                        : (task?.attachments && typeof task.attachments === 'string' ? task.attachments.split('/').pop() : 'No attachments')
                    )
                  )}</div>
                </div>
              </div>
            </div>

            {false && id && (
              <div
                className="sticky"
                style={{
                  top: modalMode ? '3.5rem' : '5rem',
                  maxHeight: modalMode ? 'calc(90vh - 10rem)' : 'calc(100vh - 12rem)',
                  overflow: 'auto',
                }}
              >
                <Logs task={task} type={"Task"} />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile fixed action bar */}
      {!modalMode && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t shadow md:hidden">
          <div className="max-w-7xl mx-auto w-full flex justify-between gap-2">
            <div className="flex gap-2">
              {!id && (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 font-medium"
                >
                  Close
                </button>
              )}
              <button
                type="button"
                onClick={() => formik.resetForm()}
                className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById('create-task-form')?.requestSubmit()}
              disabled={formik.isSubmitting}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primaryHover disabled:opacity-50"
            >
              {id ? "Update" : "Create"} Task
            </button>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAddMember}
        title="Member Not in Project"
        message="This user is not a member of the selected project. Do you want to go to Project Settings to add them?"
        confirmText="Go to Settings"
      />
    </main>
  );
};

export default CreateTask;
