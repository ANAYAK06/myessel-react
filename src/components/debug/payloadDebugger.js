import React, { useState, useMemo, useEffect } from 'react';
import { 
    Bug, ChevronDown, ChevronRight, AlertTriangle, CheckCircle, 
    XCircle, Info, Search, Copy, Eye, EyeOff, FileText, Database,
    Zap, Target, Filter, Download
} from 'lucide-react';

const PayloadDebugger = ({ 
    payload, 
    title = "Payload Debug Analysis", 
    expectedFields = [], 
    arrayFields = [],
    requiredFields = [],
    onClose,
    onContinue,
    actionType,
    className = ""
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyIssues, setShowOnlyIssues] = useState(false);
    const [showRawData, setShowRawData] = useState(false);

    // Field validation rules
    const fieldValidations = {
        email: (value) => {
            if (!value) return { valid: false, issue: 'Email is required' };
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value) ? 
                { valid: true } : 
                { valid: false, issue: 'Invalid email format' };
        },
        empRefNo: (value) => {
            if (!value) return { valid: false, issue: 'Employee reference number is required' };
            return value.toString().trim() !== '' ? 
                { valid: true } : 
                { valid: false, issue: 'Empty employee reference number' };
        },
        name: (value) => {
            if (!value) return { valid: false, issue: 'Name field is required' };
            return value.toString().trim().length >= 2 ? 
                { valid: true } : 
                { valid: false, issue: 'Name must be at least 2 characters' };
        },
        id: (value) => {
            if (value === null || value === undefined) return { valid: false, issue: 'ID field is null/undefined' };
            const numValue = Number(value);
            return !isNaN(numValue) && numValue > 0 ? 
                { valid: true } : 
                { valid: false, issue: 'ID must be a positive number' };
        },
        date: (value) => {
            if (!value) return { valid: false, issue: 'Date field is required' };
            const date = new Date(value);
            return !isNaN(date.getTime()) ? 
                { valid: true } : 
                { valid: false, issue: 'Invalid date format' };
        },
        array: (value, fieldName) => {
            if (!value) return { valid: true, issue: 'Array field is empty (may be optional)' };
            if (typeof value !== 'string') return { valid: false, issue: 'Array field should be comma-separated string' };
            return value.trim() !== '' ? 
                { valid: true } : 
                { valid: false, issue: 'Array field is empty string' };
        }
    };

    // Analyze payload
    const analysis = useMemo(() => {
        if (!payload || typeof payload !== 'object') {
            return {
                totalFields: 0,
                nullFields: [],
                undefinedFields: [],
                emptyFields: [],
                validFields: [],
                arrayFields: [],
                issues: [{ type: 'error', message: 'Invalid payload: not an object' }],
                fieldTypes: {},
                recommendations: []
            };
        }

        const result = {
            totalFields: 0,
            nullFields: [],
            undefinedFields: [],
            emptyFields: [],
            validFields: [],
            arrayFields: [],
            issues: [],
            fieldTypes: {},
            recommendations: [],
            missingRequired: [],
            fieldValidations: {}
        };

        const allFields = Object.keys(payload);
        result.totalFields = allFields.length;

        // Check each field
        allFields.forEach(fieldName => {
            const value = payload[fieldName];
            const fieldType = typeof value;
            result.fieldTypes[fieldName] = fieldType;

            // Basic null/undefined checks
            if (value === null) {
                result.nullFields.push(fieldName);
            } else if (value === undefined) {
                result.undefinedFields.push(fieldName);
            } else if (value === '' || (typeof value === 'string' && value.trim() === '')) {
                result.emptyFields.push(fieldName);
            } else {
                result.validFields.push(fieldName);
            }

            // Check if it's an array field
            if (arrayFields.includes(fieldName)) {
                result.arrayFields.push({
                    name: fieldName,
                    value: value,
                    type: fieldType,
                    valid: fieldValidations.array(value, fieldName)
                });
            }

            // Specific field validations
            const lowerFieldName = fieldName.toLowerCase();
            if (lowerFieldName.includes('email') || lowerFieldName.includes('mailid')) {
                result.fieldValidations[fieldName] = fieldValidations.email(value);
            } else if (lowerFieldName.includes('emprefno')) {
                result.fieldValidations[fieldName] = fieldValidations.empRefNo(value);
            } else if (lowerFieldName.includes('name') && !lowerFieldName.includes('username')) {
                result.fieldValidations[fieldName] = fieldValidations.name(value);
            } else if (lowerFieldName.includes('id') && lowerFieldName !== 'mailid') {
                result.fieldValidations[fieldName] = fieldValidations.id(value);
            } else if (lowerFieldName.includes('date') || lowerFieldName.includes('dob')) {
                result.fieldValidations[fieldName] = fieldValidations.date(value);
            }
        });

        // Check for missing required fields
        requiredFields.forEach(required => {
            if (!payload.hasOwnProperty(required)) {
                result.missingRequired.push(required);
            }
        });

        // Generate issues
        if (result.nullFields.length > 0) {
            result.issues.push({
                type: 'error',
                message: `${result.nullFields.length} fields are null`,
                fields: result.nullFields
            });
        }

        if (result.undefinedFields.length > 0) {
            result.issues.push({
                type: 'error', 
                message: `${result.undefinedFields.length} fields are undefined`,
                fields: result.undefinedFields
            });
        }

        if (result.emptyFields.length > 0) {
            result.issues.push({
                type: 'warning',
                message: `${result.emptyFields.length} fields are empty`,
                fields: result.emptyFields
            });
        }

        if (result.missingRequired.length > 0) {
            result.issues.push({
                type: 'error',
                message: `${result.missingRequired.length} required fields are missing`,
                fields: result.missingRequired
            });
        }

        // Field validation issues
        Object.entries(result.fieldValidations).forEach(([fieldName, validation]) => {
            if (!validation.valid) {
                result.issues.push({
                    type: 'error',
                    message: `${fieldName}: ${validation.issue}`,
                    fields: [fieldName]
                });
            }
        });

        // Generate recommendations
        if (result.nullFields.length > 0) {
            result.recommendations.push('Check field mapping in buildVerificationPayload function');
        }
        if (result.emptyFields.length > 0) {
            result.recommendations.push('Verify data fetching from selectedStaffData');
        }
        if (result.missingRequired.length > 0) {
            result.recommendations.push('Add missing required fields to payload');
        }

        return result;
    }, [payload, expectedFields, arrayFields, requiredFields]);

    // Filter fields based on search and issues filter
    const filteredFields = useMemo(() => {
        let fields = Object.keys(payload || {});
        
        if (searchTerm) {
            fields = fields.filter(field => 
                field.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(payload[field]).toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (showOnlyIssues) {
            fields = fields.filter(field => 
                analysis.nullFields.includes(field) ||
                analysis.undefinedFields.includes(field) ||
                analysis.emptyFields.includes(field) ||
                (analysis.fieldValidations[field] && !analysis.fieldValidations[field].valid)
            );
        }
        
        return fields;
    }, [payload, searchTerm, showOnlyIssues, analysis]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const downloadAnalysis = () => {
        const analysisReport = {
            timestamp: new Date().toISOString(),
            title,
            summary: {
                totalFields: analysis.totalFields,
                issueCount: analysis.issues.length,
                nullFields: analysis.nullFields.length,
                undefinedFields: analysis.undefinedFields.length,
                emptyFields: analysis.emptyFields.length
            },
            issues: analysis.issues,
            recommendations: analysis.recommendations,
            payload: showRawData ? payload : 'Hidden for brevity'
        };
        
        const blob = new Blob([JSON.stringify(analysisReport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payload-debug-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getFieldIcon = (fieldName) => {
        const value = payload[fieldName];
        if (value === null || value === undefined) return <XCircle className="w-4 h-4 text-red-500" />;
        if (value === '' || (typeof value === 'string' && value.trim() === '')) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
        if (analysis.fieldValidations[fieldName] && !analysis.fieldValidations[fieldName].valid) return <XCircle className="w-4 h-4 text-red-500" />;
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    };

    const getIssueIcon = (type) => {
        switch (type) {
            case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    if (!payload) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
                <div className="flex items-center space-x-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 font-medium">No payload provided for debugging</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-xl shadow-lg ${className}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 hover:bg-indigo-600 rounded"
                        >
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                        <Bug className="w-5 h-5" />
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <div className="flex items-center space-x-2">
                            {analysis.issues.length > 0 && (
                                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                    {analysis.issues.length} issues
                                </span>
                            )}
                            <span className="bg-indigo-700 text-white px-2 py-1 rounded-full text-xs">
                                {analysis.totalFields} fields
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {onContinue && actionType && (
                            <button
                                onClick={onContinue}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium"
                                title={`Continue with ${actionType} action`}
                            >
                                Continue {actionType}
                            </button>
                        )}
                        <button
                            onClick={downloadAnalysis}
                            className="p-2 hover:bg-indigo-600 rounded"
                            title="Download Analysis"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-red-600 rounded"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="p-4">
                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <Search className="w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search fields..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <label className="flex items-center space-x-2 text-sm">
                            <input
                                type="checkbox"
                                checked={showOnlyIssues}
                                onChange={(e) => setShowOnlyIssues(e.target.checked)}
                                className="rounded"
                            />
                            <Filter className="w-4 h-4" />
                            <span>Show only issues</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                            <input
                                type="checkbox"
                                checked={showRawData}
                                onChange={(e) => setShowRawData(e.target.checked)}
                                className="rounded"
                            />
                            {showRawData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            <span>Show raw data</span>
                        </label>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
                        {['overview', 'fields', 'arrays', 'issues'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                                    activeTab === tab
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <div className="space-y-4">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <Database className="w-5 h-5 text-blue-600" />
                                        <span className="text-2xl font-bold text-blue-700">{analysis.totalFields}</span>
                                    </div>
                                    <p className="text-blue-600 text-sm font-medium">Total Fields</p>
                                </div>
                                
                                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                    <div className="flex items-center justify-between">
                                        <XCircle className="w-5 h-5 text-red-600" />
                                        <span className="text-2xl font-bold text-red-700">
                                            {analysis.nullFields.length + analysis.undefinedFields.length}
                                        </span>
                                    </div>
                                    <p className="text-red-600 text-sm font-medium">Null/Undefined</p>
                                </div>
                                
                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                    <div className="flex items-center justify-between">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                        <span className="text-2xl font-bold text-yellow-700">{analysis.emptyFields.length}</span>
                                    </div>
                                    <p className="text-yellow-600 text-sm font-medium">Empty Fields</p>
                                </div>
                                
                                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="text-2xl font-bold text-green-700">{analysis.validFields.length}</span>
                                    </div>
                                    <p className="text-green-600 text-sm font-medium">Valid Fields</p>
                                </div>
                            </div>

                            {/* Recommendations */}
                            {analysis.recommendations.length > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                                        <Target className="w-4 h-4 mr-2" />
                                        Recommendations
                                    </h4>
                                    <ul className="space-y-1">
                                        {analysis.recommendations.map((rec, index) => (
                                            <li key={index} className="text-blue-700 text-sm flex items-start">
                                                <span className="text-blue-500 mr-2">•</span>
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'fields' && (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {filteredFields.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    {showOnlyIssues ? 'No fields with issues found' : 'No fields match search criteria'}
                                </div>
                            ) : (
                                filteredFields.map((fieldName) => {
                                    const value = payload[fieldName];
                                    const validation = analysis.fieldValidations[fieldName];
                                    
                                    return (
                                        <div key={fieldName} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center space-x-2">
                                                    {getFieldIcon(fieldName)}
                                                    <span className="font-medium text-gray-900">{fieldName}</span>
                                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                        {analysis.fieldTypes[fieldName]}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(String(value))}
                                                    className="p-1 hover:bg-gray-200 rounded"
                                                    title="Copy value"
                                                >
                                                    <Copy className="w-3 h-3 text-gray-500" />
                                                </button>
                                            </div>
                                            
                                            <div className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                                                {showRawData ? JSON.stringify(value) : (
                                                    value === null ? 'null' :
                                                    value === undefined ? 'undefined' :
                                                    value === '' ? '(empty string)' :
                                                    String(value).length > 50 ? String(value).substring(0, 50) + '...' :
                                                    String(value)
                                                )}
                                            </div>
                                            
                                            {validation && !validation.valid && (
                                                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                                    ⚠️ {validation.issue}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {activeTab === 'arrays' && (
                        <div className="space-y-3">
                            {analysis.arrayFields.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No array fields specified
                                </div>
                            ) : (
                                analysis.arrayFields.map((arrayField, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <Zap className="w-4 h-4 text-purple-600" />
                                                <span className="font-medium">{arrayField.name}</span>
                                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                                    Array Field
                                                </span>
                                            </div>
                                            {arrayField.valid.valid ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            )}
                                        </div>
                                        
                                        <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                                            {arrayField.value || '(empty)'}
                                        </div>
                                        
                                        {!arrayField.valid.valid && (
                                            <div className="mt-2 text-xs text-red-600">
                                                {arrayField.valid.issue}
                                            </div>
                                        )}
                                        
                                        {arrayField.value && (
                                            <div className="mt-2 text-xs text-gray-600">
                                                Items: {arrayField.value.split(',').filter(Boolean).length}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'issues' && (
                        <div className="space-y-3">
                            {analysis.issues.length === 0 ? (
                                <div className="text-center py-8 text-green-600">
                                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                                    <p className="font-medium">No issues detected!</p>
                                    <p className="text-sm text-gray-600">Your payload looks good to go.</p>
                                </div>
                            ) : (
                                analysis.issues.map((issue, index) => (
                                    <div key={index} className={`border rounded-lg p-4 ${
                                        issue.type === 'error' ? 'border-red-200 bg-red-50' :
                                        issue.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                                        'border-blue-200 bg-blue-50'
                                    }`}>
                                        <div className="flex items-start space-x-3">
                                            {getIssueIcon(issue.type)}
                                            <div className="flex-1">
                                                <p className={`font-medium ${
                                                    issue.type === 'error' ? 'text-red-700' :
                                                    issue.type === 'warning' ? 'text-yellow-700' :
                                                    'text-blue-700'
                                                }`}>
                                                    {issue.message}
                                                </p>
                                                {issue.fields && issue.fields.length > 0 && (
                                                    <div className="mt-2">
                                                        <p className="text-xs font-medium mb-1">Affected fields:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {issue.fields.map((field, fieldIndex) => (
                                                                <span key={fieldIndex} className={`text-xs px-2 py-1 rounded ${
                                                                    issue.type === 'error' ? 'bg-red-100 text-red-700' :
                                                                    issue.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                    {field}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PayloadDebugger;