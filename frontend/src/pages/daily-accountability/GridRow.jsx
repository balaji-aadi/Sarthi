import React, { useEffect } from 'react';

const GridRow = ({ row, index, columns, setRows }) => {
  
  const handleCellChange = (colId, value) => {
     setRows(prevRows => prevRows.map(r => r.id === row.id ? { ...r, [colId]: value } : r));
  };

  // Auto-assign date if it doesn't exist just when rendering.
  // Using an effect to update state if row doesn't have a date keeps it clean.
  useEffect(() => {
    if (!row.date) {
        handleCellChange('date', new Date().toISOString().split('T')[0]);
    }
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = row.date === todayStr;

  return (
    <div className={`flex border-b border-gray-100 hover:bg-gray-50/80 transition-all group duration-150 ${isToday ? 'bg-orange-50/40 hover:bg-orange-50/60' : 'bg-white'}`}>
      {columns.map(col => {
         let content;
         
         if (col.id === 'sno') {
            content = <span className="text-gray-400 font-medium text-xs px-2">{index + 1}</span>;
         } else if (col.id === 'date') {
            const dateVal = row[col.id] || new Date().toISOString().split('T')[0];
            content = (
                <input 
                    type="date" 
                    value={dateVal} 
                    onChange={(e) => handleCellChange(col.id, e.target.value)}
                    className={`w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-2 py-1.5 text-sm transition-colors ${isToday ? 'text-orange-600 font-medium' : 'text-gray-600'}`}
                />
            );
         } else if (col.id === 'verdict') {
            const currentVal = row[col.id] || 'Learning';
            content = (
                <select 
                    value={currentVal} 
                    onChange={(e) => handleCellChange(col.id, e.target.value)}
                    className={`w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-2 py-1.5 text-sm font-medium cursor-pointer appearance-none ${
                        currentVal === 'Done' ? 'text-emerald-600 bg-emerald-50' :
                        currentVal === 'Pending' ? 'text-orange-500 bg-orange-50' :
                        currentVal === 'Learning' ? 'text-blue-600 bg-blue-50' :
                        currentVal === 'Skipped' ? 'text-red-500 bg-red-50' :
                        'text-gray-600'
                    }`}
                >
                    <option value="Learning" className="text-blue-600 font-medium">Learning</option>
                    <option value="Done" className="text-emerald-600 font-medium">Done</option>
                    <option value="Pending" className="text-orange-500 font-medium">Pending</option>
                    <option value="Skipped" className="text-red-500 font-medium">Skipped</option>
                </select>
            );
         } else {
            // Text columns
            content = (
                <input 
                    type="text" 
                    value={row[col.id] || ''} 
                    onChange={(e) => handleCellChange(col.id, e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 focus:bg-white focus:shadow-sm rounded px-2 py-1.5 text-sm text-gray-700 placeholder-gray-300 transition-all"
                    placeholder="Click to edit..."
                />
            );
         }

         return (
            <div key={`${row.id}-${col.id}`} className="p-2 border-r border-gray-100 flex items-center flex-shrink-0" style={{ width: col.width || '150px' }}>
                {content}
            </div>
         );
      })}
      
      {/* Delete Row button */}
      <div className="p-2 flex-1 min-w-[50px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
            onClick={() => setRows(prev => prev.filter(r => r.id !== row.id))}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md p-1.5 text-xs transition-colors shadow-sm bg-white border border-gray-200"
            title="Delete row"
        >
            Delete
        </button>
      </div>
    </div>
  );
};

export default GridRow;
