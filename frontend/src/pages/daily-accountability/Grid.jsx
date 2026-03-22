import React from 'react';
import GridRow from './GridRow';

const Grid = ({ columns, rows, setRows, setColumns }) => {
  
  const handleColumnNameChange = (colId, newName) => {
    setColumns(columns.map(col => col.id === colId ? { ...col, label: newName } : col));
  };

  const removeColumn = (colId) => {
    setColumns(columns.filter(col => col.id !== colId));
  };
  
  return (
    <div className="w-full h-full border border-gray-200 rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col bg-white">
      <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0 bg-white custom-scrollbar">
        <div className="min-w-max inline-block w-full align-top">
          {/* Header */}
          <div className="flex sticky top-0 bg-gray-50 border-b border-gray-200 z-10 text-xs font-semibold text-gray-500 uppercase tracking-wider shadow-sm">
            {columns.map(col => (
               <div key={col.id} className="p-3 border-r border-gray-200 flex-shrink-0 relative group flex items-center justify-between" style={{ width: col.width || '150px' }}>
                  {['sno', 'date', 'verdict'].includes(col.id) ? (
                      <span className="truncate">{col.label}</span>
                  ) : (
                      <>
                        <input 
                            type="text" 
                            value={col.label}
                            onChange={(e) => handleColumnNameChange(col.id, e.target.value)}
                            className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-400 w-full hover:bg-gray-100 px-1 py-0.5 rounded transition-colors text-xs font-semibold uppercase tracking-wider"
                        />
                        <button 
                            onClick={() => removeColumn(col.id)}
                            className="ml-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove Column"
                        >
                            ×
                        </button>
                      </>
                  )}
               </div>
            ))}
            <div className="p-3 flex-1 min-w-[50px] bg-gray-50"></div>
          </div>

          {/* Body */}
          <div className="flex flex-col w-full">
              {rows.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                     <span className="text-gray-300 text-4xl">📝</span>
                     <p className="text-gray-500 font-medium">No entries found.</p>
                     <p className="text-sm text-gray-400">Click the "+ Add Row" button above to track your first day.</p>
                  </div>
              ) : (
                  rows.map((row, index) => (
                      <GridRow 
                          key={row.id} 
                          row={row} 
                          index={index} 
                          columns={columns} 
                          setRows={setRows} 
                      />
                  ))
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grid;
