import React from 'react';
import { X, UserCog2 } from 'lucide-react';
import { employeeMenu, requestMenu, reportingPersonMenu } from '../menuConfig';

const NavGroup = ({ title, items, activePage, onNavigate }) => (
    <div className="mb-5">
        <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/35">{title}</p>
        <div className="space-y-0.5">
            {items.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.key;
                return (
                    <button
                        key={item.key}
                        onClick={() => onNavigate(item.key)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group ${
                            active
                                ? 'bg-white/10 text-white'
                                : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                        }`}
                    >
                        <span className={`w-1 h-5 rounded-full shrink-0 ${active ? 'bg-orange-400' : 'bg-transparent'}`} />
                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-orange-400' : 'text-white/40 group-hover:text-orange-300'}`} />
                        <span className={`truncate ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                    </button>
                );
            })}
        </div>
    </div>
);

const Sidebar = ({ activePage, onNavigate, isOpen, onClose, isReportingPerson, onToggleReportingPerson, fullName, designation }) => {
    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-[#0d1b5e] dark:bg-[#0a1240] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto lg:shrink-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Brand */}
                <div className="flex items-center justify-between gap-2 px-4 h-16 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <img src="/essellogo.png" alt="Essel Projects" className="w-9 h-9 object-contain shrink-0" />
                        <div className="min-w-0">
                            <p className="text-white text-sm font-bold leading-tight truncate">Employee Portal</p>
                            <p className="text-orange-300 text-[11px] leading-tight truncate">Essel Projects</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <div className="flex-1 overflow-y-auto px-3 py-4">
                    <NavGroup title="Employee" items={employeeMenu} activePage={activePage} onNavigate={onNavigate} />
                    <NavGroup title="Self-Service Requests" items={requestMenu} activePage={activePage} onNavigate={onNavigate} />
                    {isReportingPerson && (
                        <NavGroup title="Reporting Person" items={reportingPersonMenu} activePage={activePage} onNavigate={onNavigate} />
                    )}
                </div>

                {/* Demo toggle */}
                <div className="px-4 py-3 border-t border-white/10 shrink-0">
                    <button
                        onClick={onToggleReportingPerson}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <UserCog2 className="w-4 h-4 text-orange-400 shrink-0" />
                        <span className="flex-1 text-left text-xs text-white/70">
                            Demo: Reporting Person View
                        </span>
                        <span className={`w-8 h-4.5 rounded-full p-0.5 transition-colors shrink-0 ${isReportingPerson ? 'bg-orange-500' : 'bg-white/20'}`} style={{ height: '18px' }}>
                            <span className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${isReportingPerson ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </span>
                    </button>
                </div>

                {/* Footer / powered by */}
                <div className="px-4 py-3 border-t border-white/10 shrink-0">
                    <p className="text-[10px] text-white/30 text-center">
                        Powered by
                        <img src="/corexlogo-full.png" alt="Corex ERP" className="inline w-12 ml-1 align-middle opacity-70" />
                    </p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
