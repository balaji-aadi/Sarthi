import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import InputField from "../../components/InputField";
import { useLoading } from "../../components/loader/LoaderContext";
import { UserApi } from "../../services/api/user.api";
import { ActivityApi } from "../../services/api/Activity.api";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";

const Activity = ({
  isOpen,
  onClose,
  task,
  type,
  isUpdate,
  getAllActivities,
}) => {
  const [activityType, setActivityType] = useState("Todo");
  const [teamMembers, setTeamMembers] = useState([]);
  const { handleLoading } = useLoading();

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

  const teamMemberOptions = teamMembers.map((item) => {
    return {
      value: item?._id,
      label: `${item?.firstName} ${" "} ${item?.lastName} `,
    };
  });

  useEffect(() => {
    handleTeamMemberOption();
  }, []);

  const activityOptions = [
    { value: "Email", label: "Email" },
    { value: "Call", label: "Call" },
    { value: "Todo", label: "Todo" },
    { value: "Meeting", label: "Meeting" },
    { value: "Upload Document", label: "Upload Document" },
  ];

  const validationSchema = Yup.object({
    activityType: Yup.string().required("Activity type is required"),
    summary: Yup.string().required("Summary is required"),
    dueDate: Yup.date().required("Due Date is required"),
    assignee: Yup.string().required("Assignee is required"),
    description: Yup.string().required("Description is required"),
    title:
      activityType === "Meeting"
        ? Yup.string().required("Title is required")
        : Yup.string(),
    meetingStartDate:
      activityType === "Meeting"
        ? Yup.date().required("Meeting start date is required")
        : Yup.date(),
    meetingEndDate:
      activityType === "Meeting"
        ? Yup.date().required("Meeting end date is required")
        : Yup.date(),
    attendees:
      activityType === "Meeting"
        ? Yup.array().min(1, "At least one attendee is required")
        : Yup.array(),
  });

  const formik = useFormik({
    initialValues: {
      referenceId: "",
      activityType: "Todo",
      summary: "",
      dueDate: "",
      assignee: "",
      description: "",
      title: "",
      meetingStartDate: "",
      meetingEndDate: "",
      attendees: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        ...(isUpdate ? { referenceId: task?.referenceId } : { referenceId: task?._id }),
        type: isUpdate ? task?.type : type,
        activityType: values.activityType,
        dueDate: values.dueDate,
        summary: values.summary,
        assignee: values.assignee,
        description: values.description,
        ...(values.activityType === "Meeting" && {
          title: values.title,
          meetingStartDate: values.meetingStartDate,
          meetingEndDate: values.meetingEndDate,
          attendees: values.attendees,
        }),
      };
      try {
        const res = isUpdate
          ? await ActivityApi.updateActivity(task?._id, payload)
          : await ActivityApi.createActivity(payload);
        console.log(res.data?.data);
        toast.success(
          isUpdate
            ? "Activity updated successfully"
            : "Activity created successfully"
        );

        isUpdate && getAllActivities();
        onClose();
        formik.resetForm();
      } catch (err) {
        console.log(err);
      }
    },
  });

  useEffect(() => {
    if (task) {
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      formik.setValues({
        referenceId: task?._id || "",
        activityType: task?.activityType || "Todo",
        dueDate: formatDate(task?.dueDate) || "",
        assignee: task?.assignee?._id || "",
        description: task?.description || "",
        title: task?.title || "",
        meetingStartDate: formatDate(task?.meetingStartDate) || "",
        meetingEndDate: formatDate(task?.meetingEndDate) || "",
        attendees: task?.attendees || [],
        summary: task?.summary,
      });
    }
  }, [task]);

  return (
    isOpen && (
      <div
        className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 "
        style={{ marginTop: "0" }}
      >
        <div className="bg-white dark:bg-themeBG text-themeText rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="px-8 py-6 flex justify-between items-center">
            <div className="flex flex-col">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1">
                Schedule Activity
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70">Strategic Planning & Tracking</p>
            </div>
            <button 
                onClick={onClose} 
                className="group p-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all duration-200 border border-slate-100 dark:border-slate-700/30 shadow-sm"
            >
                 <FiX size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
            </button>
          </div>
          
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-slate-100 dark:via-slate-800 to-transparent" />
          
          <form onSubmit={formik.handleSubmit} className="p-8 pt-6">
            <div className="overflow-auto max-h-[60vh] pr-4 custom-scrollbar lg:pr-6">
              <InputField
                label="Select Category"
                name="activityType"
                type="select"
                value={formik.values.activityType}
                onChange={formik.handleChange}
                options={activityOptions}
                error={
                  formik.errors.activityType &&
                  formik.touched.activityType &&
                  formik.errors.activityType
                }
                isRequired={true}
              />
              
              {formik.values.activityType && (
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                  <InputField
                    label="Summary"
                    name="summary"
                    type="text"
                    value={formik.values.summary}
                    onChange={formik.handleChange}
                    error={
                      formik.errors.summary &&
                      formik.touched.summary &&
                      formik.errors.summary
                    }
                    isRequired={true}
                    placeholder="Brief summary of the activity"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Due Date"
                      name="dueDate"
                      type="date"
                      value={formik.values.dueDate}
                      onChange={formik.handleChange}
                      error={
                        formik.errors.dueDate &&
                        formik.touched.dueDate &&
                        formik.errors.dueDate
                      }
                      isRequired={true}
                    />
                    <InputField
                      label="Assign To"
                      name="assignee"
                      type="select"
                      value={formik.values.assignee}
                      onChange={formik.handleChange}
                      options={teamMemberOptions}
                      error={
                        formik.errors.assignee &&
                        formik.touched.assignee &&
                        formik.errors.assignee
                      }
                      isRequired={true}
                    />
                  </div>
                  <InputField
                    label="Description"
                    name="description"
                    type="textarea"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    placeholder="Provide additional context..."
                    error={
                      formik.errors.description &&
                      formik.touched.description &&
                      formik.errors.description
                    }
                  />
                </div>
              )}

              {formik.values.activityType === "Meeting" && (
                <div className="space-y-1 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
                  <InputField
                    label="Meeting Title"
                    name="title"
                    type="text"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    error={
                      formik.errors.title &&
                      formik.touched.title &&
                      formik.errors.title
                    }
                    isRequired={true}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Start Time"
                      name="meetingStartDate"
                      type="date"
                      value={formik.values.meetingStartDate}
                      onChange={formik.handleChange}
                      error={
                        formik.errors.meetingStartDate &&
                        formik.touched.meetingStartDate &&
                        formik.errors.meetingStartDate
                      }
                      isRequired={true}
                    />
                    <InputField
                      label="End Time"
                      name="meetingEndDate"
                      type="date"
                      value={formik.values.meetingEndDate}
                      onChange={formik.handleChange}
                      error={
                        formik.errors.meetingEndDate &&
                        formik.touched.meetingEndDate &&
                        formik.errors.meetingEndDate
                      }
                      isRequired={true}
                    />
                  </div>
                  <InputField
                    label="Attendees"
                    name="attendees"
                    type="select"
                    value={formik.values.attendees}
                    onChange={formik.handleChange}
                    options={teamMemberOptions}
                    isMulti
                    error={
                      formik.errors.attendees &&
                      formik.touched.attendees &&
                      formik.errors.attendees
                    }
                    isRequired={true}
                  />
                </div>
              )}
            </div>
            
            <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-primary hover:bg-primaryHover text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all transform active:scale-95"
              >
                Schedule Activity
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default Activity;
