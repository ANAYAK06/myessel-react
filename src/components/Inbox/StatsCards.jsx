// StatsCards.jsx - Reusable Statistics Cards Component
import React from 'react';

/**
 * StatsCards Component
 * 
 * A flexible component for displaying statistics cards in a grid layout.
 * Supports two visual styles: 'standard' (CC Budget) and 'simple' (DCA).
 * 
 * @param {Array} cards - Array of card configuration objects
 * @param {string} variant - 'standard' or 'simple' (default: 'standard')
 * @param {string} gridCols - Grid column classes (default: 'grid-cols-1 md:grid-cols-4')
 * @param {string} gap - Gap between cards (default: 'gap-6')
 * @param {string} className - Additional wrapper classes
 */

const StatsCards = ({
    cards = [],
    variant = 'standard', // 'standard' (CC Budget style) or 'simple' (DCA style)
    gridCols = 'grid-cols-1 md:grid-cols-4',
    gap = 'gap-6',
    className = ''
}) => {
    if (!cards || cards.length === 0) {
        return null;
    }

    return (
        <div className={`grid ${gridCols} ${gap} ${className}`}>
            {cards.map((card, index) => (
                <StatsCard
                    key={card.key || index}
                    {...card}
                    variant={variant}
                />
            ))}
        </div>
    );
};

/**
 * Individual StatsCard Component
 */
const StatsCard = ({
    // Content
    icon: Icon,
    value,
    label,
    
    // Colors (e.g., 'indigo', 'red', 'green', 'purple')
    color = 'indigo',
    
    // Progress bar
    progressWidth = '100%', // Can be number (0-100) or string ('75%')
    showProgress = true,
    
    // Variant
    variant = 'standard',
    
    // Custom classes
    className = '',
    
    // Click handler
    onClick = null
}) => {
    // Normalize progress width
    const normalizedProgress = typeof progressWidth === 'number' 
        ? `${Math.min(100, Math.max(0, progressWidth))}%`
        : progressWidth;

    // Color class mappings
    const colorClasses = {
        indigo: {
            bg: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20',
            border: 'border-indigo-200 dark:border-indigo-700',
            iconBg: 'bg-indigo-500',
            text: 'text-indigo-700 dark:text-indigo-300',
            subText: 'text-indigo-600 dark:text-indigo-400',
            progressBg: 'bg-indigo-200 dark:bg-indigo-800',
            progressBar: 'bg-indigo-500',
            decorCircle: 'bg-indigo-500/10'
        },
        purple: {
            bg: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
            border: 'border-purple-200 dark:border-purple-700',
            iconBg: 'bg-purple-500',
            text: 'text-purple-700 dark:text-purple-300',
            subText: 'text-purple-600 dark:text-purple-400',
            progressBg: 'bg-purple-200 dark:bg-purple-800',
            progressBar: 'bg-purple-500',
            decorCircle: 'bg-purple-500/10'
        },
        red: {
            bg: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
            border: 'border-red-200 dark:border-red-700',
            iconBg: 'bg-red-500',
            text: 'text-red-700 dark:text-red-300',
            subText: 'text-red-600 dark:text-red-400',
            progressBg: 'bg-red-200 dark:bg-red-800',
            progressBar: 'bg-red-500',
            decorCircle: 'bg-red-500/10'
        },
        green: {
            bg: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
            border: 'border-green-200 dark:border-green-700',
            iconBg: 'bg-green-500',
            text: 'text-green-700 dark:text-green-300',
            subText: 'text-green-600 dark:text-green-400',
            progressBg: 'bg-green-200 dark:bg-green-800',
            progressBar: 'bg-green-500',
            decorCircle: 'bg-green-500/10'
        },
        blue: {
            bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
            border: 'border-blue-200 dark:border-blue-700',
            iconBg: 'bg-blue-500',
            text: 'text-blue-700 dark:text-blue-300',
            subText: 'text-blue-600 dark:text-blue-400',
            progressBg: 'bg-blue-200 dark:bg-blue-800',
            progressBar: 'bg-blue-500',
            decorCircle: 'bg-blue-500/10'
        },
        teal: {
            bg: 'from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20',
            border: 'border-teal-200 dark:border-teal-700',
            iconBg: 'bg-teal-500',
            text: 'text-teal-700 dark:text-teal-300',
            subText: 'text-teal-600 dark:text-teal-400',
            progressBg: 'bg-teal-200 dark:bg-teal-800',
            progressBar: 'bg-teal-500',
            decorCircle: 'bg-teal-500/10'
        },
        orange: {
            bg: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
            border: 'border-orange-200 dark:border-orange-700',
            iconBg: 'bg-orange-500',
            text: 'text-orange-700 dark:text-orange-300',
            subText: 'text-orange-600 dark:text-orange-400',
            progressBg: 'bg-orange-200 dark:bg-orange-800',
            progressBar: 'bg-orange-500',
            decorCircle: 'bg-orange-500/10'
        },
        yellow: {
            bg: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20',
            border: 'border-yellow-200 dark:border-yellow-700',
            iconBg: 'bg-yellow-500',
            text: 'text-yellow-700 dark:text-yellow-300',
            subText: 'text-yellow-600 dark:text-yellow-400',
            progressBg: 'bg-yellow-200 dark:bg-yellow-800',
            progressBar: 'bg-yellow-500',
            decorCircle: 'bg-yellow-500/10'
        }
    };

    const colors = colorClasses[color] || colorClasses.indigo;

    // Standard variant (CC Budget style - with decorative circle)
    if (variant === 'standard') {
        return (
            <div
                className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colors.bg} p-6 border ${colors.border} shadow-lg hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
                onClick={onClick}
            >
                {/* Decorative Circle */}
                <div className={`absolute top-0 right-0 w-20 h-20 ${colors.decorCircle} rounded-full -mr-10 -mt-10`}></div>
                
                <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                        {/* Icon */}
                        <div className={`p-3 ${colors.iconBg} rounded-xl shadow-lg`}>
                            {Icon && <Icon className="w-6 h-6 text-white" />}
                        </div>
                        
                        {/* Value */}
                        <div className="text-right">
                            <p className={`text-2xl font-bold ${colors.text}`}>
                                {value}
                            </p>
                            <p className={`text-sm ${colors.subText}`}>
                                {label}
                            </p>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    {showProgress && (
                        <div className={`w-full ${colors.progressBg} rounded-full h-2 mt-3`}>
                            <div 
                                className={`${colors.progressBar} h-2 rounded-full transition-all duration-500`}
                                style={{ width: normalizedProgress }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    
    return (
        <div
            className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-5 border ${colors.border} shadow-md hover:shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between mb-3">
                {/* Icon */}
                <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
                    {Icon && <Icon className="w-6 h-6 text-white" />}
                </div>
                
                {/* Value */}
                <span className={`text-3xl font-bold ${colors.text}`}>
                    {value}
                </span>
            </div>
            
            {/* Label */}
            <p className={`text-sm ${colors.subText} font-medium`}>
                {label}
            </p>
            
            {/* Progress Bar */}
            {showProgress && (
                <div className={`mt-2 h-1 ${colors.progressBar} rounded-full`}></div>
            )}
        </div>
    );
};

export default StatsCards;
export { StatsCard };