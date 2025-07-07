// DonutChart.jsx - Reusable component for month-to-month comparisons
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';

const DonutChart = ({ 
    current, 
    previous, 
    type = "sales", 
    title,
    onDetailsClick,
    formatCurrency
}) => {
    const [animationProgress, setAnimationProgress] = useState(0);
    
    useEffect(() => {
        const timer = setTimeout(() => setAnimationProgress(1), 100);
        return () => clearTimeout(timer);
    }, []);

    // Calculate percentages and growth
    const total = current + previous;
    const currentPercentage = total > 0 ? (current / total) * 100 : 50;
    const previousPercentage = total > 0 ? (previous / total) * 100 : 50;
    const isPositiveGrowth = current >= previous;
    const growthPercentage = previous > 0 ? ((current - previous) / previous * 100).toFixed(1) : 0;
    
    // Chart dimensions
    const size = 180;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    // Calculate stroke dash arrays for animated segments
    const currentStrokeDasharray = (currentPercentage / 100) * circumference * animationProgress;
    const previousStrokeDasharray = (previousPercentage / 100) * circumference * animationProgress;
    
    // Color logic matching your dashboard theme
    const getColors = () => {
        if (type === "sales") {
            return {
                current: isPositiveGrowth ? "#10b981" : "#ef4444", // green-500 or red-500
                previous: "#94a3b8", // slate-400
                bgClass: isPositiveGrowth ? "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" : "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20"
            };
        } else {
            return {
                current: isPositiveGrowth ? "#ef4444" : "#10b981", // red for higher purchase, green for lower
                previous: "#94a3b8", // slate-400  
                bgClass: isPositiveGrowth ? "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20" : "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
            };
        }
    };

    const colors = getColors();

    // Format currency for display
    const formatCurrencyShort = (amount) => {
        if (!formatCurrency) {
            // Fallback formatting
            if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
            if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
            if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
            return `₹${amount}`;
        }
        
        // Use provided formatter for full amounts, but create short version for legend
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        return `₹${formatCurrency(amount)}`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title} Comparison
                </h3>
                <button 
                    onClick={onDetailsClick}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center transition-colors"
                >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                </button>
            </div>

            {/* Main Chart Container */}
            <div className={`bg-gradient-to-r ${colors.bgClass} rounded-lg p-4 transition-colors`}>
                <div className="flex flex-col items-center">
                    {/* SVG Donut Chart */}
                    <div className="relative mb-4">
                        <svg width={size} height={size} className="transform -rotate-90">
                            {/* Background circle */}
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke="#e2e8f0"
                                strokeWidth={strokeWidth}
                                className="opacity-30"
                            />
                            
                            {/* Previous month segment (gray) */}
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke={colors.previous}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${previousStrokeDasharray} ${circumference}`}
                                strokeLinecap="round"
                                style={{
                                    transition: 'stroke-dasharray 1.5s ease-in-out',
                                }}
                            />
                            
                            {/* Current month segment (colored) */}
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke={colors.current}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${currentStrokeDasharray} ${circumference}`}
                                strokeDashoffset={-previousStrokeDasharray}
                                strokeLinecap="round"
                                style={{
                                    transition: 'stroke-dasharray 1.5s ease-in-out 0.5s',
                                }}
                            />
                        </svg>
                        
                        {/* Center content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-center">
                                <div 
                                    className="text-2xl font-bold"
                                    style={{ color: colors.current }}
                                >
                                    {Math.abs(growthPercentage)}%
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center mt-1">
                                    {((type === "sales" && isPositiveGrowth) || (type === "purchase" && !isPositiveGrowth)) ? (
                                        <ArrowUpRight className="w-3 h-3 mr-1" />
                                    ) : (
                                        <ArrowDownRight className="w-3 h-3 mr-1" />
                                    )}
                                    {isPositiveGrowth ? 'increase' : 'decrease'}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="w-full space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: colors.current }}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">This Month</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatCurrencyShort(current)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: colors.previous }}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Previous Month</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatCurrencyShort(previous)}
                            </span>
                        </div>
                    </div>
                    
                    {/* Additional stats */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 w-full">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                            <span>Current: {currentPercentage.toFixed(1)}%</span>
                            <span>Previous: {previousPercentage.toFixed(1)}%</span>
                        </div>
                        
                        {/* Growth indicator bar */}
                        <div className="mt-2">
                            <div className="flex items-center justify-center">
                                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                                    ((type === "sales" && isPositiveGrowth) || (type === "purchase" && !isPositiveGrowth))
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                }`}>
                                    {((type === "sales" && isPositiveGrowth) || (type === "purchase" && !isPositiveGrowth)) ? (
                                        <ArrowUpRight className="w-3 h-3" />
                                    ) : (
                                        <ArrowDownRight className="w-3 h-3" />
                                    )}
                                    <span>
                                        {Math.abs(growthPercentage)}% vs last month
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonutChart;