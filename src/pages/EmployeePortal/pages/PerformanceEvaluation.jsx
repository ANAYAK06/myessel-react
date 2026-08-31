import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Star, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { PageHeader, DemoBanner, SectionCard, FormField, PrimaryButton, SecondaryButton, inputClass } from '../components/PortalUI';
import { reportees } from '../data/dummyData';

const criteria = ['Quality of Work', 'Punctuality & Discipline', 'Teamwork', 'Safety Compliance', 'Ownership & Initiative'];

const StarRating = ({ value, onChange }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => onChange(n)}>
                <Star className={`w-5 h-5 transition-colors ${n <= value ? 'fill-orange-400 text-orange-400' : 'text-gray-300 dark:text-gray-600'}`} />
            </button>
        ))}
    </div>
);

const PerformanceEvaluation = () => {
    const [selected, setSelected] = useState(null);
    const [ratings, setRatings] = useState({});
    const [remarks, setRemarks] = useState('');
    const [submittedFor, setSubmittedFor] = useState(null);

    const openEvaluation = (r) => {
        setSelected(r);
        setRatings(Object.fromEntries(criteria.map((c) => [c, 0])));
        setRemarks('');
        setSubmittedFor(null);
    };

    const handleSubmit = () => {
        if (Object.values(ratings).some((v) => !v)) {
            toast.error('Please rate every criterion before submitting.');
            return;
        }
        setSubmittedFor(selected.name);
        toast.success('Evaluation submitted (demo).');
    };

    if (!selected) {
        return (
            <div>
                <PageHeader title="Performance Evaluation" subtitle="Rate and review the employees reporting to you" icon={Star} />
                <DemoBanner />

                <SectionCard title="Select a Reportee to Evaluate" icon={Star}>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {reportees.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => openEvaluation(r)}
                                className="w-full flex items-center justify-between gap-3 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-white/5 -mx-4 sm:-mx-5 px-4 sm:px-5 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-10 h-10 rounded-full ${r.avatarColor} text-white flex items-center justify-center text-sm font-bold shrink-0`}>
                                        {r.name.split(' ').map((n) => n[0]).join('')}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{r.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{r.designation} · {r.department}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-orange-500 shrink-0">Evaluate →</span>
                            </button>
                        ))}
                    </div>
                </SectionCard>
            </div>
        );
    }

    return (
        <div>
            <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-orange-500 mb-3">
                <ArrowLeft className="w-4 h-4" /> Back to reportees
            </button>
            <PageHeader title={`Evaluate ${selected.name}`} subtitle={`${selected.designation} · ${selected.department}`} icon={Star} />
            <DemoBanner text="Demo preview — this evaluation is not saved to any live record." />

            <SectionCard title="Rating Criteria" icon={Star}>
                {submittedFor ? (
                    <div className="flex flex-col items-center text-center py-8 px-4">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                        </div>
                        <p className="text-base font-semibold text-gray-800 dark:text-gray-100">Evaluation Submitted</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Performance review for {submittedFor} has been recorded.</p>
                        <SecondaryButton className="mt-5" onClick={() => setSelected(null)}>Evaluate Another</SecondaryButton>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {criteria.map((c) => (
                                <div key={c} className="flex items-center justify-between gap-3 py-1.5">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{c}</span>
                                    <StarRating value={ratings[c] || 0} onChange={(v) => setRatings((r) => ({ ...r, [c]: v }))} />
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <FormField label="Remarks">
                                <textarea
                                    className={inputClass}
                                    rows={3}
                                    placeholder="Overall feedback and comments"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </FormField>
                        </div>
                        <div className="flex items-center gap-3 mt-5">
                            <PrimaryButton onClick={handleSubmit}>Submit Evaluation</PrimaryButton>
                            <SecondaryButton onClick={() => setSelected(null)}>Cancel</SecondaryButton>
                        </div>
                    </>
                )}
            </SectionCard>
        </div>
    );
};

export default PerformanceEvaluation;
