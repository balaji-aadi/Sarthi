import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import InputField from "../../components/InputField";
import { UserApi } from "../../services/api/user.api";
import { AuthApi } from "../../services/api/Auth.api";
import { userValidationSchema } from "../../validationSchema";
import { useLoading } from "../../components/loader/LoaderContext";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { LuArrowLeft, LuSave, LuX, LuUser, LuShield, LuMapPin, LuImage } from "react-icons/lu";

const CreateUser = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [id, setId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [userTypeOptions, setUserTypeOptions] = useState([]);
  const { handleLoading } = useLoading();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUserRoles();
    
    // Check for user data in navigation state (from TeamList edit)
    if (location.state?.user) {
        initUpdatingUser(location.state.user);
    }
  }, []);

  const fetchUserRoles = async () => {
    try {
      const res = await AuthApi.roleType();
      if (res.data?.data) {
        const options = res.data.data.map((role) => ({
          value: role._id,
          label: role.name,
        }));
        setUserTypeOptions(options);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      toast.error("Failed to load user roles");
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      userRole: "", 
      userRoles: [], 
      address: "",
      profileImage: "",
      confirmPassword: "",
    },
    validationSchema: userValidationSchema(isUpdating),

    onSubmit: async (values) => {
      const { confirmPassword, ...payload } = values;
      
      // Map userRoles select options to array of ID strings
      if (payload.userRoles && Array.isArray(payload.userRoles)) {
          payload.userRoles = payload.userRoles.map(opt => opt.value);
      }
      
      const { password, ...updatedPayload } = payload;
      
      handleLoading(true);
      try {
        // Handle File Upload if a new file is selected
        let imageUrl = payload.profileImage; // defaulting to existing value (if string)
        
        // request.body.profileImage from formik might be a File object now if changed
        // If it's a File object, we upload it.
        // If it's a string, we leave it (it's the existing URL/filename).
        // If it's empty string/null, it's empty.

        if (payload.profileImage instanceof File) {
             const fileFormData = new FormData();
             fileFormData.append("file", payload.profileImage);
             
             try {
                 // Using CommonApi for upload
                 const { CommonApi } = await import("../../services/api/Common.api"); 
                 const fileRes = await CommonApi.uploadFile(fileFormData);
                 
                 // Backend usually returns { data: { filenames: ["..."] } } or specific structure
                 // Based on CreateTask.jsx: fileRes.data?.data?.filenames?.[0]
                 const filename = fileRes.data?.data?.filenames?.[0];
                 
                 if (filename) {
                     const { server } = await import("../../services/config");
                     imageUrl = `${server}file/get-file/${filename}`;
                 }
             } catch (uploadErr) {
                 console.error("Image upload failed", uploadErr);
                 toast.error("Image upload failed");
                 handleLoading(false);
                 return; // Stop submission
             }
        }
        
        // Update payload with string URL
        payload.profileImage = imageUrl;
        if (updatedPayload.profileImage !== undefined) updatedPayload.profileImage = imageUrl;

        if (isUpdating) {
             await UserApi.updateUser(id, updatedPayload);
             toast.success("User updated successfully");
        } else {
             await AuthApi.register(payload);
             toast.success("User created successfully");
        }
        navigate('/user');
      } catch (err) {
        console.log(err);
        toast.error(err.response?.data?.message || "Operation failed");
      }
      handleLoading(false);
    },
  });

  const initUpdatingUser = async (user) => {
    handleLoading(true);
    setIsUpdating(true);
    setId(user._id);

    try {
      // Fetch fresh data
      const res = await UserApi.singleUser(user._id);
      const userData = res.data?.data || user; // Fallback to passed user if fetch fails or returns empty?
      
      // Map existing roles to select options
      let selectedRoles = [];
      if (userData.userRoles && userData.userRoles.length > 0) {
          selectedRoles = userData.userRoles.map(r => ({ value: r._id, label: r.name }));
      } else if (userData.userRole) {
          if (typeof userData.userRole === 'object') {
             selectedRoles = [{ value: userData.userRole._id, label: userData.userRole.name }];
          } else {
             const roleOption = userTypeOptions.find(opt => opt.value === userData.userRole);
             if (roleOption) selectedRoles = [roleOption];
          }
      }
      
      if (userData.profileImage) {
          setImagePreview(userData.profileImage);
      }

      formik.setValues({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        userRole: userData.userRole?._id || (typeof userData.userRole === 'string' ? userData.userRole : ""),
        userRoles: selectedRoles,
        address: userData.address || "",
        profileImage: "",
        password: "", 
        confirmPassword: ""
      });
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch user details");
    }
    handleLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    formik.setFieldValue("profileImage", file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-bgLight p-6 pb-20">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
        <div>
           <div className="flex items-center gap-3 text-textSub text-sm mb-2">
              <span className="cursor-pointer hover:text-primary" onClick={() => navigate('/user')}>Team</span>
              <span>/</span>
              <span className="text-textMain font-medium">{isUpdating ? "Update Member" : "New Member"}</span>
           </div>
           <h1 className="text-3xl font-bold text-textMain flex items-center gap-3">
              <LuUser className="text-primary" />
              {isUpdating ? "Update Team Member" : "Add New Member"}
           </h1>
           <p className="text-textSub mt-1">Manage personal details, roles, and access permissions.</p>
        </div>
        <div className="flex gap-3">
            <button
                type="button"
                onClick={() => navigate('/user')}
                className="px-4 py-2 border border-borderLight text-textSub rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
                <LuX /> Cancel
            </button>
            <button
                type="button"
                onClick={formik.handleSubmit}
                className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primaryHover shadow-lg shadow-primary/30 transition-all flex items-center gap-2 font-medium"
            >
                <LuSave /> {isUpdating ? "Save Changes" : "Create User"}
            </button>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-borderLight p-6">
                <h3 className="text-lg font-bold text-textMain mb-6 border-b border-borderLight pb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="First Name"
                        name="firstName"
                        type="text"
                        value={formik.values.firstName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.firstName && formik.errors.firstName}
                        isRequired
                    />
                    <InputField
                        label="Last Name"
                        name="lastName"
                        type="text"
                        value={formik.values.lastName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.lastName && formik.errors.lastName}
                        isRequired
                    />
                    <InputField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && formik.errors.email}
                        isRequired
                    />
                    <InputField
                        label="Phone Number"
                        name="phoneNumber"
                        type="text"
                        value={formik.values.phoneNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.phoneNumber && formik.errors.phoneNumber}
                        isRequired
                    />
                </div>
            </div>

            {/* Address & Extra */}
            <div className="bg-white rounded-2xl shadow-sm border border-borderLight p-6">
                <h3 className="text-lg font-bold text-textMain mb-6 border-b border-borderLight pb-4 flex items-center gap-2">
                    <LuMapPin className="text-primary" /> Address & Location
                </h3>
                <InputField
                    label="Full Address"
                    name="address"
                    type="textarea"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Street, City, Zip Code..."
                    error={formik.touched.address && formik.errors.address}
                    style="h-32"
                />
            </div>
        </div>


        {/* Right Column: Role & Security */}
        <div className="space-y-6">
            
            {/* Profile Image */}
            <div className="bg-white rounded-2xl shadow-sm border border-borderLight p-6 text-center">
                <h3 className="text-lg font-bold text-textMain mb-4 flex items-center justify-center gap-2">
                    <LuImage className="text-primary" /> Profile Photo
                </h3>
                <div className="flex justify-center mb-6">
                     {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile Preview"
                          className="w-32 h-32 rounded-full object-cover border-4 border-bgLight shadow-sm"
                        />
                     ) : (
                        <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-300">
                            <LuUser size={48} />
                        </div>
                     )}
                </div>
                <div className="relative">
                    <input
                        type="file"
                        name="profileImage"
                        accept="image/*"
                        id="profile-upload"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                    <label 
                        htmlFor="profile-upload"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        Upload Photo
                    </label>
                </div>
            </div>

            {/* Access & Role */}
            <div className="bg-white rounded-2xl shadow-sm border border-borderLight p-6">
                <h3 className="text-lg font-bold text-textMain mb-6 border-b border-borderLight pb-4 flex items-center gap-2">
                    <LuShield className="text-primary" /> Roles & Security
                </h3>
                
                <div className="mb-6">
                    <label className="block text-textMain font-medium mb-2 text-sm">Assign Roles</label>
                    <Select
                        isMulti
                        name="userRoles"
                        options={userTypeOptions}
                        className="basic-multi-select text-sm"
                        classNamePrefix="select"
                        value={formik.values.userRoles}
                        onChange={(selectedOptions) => {
                            formik.setFieldValue("userRoles", selectedOptions);
                            // Backward compatibility
                            if (selectedOptions && selectedOptions.length > 0) {
                                formik.setFieldValue("userRole", selectedOptions[0].value);
                            } else {
                                formik.setFieldValue("userRole", "");
                            }
                        }}
                        onBlur={formik.handleBlur}
                        placeholder="Select roles..."
                    />
                    {formik.touched.userRole && formik.errors.userRole && (
                        <div className="text-red-500 text-xs mt-1">{typeof formik.errors.userRole === 'string' ? formik.errors.userRole : "Role is required"}</div>
                    )}
                </div>

                {!isUpdating && (
                    <div className="space-y-4 pt-4 border-t border-borderLight">
                        <InputField
                            label="Password"
                            name="password"
                            type="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && formik.errors.password}
                            isRequired
                        />
                        <InputField
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.confirmPassword && formik.errors.confirmPassword}
                            isRequired
                        />
                    </div>
                )}
            </div>
        </div>

      </form>
    </div>
  );
};

export default CreateUser;
