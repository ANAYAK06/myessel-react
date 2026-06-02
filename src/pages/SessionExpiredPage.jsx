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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
            {/* Card */}
            <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                <div className="p-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 flex items-center justify-center">
                                <ShieldAlert className="w-10 h-10 text-indigo-300" />
                            </div>
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-slate-900 flex items-center justify-center">
                                <span className="text-slate-900 text-[10px] font-black">!</span>
                            </span>
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                            Session Ended
                        </h1>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            For your security, your session has been terminated.
                            This may have occurred for one of the following reasons:
                        </p>
                    </div>

                    {/* Reasons list */}
                    <ul className="space-y-3 mb-8">
                        {REASONS.map(({ icon: Icon, text }, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3"
                            >
                                <Icon className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                                <span className="text-slate-300 text-xs leading-relaxed">{text}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Login button */}
                    <button
                        onClick={() => navigate('/', { replace: true })}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/40 transition-all duration-200 active:scale-[0.98]"
                    >
                        <LogIn className="w-4 h-4" />
                        Return to Login
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Footer */}
                <div className="px-8 pb-6 text-center">
                    <p className="text-slate-600 text-[11px]">
                        Essel Projects — RAPP-SLAPP ERP
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SessionExpiredPage;
