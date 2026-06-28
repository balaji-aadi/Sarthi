import { 
    IoAdd, 
    IoFilterOutline, 
    IoGridOutline, 
    IoListOutline, 
    IoCalendarOutline, 
    IoTimeOutline, 
    IoChevronDownOutline, 
    IoSearchOutline, 
    IoCloseOutline 
} from 'react-icons/io5';
import { MdFilterAltOff } from 'react-icons/md';
import Select, { components } from 'react-select';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardHeader = ({ 
    viewMode, 
    setViewMode, 
    projects, 
    members, 
    selectedProject, 
    onProjectChange, 
    selectedMember, 
    onMemberChange,
    search,
    onSearchChange,
    onResetFilters,
    onCreateTask,
    isManager,
    isAdmin,
    canCreate,
    sortBy,
    onSortChange,
    parentId,
    onParentChange,
    parentTasks
}) => {

    const tabs = [
        { id: 'spreadsheet', label: 'Spreadsheet', icon: <IoListOutline /> },
        { id: 'timeline', label: 'Timeline', icon: <IoTimeOutline /> },
        { id: 'calendar', label: 'Calendar', icon: <IoCalendarOutline /> },
        { id: 'board', label: 'Board', icon: <IoGridOutline /> },
    ];

    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    // Highly premium custom styles for React-Select
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '38px',
            height: '38px',
            backgroundColor: '#ffffff',
            borderColor: state.isFocused ? '#6366f1' : '#e2e8f0', // Indigo border on focus
            borderRadius: '0.75rem',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : 'none',
            fontSize: '0.8125rem',
            fontWeight: '600',
            color: '#1e293b',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            paddingLeft: '4px',
            '&:hover': {
                borderColor: state.isFocused ? '#6366f1' : '#cbd5e1'
            }
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: '0 8px',
        }),
        input: (provided) => ({
            ...provided,
            margin: '0px',
            color: '#1e293b',
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: '36px',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#1e293b', // Rich Slate-800
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#94a3b8', // Slate-400
            fontWeight: '500',
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '1rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px border #f1f5f9',
            padding: '4px',
            zIndex: 100,
            overflow: 'hidden',
            backgroundColor: '#ffffff',
        }),
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
        menuList: (provided) => ({
            ...provided,
            padding: '0px',
        }),
        option: (provided, state) => ({
            ...provided,
            fontSize: '0.8125rem',
            fontWeight: '600',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            padding: '8px 12px',
            color: state.isSelected ? '#ffffff' : '#334155',
            backgroundColor: state.isSelected 
                ? '#6366f1' 
                : state.isFocused 
                    ? '#f1f5f9' 
                    : 'transparent',
            transition: 'all 0.15s ease',
            '&:active': {
                backgroundColor: state.isSelected ? '#6366f1' : '#e2e8f0'
            }
        })
    };

    const CustomMenuList = (props) => {
        return (
            <components.MenuList {...props}>
                <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                   Quick search...
                </div>
                {props.children}
            </components.MenuList>
        );
    };

    const CustomDropdownIndicator = (props) => {
        return (
            <components.DropdownIndicator {...props}>
                <IoChevronDownOutline 
                    size={14} 
                    className="text-slate-400 mr-2 transition-transform duration-300" 
                    style={{ transform: props.selectProps.menuIsOpen ? 'rotate(180deg)' : 'none' }}
                />
            </components.DropdownIndicator>
        );
    };

    const isAnyFilterActive = search || sortBy || parentId || selectedProject || selectedMember;

    return (
        <div className="bg-white/80 backdrop-blur-md px-6 py-4 flex flex-col gap-4 sticky top-0 z-[80] border-b border-slate-100 shadow-sm">
            {/* Top Row: Navigation View Tabs & Primary Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Navigation View Tabs */}
                <div className="flex items-center gap-1 bg-slate-100/60 p-1 rounded-2xl border border-slate-200/30 w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setViewMode(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 relative ${
                                viewMode === tab.id 
                                    ? 'text-slate-900 font-black' 
                                    : 'text-slate-500 hover:text-slate-700 font-bold'
                            }`}
                        >
                            {viewMode === tab.id && (
                                <motion.div 
                                    layoutId="header-tab-active"
                                    className="absolute inset-0 bg-white shadow-sm rounded-xl border border-slate-200/20"
                                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                />
                            )}
                            <span className="relative z-10">
                                {React.cloneElement(tab.icon, { size: 14 })}
                            </span>
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>
                
                {/* Actions (Refine View and Create Task) */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button 
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className={`px-5 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${
                            isFiltersOpen 
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                        }`}
                    >
                        <IoFilterOutline size={14} className={isFiltersOpen ? "rotate-180 transition-transform duration-300" : ""} />
                        <span>{isFiltersOpen ? 'Hide Controls' : 'Refine View'}</span>
                        {isAnyFilterActive && !isFiltersOpen && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        )}
                    </button>

                    {canCreate && (
                        <button
                            onClick={onCreateTask}
                            className="bg-slate-900 hover:bg-slate-950 text-white px-6 py-3 rounded-2xl font-black shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 text-[10px] uppercase tracking-wider"
                        >
                            <IoAdd size={16} className="text-white" />
                            <span>Create Task</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Expandable Refine View Controls Bar */}
            <AnimatePresence>
                {isFiltersOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 4 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden w-full"
                    >
                        <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Refine & Filter View</span>
                                {isAnyFilterActive && (
                                    <button 
                                        onClick={onResetFilters}
                                        className="text-[10px] font-black text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-all"
                                    >
                                        <MdFilterAltOff size={14} />
                                        <span>Reset All</span>
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap items-center gap-3 w-full">
                                {/* Search Bar */}
                                <div className="relative flex-grow min-w-[200px] max-w-full lg:max-w-xs">
                                    <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Find a task..." 
                                        value={search}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                        className="pl-10 pr-9 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 w-full h-[38px] transition-all"
                                    />
                                    {search && (
                                        <button 
                                            onClick={() => onSearchChange('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <IoCloseOutline size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Date Sort Selector */}
                                <div className="min-w-[150px] flex-grow lg:flex-grow-0 z-[60]">
                                    <Select 
                                        value={sortBy ? { value: sortBy, label: sortBy === 'newest' ? 'Newest First' : sortBy === 'oldest' ? 'Oldest First' : sortBy === 'deadlineSoon' ? 'Deadline Soon' : 'Deadline Late' } : null}
                                        onChange={(option) => onSortChange(option ? option.value : "")}
                                        options={[
                                            { value: "newest", label: "Newest First" },
                                            { value: "oldest", label: "Oldest First" },
                                            { value: "deadlineSoon", label: "Deadline Soon" },
                                            { value: "deadlineLate", label: "Deadline Late" }
                                        ]}
                                        placeholder="Sort By"
                                        isSearchable={true}
                                        styles={customStyles}
                                        components={{ 
                                            MenuList: CustomMenuList,
                                            DropdownIndicator: CustomDropdownIndicator
                                        }}
                                        isClearable={true}
                                        menuPortalTarget={document.body}
                                    />
                                </div>

                                {/* Parent Task Selector */}
                                <div className="min-w-[160px] flex-grow lg:flex-grow-0 z-[50]">
                                    <Select 
                                        value={parentId ? { value: parentId, label: parentTasks.find(t => t._id === parentId)?.taskName || "Unknown" } : null} 
                                        onChange={(option) => onParentChange(option ? option.value : "")}
                                        options={parentTasks.map(t => ({ value: t._id, label: t.taskName }))}
                                        placeholder="All Parents"
                                        isSearchable={true}
                                        styles={customStyles}
                                        components={{ 
                                            MenuList: CustomMenuList,
                                            DropdownIndicator: CustomDropdownIndicator
                                        }}
                                        isClearable={true}
                                        menuPortalTarget={document.body}
                                    />
                                </div>

                                {/* Project Selector (Arena) */}
                                <div className="min-w-[160px] flex-grow lg:flex-grow-0 z-[40]">
                                    <Select 
                                        value={selectedProject ? { value: selectedProject, label: projects.find(p => p.value === selectedProject)?.label || "Unknown" } : null} 
                                        onChange={(option) => onProjectChange(option ? option.value : "")}
                                        options={projects}
                                        placeholder="All Arenas"
                                        isSearchable={true}
                                        styles={customStyles}
                                        components={{ 
                                            MenuList: CustomMenuList,
                                            DropdownIndicator: CustomDropdownIndicator
                                        }}
                                        isClearable={true}
                                        menuPortalTarget={document.body}
                                    />
                                </div>

                                {/* Member Selector (Only for Managers/Admins) */}
                                {(isManager || isAdmin) && (
                                    <div className="min-w-[160px] flex-grow lg:flex-grow-0 z-[30]">
                                        <Select 
                                            value={selectedMember ? { value: selectedMember, label: members.find(m => m.value === selectedMember)?.label || "Unknown" } : null} 
                                            onChange={(option) => onMemberChange(option ? option.value : "")}
                                            options={members}
                                            placeholder="All Members"
                                            isSearchable={true}
                                            styles={customStyles}
                                            components={{ 
                                                MenuList: CustomMenuList,
                                                DropdownIndicator: CustomDropdownIndicator
                                            }}
                                            isClearable={true}
                                            menuPortalTarget={document.body}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardHeader;
