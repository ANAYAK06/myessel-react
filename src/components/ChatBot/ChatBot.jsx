import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { initializeSession, queryChat } from '../../api/chatAPI';

// ─── Markdown renderer ───────────────────────────────────────────────────────
// Handles the subset Claude typically returns: headers, bold, tables, hr, lists

function renderInline(text) {
    // Bold: **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}

function MarkdownMessage({ text }) {
    const lines = text.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Horizontal rule
        if (/^---+$/.test(line.trim())) {
            elements.push(<hr key={i} className="my-2 border-gray-300 dark:border-gray-600" />);
            i++;
            continue;
        }

        // H3 header
        if (line.startsWith('### ')) {
            elements.push(
                <h3 key={i} className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-3 mb-1">
                    {renderInline(line.slice(4))}
                </h3>
            );
            i++;
            continue;
        }

        // H2 header
        if (line.startsWith('## ')) {
            elements.push(
                <h2 key={i} className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-3 mb-1">
                    {renderInline(line.slice(3))}
                </h2>
            );
            i++;
            continue;
        }

        // Table: collect consecutive pipe lines
        if (line.trim().startsWith('|')) {
            const tableLines = [];
            while (i < lines.length && lines[i].trim().startsWith('|')) {
                tableLines.push(lines[i]);
                i++;
            }
            // Parse rows, skip separator rows (|---|---|)
            const rows = tableLines
                .filter(l => !/^\|[\s|:-]+\|$/.test(l.trim()))
                .map(l =>
                    l.split('|')
                        .slice(1, -1)
                        .map(cell => cell.trim())
                );

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

        // Unordered list item
        if (line.match(/^[-*] /)) {
            const listItems = [];
            while (i < lines.length && lines[i].match(/^[-*] /)) {
                listItems.push(lines[i].slice(2));
                i++;
            }
            elements.push(
                <ul key={`ul-${i}`} className="list-disc list-inside text-sm text-gray-700 dark:text-gray-200 my-1 space-y-0.5">
                    {listItems.map((item, li) => (
                        <li key={li}>{renderInline(item)}</li>
                    ))}
                </ul>
            );
            continue;
        }

        // Empty line
        if (line.trim() === '') {
            elements.push(<div key={i} className="h-1" />);
            i++;
            continue;
        }

        // Normal paragraph line
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
                <span
                    key={d}
                    className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${d * 0.15}s` }}
                />
            ))}
        </div>
    );
}

// ─── Main ChatBot component ──────────────────────────────────────────────────
const ChatBot = () => {
    const { userData, roleId: authRoleId, employeeId } = useSelector(s => s.auth);

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [sessionError, setSessionError] = useState(null);
    const [initializing, setInitializing] = useState(false);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Resolve user ids from auth state
    const userId = userData?.UID || userData?.UID || employeeId;
    const roleId = userData?.roleId || authRoleId;

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    // Initialize session on first open
    const ensureSession = useCallback(async () => {
        if (sessionId) return sessionId;
        setInitializing(true);
        setSessionError(null);
        try {
            const res = await initializeSession(Number(userId), Number(roleId));
            if (res?.success) {
                const sid = `session_${userId}_${roleId}_${Date.now()}`;
                setSessionId(sid);
                // Welcome message
                const roleCode = res.session?.UserRoleCode || '';
                setMessages([{
                    role: 'assistant',
                    text: `Hello${roleCode ? ` (${roleCode})` : ''}! I'm your ERP assistant. Ask me anything about your data — bank details, reports, transactions, and more.`,
                }]);
                return sid;
            } else {
                setSessionError('Could not initialize chat session.');
                return null;
            }
        } catch {
            setSessionError('Failed to connect to chat service.');
            return null;
        } finally {
            setInitializing(false);
        }
    }, [sessionId, userId, roleId]);

    const handleOpen = async () => {
        setIsOpen(true);
        if (!sessionId) await ensureSession();
    };

    const handleSend = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const sid = sessionId || await ensureSession();
        if (!sid) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', text }]);
        setLoading(true);

        try {
            const res = await queryChat(Number(userId), Number(roleId), text, sid);
            if (res?.success) {
                setMessages(prev => [...prev, { role: 'assistant', text: res.answer, intent: res.intent }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I could not process that request.', error: true }]);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', text: 'Network error — please try again.', error: true }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* ── Floating toggle button ── */}
            <button
                onClick={isOpen ? () => setIsOpen(false) : handleOpen}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                title="ERP Assistant"
            >
                {isOpen ? (
                    // X icon
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    // Sparkle / chat icon
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                    </svg>
                )}
            </button>

            {/* ── Chat panel ── */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
                    style={{ height: '520px' }}>

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                </svg>
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
                                    <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Ask me anything about your ERP data</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {['Get bank details', 'Show transactions', 'Staff summary'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setInput(s)}
                                            className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                        </svg>
                                    </div>
                                )}
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3 py-2.5 ${
                                        msg.role === 'user'
                                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm'
                                            : msg.error
                                                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-bl-sm'
                                                : 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-sm'
                                    }`}
                                >
                                    {msg.role === 'user' ? (
                                        <p className="text-sm text-white leading-relaxed">{msg.text}</p>
                                    ) : (
                                        <>
                                            {msg.intent && (
                                                <span className="inline-block text-[10px] px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-full mb-1.5">
                                                    {msg.intent}
                                                </span>
                                            )}
                                            <MarkdownMessage text={msg.text} />
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                    </svg>
                                </div>
                                <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm px-3 py-2.5">
                                    <TypingDots />
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Input area */}
                    <div className="flex-shrink-0 px-3 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-end space-x-2">
                            <textarea
                                ref={inputRef}
                                rows={1}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading || initializing}
                                placeholder="Ask about bank details, staff, transactions…"
                                className="flex-1 resize-none text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors max-h-28 overflow-y-auto"
                                style={{ minHeight: '40px' }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || loading || initializing}
                                className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-indigo-500 hover:to-purple-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 text-center">
                            Press Enter to send · Shift+Enter for new line
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatBot;
