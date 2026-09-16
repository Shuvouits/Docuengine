import { useEffect, useState } from "react";
import {
    AlertTriangle,
    Check,
    CheckCircle2,
    Clipboard,
    Download,
    KeyRound,
    LoaderCircle,
    LockKeyhole,
    RefreshCw,
    ShieldCheck,
    Smartphone,
    X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import api from "../../../api/axios";

const MfaRecoveryPage = ({ authData = null }) => {
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [mfa, setMfa] = useState(null);

    const [setupData, setSetupData] = useState(null);
    const [setupCode, setSetupCode] = useState("");

    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [codesSaved, setCodesSaved] = useState(false);

    const [regenerateOpen, setRegenerateOpen] = useState(false);
    const [regenerateCode, setRegenerateCode] = useState("");

    const [disableOpen, setDisableOpen] = useState(false);
    const [disableCode, setDisableCode] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const user = authData?.user || null;

    const loadStatus = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get(
                "/auth/mfa/status"
            );

            setMfa(
                response.data?.data?.mfa || null
            );
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to load MFA settings."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStatus();
    }, []);

    const clearMessages = () => {
        setError("");
        setMessage("");
    };

    const handleStartSetup = async () => {
        clearMessages();
        setActionLoading(true);

        try {
            const response = await api.post(
                "/auth/mfa/setup"
            );

            setSetupData({
                secret:
                    response.data?.data?.secret || "",
                otpAuthUri:
                    response.data?.data?.otp_auth_uri || "",
            });

            setSetupCode("");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to start MFA setup."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleSetupCodeChange = (e) => {
        setSetupCode(
            e.target.value
                .replace(/\D/g, "")
                .slice(0, 6)
        );
    };

    const handleConfirmSetup = async () => {
        clearMessages();

        if (!/^\d{6}$/.test(setupCode)) {
            setError(
                "Enter the 6-digit code from your authenticator app."
            );
            return;
        }

        setActionLoading(true);

        try {
            const response = await api.post(
                "/auth/mfa/confirm",
                {
                    code: setupCode,
                }
            );

            const codes =
                response.data?.data?.recovery_codes || [];

            setRecoveryCodes(codes);
            setCodesSaved(false);
            setSetupData(null);
            setSetupCode("");

            await loadStatus();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to verify the authentication code."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleRegenerate = async () => {
        clearMessages();

        if (!/^\d{6}$/.test(regenerateCode)) {
            setError(
                "Enter your current 6-digit authenticator code."
            );
            return;
        }

        setActionLoading(true);

        try {
            const response = await api.post(
                "/auth/mfa/recovery-codes/regenerate",
                {
                    code: regenerateCode,
                }
            );

            const codes =
                response.data?.data?.recovery_codes || [];

            setRecoveryCodes(codes);
            setCodesSaved(false);
            setRegenerateOpen(false);
            setRegenerateCode("");

            setMessage(
                "New recovery codes were generated successfully."
            );
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to regenerate recovery codes."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleDisable = async () => {
        clearMessages();

        if (!/^\d{6}$/.test(disableCode)) {
            setError(
                "Enter your current 6-digit authenticator code."
            );
            return;
        }

        setActionLoading(true);

        try {
            await api.post(
                "/auth/mfa/disable",
                {
                    code: disableCode,
                }
            );

            setDisableOpen(false);
            setDisableCode("");
            setRecoveryCodes([]);
            setCodesSaved(false);

            setMessage(
                "Multi-factor authentication has been disabled."
            );

            await loadStatus();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to disable MFA."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleCopyCodes = async () => {
        if (!recoveryCodes.length) {
            return;
        }

        await navigator.clipboard.writeText(
            recoveryCodes.join("\n")
        );

        setCopied(true);

        window.setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    const handleDownloadCodes = () => {
        if (!recoveryCodes.length) {
            return;
        }

        const content = [
            "DocuEngine Recovery Codes",
            "",
            "Keep these codes somewhere safe.",
            "Each recovery code can only be used once.",
            "",
            ...recoveryCodes,
        ].join("\n");

        const blob = new Blob(
            [content],
            {
                type: "text/plain;charset=utf-8",
            }
        );

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download =
            "docuengine-recovery-codes.txt";

        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        URL.revokeObjectURL(url);
    };

    if (loading && !mfa) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <div className="text-center">
                    <LoaderCircle
                        size={28}
                        className="mx-auto animate-spin text-[#19b5fe]"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading security settings...
                    </p>
                </div>
            </div>
        );
    }

    const enabled = Boolean(mfa?.enabled);

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
                        MFA & Recovery
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Protect your account with an authenticator
                        app and keep recovery codes available for
                        emergency access.
                    </p>
                </div>

                <div
                    className={`
                        inline-flex w-fit items-center gap-2
                        rounded-full border px-3.5 py-2
                        text-xs font-semibold
                        ${
                            enabled
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                        }
                    `}
                >
                    <span
                        className={`
                            h-2 w-2 rounded-full
                            ${
                                enabled
                                    ? "bg-emerald-500"
                                    : "bg-amber-500"
                            }
                        `}
                    />

                    {enabled
                        ? "MFA Enabled"
                        : "MFA Disabled"}
                </div>
            </div>

            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <AlertTriangle
                        size={20}
                        className="mt-0.5 shrink-0 text-red-500"
                    />

                    <div className="flex-1">
                        <p className="text-sm font-semibold text-red-700">
                            {error}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        className="text-red-400 hover:text-red-600"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {message && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-emerald-500"
                    />

                    <p className="text-sm font-semibold text-emerald-700">
                        {message}
                    </p>
                </div>
            )}

            {recoveryCodes.length > 0 && (
                <RecoveryCodesPanel
                    codes={recoveryCodes}
                    copied={copied}
                    codesSaved={codesSaved}
                    onCopy={handleCopyCodes}
                    onDownload={handleDownloadCodes}
                    onSavedChange={setCodesSaved}
                    onClose={() => {
                        if (!codesSaved) {
                            return;
                        }

                        setRecoveryCodes([]);
                    }}
                />
            )}

            {!enabled && !setupData && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="grid gap-8 p-6 lg:grid-cols-[1fr_340px] lg:p-8">
                        <div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#19b5fe]/10">
                                <Smartphone
                                    size={24}
                                    className="text-[#19b5fe]"
                                />
                            </div>

                            <h2 className="mt-5 text-xl font-bold text-[#07111f]">
                                Add an authenticator app
                            </h2>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                Use an authenticator such as Google
                                Authenticator, Microsoft Authenticator,
                                1Password, or another TOTP-compatible app.
                            </p>

                            <div className="mt-6 space-y-4">
                                <Step
                                    number="1"
                                    title="Start setup"
                                    description="Generate a secure authenticator key for your account."
                                />

                                <Step
                                    number="2"
                                    title="Scan the QR code"
                                    description="Add DocuEngine to your authenticator app."
                                />

                                <Step
                                    number="3"
                                    title="Confirm the code"
                                    description="Enter the current 6-digit code to activate MFA."
                                />
                            </div>
                        </div>

                        <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6">
                            <LockKeyhole
                                size={26}
                                className="text-[#19b5fe]"
                            />

                            <h3 className="mt-4 font-bold text-[#07111f]">
                                MFA is currently disabled
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Enable MFA to require a second
                                verification step whenever you sign in.
                            </p>

                            <button
                                type="button"
                                onClick={handleStartSetup}
                                disabled={actionLoading}
                                className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#19b5fe] px-5 text-sm font-semibold text-white shadow-lg shadow-[#19b5fe]/20 transition hover:bg-[#159edb] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {actionLoading && (
                                    <LoaderCircle
                                        size={17}
                                        className="animate-spin"
                                    />
                                )}

                                Enable MFA
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!enabled && setupData && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
                    <div className="mb-7">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#19b5fe]">
                            Authenticator Setup
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-[#07111f]">
                            Scan this QR code
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Scan the code with your authenticator
                            application, then enter the current
                            6-digit code below.
                        </p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-6">
                            {setupData.otpAuthUri ? (
                                <QRCodeSVG
                                    value={
                                        setupData.otpAuthUri
                                    }
                                    size={210}
                                    level="M"
                                    includeMargin
                                />
                            ) : (
                                <p className="text-sm text-red-500">
                                    QR code could not be generated.
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-medium text-slate-500">
                                    Can't scan the QR code?
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Enter this setup key manually in
                                    your authenticator application.
                                </p>

                                <div className="mt-3 break-all rounded-lg border border-slate-200 bg-white px-4 py-3 font-mono text-sm font-semibold tracking-wide text-slate-700">
                                    {setupData.secret}
                                </div>
                            </div>

                            <div className="mt-6">
                                <label
                                    htmlFor="setup-code"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Authentication code
                                </label>

                                <input
                                    id="setup-code"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    value={setupCode}
                                    onChange={
                                        handleSetupCodeChange
                                    }
                                    placeholder="000000"
                                    className="h-12 w-full max-w-sm rounded-xl border border-slate-200 px-4 text-center text-lg font-semibold tracking-[0.35em] text-slate-800 outline-none transition focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
                                />
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={
                                        handleConfirmSetup
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#19b5fe] px-5 text-sm font-semibold text-white transition hover:bg-[#159edb] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {actionLoading && (
                                        <LoaderCircle
                                            size={17}
                                            className="animate-spin"
                                        />
                                    )}

                                    Verify & Enable
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSetupData(null);
                                        setSetupCode("");
                                        setError("");
                                    }}
                                    disabled={
                                        actionLoading
                                    }
                                    className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {enabled && (
                <>
                    <div className="grid gap-5 xl:grid-cols-3">
                        <StatusCard
                            icon={ShieldCheck}
                            title="Authenticator"
                            value="Enabled"
                            description="A valid authentication code is required during sign in."
                            status="success"
                        />

                        <StatusCard
                            icon={KeyRound}
                            title="Recovery Access"
                            value="Configured"
                            description="Recovery codes can be regenerated whenever required."
                            status="info"
                        />

                        <StatusCard
                            icon={CheckCircle2}
                            title="Last Used"
                            value={
                                mfa?.last_used_at
                                    ? formatDate(
                                          mfa.last_used_at
                                      )
                                    : "Not available"
                            }
                            description="Most recent successful use of your MFA configuration."
                            status="neutral"
                        />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#19b5fe]/10">
                                    <RefreshCw
                                        size={20}
                                        className="text-[#19b5fe]"
                                    />
                                </div>

                                <div>
                                    <h2 className="font-bold text-[#07111f]">
                                        Recovery codes
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Generate a new set if your
                                        existing codes have been lost
                                        or may have been exposed.
                                    </p>
                                </div>
                            </div>

                            {!regenerateOpen ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        clearMessages();
                                        setRegenerateOpen(true);
                                    }}
                                    className="mt-6 h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-[#19b5fe]/40 hover:bg-[#19b5fe]/5 hover:text-[#159edb]"
                                >
                                    Regenerate Recovery Codes
                                </button>
                            ) : (
                                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Current authenticator code
                                    </label>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={
                                            regenerateCode
                                        }
                                        onChange={(e) =>
                                            setRegenerateCode(
                                                e.target.value
                                                    .replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                    .slice(
                                                        0,
                                                        6
                                                    )
                                            )
                                        }
                                        placeholder="000000"
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-center font-semibold tracking-[0.3em] outline-none transition focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
                                    />

                                    <div className="mt-4 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={
                                                handleRegenerate
                                            }
                                            disabled={
                                                actionLoading
                                            }
                                            className="flex h-10 items-center gap-2 rounded-lg bg-[#19b5fe] px-4 text-sm font-semibold text-white disabled:opacity-60"
                                        >
                                            {actionLoading && (
                                                <LoaderCircle
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            )}

                                            Generate
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRegenerateOpen(
                                                    false
                                                );
                                                setRegenerateCode(
                                                    ""
                                                );
                                            }}
                                            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-red-200 bg-white p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                                    <AlertTriangle
                                        size={20}
                                        className="text-red-500"
                                    />
                                </div>

                                <div>
                                    <h2 className="font-bold text-[#07111f]">
                                        Disable MFA
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Your account will no longer
                                        require an authenticator code
                                        during sign in.
                                    </p>
                                </div>
                            </div>

                            {!disableOpen ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        clearMessages();
                                        setDisableOpen(true);
                                    }}
                                    className="mt-6 h-11 rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                    Disable MFA
                                </button>
                            ) : (
                                <div className="mt-6 rounded-xl border border-red-100 bg-red-50/50 p-4">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Current authenticator code
                                    </label>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={disableCode}
                                        onChange={(e) =>
                                            setDisableCode(
                                                e.target.value
                                                    .replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                    .slice(
                                                        0,
                                                        6
                                                    )
                                            )
                                        }
                                        placeholder="000000"
                                        className="mt-2 h-11 w-full rounded-xl border border-red-200 bg-white px-4 text-center font-semibold tracking-[0.3em] outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                                    />

                                    <div className="mt-4 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={
                                                handleDisable
                                            }
                                            disabled={
                                                actionLoading
                                            }
                                            className="flex h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                                        >
                                            {actionLoading && (
                                                <LoaderCircle
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            )}

                                            Confirm Disable
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDisableOpen(
                                                    false
                                                );
                                                setDisableCode("");
                                            }}
                                            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {user && (
                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                <div>
                                    <p className="text-sm font-semibold text-[#07111f]">
                                        Protected account
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {user.name} · {user.email}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                                    <CheckCircle2
                                        size={16}
                                    />

                                    MFA protection active
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const RecoveryCodesPanel = ({
    codes,
    copied,
    codesSaved,
    onCopy,
    onDownload,
    onSavedChange,
    onClose,
}) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
            <div className="border-b border-amber-100 bg-amber-50 px-6 py-5">
                <div className="flex items-start gap-3">
                    <KeyRound
                        size={22}
                        className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <div>
                        <h2 className="font-bold text-amber-900">
                            Save your recovery codes now
                        </h2>

                        <p className="mt-1 max-w-2xl text-sm leading-6 text-amber-800/80">
                            These recovery codes are shown only
                            once. Each code can be used one time
                            if you cannot access your authenticator.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                    {codes.map((code, index) => (
                        <div
                            key={code}
                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                        >
                            <span className="text-xs font-semibold text-slate-400">
                                {String(index + 1).padStart(
                                    2,
                                    "0"
                                )}
                            </span>

                            <span className="font-mono text-sm font-semibold tracking-wide text-slate-700">
                                {code}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={onCopy}
                        className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        {copied ? (
                            <Check size={16} />
                        ) : (
                            <Clipboard size={16} />
                        )}

                        {copied
                            ? "Copied"
                            : "Copy All"}
                    </button>

                    <button
                        type="button"
                        onClick={onDownload}
                        className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        <Download size={16} />
                        Download
                    </button>
                </div>

                <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <input
                        type="checkbox"
                        checked={codesSaved}
                        onChange={(e) =>
                            onSavedChange(
                                e.target.checked
                            )
                        }
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#19b5fe] focus:ring-[#19b5fe]"
                    />

                    <span className="text-sm leading-5 text-slate-600">
                        I have saved these recovery codes
                        somewhere secure.
                    </span>
                </label>

                <button
                    type="button"
                    disabled={!codesSaved}
                    onClick={onClose}
                    className="mt-4 h-10 rounded-xl bg-[#07111f] px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

const StatusCard = ({
    icon: Icon,
    title,
    value,
    description,
    status,
}) => {
    const styles = {
        success:
            "bg-emerald-50 text-emerald-600",
        info:
            "bg-[#19b5fe]/10 text-[#19b5fe]",
        neutral:
            "bg-slate-100 text-slate-600",
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div
                className={`
                    flex h-10 w-10 items-center justify-center
                    rounded-xl
                    ${styles[status]}
                `}
            >
                <Icon size={19} />
            </div>

            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                {title}
            </p>

            <p className="mt-1 font-bold text-[#07111f]">
                {value}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
                {description}
            </p>
        </div>
    );
};

const Step = ({
    number,
    title,
    description,
}) => {
    return (
        <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-[#19b5fe]">
                {number}
            </div>

            <div>
                <p className="text-sm font-semibold text-[#07111f]">
                    {title}
                </p>

                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
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

export default MfaRecoveryPage;