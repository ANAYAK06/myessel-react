import React from 'react';
import { ArrowLeft, Search, Briefcase } from 'lucide-react';

const InboxHeader = ({
    title = 'Verification',
    subtitle = '',
    itemCount = 0,
    onBackClick,
    backButtonTitle = 'Back to Dashboard',

    HeaderIcon = Briefcase,

    badgeText = '',
    badgeCount = 0,
    showBadgeCount = true,

    searchConfig = {
        enabled: true,
        placeholder: 'Search...',
        value: '',
        onChange: () => {}
    },

    filters = [],
    renderCustomContent = null,

    className = ''
}) => {
    return (
        <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 shadow-lg shadow-blue-900/20 px-5 py-3 text-white mb-2 ${className}`}>
            {/* Dot pattern */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                }}
            />
            {/* Orange glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-400 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />

            {/* Single compact row */}
            <div className="relative flex items-center gap-3">
                {/* Back button */}
                {onBackClick && (
                    <button
                        onClick={onBackClick}
                        className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
                        title={backButtonTitle}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                )}

                {/* Icon */}
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20 shrink-0">
                    <HeaderIcon className="h-5 w-5 text-white" />
                </div>

                {/* Title block */}
                <div className="min-w-0 flex-shrink-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        {badgeText && (
                            <span className="text-[10px] font-bold text-orange-200 uppercase tracking-wider bg-orange-500/25 px-1.5 py-0.5 rounded-full border border-orange-400/30 leading-none">
                                {badgeText}
                            </span>
                        )}
                        {showBadgeCount && badgeCount > 0 && (
                            <span className="text-[10px] bg-red-500/80 text-white px-1.5 py-0.5 rounded-full font-semibold leading-none">
                                {badgeCount} Pending
                            </span>
                        )}
                    </div>
                    <h1 className="text-sm font-bold leading-tight truncate">{title}</h1>
                    {(subtitle || itemCount > 0) && (
                        <p className="text-blue-300 text-[11px] leading-tight truncate">
                            {subtitle}{itemCount > 0 ? ` • ${itemCount} ${itemCount === 1 ? 'item' : 'items'} pending` : ''}
                        </p>
                    )}
                </div>

                {/* Search + filters — right side */}
                {(searchConfig.enabled || filters.length > 0 || renderCustomContent) && (
                    <div className="flex items-center gap-2 ml-auto flex-1 max-w-2xl justify-end">
                        {searchConfig.enabled && (
                            <div className="relative flex-1 max-w-xs">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-300" />
                                <input
                                    type="text"
                                    placeholder={searchConfig.placeholder}
                                    value={searchConfig.value}
                                    onChange={searchConfig.onChange}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/10 text-white placeholder-blue-300 border border-white/20 rounded-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400 backdrop-blur-sm"
                                />
                            </div>
                        )}

                        {filters.map((filter, index) => (
                            <div key={index} className={filter.colSpan || 'w-36'}>
                                <select
                                    value={filter.value}
                                    onChange={filter.onChange}
                                    className="w-full px-2.5 py-1.5 text-xs bg-white/10 text-white border border-white/20 rounded-lg focus:ring-1 focus:ring-orange-400 backdrop-blur-sm"
                                >
                                    <option value={filter.defaultValue || 'All'} className="text-gray-900">
                                        {filter.defaultLabel || 'All'}
                                    </option>
                                    {filter.options?.map((option) => (
                                        <option key={option.value || option} value={option.value || option} className="text-gray-900">
                                            {option.label || option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}

                        {renderCustomContent && renderCustomContent()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InboxHeader;
