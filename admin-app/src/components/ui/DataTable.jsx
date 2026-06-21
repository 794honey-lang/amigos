import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export const DataTable = ({ 
  columns, 
  data = [], 
  pageSize = 5, 
  searchPlaceholder = "Search...", 
  searchKey,
  onRowClick,
  selectedRowId,
  rowIdKey = 'id',
  expandableRowRender
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredData = React.useMemo(() => {
    if (!searchTerm || !searchKey) return data;
    return data.filter(item => {
      const keys = Array.isArray(searchKey) ? searchKey : [searchKey];
      return keys.some(key => {
        const value = item[key];
        if (value === undefined || value === null) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, searchKey]);

  const sortedData = React.useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return sortOrder === 'asc' 
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortKey, sortOrder]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="bg-white border border-border rounded-card shadow-sm overflow-hidden flex flex-col">
      {searchKey && (
        <div className="p-4 border-b border-border bg-stone-50/50">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full max-w-xs px-3 py-1.5 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
          />
        </div>
      )}

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-border text-xs font-heading font-semibold text-text-secondary uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-3 font-semibold select-none ${col.sortable ? 'cursor-pointer hover:bg-stone-100 hover:text-text-primary' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && <ArrowUpDown className="w-3 h-3 text-text-muted" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs font-body text-text-primary">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => {
                const isSelected = selectedRowId && row[rowIdKey] === selectedRowId;
                return (
                  <React.Fragment key={row[rowIdKey] || rowIdx}>
                    <tr 
                      onClick={() => onRowClick && onRowClick(row)}
                      className={`transition-colors ${
                        onRowClick ? 'cursor-pointer hover:bg-amber-50/10' : 'hover:bg-amber-50/10'
                      } ${
                        isSelected 
                          ? 'bg-amber-50/40 hover:bg-amber-50/50' 
                          : rowIdx % 2 === 1 
                            ? 'bg-surface-sunken' 
                            : 'bg-white'
                      }`}
                    >
                      {columns.map((col, colIdx) => (
                        <td key={colIdx} className="px-6 py-3.5 whitespace-nowrap align-middle">
                          {col.render ? col.render(row) : row[col.key]}
                        </td>
                      ))}
                    </tr>
                    {isSelected && expandableRowRender && (
                      <tr className="bg-amber-50/10 transition-all">
                        <td colSpan={columns.length} className="px-6 py-4 border-y border-amber-100 bg-amber-50/5 text-left">
                          {expandableRowRender(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-text-muted font-medium">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between bg-stone-50/50 text-xs font-heading">
          <span className="text-text-muted font-medium">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} records
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 border border-stone-200 rounded-input bg-white hover:bg-stone-50 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-text-secondary" />
            </button>
            <span className="px-3 font-semibold text-text-primary">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 border border-stone-200 rounded-input bg-white hover:bg-stone-50 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
