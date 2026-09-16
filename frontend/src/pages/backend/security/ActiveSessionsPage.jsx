import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    AlertTriangle,
    Clock3,
    Globe2,
    Laptop,
    LoaderCircle,
    LogOut,
    Monitor,
    RefreshCw,
    ShieldCheck,
    Smartphone,
    Trash2,
    X,
} from "lucide-react";

import api from "../../../api/axios";

const ActiveSessionsPage = () => {
    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [selectedSession, setSelectedSession] = useState(null);
    const [logoutAllOpen, setLogoutAllOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const activeCount = sessions.length;

    const currentSession = useMemo(
        () =>
            sessions.find(
                (session) => session.is_current
            ) || null,
        [sessions]
    );

    const otherSessionsCount = useMemo(
        () =>
            sessions.filter(
                (session) => !session.is_current
            ).length,
        [sessions]
    );

    const loadSessions = async (
        showMainLoader = true
    ) => {
        if (showMainLoader) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        setError("");

        try {
            const response = await api.get(
                "/auth/sessions"
            );

            setSessions(
                response.data?.data?.sessions || []
            );
        } catch (error) {
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                localStorage.removeItem("token");

                navigate("/login", {
                    replace: true,
                });

                return;
            }

            setError(
                error.response?.data?.message ||
                    "Unable to load active sessions."
            );
        } finally {
            if (showMainLoader) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    };

    useEffect(() => {
        loadSessions();
    }, []);

    const clearMessages = () => {
        setError("");
        setMessage("");
    };

    const handleRefresh = async () => {
        clearMessages();

        await loadSessions(false);
    };

    const handleRevokeSession = async () => {
        if (!selectedSession) {
            return;
        }

        clearMessages();
        setActionLoading(true);

        try {
            await api.delete(
                `/auth/sessions/${selectedSession.id}`
            );

            setSessions((current) =>
                current.filter(
                    (session) =>
                        session.id !== selectedSession.id
                )
            );

            setMessage(
                "The selected session has been revoked."
            );

            setSelectedSession(null);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to revoke this session."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogoutAll = async () => {
        clearMessages();
        setActionLoading(true);

        try {
            await api.post(
                "/auth/sessions/logout-all"
            );

            localStorage.removeItem("token");

            navigate("/login", {
                replace: true,
            });
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to revoke authentication sessions."
            );

            setLogoutAllOpen(false);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <div className="text-center">
                    <LoaderCircle
                        size={30}
                        className="mx-auto animate-spin text-[#19b5fe]"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading active sessions...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <ShieldCheck
                            size={16}
                            className="text-[#19b5fe]"
                        />

                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#19b5fe]">
                            Account Security
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-[#07111f] lg:text-3xl">
                        Active Sessions
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Review devices currently signed in to your
                        DocuEngine account and revoke access when
                        needed.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            clearMessages();
                            setLogoutAllOpen(true);
                        }}
                        disabled={activeCount === 0}
                        className="flex h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <LogOut size={17} />

                        Logout All
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <AlertTriangle
                        size={20}
                        className="mt-0.5 shrink-0 text-red-500"
                    />

                    <p className="flex-1 text-sm font-semibold text-red-700">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        className="text-red-400 transition hover:text-red-600"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {message && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <ShieldCheck
                        size={20}
                        className="mt-0.5 shrink-0 text-emerald-500"
                    />

                    <p className="text-sm font-semibold text-emerald-700">
                        {message}
                    </p>
                </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    title="Active Sessions"
                    value={activeCount}
                    description="Sessions currently authorized for your account."
                    icon={Monitor}
                />

                <StatCard
                    title="Other Devices"
                    value={otherSessionsCount}
                    description="Active sessions excluding your current browser."
                    icon={Laptop}
                />

                <StatCard
                    title="Current Session"
                    value={
                        currentSession
                            ? currentSession.device_name ||
                              getDeviceLabel(
                                  currentSession.user_agent
                              )
                            : "Not detected"
                    }
                    description="The browser session you are using right now."
                    icon={ShieldCheck}
                />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-base font-bold text-[#07111f]">
                            Signed-in devices
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Sessions disappear from this list after
                            they are revoked or expire.
                        </p>
                    </div>

                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {activeCount} active
                    </span>
                </div>

                {sessions.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                            <Monitor
                                size={22}
                                className="text-slate-400"
                            />
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-800">
                            No active sessions
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            No authentication sessions were found.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {sessions.map((session) => (
                            <SessionRow
                                key={session.id}
                                session={session}
                                onRevoke={() => {
                                    clearMessages();

                                    setSelectedSession(
                                        session
                                    );
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex items-start gap-3">
                    <ShieldCheck
                        size={19}
                        className="mt-0.5 shrink-0 text-[#19b5fe]"
                    />

                    <div>
                        <p className="text-sm font-semibold text-slate-700">
                            Session security
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            Revoking a session immediately prevents
                            that session token from accessing
                            protected DocuEngine APIs.
                        </p>
                    </div>
                </div>
            </div>

            {selectedSession && (
                <DeleteModal
                    title="Revoke Session"
                    description={`Revoke access for ${
                        selectedSession.device_name ||
                        getDeviceLabel(
                            selectedSession.user_agent
                        )
                    }? This action cannot be undone.`}
                    confirmText="Revoke Session"
                    loading={actionLoading}
                    onClose={() => {
                        if (!actionLoading) {
                            setSelectedSession(null);
                        }
                    }}
                    onConfirm={handleRevokeSession}
                />
            )}

            {logoutAllOpen && (
                <DeleteModal
                    title="Logout All Sessions"
                    description="This will revoke every active session, including the session you are using now. You will need to sign in again. This action cannot be undone."
                    confirmText="Logout All"
                    loading={actionLoading}
                    onClose={() => {
                        if (!actionLoading) {
                            setLogoutAllOpen(false);
                        }
                    }}
                    onConfirm={handleLogoutAll}
                />
            )}
        </div>
    );
};

const SessionRow = ({
    session,
    onRevoke,
}) => {
    const deviceLabel =
        session.device_name ||
        getDeviceLabel(session.user_agent);

    const DeviceIcon =
        getDeviceIcon(session.user_agent);

    return (
        <div className="px-6 py-5 transition hover:bg-slate-50/70">
            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
                <div className="flex min-w-0 items-start gap-4">
                    <div
                        className={`
                            flex h-11 w-11 shrink-0
                            items-center justify-center
                            rounded-xl
                            ${
                                session.is_current
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-slate-100 text-slate-500"
                            }
                        `}
                    >
                        <DeviceIcon size={20} />
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-[#07111f]">
                                {deviceLabel}
                            </p>

                            {session.is_current && (
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                                    Current Session
                                </span>
                            )}
                        </div>

                        <p className="mt-1 max-w-2xl truncate text-xs text-slate-400">
                            {session.user_agent ||
                                "Browser information unavailable"}
                        </p>
                    </div>
                </div>

                <div className="grid flex-1 gap-4 sm:grid-cols-3 xl:max-w-[620px]">
                    <SessionMeta
                        icon={Globe2}
                        label="IP Address"
                        value={
                            session.ip_address ||
                            "Unknown"
                        }
                    />

                    <SessionMeta
                        icon={Clock3}
                        label="Last Activity"
                        value={formatDate(
                            session.last_activity_at
                        )}
                    />

                    <SessionMeta
                        icon={Clock3}
                        label="Expires"
                        value={formatDate(
                            session.expires_at
                        )}
                    />
                </div>

                <div className="shrink-0">
                    {session.is_current ? (
                        <span className="inline-flex h-10 items-center px-3 text-xs font-semibold text-slate-400">
                            This device
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={onRevoke}
                            className="flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                            <Trash2 size={15} />

                            Revoke
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="text-[11px] text-slate-400">
                    Signed in {formatDate(session.created_at)}
                </p>
            </div>
        </div>
    );
};

const SessionMeta = ({
    icon: Icon,
    label,
    value,
}) => {
    return (
        <div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <Icon size={12} />
                {label}
            </div>

            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                {value}
            </p>
        </div>
    );
};

const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-[#19b5fe]">
                <Icon size={19} />
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {title}
            </p>

            <p className="mt-1 truncate text-xl font-bold text-[#07111f]">
                {value}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
                {description}
            </p>
        </div>
    );
};

const DeleteModal = ({
    title,
    description,
    confirmText,
    loading,
    onClose,
    onConfirm,
}) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-[2px]">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="h-1 w-full bg-red-500" />

                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                    <X size={18} />
                </button>

                <div className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <Trash2 size={21} />
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-[#07111f]">
                        {title}
                    </h2>

                    <p className="mt-2 pr-4 text-sm leading-6 text-slate-500">
                        {description}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading && (
                            <LoaderCircle
                                size={16}
                                className="animate-spin"
                            />
                        )}

                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const getDeviceLabel = (userAgent) => {
    if (!userAgent) {
        return "Unknown Device";
    }

    let browser = "Browser";
    let platform = "Device";

    if (/Edg\//i.test(userAgent)) {
        browser = "Microsoft Edge";
    } else if (/Chrome\//i.test(userAgent)) {
        browser = "Google Chrome";
    } else if (/Firefox\//i.test(userAgent)) {
        browser = "Firefox";
    } else if (
        /Safari\//i.test(userAgent) &&
        !/Chrome\//i.test(userAgent)
    ) {
        browser = "Safari";
    }

    if (/Windows/i.test(userAgent)) {
        platform = "Windows";
    } else if (/Macintosh|Mac OS/i.test(userAgent)) {
        platform = "macOS";
    } else if (/Android/i.test(userAgent)) {
        platform = "Android";
    } else if (/iPhone|iPad/i.test(userAgent)) {
        platform = "iOS";
    } else if (/Linux/i.test(userAgent)) {
        platform = "Linux";
    }

    return `${browser} on ${platform}`;
};

const getDeviceIcon = (userAgent) => {
    if (
        /Android|iPhone|iPad|Mobile/i.test(
            userAgent || ""
        )
    ) {
        return Smartphone;
    }

    return Monitor;
};

const formatDate = (value) => {
    if (!value) {
        return "Not available";
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    ).format(new Date(value));
};

export default ActiveSessionsPage;