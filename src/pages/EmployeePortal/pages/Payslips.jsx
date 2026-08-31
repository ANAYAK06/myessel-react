import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { PageHeader, SectionCard, Badge, SecondaryButton, EmptyState, SearchInput, Pagination } from '../components/PortalUI';
import PaySlipModal from '../../HRReports/PaySlipModal';
import { fetchMyPayslipList, fetchMyPayslipDetail, clearPayslipDetail } from '../../../slices/HRSlice/employeePortalSlice';

const PAGE_SIZE = 6;

const Payslips = ({ employeeData }) => {
    const dispatch = useDispatch();
    const { payslipList, payslipDetail, loading } = useSelector((state) => state.employeePortal);

    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [fetchingKey, setFetchingKey] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const empRefNo = employeeData?.EmpRefno;

    useEffect(() => {
        if (empRefNo) {
            dispatch(fetchMyPayslipList(empRefNo));
        }
    }, [dispatch, empRefNo]);

    const rowKey = (p) => `${p.TransactionRefno}-${p.CCCode}-${p.ConslidateTransNo}`;

    const filteredList = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return payslipList;
        return payslipList.filter((p) => `${p.MonthName} ${p.Year}`.toLowerCase().includes(term));
    }, [payslipList, search]);

    const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
    const pagedList = filteredList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [search, payslipList]);

    const handleView = async (item) => {
        setFetchingKey(rowKey(item));
        try {
            setSelectedItem(item);
            await dispatch(fetchMyPayslipDetail({
                empRefNo,
                transactionRefno: item.TransactionRefno,
                ccCode: item.CCCode,
                conslidateTransNo: item.ConslidateTransNo,
            })).unwrap();
            setShowModal(true);
        } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Failed to fetch payslip. Please try again.');
        } finally {
            setFetchingKey(null);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setSelectedItem(null);
        dispatch(clearPayslipDetail());
    };

    return (
        <div>
            <PageHeader title="Payslips" subtitle="Your monthly salary slips" icon={FileText} />

            <SectionCard
                title="Payslip History"
                icon={FileText}
                action={
                    payslipList.length > 0 && (
                        <SearchInput value={search} onChange={setSearch} placeholder="Search by month or year…" />
                    )
                }
            >
                {loading.payslipList ? (
                    <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>
                ) : payslipList.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No payslips found"
                        subtitle="Your payslips will appear here once a payroll run has been approved for you."
                    />
                ) : filteredList.length === 0 ? (
                    <EmptyState icon={FileText} title="No matching payslips" subtitle="Try a different month or year." />
                ) : (
                    <>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {pagedList.map((p) => (
                            <div key={rowKey(p)} className="flex items-center justify-between gap-3 py-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-[#0d1b5e] dark:bg-orange-500/15 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                            {p.MonthName} {p.Year}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Net Pay: ₹{Number(p.NetValue || 0).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                                        Paid
                                    </Badge>
                                    <SecondaryButton
                                        className="!px-3 !py-1.5"
                                        disabled={fetchingKey === rowKey(p)}
                                        onClick={() => handleView(p)}
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">
                                            {fetchingKey === rowKey(p) ? 'Loading…' : 'View'}
                                        </span>
                                    </SecondaryButton>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        totalItems={filteredList.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
                    </>
                )}
            </SectionCard>

            {showModal && (
                <PaySlipModal
                    isOpen={showModal}
                    onClose={handleClose}
                    paySlipData={payslipDetail}
                    loading={loading.payslipDetail}
                    employeeData={{
                        TransactionRefno: selectedItem?.TransactionRefno,
                        CurrentCC: selectedItem?.CCCode,
                        CurrentCCName: selectedItem?.CCName,
                    }}
                />
            )}
        </div>
    );
};

export default Payslips;
