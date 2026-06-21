import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const KpiCard = ({ title, value, icon: Icon, trend, description }) => {
  return (
    <div className="bg-white border border-border p-5 rounded-card shadow-sm flex items-start justify-between">
      <div className="space-y-2">
        <span className="text-xs font-heading font-medium text-text-secondary uppercase tracking-wider block">
          {title}
        </span>
        <h3 className="text-2xl font-heading font-extrabold text-text-primary">
          {value}
        </h3>
        {description && (
          <span className="text-[10px] text-text-muted font-body block">{description}</span>
        )}
        {trend && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className={`flex items-center gap-0.5 text-[10px] font-heading font-bold px-1.5 py-0.5 rounded-pill ${
              trend.type === 'up' 
                ? 'bg-green-50 text-success border border-success/15' 
                : 'bg-red-50 text-danger border border-danger/15'
            }`}>
              {trend.type === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span>{trend.value}</span>
            </span>
            <span className="text-[10px] text-text-muted font-body">{trend.label || 'vs last week'}</span>
          </div>
        )}
      </div>
      {Icon && (
        <div className="w-10 h-10 rounded-full bg-surface-sunken flex items-center justify-center text-brand border border-border shadow-inner">
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default KpiCard;
