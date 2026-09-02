import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';
import { PageHeader, SectionCard, FormField, PrimaryButton, SecondaryButton, inputClass } from './PortalUI';
import CustomDatePicker from '../../../components/CustomDatePicker';

/**
 * Reusable request-form page.
 * fields: [{ name, label, type: 'text'|'textarea'|'date'|'number'|'select', required, options, placeholder, span }]
 */
const RequestFormBase = ({ title, subtitle, icon: Icon, fields, submitLabel = 'Submit Request', reportingPersonName = 'your reporting person', onSubmit, sidePanel }) => {
    const initial = Object.fromEntries(fields.map((f) => [f.name, '']));
    const [values, setValues] = useState(initial);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (name, value) => setValues((v) => ({ ...v, [name]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const missing = fields.filter((f) => f.required && !values[f.name]);
        if (missing.length) {
            toast.error(`Please fill: ${missing.map((f) => f.label).join(', ')}`);
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(values);
            setSubmitted(true);
            toast.success('Request submitted — routed to your reporting person for verification.');
        } catch (err) {
            toast.error(err?.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setValues(initial);
        setSubmitted(false);
    };

    return (
        <div>
            <PageHeader title={title} subtitle={subtitle} icon={Icon} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                    <SectionCard title="Request Details" icon={Icon}>
                        {submitted ? (
                            <div className="flex flex-col items-center text-center py-8 px-4">
                                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                                </div>
                                <p className="text-base font-semibold text-gray-800 dark:text-gray-100">Request Submitted</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                                    Your request has been sent to <span className="font-semibold text-gray-700 dark:text-gray-200">{reportingPersonName}</span> for verification before entering the standard approval workflow.
                                </p>
                                <SecondaryButton className="mt-5" onClick={handleReset}>
                                    Submit Another Request
                                </SecondaryButton>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {fields.map((f) => (
                                        <div key={f.name} className={f.span === 2 ? 'sm:col-span-2' : ''}>
                                            <FormField label={f.label} required={f.required}>
                                                {f.type === 'textarea' ? (
                                                    <textarea
                                                        className={inputClass}
                                                        rows={3}
                                                        placeholder={f.placeholder}
                                                        value={values[f.name]}
                                                        onChange={(e) => handleChange(f.name, e.target.value)}
                                                    />
                                                ) : f.type === 'select' ? (
                                                    <select
                                                        className={inputClass}
                                                        value={values[f.name]}
                                                        onChange={(e) => handleChange(f.name, e.target.value)}
                                                    >
                                                        <option value="">Select…</option>
                                                        {f.options.map((o) => (
                                                            <option key={o} value={o}>{o}</option>
                                                        ))}
                                                    </select>
                                                ) : f.type === 'date' ? (
                                                    <CustomDatePicker
                                                        value={values[f.name] || null}
                                                        onChange={(date) => {
                                                            if (!date) { handleChange(f.name, ''); return; }
                                                            const y = date.getFullYear();
                                                            const m = String(date.getMonth() + 1).padStart(2, '0');
                                                            const d = String(date.getDate()).padStart(2, '0');
                                                            handleChange(f.name, `${y}-${m}-${d}`);
                                                        }}
                                                        format="YYYY-MM-DD"
                                                        placeholder={f.placeholder || 'Select date'}
                                                        size="sm"
                                                    />
                                                ) : (
                                                    <input
                                                        type={f.type || 'text'}
                                                        className={inputClass}
                                                        placeholder={f.placeholder}
                                                        value={values[f.name]}
                                                        onChange={(e) => handleChange(f.name, e.target.value)}
                                                    />
                                                )}
                                            </FormField>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <PrimaryButton type="submit" disabled={submitting}>
                                        {submitting ? 'Submitting…' : submitLabel} <ArrowRight className="w-4 h-4" />
                                    </PrimaryButton>
                                    <SecondaryButton type="button" onClick={handleReset} disabled={submitting}>Clear</SecondaryButton>
                                </div>
                            </form>
                        )}
                    </SectionCard>
                </div>

                <div className="flex flex-col gap-5">
                    {sidePanel}
                    <SectionCard title="Approval Flow" icon={UserCheck}>
                        <div className="space-y-4">
                            {[
                                { step: '1', label: 'Submitted by you', desc: 'Employee Portal' },
                                { step: '2', label: `Verified by ${reportingPersonName}`, desc: 'Your reporting person' },
                                { step: '3', label: 'Standard workflow', desc: 'Existing approval engine' },
                                { step: '4', label: 'Final approval', desc: 'Record created' },
                            ].map((s, i, arr) => (
                                <div key={s.step} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-7 h-7 rounded-full bg-[#0d1b5e] dark:bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center shrink-0">
                                            {s.step}
                                        </div>
                                        {i < arr.length - 1 && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 my-1" />}
                                    </div>
                                    <div className="pb-1">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{s.label}</p>
                                        <p className="text-xs text-gray-400">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
};

export default RequestFormBase;
