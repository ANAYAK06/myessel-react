import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Briefcase, Phone, Heart } from 'lucide-react';
import { PageHeader, SectionCard, InfoRow, Badge } from '../components/PortalUI';
import { fetchMyDocuments } from '../../../slices/HRSlice/employeePortalSlice';

const photoMimeType = (fileType) => {
    const ft = (fileType || '').toUpperCase();
    if (ft === 'PNG') return 'image/png';
    if (['IMAGE', 'JPG', 'JPEG'].includes(ft)) return 'image/jpeg';
    return 'image/jpeg';
};

const MyProfile = ({ employeeData, employeeId, fullName, initials }) => {
    const dispatch = useDispatch();
    const { documents } = useSelector((state) => state.employeePortal);
    const d = employeeData || {};

    const empRefNo = d.EmpRefno || employeeId;

    useEffect(() => {
        if (empRefNo) {
            dispatch(fetchMyDocuments(empRefNo));
        }
    }, [dispatch, empRefNo]);

    const photoDoc = useMemo(() => documents.find((doc) => doc.DocName === 'Photo'), [documents]);

    const photoUrl = useMemo(() => {
        if (!photoDoc?.DocBinaryData) return null;
        try {
            const byteCharacters = atob(photoDoc.DocBinaryData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
            const byteArray = new Uint8Array(byteNumbers);
            return URL.createObjectURL(new Blob([byteArray], { type: photoMimeType(photoDoc.FileType) }));
        } catch {
            return null;
        }
    }, [photoDoc]);

    useEffect(() => () => {
        if (photoUrl) URL.revokeObjectURL(photoUrl);
    }, [photoUrl]);

    return (
        <div>
            <PageHeader title="My Profile" subtitle="Your personal and employment details" icon={User} />

            {/* Hero */}
            <div className="bg-[#0d1b5e] dark:bg-[#0a1240] rounded-2xl p-6 mb-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative">
                    <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-orange-400/60 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                        {photoUrl ? (
                            <img src={photoUrl} alt={fullName || 'Employee'} className="w-full h-full object-cover" />
                        ) : (
                            initials || <User className="w-7 h-7" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold truncate">{fullName || 'Employee'}</h1>
                        <p className="text-orange-200 text-sm mt-0.5">{d.Appointed || d.UserRole || '—'}</p>
                        <p className="text-white/50 text-xs mt-0.5">{d.DepartmentName || '—'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end sm:gap-1.5">
                        <Badge className={d.Status === 'Active' ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-400/30' : 'bg-amber-400/20 text-amber-100 border border-amber-400/30'}>
                            {d.Status || 'Unknown'}
                        </Badge>
                        <Badge className="bg-white/10 text-orange-100 border border-white/20">
                            {d.EmpRefno || employeeId}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/15 relative">
                    {[
                        { label: 'Employee ID', value: d.Username || employeeId },
                        { label: 'Job Type', value: d.Jobtype },
                        { label: 'Category', value: d.Category },
                        { label: 'Role', value: d.UserRole },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <p className="text-white/50 text-xs">{label}</p>
                            <p className="text-white text-sm font-semibold truncate">{value || '—'}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <SectionCard title="Personal Information" icon={User}>
                    <InfoRow label="Full Name" value={fullName} />
                    <InfoRow label="Date of Birth" value={d.UpDob} />
                    <InfoRow label="Age" value={d.Age ? `${d.Age} years` : null} />
                    <InfoRow label="Gender" value={d.Gender} />
                    <InfoRow label="Marital Status" value={d.MartialStatus} />
                    {d.MartialStatus === 'Married' && (
                        <InfoRow label="Date of Marriage" value={d.UpDateofMarriage} />
                    )}
                </SectionCard>

                <SectionCard title="Employment Details" icon={Briefcase}>
                    <InfoRow label="Ref No" value={d.EmpRefno} />
                    <InfoRow label="Department" value={d.DepartmentName} />
                    <InfoRow label="Designation" value={d.Appointed} />
                    <InfoRow label="Job Type" value={d.Jobtype} />
                    <InfoRow label="Joining Category" value={d.joiningcategory} />
                    <InfoRow label="Joining Type" value={d.JoiningType} />
                    <InfoRow label="Appointment" value={d.Appointmenttype} />
                </SectionCard>

                <SectionCard title="Contact & Address" icon={Phone}>
                    <InfoRow label="Mobile" value={d.Mobile} />
                    <InfoRow label="Work Email" value={d.workemail} />
                    <InfoRow label="Permanent Address" value={d.PermanentAddress} />
                </SectionCard>

                <SectionCard title="Family & Nominee" icon={Heart}>
                    {d.MartialStatus === 'Married' && (
                        <InfoRow label="Spouse Name" value={d.SpouseName} />
                    )}
                    <InfoRow label="Nominee Name" value={d.NomineeName} />
                    <InfoRow label="Relation" value={d.Relation} />
                    <InfoRow label="Nominee Gender" value={d.NomineeGender} />
                </SectionCard>
            </div>
        </div>
    );
};

export default MyProfile;
