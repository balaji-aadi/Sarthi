import React, { useEffect, useState } from "react";
import Select, { components } from "react-select";
import ReactQuill from "react-quill";
import { LuEye, LuEyeOff } from "react-icons/lu";

const InputField = ({
  label,
  name,
  type,
  value,
  onChange,
  readOnly,
  onBlur,
  placeholder,
  error,
  isRequired,
  options,
  isMulti = false,
  style,
  labelClass,
  ...props
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: isDarkMode ? "#1f2633" : "#fff",
      borderColor: error ? "red" : "#d1d5db",
      color: isDarkMode ? "#fff" : "#000",
      boxShadow: state.isFocused ? "none" : "none",
      "&:hover": {
        borderColor: error ? "red" : "",
      },
    }),
    singleValue: (provided, state) => ({
      ...provided,
      color: isDarkMode ? "#fff" : "#000",
      textTransform: "capitalize",
      display: state.selectProps.menuIsOpen ? "none" : "block",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? isDarkMode
          ? "#1f2633"
          : "#e5e7eb"
        : isDarkMode
          ? "#1f2633"
          : "transparent",
      color: isDarkMode ? "#fff" : "#000",
      textTransform: "capitalize",
      opacity: state.data.isMember === false ? 0.5 : 1,
      "&:hover": {
        backgroundColor: isDarkMode ? "#4b5563" : "#d1d5db",
      },
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#6b7280",
    }),
    input: (provided) => ({
      ...provided,
      color: isDarkMode ? "#fff" : "#000",
    }),
  };

  const CustomMenuList = (props) => {
    return (
      <components.MenuList {...props}>
        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1f2633] text-xs text-gray-500 font-medium">
           Type to search...
        </div>
        {props.children}
      </components.MenuList>
    );
  };

  const handleSelectChange = (selectedOption) => {
    if (isMulti) {
      onChange({
        target: {
          name,
          value: selectedOption
            ? selectedOption.map((option) => option.value)
            : [],
        },
      });
    } else {
      onChange({
        target: {
          name,
          value: selectedOption ? selectedOption.value : "",
        },
      });
    }
  };

  const handleCheckboxChange = (e) => {
    onChange({
      target: {
        name,
        value: e.target.checked,
      },
    });
  };

  const handleQuillChange = (content) => {
    onChange({
      target: {
        name,
        value: content,
      },
    });
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
  ];

  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className={`block text-gray-700 dark:text-white font-medium mb-2 ${labelClass || ""}`}
      >
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>

      {type === "select" ? (
        <Select
          id={name}
          name={name}
          value={
            isMulti
              ? options.filter((option) => value.includes(option.value))
              : options.find((option) => option.value === value) || ""
          }
          onChange={handleSelectChange}
          onBlur={onBlur}
          options={options}
          placeholder={placeholder || `${label}`}
          isMulti={isMulti}
          isSearchable={true}
          openMenuOnFocus={true}
          className={`w-full ${style && style} `}
          styles={customStyles}
          components={{ MenuList: (props) => <CustomMenuList {...props} /> }}
          {...props}
        />
      ) : type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none bg-white dark:bg-themeBG dark:text-themeText min-h-[100px] focus:ring-2 focus:ring-primary/20 transition-all"
          {...props}
        />
      ) : type === "quill" ? (
        <div className={`quill-container ${isDarkMode ? "dark-quill" : ""}`}>
          <ReactQuill
            id={name}
            theme="snow"
            value={value || ""}
            onChange={handleQuillChange}
            modules={quillModules}
            formats={quillFormats}
            placeholder={placeholder}
            className="bg-white dark:bg-themeBG dark:text-themeText"
          />
        </div>
      ) : type === "checkbox" ? (
        <div className="flex items-center">
          <input
            type="checkbox"
            id={name}
            name={name}
            checked={value}
            onChange={handleCheckboxChange}
            onBlur={onBlur}
            className="mr-2"
            {...props}
          />
          <label htmlFor={name} className="text-gray-700">
            {label}
          </label>
        </div>
      ) : type === "password" ? (
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            onBlur={onBlur}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none bg-white dark:bg-themeBG dark:text-themeText focus:ring-2 focus:ring-primary/20 transition-all pr-10"
            {...props}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <LuEye size={18} /> : <LuEyeOff size={18} />}
          </button>
        </div>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          onBlur={onBlur}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none bg-white dark:bg-themeBG dark:text-themeText focus:ring-2 focus:ring-primary/20 transition-all"
          {...props}
        />
      )}

      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
};

export default InputField;
