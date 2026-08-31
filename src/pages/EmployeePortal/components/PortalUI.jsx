import React from 'react';
import { Sparkles, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export const PageHeader = ({ title, subtitle, icon: Icon, action }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
            {Icon && (
                <div className="w-10 h-10 rounded-xl bg-[#0d1b5e] dark:bg-[#0a1240] flex items-center justify-center shadow-sm shrink-0">
                    <Icon className="w-5 h-5 text-orange-400" />
                </div>
            )}
            <div>
                <h1 className="text-lg sm:text-xl font-bold text-[#0d1b5e] dark:text-white">{title}</h1>
                {subtitle && <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
    </div>
);

export const DemoBanner = ({ text = 'Demo preview — sample data shown for illustration. Not connected to live records.' }) => (
    <div className="flex items-start gap-2 mb-5 px-3.5 py-2.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
        <Sparkles className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
        <p className="text-xs text-orange-700 dark:text-orange-300">{text}</p>
    </div>
);

export const SectionCard = ({ title, icon: Icon, children, className = '', action }) => (
    <div className={`bg-white dark:bg-[#1e2535] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
        {title && (
            <div className="flex items-center justify-between gap-2.5 px-4 sm:px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-white/5">
                <div className="flex items-center gap-2.5 min-w-0">
                    {Icon && (
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0d1b5e] dark:bg-orange-500/20 shrink-0">
                            <Icon className="w-4 h-4 text-orange-400 dark:text-orange-400" />
                        </div>
                    )}
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{title}</h3>
                </div>
                {action}
            </div>
        )}
        <div className="p-4 sm:p-5">{children}</div>
    </div>
);

export const StatCard = ({ label, value, sub, icon: Icon, tone = 'navy' }) => {
    const tones = {
        navy: 'bg-[#0d1b5e] dark:bg-[#0a1240]',
        orange: 'bg-gradient-to-br from-orange-500 to-orange-600',
        white: 'bg-white dark:bg-[#1e2535] border border-gray-200 dark:border-gray-700',
    };
    const isDark = tone !== 'white';
    return (
        <div className={`rounded-xl p-4 shadow-sm ${tones[tone]}`}>
            <div className="flex items-center justify-between">
                <p className={`text-xs font-medium ${isDark ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>{label}</p>
                {Icon && (
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/15' : 'bg-orange-50 dark:bg-orange-500/15'}`}>
                        <Icon className={`w-4 h-4 ${isDark ? 'text-orange-300' : 'text-orange-500'}`} />
                    </div>
                )}
            </div>
            <p className={`text-xl font-bold mt-2 ${isDark ? 'text-white' : 'text-[#0d1b5e] dark:text-white'}`}>{value}</p>
            {sub && <p className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-400'}`}>{sub}</p>}
        </div>
    );
};

export const Badge = ({ children, className = '' }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${className}`}>
        {children}
    </span>
);

export const InfoRow = ({ label, value, className = '' }) => (
    <div className={`flex flex-col sm:flex-row sm:items-center py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 ${className}`}>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide sm:w-40 shrink-0 mb-0.5 sm:mb-0">
            {label}
        </span>
        <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
            {value || <span className="text-gray-400 dark:text-gray-500 font-normal">—</span>}
        </span>
    </div>
);

export const EmptyState = ({ icon: Icon, title, subtitle }) => (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
        {Icon && (
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                <Icon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
        )}
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">{subtitle}</p>}
    </div>
);

export const PrimaryButton = ({ children, className = '', ...props }) => (
    <button
        className={`inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-900 to-orange-500 hover:from-blue-950 hover:to-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
    >
        {children}
    </button>
);

export const SecondaryButton = ({ children, className = '', ...props }) => (
    <button
        className={`inline-flex items-center justify-center gap-1.5 bg-white dark:bg-white/5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
    >
        {children}
    </button>
);

export const FormField = ({ label, children, required, hint }) => (
    <label className="block">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            {label} {required && <span className="text-orange-500">*</span>}
        </span>
        <div className="mt-1.5">{children}</div>
        {hint && <span className="text-xs text-gray-400 mt-1 block">{hint}</span>}
    </label>
);

export const SearchInput = ({ value, onChange, placeholder = 'Search…', className = '' }) => (
    <div className={`relative w-full sm:w-64 ${className}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${inputClass} pl-9`}
        />
    </div>
);

export const Pagination = ({ page, totalPages, totalItems, pageSize, onPageChange }) => {
    if (totalPages <= 1) return null;
    const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalItems);
    return (
        <div className="flex items-center justify-between gap-3 pt-4 mt-1 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400">
                Showing {start}–{end} of {totalItems}
            </p>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 px-1 whitespace-nowrap">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export const inputClass =
    'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors';
