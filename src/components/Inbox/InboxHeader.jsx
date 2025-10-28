// InboxHeader.jsx - Reusable Header Component for Inbox Verification Pages
import React from 'react';
import { ArrowLeft, Search, Briefcase } from 'lucide-react';

const InboxHeader = ({
    // Title and Navigation
    title = 'Verification',
    subtitle = '',
    itemCount = 0,
    onBackClick,
    backButtonTitle = 'Back to Dashboard',
    
    // Icon
    HeaderIcon = Briefcase,
    
    // Badges
    badgeText = '',
    badgeCount = 0,
    showBadgeCount = true,
    
    // Search Configuration
    searchConfig = {
        enabled: true,
        placeholder: 'Search...',
        value: '',
        onChange: () => {}
    },
    
    // Filter Configurations (Array of filters)
    filters = [],
    
    // Custom Render Props (for advanced customization)
    renderCustomContent = null,
    
    // Styling
    className = ''
}) => {
    return (
        <div className={`bg-gradient-to-r mb-2 from-indigo-600 via-indigo-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white ${className}` } >
            {/* Header Top Section */}
            <div className="flex items-center justify-between mb-4">
                {/* Left Side - Title Area */}
                <div className="flex items-center space-x-4">
                    {/* Back Button */}
                    {onBackClick && (
                        <button
                            onClick={onBackClick}
                            className="p-2 text-indigo-100 hover:text-white hover:bg-indigo-500 rounded-lg transition-colors"
                            title={backButtonTitle}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    
                    {/* Title with Icon */}
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-indigo-500 rounded-xl shadow-inner">
                            <HeaderIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {title}
                            </h1>
                            <p className="text-indigo-100 mt-1">
                                {subtitle}
                                {itemCount > 0 && ` • ${itemCount} ${itemCount === 1 ? 'Item' : 'Items'} pending`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Badges */}
                <div className="flex items-center space-x-2">
                    {badgeText && (
                        <div className="px-4 py-2 bg-indigo-500 text-indigo-100 text-sm rounded-full border border-indigo-400">
                            {badgeText}
                        </div>
                    )}
                    {showBadgeCount && (
                        <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm rounded-full shadow-md">
                            {badgeCount} Pending
                        </div>
                    )}
                </div>
            </div>

            {/* Search and Filters Section */}
            {(searchConfig.enabled || filters.length > 0 || renderCustomContent) && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search Input */}
                    {searchConfig.enabled && (
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-indigo-200" />
                                <input
                                    type="text"
                                    placeholder={searchConfig.placeholder}
                                    value={searchConfig.value}
                                    onChange={searchConfig.onChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-indigo-500/50 text-white placeholder-indigo-200 border border-indigo-400 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 backdrop-blur-sm"
                                />
                            </div>
                        </div>
                    )}
                    
                    {/* Dynamic Filters */}
                    {filters.map((filter, index) => (
                        <div key={index} className={filter.colSpan || ''}>
                            <select
                                value={filter.value}
                                onChange={filter.onChange}
                                className="w-full px-3 py-2.5 bg-indigo-500/50 text-white border border-indigo-400 rounded-xl focus:ring-2 focus:ring-indigo-300 backdrop-blur-sm"
                            >
                                <option value={filter.defaultValue || 'All'}>
                                    {filter.defaultLabel || 'All'}
                                </option>
                                {filter.options?.map((option) => (
                                    <option key={option.value || option} value={option.value || option}>
                                        {option.label || option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                    
                    {/* Custom Content Slot */}
                    {renderCustomContent && renderCustomContent()}
                </div>
            )}
        </div>
    );
};

export default InboxHeader;