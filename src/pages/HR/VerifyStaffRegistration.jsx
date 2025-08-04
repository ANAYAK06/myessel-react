// components/HR/VerifyStaffRegistration.js - DEMO STAFF REGISTRATION VERIFICATION
import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, User, Phone, Mail, MapPin, Calendar, FileText, 
    CheckCircle, XCircle, Clock, AlertCircle, Download, Eye,
    Building2, IdCard, Users, Star, Award, Briefcase, GraduationCap,
    DollarSign, Shield, Camera, Search, Filter, RefreshCw
} from 'lucide-react';

const VerifyStaffRegistration = ({ notificationData, onNavigate }) => {
    const [pendingRegistrations, setPendingRegistrations] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [verificationComment, setVerificationComment] = useState('');
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');

    const {
        InboxTitle,
        ModuleDisplayName,
        TotalPendingCount,
        MasterId,
        CCCodes,
        RoleId
    } = notificationData || {};

    // Mock data for demo
    const mockRegistrations = [
        {
            id: 1,
            applicationId: "SR2025001",
            name: "Rajesh Kumar Singh",
            email: "rajesh.singh@company.com",
            phone: "9876543210",
            alternatePhone: "9876543211",
            department: "Information Technology",
            designation: "Senior Software Developer",
            proposedSalary: 850000,
            joiningDate: "2025-02-15",
            dateOfBirth: "1990-05-15",
            gender: "Male",
            bloodGroup: "O+",
            address: "123, MG Road, Koramangala, Bangalore, Karnataka - 560034",
            emergencyContact: {
                name: "Priya Singh",
                relation: "Spouse", 
                phone: "9876543212",
                address: "Same as above"
            },
            documents: [
                { type: "Resume/CV", uploaded: true, fileName: "rajesh_resume.pdf", size: "1.2 MB" },
                { type: "Aadhaar Card", uploaded: true, fileName: "aadhaar_copy.pdf", size: "0.8 MB" },
                { type: "PAN Card", uploaded: true, fileName: "pan_copy.pdf", size: "0.5 MB" },
                { type: "Educational Certificates", uploaded: true, fileName: "education_certs.pdf", size: "2.1 MB" },
                { type: "Experience Letters", uploaded: true, fileName: "experience_letters.pdf", size: "1.8 MB" },
                { type: "Passport Photo", uploaded: true, fileName: "passport_photo.jpg", size: "0.3 MB" },
                { type: "Medical Certificate", uploaded: true, fileName: "medical_cert.pdf", size: "0.9 MB" },
                { type: "Background Verification", uploaded: false, fileName: "", size: "" }
            ],
            education: [
                { 
                    degree: "B.Tech Computer Science Engineering", 
                    college: "Indian Institute of Technology, Bangalore", 
                    year: "2012", 
                    percentage: "85.6%",
                    grade: "First Class with Distinction"
                },
                { 
                    degree: "M.Tech Software Engineering", 
                    college: "Indian Institute of Science, Bangalore", 
                    year: "2014", 
                    percentage: "88.2%",
                    grade: "First Class with Distinction"
                }
            ],
            experience: [
                { 
                    company: "Tata Consultancy Services", 
                    designation: "Software Engineer", 
                    duration: "June 2014 - May 2017", 
                    experience: "3 years",
                    salary: "₹4.2L per annum",
                    responsibilities: "Full-stack development, React.js, Node.js"
                },
                { 
                    company: "Infosys Limited", 
                    designation: "Senior Software Engineer", 
                    duration: "June 2017 - December 2022", 
                    experience: "5.5 years",
                    salary: "₹12.8L per annum",
                    responsibilities: "Team lead, Architecture design, Microservices"
                },
                { 
                    company: "Wipro Technologies", 
                    designation: "Technical Lead", 
                    duration: "January 2023 - Present", 
                    experience: "2 years",
                    salary: "₹18.5L per annum",
                    responsibilities: "Technical leadership, Cloud migration, DevOps"
                }
            ],
            skills: ["React.js", "Node.js", "Python", "AWS", "Docker", "Kubernetes", "MongoDB", "PostgreSQL"],
            submittedDate: "2025-01-25",
            submittedBy: "HR Department",
            hrRemarks: "Excellent candidate with strong technical background. Recommended for senior position.",
            status: "Pending Verification",
            priority: "High",
            photo: "/api/placeholder/150/150",
            references: [
                { name: "Amit Sharma", company: "Infosys", designation: "Senior Manager", phone: "9876543213" },
                { name: "Sridhar Rao", company: "Wipro", designation: "Project Director", phone: "9876543214" }
            ]
        },
        {
            id: 2,
            applicationId: "SR2025002", 
            name: "Priya Sharma",
            email: "priya.sharma@company.com",
            phone: "9876543213",
            alternatePhone: "9876543214",
            department: "Human Resources",
            designation: "HR Executive",
            proposedSalary: 450000,
            joiningDate: "2025-02-20",
            dateOfBirth: "1995-08-22",
            gender: "Female",
            bloodGroup: "A+",
            address: "456, Brigade Road, Richmond Town, Bangalore, Karnataka - 560025",
            emergencyContact: {
                name: "Raj Sharma",
                relation: "Father",
                phone: "9876543215",
                address: "Same as above"
            },
            documents: [
                { type: "Resume/CV", uploaded: true, fileName: "priya_resume.pdf", size: "0.9 MB" },
                { type: "Aadhaar Card", uploaded: true, fileName: "aadhaar_copy.pdf", size: "0.7 MB" },
                { type: "PAN Card", uploaded: true, fileName: "pan_copy.pdf", size: "0.4 MB" },
                { type: "Educational Certificates", uploaded: true, fileName: "education_certs.pdf", size: "1.5 MB" },
                { type: "Experience Letters", uploaded: false, fileName: "", size: "" },
                { type: "Passport Photo", uploaded: true, fileName: "passport_photo.jpg", size: "0.2 MB" },
                { type: "Medical Certificate", uploaded: true, fileName: "medical_cert.pdf", size: "0.8 MB" },
                { type: "Background Verification", uploaded: true, fileName: "bg_verification.pdf", size: "1.1 MB" }
            ],
            education: [
                { 
                    degree: "MBA Human Resources Management", 
                    college: "Christ University, Bangalore", 
                    year: "2018", 
                    percentage: "82.4%",
                    grade: "First Class"
                },
                { 
                    degree: "B.Com (Bachelor of Commerce)", 
                    college: "St. Joseph's College of Commerce", 
                    year: "2016", 
                    percentage: "78.6%",
                    grade: "First Class"
                }
            ],
            experience: [
                { 
                    company: "Wipro Technologies", 
                    designation: "HR Associate", 
                    duration: "July 2018 - August 2023", 
                    experience: "5 years 1 month",
                    salary: "₹6.8L per annum",
                    responsibilities: "Recruitment, Employee engagement, Policy implementation"
                }
            ],
            skills: ["HR Management", "Recruitment", "Employee Relations", "HRMS", "Excel", "Communication"],
            submittedDate: "2025-01-28",
            submittedBy: "HR Department", 
            hrRemarks: "Good candidate for HR role. Experience in similar industry helpful.",
            status: "Pending Verification",
            priority: "Medium",
            photo: "/api/placeholder/150/150",
            references: [
                { name: "Sunita Reddy", company: "Wipro", designation: "HR Manager", phone: "9876543216" }
            ]
        },
        {
            id: 3,
            applicationId: "SR2025003",
            name: "Mohammed Arif Khan",
            email: "arif.khan@company.com", 
            phone: "9876543217",
            alternatePhone: "9876543218",
            department: "Finance",
            designation: "Financial Analyst",
            proposedSalary: 650000,
            joiningDate: "2025-03-01",
            dateOfBirth: "1992-12-10",
            gender: "Male",
            bloodGroup: "B+",
            address: "789, Commercial Street, Shivaji Nagar, Bangalore, Karnataka - 560001",
            emergencyContact: {
                name: "Fatima Khan",
                relation: "Wife",
                phone: "9876543219",
                address: "Same as above"
            },
            documents: [
                { type: "Resume/CV", uploaded: true, fileName: "arif_resume.pdf", size: "1.1 MB" },
                { type: "Aadhaar Card", uploaded: true, fileName: "aadhaar_copy.pdf", size: "0.6 MB" },
                { type: "PAN Card", uploaded: true, fileName: "pan_copy.pdf", size: "0.5 MB" },
                { type: "Educational Certificates", uploaded: true, fileName: "education_certs.pdf", size: "1.9 MB" },
                { type: "Experience Letters", uploaded: true, fileName: "experience_letters.pdf", size: "1.4 MB" },
                { type: "Passport Photo", uploaded: true, fileName: "passport_photo.jpg", size: "0.4 MB" },
                { type: "Medical Certificate", uploaded: false, fileName: "", size: "" },
                { type: "Background Verification", uploaded: true, fileName: "bg_verification.pdf", size: "1.0 MB" }
            ],
            education: [
                { 
                    degree: "CA (Chartered Accountancy)", 
                    college: "Institute of Chartered Accountants of India", 
                    year: "2016", 
                    percentage: "First Attempt",
                    grade: "Qualified"
                },
                { 
                    degree: "B.Com (Honors)", 
                    college: "Delhi University", 
                    year: "2014", 
                    percentage: "79.8%",
                    grade: "First Class"
                }
            ],
            experience: [
                { 
                    company: "Deloitte India", 
                    designation: "Junior Analyst", 
                    duration: "August 2016 - July 2019", 
                    experience: "3 years",
                    salary: "₹7.2L per annum",
                    responsibilities: "Financial analysis, Audit, Taxation"
                },
                { 
                    company: "KPMG India", 
                    designation: "Senior Financial Analyst", 
                    duration: "August 2019 - Present", 
                    experience: "5.5 years",
                    salary: "₹15.6L per annum",
                    responsibilities: "Financial modeling, Risk assessment, Client advisory"
                }
            ],
            skills: ["Financial Analysis", "Excel", "SAP", "Taxation", "Audit", "Risk Management", "SQL"],
            submittedDate: "2025-01-30",
            submittedBy: "Finance Department",
            hrRemarks: "Strong financial background. CA qualification is valuable for our finance team.",
            status: "Pending Verification",
            priority: "High",
            photo: "/api/placeholder/150/150",
            references: [
                { name: "Rajesh Gupta", company: "KPMG", designation: "Director", phone: "9876543220" },
                { name: "Suresh Iyer", company: "Deloitte", designation: "Partner", phone: "9876543221" }
            ]
        }
    ];

    useEffect(() => {
        // Simulate API call
        setLoading(true);
        setTimeout(() => {
            setPendingRegistrations(mockRegistrations);
            setLoading(false);
        }, 1000);
    }, []);

    const handleBackToInbox = () => {
        if (onNavigate) {
            onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
        }
    };

    const handleApprove = async (registration) => {
        if (!verificationComment.trim()) {
            alert('Please add verification comments before approving.');
            return;
        }

        setActionLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setPendingRegistrations(prev => prev.filter(r => r.id !== registration.id));
            setSelectedStaff(null);
            setVerificationComment('');
            alert(`✅ ${registration.name}'s registration approved successfully!`);
        } catch (error) {
            console.error('Error approving registration:', error);
            alert('Error approving registration. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (registration) => {
        if (!verificationComment.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }

        setActionLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setPendingRegistrations(prev => prev.filter(r => r.id !== registration.id));
            setSelectedStaff(null);
            setVerificationComment('');
            alert(`❌ ${registration.name}'s registration rejected.`);
        } catch (error) {
            console.error('Error rejecting registration:', error);
            alert('Error rejecting registration. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { 
            style: 'currency', 
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleDocumentView = (document) => {
        setSelectedDocument(document);
        setShowDocumentModal(true);
    };

    const filteredRegistrations = pendingRegistrations.filter(reg => {
        const matchesSearch = reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            reg.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            reg.department.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment = filterDepartment === 'All' || reg.department === filterDepartment;
        const matchesPriority = filterPriority === 'All' || reg.priority === filterPriority;
        
        return matchesSearch && matchesDepartment && matchesPriority;
    });

    const departments = [...new Set(pendingRegistrations.map(r => r.department))];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-sm p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBackToInbox}
                            className="p-2 text-indigo-100 hover:text-white hover:bg-indigo-600 rounded-lg transition-colors"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-indigo-500 rounded-lg">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {InboxTitle || 'Staff Registration Verification'}
                                </h1>
                                <p className="text-indigo-100 mt-1">
                                    {ModuleDisplayName} • {pendingRegistrations.length} applications pending
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="px-3 py-1 bg-indigo-500 text-indigo-100 text-xs rounded-full">
                            HR Verification
                        </div>
                        <div className="px-3 py-1 bg-red-500 text-white text-xs rounded-full">
                            {pendingRegistrations.length} Pending
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-indigo-200" />
                            <input
                                type="text"
                                placeholder="Search by name, ID, or department..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-indigo-500 text-white placeholder-indigo-200 border border-indigo-400 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            className="w-full px-3 py-2 bg-indigo-500 text-white border border-indigo-400 rounded-lg focus:ring-2 focus:ring-indigo-300"
                        >
                            <option value="All">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="w-full px-3 py-2 bg-indigo-500 text-white border border-indigo-400 rounded-lg focus:ring-2 focus:ring-indigo-300"
                        >
                            <option value="All">All Priorities</option>
                            <option value="High">High Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="Low">Low Priority</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
                            <p className="text-2xl font-bold text-indigo-600">{pendingRegistrations.length}</p>
                        </div>
                        <FileText className="w-8 h-8 text-indigo-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
                            <p className="text-2xl font-bold text-red-600">
                                {pendingRegistrations.filter(r => r.priority === 'High').length}
                            </p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Departments</p>
                            <p className="text-2xl font-bold text-green-600">{departments.length}</p>
                        </div>
                        <Building2 className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Experience</p>
                            <p className="text-2xl font-bold text-purple-600">4.5 yrs</p>
                        </div>
                        <Award className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Staff Registrations List - Summary View */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <Clock className="w-5 h-5 text-orange-500" />
                                    <span>Pending Staff Registrations ({filteredRegistrations.length})</span>
                                </h2>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    title="Refresh"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                                    <p className="text-gray-500">Loading pending registrations...</p>
                                </div>
                            ) : filteredRegistrations.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                    <p className="text-gray-500">No staff registrations found!</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {searchQuery || filterDepartment !== 'All' || filterPriority !== 'All' 
                                            ? 'Try adjusting your filters.' 
                                            : 'All applications have been processed.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredRegistrations.map((registration) => (
                                        <div
                                            key={registration.id}
                                            className={`border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                                selectedStaff?.id === registration.id
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                            }`}
                                            onClick={() => setSelectedStaff(registration)}
                                        >
                                            <div className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="relative">
                                                            <img 
                                                                src={registration.photo} 
                                                                alt={registration.name}
                                                                className="w-14 h-14 rounded-full border-2 border-gray-200 object-cover"
                                                            />
                                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                                <User className="w-2 h-2 text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-3 mb-2">
                                                                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                                    {registration.name}
                                                                </h3>
                                                                <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(registration.priority)}`}>
                                                                    {registration.priority}
                                                                </span>
                                                                <span className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                                    {registration.applicationId}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                                <div className="flex items-center space-x-2">
                                                                    <Building2 className="w-4 h-4" />
                                                                    <span>{registration.department}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <IdCard className="w-4 h-4" />
                                                                    <span>{registration.designation}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>Joining: {registration.joiningDate}</span>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <DollarSign className="w-4 h-4" />
                                                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                                        {formatCurrency(registration.proposedSalary)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                                                <span>Experience: {registration.experience.reduce((total, exp) => total + parseFloat(exp.experience), 0).toFixed(1)} years</span>
                                                                <span>•</span>
                                                                <span>Documents: {registration.documents.filter(d => d.uploaded).length}/{registration.documents.length}</span>
                                                                <span>•</span>
                                                                <span>Applied: {registration.submittedDate}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Staff Details Panel - Detail View */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors sticky top-6">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {selectedStaff ? 'Staff Details' : 'Select an Application'}
                            </h2>
                        </div>

                        <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {selectedStaff ? (
                                <div className="space-y-6">
                                    {/* Staff Photo and Basic Info */}
                                    <div className="flex items-center space-x-6 bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
                                        <img 
                                            src={selectedStaff.photo} 
                                            alt={selectedStaff.name}
                                            className="w-24 h-24 rounded-full border-4 border-indigo-200"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">{selectedStaff.name}</h3>
                                            <p className="text-indigo-600 dark:text-indigo-400 font-medium">{selectedStaff.designation}</p>
                                            <p className="text-gray-600 dark:text-gray-300">{selectedStaff.department}</p>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <span className={`px-3 py-1 text-xs rounded-full ${getPriorityColor(selectedStaff.priority)}`}>
                                                    {selectedStaff.priority} Priority
                                                </span>
                                                <span className="text-lg font-bold text-green-600">
                                                    {formatCurrency(selectedStaff.proposedSalary)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Information Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Personal Information */}
                                        <div>
                                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                                                <User className="w-4 h-4 mr-2" />
                                                Personal Information
                                            </h4>
                                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
                                                    <p className="font-medium">{selectedStaff.email}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase tracking-wide">Phone</label>
                                                    <p className="font-medium">{selectedStaff.phone}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs text-gray-500 uppercase tracking-wide">DOB</label>
                                                        <p className="font-medium">{selectedStaff.dateOfBirth}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500 uppercase tracking-wide">Blood Group</label>
                                                        <p className="font-medium">{selectedStaff.bloodGroup}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase tracking-wide">Address</label>
                                                    <p className="font-medium text-sm">{selectedStaff.address}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Emergency Contact */}
                                        <div>
                                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                                                <Shield className="w-4 h-4 mr-2" />
                                                Emergency Contact
                                            </h4>
                                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg space-y-3">
                                                <div>
                                                    <label className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wide">Name</label>
                                                    <p className="font-medium">{selectedStaff.emergencyContact.name}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wide">Relation</label>
                                                        <p className="font-medium">{selectedStaff.emergencyContact.relation}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wide">Phone</label>
                                                        <p className="font-medium">{selectedStaff.emergencyContact.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Education & Experience Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Education */}
                                        <div>
                                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                                                <GraduationCap className="w-4 h-4 mr-2" />
                                                Education
                                            </h4>
                                            <div className="space-y-3">
                                                {selectedStaff.education.map((edu, index) => (
                                                    <div key={index} className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                                                        <div className="font-semibold text-green-800 dark:text-green-300">{edu.degree}</div>
                                                        <div className="text-green-600 dark:text-green-400 text-sm">{edu.college}</div>
                                                        <div className="flex justify-between text-xs text-green-500 mt-2">
                                                            <span>{edu.year}</span>
                                                            <span className="font-medium">{edu.percentage}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Experience */}
                                        <div>
                                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                                                <Briefcase className="w-4 h-4 mr-2" />
                                                Experience
                                            </h4>
                                            <div className="space-y-3">
                                                {selectedStaff.experience.map((exp, index) => (
                                                    <div key={index} className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border-l-4 border-indigo-500">
                                                        <div className="font-semibold text-indigo-800 dark:text-indigo-300">{exp.designation}</div>
                                                        <div className="text-indigo-600 dark:text-indigo-400 text-sm">{exp.company}</div>
                                                        <div className="flex justify-between text-xs text-indigo-500 mt-2">
                                                            <span>{exp.duration}</span>
                                                            <span className="font-medium">{exp.salary}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div>
                                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                                            <Star className="w-4 h-4 mr-2" />
                                            Skills
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedStaff.skills.map((skill, index) => (
                                                <span key={index} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-sm rounded-full">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Documents */}
                                    <div>
                                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Documents ({selectedStaff.documents.filter(d => d.uploaded).length}/{selectedStaff.documents.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {selectedStaff.documents.map((doc, index) => (
                                                <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${doc.uploaded ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                                                    <div className="flex items-center space-x-3">
                                                        <FileText className={`w-4 h-4 ${doc.uploaded ? 'text-green-600' : 'text-red-600'}`} />
                                                        <div>
                                                            <div className="text-sm font-medium">{doc.type}</div>
                                                            {doc.uploaded && <div className="text-xs text-gray-500">{doc.size}</div>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {doc.uploaded ? (
                                                            <>
                                                                <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                                                                <button
                                                                    onClick={() => handleDocumentView(doc)}
                                                                    className="text-indigo-600 hover:text-indigo-800"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-red-600 font-medium">✗ Missing</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* HR Remarks */}
                                    {selectedStaff.hrRemarks && (
                                        <div>
                                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">HR Department Remarks</h4>
                                            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-4 rounded-lg">
                                                <p className="text-indigo-800 dark:text-indigo-200 italic">"{selectedStaff.hrRemarks}"</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Verification Comments */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Verification Comments *
                                        </label>
                                        <textarea
                                            value={verificationComment}
                                            onChange={(e) => setVerificationComment(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                            rows="4"
                                            placeholder="Provide detailed verification comments, decision rationale, and any recommendations..."
                                            required
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleApprove(selectedStaff)}
                                            disabled={actionLoading || !verificationComment.trim()}
                                            className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            <span>{actionLoading ? 'Processing...' : 'Approve Registration'}</span>
                                        </button>
                                        <button
                                            onClick={() => handleReject(selectedStaff)}
                                            disabled={actionLoading || !verificationComment.trim()}
                                            className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            <span>{actionLoading ? 'Processing...' : 'Reject Registration'}</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Select a staff registration from the list to view details and take action.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Modal */}
            {showDocumentModal && selectedDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    {selectedDocument.type}
                                </h3>
                                <button
                                    onClick={() => setShowDocumentModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">File Name:</span>
                                    <span className="text-sm font-medium">{selectedDocument.fileName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">File Size:</span>
                                    <span className="text-sm font-medium">{selectedDocument.size}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Status:</span>
                                    <span className="text-sm font-medium text-green-600">Uploaded</span>
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() => {
                                        console.log('Downloading:', selectedDocument.fileName);
                                        alert(`Downloading ${selectedDocument.fileName}...`);
                                    }}
                                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                </button>
                                <button
                                    onClick={() => setShowDocumentModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifyStaffRegistration;