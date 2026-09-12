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
import { isLldBranch, isDsaBranch, getCurriculumNodeType } from "../../utils/curriculumHelper";
import { ProblemApi } from "../../services/api/Problem.api";
import { IoTrashOutline } from "react-icons/io5";

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
  isDsa = false,
}) => {
  const { currentUser, activeBranch } = useSelector((state) => state.store);
  const location = useLocation();
  const locationState = location.state || {}; // { parentTask: { _id, name, projectId ... }, project: ... }

  const [teamMembers, setTeamMembers] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [sprints, setSprints] = useState([]); // State for sprints
  const [parentTaskOptions, setParentTaskOptions] = useState([]); // State for potential parent tasks
  const [selectedProject, setSelectedProject] = useState("");

  // Detect if current task / project / context is DSA
  const isDsaModule = Boolean(
    isDsa ||
    isDsaBranch(activeBranch) ||
    (task?.taskId && /^DSA/i.test(task.taskId)) ||
    (task?.projectName && typeof task.projectName === 'object' && /^DSA/i.test(task.projectName.name || task.projectName.key)) ||
    (selectedProject && projects.some(p => (p.value === selectedProject || p._id === selectedProject) && /^DSA/i.test(p.label || p.name || p.key || ''))) ||
    (locationState?.project && /^DSA/i.test(locationState.project.name || locationState.project.key || '')) ||
    (locationState?.parentTask && /^DSA/i.test(locationState.parentTask.taskId || ''))
  );

  const [learningTrack, setLearningTrack] = useState(() => (isDsaModule ? 'Standard' : (isLldBranch(activeBranch) ? 'LLD' : 'Standard')));
  const [learningType, setLearningType] = useState(() => (isDsaModule ? 'standard' : (isLldBranch(activeBranch) ? 'drill' : 'standard')));

  useEffect(() => {
    if (isDsaModule) {
      setLearningTrack('Standard');
      setLearningType('standard');
    }
  }, [isDsaModule]);

  const [validProjectMembers, setValidProjectMembers] = useState([]); // Array of User IDs
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { handleLoading } = useLoading();
  const userRole = currentUser?.userRole?.name;
  const canEditRestrictedFields = userRole === "projectmanager" || userRole === "admin" || userRole === "hr";
  const [manager, setManager] = useState(canEditRestrictedFields);

  useEffect(() => {
    setManager(canEditRestrictedFields);
  }, [userRole]);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const navigate = useNavigate();
  const handleClose = () => {
    setId();
    setTask([]);
  };

  const getNodeTypeLabel = () => {
    if (isDsaModule) return "Problem";
    if (learningTrack !== "LLD" || learningType === "standard") return "Task";
    if (learningType === "drill") return "Curriculum Drill";
    if (learningType === "unit") return "Learning Unit";
    if (learningType === "module") return "Curriculum Module";
    if (learningType === "problem") return "Major LLD Problem";
    if (learningType === "version") return "Problem Version";
    return "Task";
  };

  const actionPrefix = id ? "Edit" : "Create";
  const dynamicTitle = `${actionPrefix} ${getNodeTypeLabel()}`;

  const breadcrumbs = [
    id
      ? { label: isDsaModule ? "DSA Workspace" : (learningTrack === "LLD" ? "LLD Curriculum" : "My Task"), handleClicked: handleClose }
      : { label: isDsaModule ? "DSA Workspace" : (learningTrack === "LLD" ? "LLD Curriculum" : "My Task"), path: "/" },
    {
      label: dynamicTitle,
      path: id ? "/" : "/task/create-task",
    },
  ];

  const [drillSections, setDrillSections] = useState({
    goal: "",
    whyThisMatters: "",
    yourTask: "",
    whatToObserve: "",
    successCriteria: "",
    thinkAbout: ""
  });
  const [useRawEditor, setUseRawEditor] = useState(false);

  const parseDrillSectionsFromText = (text) => {
    if (!text || typeof text !== "string") return null;
    const goalMatch = text.match(/###\s*Goal\s*([\s\S]*?)(?=###|$)/i);
    const whyMatch = text.match(/###\s*Why This Matters\s*([\s\S]*?)(?=###|$)/i);
    const taskMatch = text.match(/###\s*Your Task\s*([\s\S]*?)(?=###|$)/i);
    const observeMatch = text.match(/###\s*What To Observe\s*([\s\S]*?)(?=###|$)/i);
    const criteriaMatch = text.match(/###\s*Success Criteria\s*([\s\S]*?)(?=###|$)/i);
    const thinkMatch = text.match(/###\s*Think About\s*([\s\S]*?)(?=###|$)/i);

    if (goalMatch || whyMatch || taskMatch) {
      return {
        goal: goalMatch ? goalMatch[1].trim() : "",
        whyThisMatters: whyMatch ? whyMatch[1].trim() : "",
        yourTask: taskMatch ? taskMatch[1].trim() : "",
        whatToObserve: observeMatch ? observeMatch[1].trim() : "",
        successCriteria: criteriaMatch ? criteriaMatch[1].trim() : "",
        thinkAbout: thinkMatch ? thinkMatch[1].trim() : ""
      };
    }
    return null;
  };

  const handleDrillSectionChange = (field, value) => {
    setDrillSections(prev => {
      const updated = { ...prev, [field]: value };
      const serialized = `### Goal\n${updated.goal}\n\n### Why This Matters\n${updated.whyThisMatters}\n\n### Your Task\n${updated.yourTask}\n\n### What To Observe\n${updated.whatToObserve}\n\n### Success Criteria\n${updated.successCriteria}\n\n### Think About\n${updated.thinkAbout}`;
      formik.setFieldValue("taskDescription", serialized);
      return updated;
    });
  };

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

    // Load available companies from Company Master
    const fetchCompanies = async () => {
      try {
        const res = await ProblemApi.getCompanies();
        setAvailableCompanies(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Failed to load companies for task tagging:", err);
      }
    };
    fetchCompanies();
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
      taskPriority: "medium",
      estimatedHours: 0.5,
      estHours: "",
      estMinutes: "30",
      taskType: "Development",
      milestone: "",
      sprint: "", // New Field
      parentTask: "", // New Field
      attachments: null,
      additionalNotes: "",
      youtubeUrl: "",
      leetcodeUrl: "",
      difficulty: "",
      isUrlVerified: false,
      assignee: currentUser?._id || "",
      taskStartDate: moment().format("YYYY-MM-DD"),
      taskDueDate: moment().add(7, "days").format("YYYY-MM-DD"),
      dependentTasks: [],
      dependencyType: "",
      progress: 0,
      actionVerb: "BUILD",
      curriculumLevel: "Level A",
      curriculumDifficulty: "Easy",
      targetTimeMinutes: 15,
      conceptTopicsInput: "",
      versionNumber: 1,
      companyTags: [],
    },
    enableReinitialize: true,
    validationSchema: taskValidationSchema,
    validate: (values) => {
      const errors = {};
      if (parentTaskData && !isDsaModule) {
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

      if (values.sprint && !isDsaModule) {
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

      if (isDsaModule) {
        payload.taskPriority = payload.taskPriority || "medium";
        payload.taskType = payload.taskType || "Task";
        payload.taskStartDate = payload.taskStartDate || moment().format("YYYY-MM-DD");
        payload.taskDueDate = payload.taskDueDate || moment().add(30, "days").format("YYYY-MM-DD");
        delete payload.curriculumMeta;
        payload.difficulty = values.difficulty || null;
        payload.leetcodeUrl = values.leetcodeUrl ? values.leetcodeUrl.trim() : "";
        payload.isUrlVerified = Boolean(values.isUrlVerified);

        // Phase 5: Format companyTags
        if (Array.isArray(values.companyTags)) {
          const companyIds = values.companyTags.map(ct => ct.company).filter(Boolean);
          if (new Set(companyIds).size !== companyIds.length) {
            handleLoading(false);
            alert("Duplicate company selected. A question can only be tagged once per company.");
            return;
          }

          payload.companyTags = values.companyTags
            .filter(ct => Boolean(ct.company))
            .map(ct => ({
              company: ct.company
            }));
        }
      }

      // Attach curriculumMeta if creating curriculum item
      if (learningTrack === 'LLD' && learningType !== 'standard') {
        const nodeType = learningType;
        const levelName = values.curriculumLevel === 'Level A' ? 'Level A · Concept Drill'
          : values.curriculumLevel === 'Level B' ? 'Level B · Design Exercise'
            : 'Level C · Full LLD Problem';
        payload.curriculumMeta = {
          nodeType,
          actionVerb: values.actionVerb || 'BUILD',
          level: values.curriculumLevel || 'Level A',
          levelName,
          difficulty: values.curriculumDifficulty || 'Easy',
          targetTimeMinutes: parseFloat(values.targetTimeMinutes || 15),
          conceptTopics: values.conceptTopicsInput ? values.conceptTopicsInput.split(',').map(s => s.trim()).filter(Boolean) : [],
          versionNumber: parseInt(values.versionNumber || 1, 10),
        };
        payload.taskType = nodeType === 'drill' ? 'CurriculumDrill'
          : nodeType === 'unit' ? 'CurriculumUnit'
            : nodeType === 'module' ? 'CurriculumModule'
              : nodeType === 'problem' ? 'MajorProblem'
                : 'ProblemVersion';
        if (!payload.taskPriority) payload.taskPriority = 'medium';
      }

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
        leetcodeUrl: task?.leetcodeUrl || "",
        difficulty: task?.difficulty || "",
        isUrlVerified: Boolean(task?.isUrlVerified),
        taskType: task.taskType || "",
        attachments: task.attachments || "",
        assignee: task.assignee?._id || task.assignee || currentUser?._id || "",
        taskStartDate: formatDate(task.taskStartDate),
        taskDueDate: formatDate(task.taskDueDate),
        dependentTasks: task.dependentTasks || [],
        dependencyType: task.dependencyType || "",
        actionVerb: task.curriculumMeta?.actionVerb || "BUILD",
        curriculumLevel: task.curriculumMeta?.level || "Level A",
        curriculumDifficulty: task.curriculumMeta?.difficulty || "Easy",
        targetTimeMinutes: task.curriculumMeta?.targetTimeMinutes || 15,
        conceptTopicsInput: Array.isArray(task.curriculumMeta?.conceptTopics) ? task.curriculumMeta.conceptTopics.join(", ") : "",
        versionNumber: task.curriculumMeta?.versionNumber || 1,
        companyTags: Array.isArray(task.companyTags)
          ? task.companyTags.map(ct => ({
              company: ct.company?._id || ct.company || ""
            }))
          : [],
      });

      const isThisTaskDsa = Boolean(
        isDsaModule ||
        (task?.taskId && /^DSA/i.test(task.taskId)) ||
        (task?.projectName && typeof task.projectName === 'object' && /^DSA/i.test(task.projectName.name || task.projectName.key))
      );

      if (!isThisTaskDsa && task.curriculumMeta && isLldBranch(activeBranch)) {
        setLearningTrack("LLD");
        const detectedType = getCurriculumNodeType(task) || "drill";
        setLearningType(detectedType);
        if (task.curriculumMeta.sections) {
          setDrillSections(task.curriculumMeta.sections);
        } else {
          const parsed = parseDrillSectionsFromText(task.taskDescription);
          if (parsed) setDrillSections(parsed);
        }
      } else {
        setLearningTrack("Standard");
        setLearningType("standard");
      }

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
      <div className={`flex-1 p-6 dark:text-themeText overflow-y-auto pb-72 w-full`}>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-themeText mb-6 text-center md:text-left">
          {dynamicTitle}
        </h2>

        <div className={`max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-6 items-start`}>
          {/* Left: Form */}
          <div className="w-full md:flex-1">
            <div className="bg-white dark:bg-themeBG rounded-2xl shadow-md p-6">
              {/* Progressive Track & Type Selector (Hidden for DSA module) */}
              {!isDsaModule && (
                <div className="mb-6 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Step 1 · Learning Track & Type
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">Choose curriculum or standard task mode</p>
                    </div>
                    <div className="inline-flex rounded-xl p-1 bg-slate-200/80 dark:bg-slate-800 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => {
                          setLearningTrack("LLD");
                          setLearningType("drill");
                          if (!formik.values.estimatedHours) formik.setFieldValue("estimatedHours", 0.5);
                          if (!formik.values.taskPriority) formik.setFieldValue("taskPriority", "medium");
                          if (!formik.values.taskType) formik.setFieldValue("taskType", "Development");
                        }}
                        className={`px-3 py-1.5 rounded-lg transition-all ${learningTrack === "LLD" ? "bg-white dark:bg-slate-700 shadow-sm text-primary font-bold" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                      >
                        LLD Curriculum
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLearningTrack("Standard");
                          setLearningType("standard");
                        }}
                        className={`px-3 py-1.5 rounded-lg transition-all ${learningTrack === "Standard" ? "bg-white dark:bg-slate-700 shadow-sm text-primary font-bold" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                      >
                        Standard / DSA Task
                      </button>
                    </div>
                  </div>

                  {learningTrack === "LLD" && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      {[
                        { type: "module", label: "Module (1.X)", desc: "Phase Grouping" },
                        { type: "unit", label: "Learning Unit (1.X.Y)", desc: "Concept Container" },
                        { type: "drill", label: "Practical Drill", desc: "Hands-on Exercise" },
                        { type: "problem", label: "Major LLD Problem", desc: "60-120m Problem" },
                        { type: "version", label: "Problem Version", desc: "Requirement Diff" },
                      ].map(btn => (
                        <button
                          key={btn.type}
                          type="button"
                          onClick={() => {
                            setLearningType(btn.type);
                            if (btn.type === "problem" && (!formik.values.estimatedHours || formik.values.estimatedHours < 1)) {
                              formik.setFieldValue("estimatedHours", 1.5);
                              formik.setFieldValue("targetTimeMinutes", 90);
                            } else if (btn.type === "drill" && !formik.values.targetTimeMinutes) {
                              formik.setFieldValue("targetTimeMinutes", 20);
                              formik.setFieldValue("estimatedHours", 20 / 60);
                            } else if (btn.type === "unit" && !formik.values.targetTimeMinutes) {
                              formik.setFieldValue("targetTimeMinutes", 45);
                              formik.setFieldValue("estimatedHours", 45 / 60);
                            }
                          }}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${learningType === btn.type
                            ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                            : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400"
                            }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mb-6 w-full">
                <InputField
                  label={isDsaModule ? "DSA Phase" : (learningTrack === "LLD" ? "LLD Phase / Project" : "Arena / Project")}
                  name="projectName"
                  type="select"
                  value={selectedProject}
                  onChange={handleProjectChange}
                  options={projectOptions}
                  error={formik.touched.projectName && formik.errors.projectName}
                />
              </div>

              <form id="create-task-form" onSubmit={formik.handleSubmit} className="w-full">
                {learningTrack === "LLD" && learningType !== "standard" ? (
                  /* ======================================================== */
                  /* PROGRESSIVE LLD CURRICULUM FORM                          */
                  /* ======================================================== */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label={
                          learningType === "drill"
                            ? "Drill Title (e.g. Dynamic Polymorphism & Virtual Destructors)"
                            : learningType === "unit"
                              ? "Unit Title (e.g. 1.1.1 Memory Layout & Virtual Tables)"
                              : learningType === "module"
                                ? "Module Title (e.g. 1.1 Object-Oriented Fundamentals)"
                                : learningType === "problem"
                                  ? "Major Problem Title (e.g. Parking Lot System)"
                                  : "Version Title (e.g. V1 Single-Floor Parking)"
                        }
                        name="taskName"
                        type="text"
                        value={formik.values.taskName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter title..."
                        error={formik.touched.taskName && formik.errors.taskName}
                        isRequired
                      />

                      <InputField
                        label={
                          learningType === "drill"
                            ? "Parent Learning Unit (Required)"
                            : learningType === "unit"
                              ? "Parent Curriculum Module (Required)"
                              : learningType === "version"
                                ? "Parent Major Problem (Required)"
                                : "Parent (Optional)"
                        }
                        name="parentTask"
                        type="select"
                        value={formik.values.parentTask}
                        onChange={(e) => {
                          formik.handleChange(e);
                          fetchParentTaskDetails(e.target.value);
                        }}
                        options={parentTaskOptions}
                        onBlur={formik.handleBlur}
                        placeholder="Select Parent Node..."
                        error={formik.touched.parentTask && formik.errors.parentTask}
                      />
                    </div>

                    {/* Drill-specific controls */}
                    {learningType === "drill" && (
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                        <InputField
                          label="Action Verb"
                          name="actionVerb"
                          type="select"
                          value={formik.values.actionVerb}
                          onChange={formik.handleChange}
                          options={[
                            { value: "BUILD", label: "BUILD · Implement from scratch" },
                            { value: "REFACTOR", label: "REFACTOR · Improve structure" },
                            { value: "EXTEND", label: "EXTEND · Add feature" },
                            { value: "ANALYZE", label: "ANALYZE · Inspect & dissect" },
                            { value: "FIX", label: "FIX · Debug & correct" },
                            { value: "OPTIMIZE", label: "OPTIMIZE · Perf/Memory" },
                            { value: "ISOLATE", label: "ISOLATE · Decouple" },
                            { value: "TRADEOFF", label: "TRADEOFF · Evaluate options" },
                          ]}
                        />
                        <InputField
                          label="Curriculum Level"
                          name="curriculumLevel"
                          type="select"
                          value={formik.values.curriculumLevel}
                          onChange={formik.handleChange}
                          options={[
                            { value: "Level A", label: "Level A · Concept Drill" },
                            { value: "Level B", label: "Level B · Design Exercise" },
                            { value: "Level C", label: "Level C · Full LLD Problem" },
                          ]}
                        />
                        <InputField
                          label="Difficulty"
                          name="curriculumDifficulty"
                          type="select"
                          value={formik.values.curriculumDifficulty}
                          onChange={formik.handleChange}
                          options={[
                            { value: "Easy", label: "Easy" },
                            { value: "Medium", label: "Medium" },
                            { value: "Hard", label: "Hard" },
                          ]}
                        />
                        <InputField
                          label="Target Drill Time (Mins)"
                          name="targetTimeMinutes"
                          type="number"
                          value={formik.values.targetTimeMinutes}
                          onChange={(e) => {
                            formik.handleChange(e);
                            const mins = parseFloat(e.target.value || 0);
                            formik.setFieldValue("estimatedHours", mins / 60);
                          }}
                          placeholder="15"
                        />
                      </div>
                    )}

                    {/* Unit-specific controls */}
                    {learningType === "unit" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                        <InputField
                          label="Estimated Learning Time (Mins)"
                          name="targetTimeMinutes"
                          type="number"
                          value={formik.values.targetTimeMinutes}
                          onChange={(e) => {
                            formik.handleChange(e);
                            const mins = parseFloat(e.target.value || 0);
                            formik.setFieldValue("estimatedHours", mins / 60);
                          }}
                          placeholder="45"
                        />
                        <div>
                          <InputField
                            label="Concept Topics (Comma-separated, stored in Unit)"
                            name="conceptTopicsInput"
                            type="text"
                            value={formik.values.conceptTopicsInput}
                            onChange={formik.handleChange}
                            placeholder="e.g. Stack vs Heap, this pointer, RAII"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Rule 3: Concepts remain metadata inside the Unit, not separate cards.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Module-specific controls */}
                    {learningType === "module" && (
                      <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                        <InputField
                          label="Estimated Hours"
                          name="estimatedHours"
                          type="number"
                          value={formik.values.estimatedHours}
                          onChange={formik.handleChange}
                          placeholder="10"
                        />
                      </div>
                    )}

                    {/* Major Problem controls */}
                    {learningType === "problem" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                        <InputField
                          label="Difficulty"
                          name="curriculumDifficulty"
                          type="select"
                          value={formik.values.curriculumDifficulty}
                          onChange={formik.handleChange}
                          options={[
                            { value: "Easy", label: "Easy" },
                            { value: "Medium", label: "Medium" },
                            { value: "Hard", label: "Hard" },
                          ]}
                        />
                        <InputField
                          label="Target Time (Mins, typically 60–120)"
                          name="targetTimeMinutes"
                          type="number"
                          value={formik.values.targetTimeMinutes}
                          onChange={(e) => {
                            formik.handleChange(e);
                            const mins = parseFloat(e.target.value || 0);
                            formik.setFieldValue("estimatedHours", mins / 60);
                          }}
                          placeholder="90"
                        />
                      </div>
                    )}

                    {/* Version controls */}
                    {learningType === "version" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                        <InputField
                          label="Version Number (1 to 5)"
                          name="versionNumber"
                          type="number"
                          value={formik.values.versionNumber}
                          onChange={formik.handleChange}
                          min="1"
                          max="10"
                        />
                        <InputField
                          label="Target Time (Mins)"
                          name="targetTimeMinutes"
                          type="number"
                          value={formik.values.targetTimeMinutes}
                          onChange={(e) => {
                            formik.handleChange(e);
                            const mins = parseFloat(e.target.value || 0);
                            formik.setFieldValue("estimatedHours", mins / 60);
                          }}
                          placeholder="25"
                        />
                      </div>
                    )}

                    {learningType === "drill" && (
                      <InputField
                        label="Concept Topics (Comma-separated)"
                        name="conceptTopicsInput"
                        type="text"
                        value={formik.values.conceptTopicsInput}
                        onChange={formik.handleChange}
                        placeholder="e.g. Dynamic Dispatch, VTable, Virtual Destructors"
                      />
                    )}

                    {learningType === "drill" && !useRawEditor ? (
                      <div className="space-y-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30">
                        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
                          <div>
                            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                              Drill Content · Structured Pedagogical Sections
                            </span>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Each section is independently authored and automatically serialized without raw markdown syntax errors.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUseRawEditor(true)}
                            className="text-xs font-bold text-primary hover:underline px-2.5 py-1 rounded-lg border border-primary/20 bg-white dark:bg-slate-800 cursor-pointer"
                          >
                            Switch to Raw Editor
                          </button>
                        </div>

                        {/* 1. Goal */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            1. GOAL <span className="text-[10px] text-slate-400 font-normal">(What will the learner build or refactor?)</span>
                          </label>
                          <textarea
                            value={drillSections.goal}
                            onChange={(e) => handleDrillSectionChange("goal", e.target.value)}
                            placeholder="e.g. Implement a resource-holding ConnectionPool class demonstrating stack vs heap instantiation..."
                            rows={2}
                            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-900/50 dark:text-slate-100 focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        {/* 2. Why This Matters */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            2. WHY THIS MATTERS <span className="text-[10px] text-slate-400 font-normal">(Technical failure modes and practical importance)</span>
                          </label>
                          <textarea
                            value={drillSections.whyThisMatters}
                            onChange={(e) => handleDrillSectionChange("whyThisMatters", e.target.value)}
                            placeholder="e.g. Resource leaks in C++ occur when developers confuse pointer storage with object lifetime..."
                            rows={3}
                            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-900/50 dark:text-slate-100 focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        {/* 3. Your Task */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            3. YOUR TASK <span className="text-[10px] text-slate-400 font-normal">(Numbered actionable step-by-step instructions)</span>
                          </label>
                          <textarea
                            value={drillSections.yourTask}
                            onChange={(e) => handleDrillSectionChange("yourTask", e.target.value)}
                            placeholder="1. Define ConnectionPool class...\n2. Instantiate on stack...\n3. Instantiate on heap...\n4. Disable copy constructor with = delete."
                            rows={4}
                            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-900/50 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 font-mono"
                          />
                        </div>

                        {/* 4. What To Observe */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            4. WHAT TO OBSERVE <span className="text-[10px] text-slate-400 font-normal">(Runtime execution, memory behavior, compiler checks)</span>
                          </label>
                          <textarea
                            value={drillSections.whatToObserve}
                            onChange={(e) => handleDrillSectionChange("whatToObserve", e.target.value)}
                            placeholder="e.g. Notice that stack-allocated object invokes its destructor automatically at the closing brace..."
                            rows={3}
                            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-900/50 dark:text-slate-100 focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        {/* 5. Success Criteria */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            5. SUCCESS CRITERIA <span className="text-[10px] text-slate-400 font-normal">(Acceptance criteria and verification points)</span>
                          </label>
                          <textarea
                            value={drillSections.successCriteria}
                            onChange={(e) => handleDrillSectionChange("successCriteria", e.target.value)}
                            placeholder="e.g. Code compiles with C++20 flags. Stack allocation destructor logs confirm cleanup on scope exit."
                            rows={3}
                            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-900/50 dark:text-slate-100 focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        {/* 6. Think About */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            6. THINK ABOUT <span className="text-[10px] text-slate-400 font-normal">(Deepening conceptual questions and architectural trade-offs)</span>
                          </label>
                          <textarea
                            value={drillSections.thinkAbout}
                            onChange={(e) => handleDrillSectionChange("thinkAbout", e.target.value)}
                            placeholder="e.g. What happens if an exception is thrown before an explicit delete statement is reached?"
                            rows={2}
                            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-900/50 dark:text-slate-100 focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {learningType === "drill" && useRawEditor && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const parsed = parseDrillSectionsFromText(formik.values.taskDescription);
                                if (parsed) setDrillSections(parsed);
                                setUseRawEditor(false);
                              }}
                              className="text-xs font-bold text-primary hover:underline px-2.5 py-1 rounded-lg border border-primary/20 bg-white dark:bg-slate-800 cursor-pointer"
                            >
                              Switch to Structured Section Fields
                            </button>
                          </div>
                        )}
                        <InputField
                          label="Description / Learning Content"
                          name="taskDescription"
                          type="quill"
                          value={formik.values.taskDescription}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Provide problem specification or educational guidance..."
                          error={formik.touched.taskDescription && formik.errors.taskDescription}
                        />
                      </div>
                    )}

                    <InputField
                      label="YouTube Video Reference (Optional)"
                      name="youtubeUrl"
                      type="text"
                      value={formik.values.youtubeUrl}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.youtubeUrl && formik.errors.youtubeUrl}
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                    />
                  </div>
                ) : (
                  /* ======================================================== */
                  /* STANDARD / DSA TASK FORM (100% UNCHANGED COMPATIBILITY)   */
                  /* ======================================================== */
                  <div className="space-y-6">
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                          label={isDsaModule ? "Problem Title" : "Work Name"}
                          name="taskName"
                          type="text"
                          value={formik.values.taskName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder={isDsaModule ? "Enter problem title..." : "Enter work name..."}
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

                      {!isDsaModule ? (
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
                            error={formik.touched.taskPriority && formik.errors.taskPriority}
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
                      ) : (
                        <div className="w-full">
                          <InputField
                            label="Parent Topic (Optional)"
                            name="parentTask"
                            type="select"
                            value={formik.values.parentTask}
                            onChange={(e) => {
                              formik.handleChange(e);
                              fetchParentTaskDetails(e.target.value);
                            }}
                            options={parentTaskOptions}
                            onBlur={formik.handleBlur}
                            placeholder="Select Parent Topic (e.g. Arrays, Strings, Trees)..."
                            error={formik.touched.parentTask && formik.errors.parentTask}
                          />
                        </div>
                      )}

                      <InputField
                        label="Description"
                        name="taskDescription"
                        type="quill"
                        value={formik.values.taskDescription}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Provide a detailed description of the work..."
                        error={formik.touched.taskDescription && formik.errors.taskDescription}
                        isRequired
                      />
                    </div>

                    <div>
                      {!isDsaModule && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputField
                            label="Start Date"
                            name="taskStartDate"
                            type="date"
                            value={formik.values.taskStartDate}
                            onChange={formik.handleChange}
                            readOnly={!canEditRestrictedFields && id ? true : false}
                            onBlur={formik.handleBlur}
                            error={formik.touched.taskStartDate && formik.errors.taskStartDate}
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
                            error={formik.touched.taskDueDate && formik.errors.taskDueDate}
                            isRequired
                          />
                        </div>
                      )}
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

                      {isDsaModule && (
                        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            DSA Problem Metadata (Optional)
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                              label="LeetCode Problem URL"
                              name="leetcodeUrl"
                              type="text"
                              value={formik.values.leetcodeUrl}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={formik.touched.leetcodeUrl && formik.errors.leetcodeUrl}
                              placeholder="e.g. https://leetcode.com/problems/two-sum/"
                            />
                            <InputField
                              label="Problem Difficulty"
                              name="difficulty"
                              type="select"
                              options={[
                                { label: "Not specified (Unknown)", value: "" },
                                { label: "Easy", value: "Easy" },
                                { label: "Medium", value: "Medium" },
                                { label: "Hard", value: "Hard" },
                              ]}
                              value={formik.values.difficulty}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </div>
                          {manager && (
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="checkbox"
                                id="isUrlVerified"
                                name="isUrlVerified"
                                checked={formik.values.isUrlVerified}
                                onChange={formik.handleChange}
                                className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                              />
                              <label htmlFor="isUrlVerified" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                Verified LeetCode Problem Link (Admin Only)
                              </label>
                            </div>
                          )}

                          {/* Phase 5: Simplified Company Tagging (Admin Only) */}
                          {manager && (
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Targeted Companies (Interview Metadata)
                                  </h4>
                                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                    Attach company tags from Company Master. Max 1 entry per company.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentTags = formik.values.companyTags || [];
                                    formik.setFieldValue("companyTags", [
                                      ...currentTags,
                                      { company: "" }
                                    ]);
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold text-primary dark:text-accent rounded-md border border-primary/30 dark:border-accent/30 hover:bg-primary/5 dark:hover:bg-accent/10 transition-colors"
                                >
                                  + Add Company Tag
                                </button>
                              </div>

                              {/* Validation message if duplicate companies selected */}
                              {(() => {
                                const tags = formik.values.companyTags || [];
                                const companyIds = tags.map(t => t.company).filter(Boolean);
                                const hasDuplicates = new Set(companyIds).size !== companyIds.length;
                                if (hasDuplicates) {
                                  return (
                                    <p className="text-xs text-rose-500 font-medium">
                                      ⚠️ Duplicate company selected. Each company can only be tagged once per question.
                                    </p>
                                  );
                                }
                                return null;
                              })()}

                              {/* List of tagged companies */}
                              <div className="space-y-2">
                                {(!formik.values.companyTags || formik.values.companyTags.length === 0) ? (
                                  <p className="text-xs text-slate-400 dark:text-slate-500 italic py-1">
                                    No companies tagged for this problem yet.
                                  </p>
                                ) : (
                                  formik.values.companyTags.map((tag, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
                                    >
                                      {/* Company Dropdown */}
                                      <div className="flex-1">
                                        <select
                                          value={tag.company}
                                          onChange={(e) => {
                                            const updated = [...formik.values.companyTags];
                                            updated[idx].company = e.target.value;
                                            formik.setFieldValue("companyTags", updated);
                                          }}
                                          className="w-full text-xs font-medium px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                                        >
                                          <option value="">Select Company from Master...</option>
                                          {availableCompanies.map((c) => (
                                            <option key={c._id} value={c._id}>
                                              {c.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      {/* Remove Action */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = formik.values.companyTags.filter((_, i) => i !== idx);
                                          formik.setFieldValue("companyTags", updated);
                                        }}
                                        title="Remove tag"
                                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                                      >
                                        <IoTrashOutline className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                      {id ? "Update" : "Create"} {isDsaModule ? "Problem" : "Task"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Logs / Activity (sticky on desktop) */}
          {/* <div className="w-full md:w-[36%] flex flex-col gap-4">
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
          </div> */}
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
