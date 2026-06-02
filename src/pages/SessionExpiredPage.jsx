import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldAlert, RefreshCw, Clock, MonitorSmartphone,
    ServerCrash, LogIn, ChevronRight,
} from 'lucide-react';

const REASONS = [
    {
        icon: RefreshCw,
        text: 'The page was refreshed and your session could not be restored.',
    },
    {
        icon: Clock,
        text: 'Your session timed out due to inactivity.',
    },
    {
        icon: MonitorSmartphone,
        text: 'You signed in from another device or browser tab.',
    },
    {
        icon: ServerCrash,
        text: 'An unexpected server error interrupted your session.',
    },
];

const SessionExpiredPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0d1b5e] flex items-center justify-center p-4 relative overflow-hidden">

            {/* Ambient blobs — matching login page */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-1/4 left-1/6 w-72 h-72 rounded-full opacity-20 blur-3xl animate-pulse"
                    style={{ background: 'radial-gradient(circle, #1a2f8f, transparent)' }}
                />
                <div
                    className="absolute bottom-1/4 right-1/6 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse"
                    style={{ background: 'radial-gradient(circle, #f97316, transparent)', animationDelay: '2s' }}
                />
            </div>

            {/* Card */}
            <div className="relative w-full max-w-md bg-[#0a1240] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

                {/* Top accent bar — orange to match login branding */}
                <div className="h-1.5 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300" />

                <div className="p-8">

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-2 border-orange-400/40 bg-orange-500/10 flex items-center justify-center">
                                <ShieldAlert className="w-10 h-10 text-orange-400" />
                            </div>
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-400 border-2 border-[#0a1240] flex items-center justify-center">
                                <span className="text-[#0a1240] text-[10px] font-black">!</span>
                            </span>
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                            Session Ended
                        </h1>
                        <p className="text-orange-200 text-sm leading-relaxed">
                            For your security, your session has been terminated.
                            This may have occurred for one of the following reasons:
                        </p>
                    </div>

                    {/* Reasons list */}
                    <ul className="space-y-3 mb-8">
                        {REASONS.map(({ icon: Icon, text }, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                            >
                                <Icon className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                                <span className="text-orange-100 text-xs leading-relaxed">{text}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Login button */}
                    <button
                        onClick={() => navigate('/', { replace: true })}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 text-white font-semibold rounded-xl shadow-lg shadow-orange-900/30 transition-all duration-200 active:scale-[0.98]"
                    >
                        <LogIn className="w-4 h-4" />
                        Return to Login
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Footer */}
                <div className="px-8 pb-6 text-center">
                    <p className="text-white/30 text-[11px]">
                        Essel Projects — RAPP-SLAPP ERP
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SessionExpiredPage;
