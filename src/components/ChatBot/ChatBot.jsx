import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { initializeSession, queryChat } from '../../api/chatAPI';

// ─── Markdown renderer ───────────────────────────────────────────────────────
function renderInline(text) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
            return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
        return part;
    });
}

function MarkdownMessage({ text }) {
    const lines = text.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        if (/^---+$/.test(line.trim())) {
            elements.push(<hr key={i} className="my-2 border-gray-300 dark:border-gray-600" />);
            i++; continue;
        }
        if (line.startsWith('### ')) {
            elements.push(
                <h3 key={i} className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-3 mb-1">
                    {renderInline(line.slice(4))}
                </h3>
            );
            i++; continue;
        }
        if (line.startsWith('## ')) {
            elements.push(
                <h2 key={i} className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-3 mb-1">
                    {renderInline(line.slice(3))}
                </h2>
            );
            i++; continue;
        }
        if (line.trim().startsWith('|')) {
            const tableLines = [];
            while (i < lines.length && lines[i].trim().startsWith('|')) { tableLines.push(lines[i]); i++; }
            const rows = tableLines
                .filter(l => !/^\|[\s|:-]+\|$/.test(l.trim()))
                .map(l => l.split('|').slice(1, -1).map(cell => cell.trim()));
            if (rows.length === 0) continue;
            const [headerRow, ...bodyRows] = rows;
            elements.push(
                <div key={`tbl-${i}`} className="overflow-x-auto my-2">
                    <table className="text-xs w-full border-collapse">
                        <thead>
                            <tr className="bg-indigo-50 dark:bg-indigo-900/40">
                                {headerRow.map((cell, ci) => (
                                    <th key={ci} className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-left font-semibold text-gray-700 dark:text-gray-200">
                                        {renderInline(cell)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {bodyRows.map((row, ri) => (
                                <tr key={ri} className={ri % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}>
                                    {row.map((cell, ci) => (
                                        <td key={ci} className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-gray-700 dark:text-gray-200">
                                            {renderInline(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            continue;
        }
        if (line.match(/^[-*] /)) {
            const listItems = [];
            while (i < lines.length && lines[i].match(/^[-*] /)) { listItems.push(lines[i].slice(2)); i++; }
            elements.push(
                <ul key={`ul-${i}`} className="list-disc list-inside text-sm text-gray-700 dark:text-gray-200 my-1 space-y-0.5">
                    {listItems.map((item, li) => <li key={li}>{renderInline(item)}</li>)}
                </ul>
            );
            continue;
        }
        if (line.trim() === '') { elements.push(<div key={i} className="h-1" />); i++; continue; }
        elements.push(
            <p key={i} className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                {renderInline(line)}
            </p>
        );
        i++;
    }
    return <div className="space-y-0.5">{elements}</div>;
}

// ─── Typing indicator ────────────────────────────────────────────────────────
function TypingDots() {
    return (
        <div className="flex items-center space-x-1 px-1 py-1">
            {[0, 1, 2].map(d => (
                <span key={d} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${d * 0.15}s` }} />
            ))}
        </div>
    );
}

// ─── Mode selector buttons (rendered inside first assistant bubble) ───────────
function ModeSelector({ onSelect }) {
    return (
        <div className="mt-3 flex flex-col gap-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">What would you like to do?</p>
            <div className="flex gap-2">
                <button
                    onClick={() => onSelect('Report')}
                    className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 hover:border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all group"
                >
                    <span className="text-lg">📊</span>
                    <div className="text-left">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Report Enquiry</p>
                        <p className="text-[10px] text-blue-500 dark:text-blue-400">View data & reports</p>
                    </div>
                </button>
                <button
                    onClick={() => onSelect('Track')}
                    className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30 hover:border-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all group"
                >
                    <span className="text-lg">🔍</span>
                    <div className="text-left">
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">Track Transaction</p>
                        <p className="text-[10px] text-purple-500 dark:text-purple-400">Check approval status</p>
                    </div>
                </button>
            </div>
        </div>
    );
}

// ─── Bot avatar ──────────────────────────────────────────────────────────────
function BotAvatar({ size = 'md' }) {
    const cls = size === 'sm'
        ? 'w-7 h-7 flex-shrink-0 mr-2 mt-0.5'
        : 'w-7 h-7 flex-shrink-0 mr-2 mt-0.5';
    return (
        <div className={`${cls} rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center`}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
        </div>
    );
}

// ─── Sparkle icon ────────────────────────────────────────────────────────────
function SparkleIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
    );
}

// ─── Main ChatBot component ──────────────────────────────────────────────────
const ChatBot = () => {
    const { userData, roleId: authRoleId, employeeId } = useSelector(s => s.auth);
    const userFirstName = userData?.FirstName || userData?.firstName || 'User';

    const [isOpen, setIsOpen]           = useState(false);
    const [messages, setMessages]       = useState([]);
    const [input, setInput]             = useState('');
    const [loading, setLoading]         = useState(false);
    const [sessionId, setSessionId]     = useState(null);
    const [sessionError, setSessionError] = useState(null);
    const [initializing, setInitializing] = useState(false);
    const [chatMode, setChatMode]       = useState(null);   // null | 'Report' | 'Track'
    const [inputHint, setInputHint]     = useState('');     // contextual placeholder
    const [pendingModule, setPendingModule] = useState(null); // module identified but awaiting search value

    const bottomRef = useRef(null);
    const inputRef  = useRef(null);

    const userId = userData?.UID || employeeId;
    const roleId = userData?.roleId || authRoleId;

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    useEffect(() => {
        if (isOpen && chatMode) inputRef.current?.focus();
    }, [isOpen, chatMode]);

    // ── Session init ──────────────────────────────────────────────────────────
    const ensureSession = useCallback(async () => {
        if (sessionId) return sessionId;
        setInitializing(true);
        setSessionError(null);
        try {
            const res = await initializeSession(Number(userId), Number(roleId));
            if (res?.success) {
                const sid = `session_${userId}_${roleId}_${Date.now()}`;
                setSessionId(sid);
                setMessages([{
                    role: 'assistant',
                    text: `Hello${userFirstName ? ` ${userFirstName}` : ''}! I'm your ERP assistant.`,
                    showModeSelector: true,
                }]);
                return sid;
            } else {
                setSessionError('Could not initialize chat session.');
                return null;
            }
        } catch (err) {
            setSessionError(err?.response?.data?.message || err?.message || 'Failed to connect to chat service.');
            return null;
        } finally {
            setInitializing(false);
        }
    }, [sessionId, userId, roleId, userFirstName]);

    const handleOpen = async () => {
        setIsOpen(true);
        if (!sessionId) await ensureSession();
    };

    // ── Mode selection ────────────────────────────────────────────────────────
    const handleModeSelect = (mode) => {
        setChatMode(mode);
        setInputHint('');
        const label    = mode === 'Report' ? 'Report Enquiry' : 'Track a Transaction';
        const response = mode === 'Report'
            ? 'Sure! Ask me about any report — bank details, vendor outstanding, payroll summaries, cost center data, and more.'
            : 'Sure! Tell me what you want to track. Provide a reference number, transaction ID, or labour ID and I\'ll check the current approval status for you.';
        setMessages(prev => [
            ...prev,
            { role: 'user', text: label, isModeSelect: true },
            { role: 'assistant', text: response },
        ]);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleSwitchMode = () => {
        if (loading) return;
        setChatMode(null);
        setInputHint('');
        setPendingModule(null);
        setMessages(prev => [
            ...prev,
            {
                role: 'assistant',
                text: 'What would you like to do next?',
                showModeSelector: true,
            },
        ]);
    };

    // ── Send message ──────────────────────────────────────────────────────────
    const handleSend = async () => {
        const text = input.trim();
        if (!text || loading || !chatMode) return;

        const sid = sessionId || await ensureSession();
        if (!sid) return;

        setInput('');
        setInputHint('');
        // Hold pendingModule for this request, then decide whether to keep it after response
        const moduleForThisRequest = pendingModule;
        setPendingModule(null);
        setMessages(prev => [...prev, { role: 'user', text }]);
        setLoading(true);

        try {
            const res = await queryChat(
                Number(userId), Number(roleId), text, sid, chatMode, moduleForThisRequest);

            if (res?.success) {
                if (res.intent === 'TrackingClarification') {
                    // AI identified the module but needs the search value —
                    // store the module so the next message can skip module detection
                    const extracted = res.data?.ExtractedModule || res.data?.extractedModule;
                    if (extracted) setPendingModule(extracted);
                    if (res.answer) setInputHint(res.answer);
                }
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text:   res.answer,
                    intent: res.intent,
                }]);
            } else {
                // Server returned a structured error — show its message, not a generic one
                const msg = res?.message || res?.Message || 'Sorry, I could not process that request.';
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: msg,
                    error: true,
                }]);
            }
        } catch (err) {
            // Extract the actual server error message from axios response if available
            const msg = err?.response?.data?.message
                     || err?.response?.data?.Message
                     || err?.message
                     || 'Network error — please try again.';
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: msg,
                error: true,
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    // ── Dynamic input placeholder ─────────────────────────────────────────────
    const inputPlaceholder = !chatMode
        ? 'Select an option above to continue…'
        : inputHint
            ? inputHint
            : chatMode === 'Report'
                ? 'Ask about reports, balances, vendor details…'
                : 'e.g. bank change for L001, or payroll TRF-2026-001…';

    // ── Mode badge config ─────────────────────────────────────────────────────
    const modeBadge = chatMode === 'Report'
        ? { icon: '📊', label: 'Report Enquiry',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' }
        : chatMode === 'Track'
        ? { icon: '🔍', label: 'Track Transaction', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' }
        : null;

    return (
        <>
            {/* ── Floating toggle button ─────────────────────────────────────── */}
            <button
                onClick={isOpen ? () => setIsOpen(false) : handleOpen}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                title="ERP Assistant"
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <SparkleIcon className="w-6 h-6 text-white" />
                )}
            </button>

            {/* ── Chat panel ────────────────────────────────────────────────── */}
            {isOpen && (
                <div
                    className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
                    style={{ height: '560px' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <SparkleIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm leading-tight">ERP Assistant</p>
                                <p className="text-indigo-200 text-xs">
                                    {initializing ? 'Connecting...' : sessionId ? 'Online' : 'Ready'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/70 hover:text-white transition-colors p-1 rounded"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                        {initializing && (
                            <div className="flex justify-center">
                                <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b border-indigo-500" />
                                    <span>Initializing session…</span>
                                </div>
                            </div>
                        )}

                        {sessionError && (
                            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2 text-xs text-red-600 dark:text-red-300">
                                {sessionError}
                            </div>
                        )}

                        {messages.length === 0 && !initializing && !sessionError && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-8">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                    <SparkleIcon className="w-6 h-6 text-indigo-500" />
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Ask me anything about your ERP data
                                </p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && <BotAvatar />}

                                <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 ${
                                    msg.role === 'user'
                                        ? msg.isModeSelect
                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-br-sm opacity-80'
                                            : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm'
                                        : msg.error
                                            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-bl-sm'
                                            : 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-sm'
                                }`}>
                                    {msg.role === 'user' ? (
                                        <p className="text-sm text-white leading-relaxed">{msg.text}</p>
                                    ) : (
                                        <>
                                            {msg.intent && msg.intent !== 'TrackingClarification' && (
                                                <span className="inline-block text-[10px] px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-full mb-1.5">
                                                    {msg.intent}
                                                </span>
                                            )}
                                            <MarkdownMessage text={msg.text} />
                                            {/* Mode selector buttons — shown only until a mode is chosen */}
                                            {msg.showModeSelector && !chatMode && (
                                                <ModeSelector onSelect={handleModeSelect} />
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <BotAvatar />
                                <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm px-3 py-2.5">
                                    <TypingDots />
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Input area */}
                    <div className="flex-shrink-0 px-3 pt-2 pb-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">

                        {/* Mode badge — shown when mode is active */}
                        {modeBadge && (
                            <div className="flex items-center mb-2">
                                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${modeBadge.color}`}>
                                    <span>{modeBadge.icon}</span>
                                    <span>{modeBadge.label}</span>
                                    <button
                                        onClick={handleSwitchMode}
                                        disabled={loading}
                                        title="Switch mode"
                                        className="ml-0.5 hover:opacity-60 disabled:opacity-30 transition-opacity leading-none"
                                    >
                                        ✕
                                    </button>
                                </span>
                            </div>
                        )}

                        <div className="flex items-end space-x-2">
                            <textarea
                                ref={inputRef}
                                rows={1}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading || initializing || !chatMode}
                                placeholder={inputPlaceholder}
                                className="flex-1 resize-none text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors max-h-28 overflow-y-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ minHeight: '40px' }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || loading || initializing || !chatMode}
                                className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-indigo-500 hover:to-purple-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 text-center">
                            {chatMode ? 'Press Enter to send · Shift+Enter for new line' : 'Choose an option above to start'}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatBot;
