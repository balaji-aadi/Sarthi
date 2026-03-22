import React, { useState, useEffect } from 'react';
import GridSection from './GridSection';
import { FaDownload, FaSearch, FaPlus } from 'react-icons/fa';
import { DailyAccountabilityApi } from '../../services/api/DailyAccountability.api';
import toast from 'react-hot-toast';

const DEFAULT_SECTIONS = [
  {
    id: 'section_default',
    title: 'General Learning',
    rows: []
  }
];

const DailyAccountability = () => {
  const [sections, setSections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTabId, setActiveTabId] = useState('');

  const fetchBoard = async () => {
    try {
        setLoading(true);
        const res = await DailyAccountabilityApi.getBoard();
        const data = res.data?.data;
        if (data && data.sections && data.sections.length > 0) {
            setSections(data.sections);
            setActiveTabId(data.sections[0].id);
        } else {
            setSections(DEFAULT_SECTIONS);
            setActiveTabId(DEFAULT_SECTIONS[0].id);
        }
    } catch (e) {
        console.error("Failed to fetch daily accountability board", e);
        toast.error("Failed to load board");
        setSections(DEFAULT_SECTIONS); 
        setActiveTabId(DEFAULT_SECTIONS[0].id);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
     fetchBoard();
  }, []);

  useEffect(() => {
    if (loading || sections.length === 0) return;
    
    // Ensure active tab is valid if a section was deleted
    if (!sections.find(s => s.id === activeTabId)) {
        setActiveTabId(sections[0]?.id || '');
    }
    
    const timer = setTimeout(async () => {
        try {
            await DailyAccountabilityApi.saveBoard({ sections });
        } catch (e) {
            console.error("Failed to save board", e);
            // toast.error("Cloud sync failed"); // Suppress noisy auto-save toasts
        }
    }, 1500); 

    return () => clearTimeout(timer);
  }, [sections, loading]);

  const addCategorySection = () => {
    const newSectionId = `sec_${Date.now()}`;
    const newTopic = { id: newSectionId, title: 'New Topic', rows: [] };
    setSections([...sections, newTopic]);
    setActiveTabId(newSectionId);
  };

  const exportCSV = () => {
    const headers = ['Category/Topic', 'S.No', 'Date', 'Content', 'Verdict'].join(',');
    const csvRows = [];
    
    sections.forEach(sec => {
        sec.rows.forEach((row, index) => {
            const date = row.date || '';
            // Strip HTML from rich text for CSV export
            const cleanContent = row.content ? String(row.content).replace(/<[^>]+>/g, '') : '';
            const content = `"${cleanContent.replace(/"/g, '""')}"`;
            const verdict = row.verdict || '';
            const title = `"${String(sec.title).replace(/"/g, '""')}"`;
            csvRows.push([title, index + 1, date, content, verdict].join(','));
        });
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `daily_accountability_multi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleUpdateSection = (updatedSection) => {
      setSections(prev => prev.map(s => s.id === updatedSection.id ? updatedSection : s));
  };
  
  const handleRemoveSection = (sectionId) => {
      setSections(prev => prev.filter(s => s.id !== sectionId));
  };

  const activeSection = sections.find(s => s.id === activeTabId);

  return (
    <div className="flex flex-col h-full bg-bgLight overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-borderLight bg-surface z-20 gap-4 shrink-0">
            <div>
                <h1 className="text-2xl font-bold text-textMain tracking-tight">Daily Accountability System</h1>
                <p className="text-sm text-textSub mt-1">Track independent learning topics and their daily logs.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input 
                        type="text" 
                        placeholder="Search logs..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm border border-borderLight rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-48 transition-all bg-white text-textMain"
                    />
                </div>
                
                <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-textSub bg-white border border-borderLight hover:bg-slate-50 rounded-lg transition-colors" title="Export to CSV">
                    <FaDownload /> Export
                </button>
            </div>
        </div>
        
        {/* Tab Navigation Menu */}
        <div className="bg-surface px-6 pt-2 border-b border-borderLight flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
             {sections.map(sec => (
                 <button 
                    key={sec.id}
                    onClick={() => setActiveTabId(sec.id)}
                    className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                        activeTabId === sec.id 
                            ? 'border-primary text-primary' 
                            : 'border-transparent text-textSub hover:text-textMain hover:border-gray-300'
                    }`}
                 >
                     {sec.title || "Unnamed Topic"} 
                 </button>
             ))}
             <button 
                onClick={addCategorySection}
                className="px-3 py-2 flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary/10 rounded-md transition-colors ml-2 border border-dashed border-primary/50"
             >
                 <FaPlus size={10}/> Add Topic
             </button>
        </div>
        
        {/* Main Tab Content Area */}
        <div className="flex-1 overflow-hidden p-6 bg-slate-50/50 flex flex-col">
            {loading ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-textSub">
                    <span className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></span>
                    <p>Syncing from Cloud...</p>
                </div>
            ) : (
                activeSection ? (
                    <GridSection 
                        key={activeSection.id} 
                        section={activeSection} 
                        updateSection={handleUpdateSection} 
                        removeSection={handleRemoveSection}
                        searchQuery={searchQuery}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-textSub">
                        <p>No topic column selected.</p>
                        <button onClick={addCategorySection} className="mt-4 text-primary font-medium hover:underline">Create a new topic to begin</button>
                    </div>
                )
            )}
        </div>
    </div>
  );
};

export default DailyAccountability;
