import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    KeyRound,
    LoaderCircle,
    LockKeyhole,
    ShieldCheck,
} from "lucide-react";

import api from "../../api/axios";

const TwoFactorChallengePage = () => {
    const navigate = useNavigate();

    const [method, setMethod] = useState("totp");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [secondsLeft, setSecondsLeft] = useState(0);

    
    const [challengeToken] = useState(() =>
    sessionStorage.getItem("mfa_challenge_token") || ""
);

const [expiresAt] = useState(() =>
    sessionStorage.getItem("mfa_challenge_expires_at") || ""
);

const [loginEmail] = useState(() =>
    sessionStorage.getItem("mfa_login_email") || ""
);

    const isExpired = secondsLeft <= 0;

    const formattedTime = useMemo(() => {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;

        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }, [secondsLeft]);

    useEffect(() => {
        if (!challengeToken) {
            navigate("/login", {
                replace: true,
            });

            return;
        }

        const updateTimer = () => {
            if (!expiresAt) {
                setSecondsLeft(300);
                return;
            }

            const expiresTime = new Date(expiresAt).getTime();
            const currentTime = Date.now();

            const remaining = Math.max(
                0,
                Math.floor((expiresTime - currentTime) / 1000)
            );

            setSecondsLeft(remaining);
        };

        updateTimer();

        const interval = window.setInterval(
            updateTimer,
            1000
        );

        return () => {
            window.clearInterval(interval);
        };
    }, [
        challengeToken,
        expiresAt,
        navigate,
    ]);

    const clearChallenge = () => {
        sessionStorage.removeItem(
            "mfa_challenge_token"
        );

        sessionStorage.removeItem(
            "mfa_challenge_expires_at"
        );

        sessionStorage.removeItem(
            "mfa_login_email"
        );
    };

    const handleMethodChange = (selectedMethod) => {
        setMethod(selectedMethod);
        setCode("");
        setError("");
    };

    const handleTotpChange = (e) => {
        const value = e.target.value
            .replace(/\D/g, "")
            .slice(0, 6);

        setCode(value);
        setError("");
    };

    const handleRecoveryCodeChange = (e) => {
        setCode(
            e.target.value
                .toUpperCase()
                .slice(0, 100)
        );

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!challengeToken) {
            setError(
                "Your verification session is no longer available."
            );

            return;
        }

        if (isExpired) {
            setError(
                "Your verification session has expired. Please sign in again."
            );

            return;
        }

        if (method === "totp") {
            if (!/^\d{6}$/.test(code)) {
                setError(
                    "Enter the 6-digit code from your authenticator app."
                );

                return;
            }
        }

        if (method === "recovery_code") {
            if (!code.trim()) {
                setError(
                    "Enter one of your recovery codes."
                );

                return;
            }
        }

        setLoading(true);

        try {
            const response = await api.post(
                "/auth/mfa/challenge/verify",
                {
                    challenge_token: challengeToken,
                    method,
                    code: code.trim(),
                }
            );

            const token = response.data?.token;

            if (!token) {
                setError(
                    "Authentication could not be completed."
                );

                return;
            }

            localStorage.setItem(
                "token",
                token
            );

            clearChallenge();

            navigate(
                "/admin/dashboard",
                {
                    replace: true,
                }
            );
        } catch (error) {
            if (error.response?.data?.message) {
                setError(
                    error.response.data.message
                );
            } else if (error.request) {
                setError(
                    "Unable to connect to the server. Please try again."
                );
            } else {
                setError(
                    "Verification failed. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        clearChallenge();

        navigate(
            "/login",
            {
                replace: true,
            }
        );
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#07111f] px-4 py-10">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#19b5fe]/10 blur-3xl" />

                <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#7c3aed]/10 blur-3xl" />

                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage: `
                            linear-gradient(#ffffff 1px, transparent 1px),
                            linear-gradient(90deg, #ffffff 1px, transparent 1px)
                        `,
                        backgroundSize: "50px 50px",
                    }}
                />
            </div>

            <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-16">
                <div className="hidden text-white lg:block">
                    <Link
                        to="/"
                        className="mb-12 flex items-center gap-3"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#19b5fe] to-[#7c3aed] shadow-lg shadow-[#19b5fe]/20">
                            <span className="text-xl font-bold text-white">
                                D
                            </span>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Docu
                                <span className="text-[#19b5fe]">
                                    Engine
                                </span>
                            </h1>

                            <p className="text-xs tracking-wide text-slate-400">
                                IT Documentation Platform
                            </p>
                        </div>
                    </Link>

                    <div className="max-w-xl">
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
                            <ShieldCheck
                                size={16}
                                className="text-[#19b5fe]"
                            />

                            Protected sign in
                        </div>

                        <h2 className="text-5xl font-bold leading-[1.08] tracking-tight xl:text-6xl">
                            One more step
                            <span className="block text-[#19b5fe]">
                                to secure your account.
                            </span>
                        </h2>

                        <p className="mt-7 max-w-lg text-lg leading-8 text-slate-400">
                            Multi-factor authentication adds another layer
                            of protection before access to your workspace
                            is granted.
                        </p>
                    </div>

                    <div className="mt-12 space-y-5">
                        <SecurityFeature
                            icon={LockKeyhole}
                            title="Identity verification"
                            description="Confirm your sign in with your registered authenticator."
                        />

                        <SecurityFeature
                            icon={KeyRound}
                            title="Recovery access"
                            description="Use a one-time recovery code if your authenticator is unavailable."
                        />

                        <SecurityFeature
                            icon={CheckCircle2}
                            title="Secure session"
                            description="A session is created only after verification succeeds."
                        />
                    </div>
                </div>

                <div className="mx-auto w-full max-w-md lg:ml-auto">
                    <div className="rounded-3xl bg-white p-7 shadow-2xl shadow-black/30 sm:p-9">
                        <Link
                            to="/"
                            className="mb-9 flex items-center gap-3 lg:hidden"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#19b5fe] to-[#7c3aed]">
                                <span className="font-bold text-white">
                                    D
                                </span>
                            </div>

                            <div>
                                <h1 className="text-xl font-bold text-[#07111f]">
                                    Docu
                                    <span className="text-[#19b5fe]">
                                        Engine
                                    </span>
                                </h1>

                                <p className="text-[10px] tracking-wide text-slate-400">
                                    IT Documentation Platform
                                </p>
                            </div>
                        </Link>

                        <div className="mb-7">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#19b5fe]/10">
                                <ShieldCheck
                                    size={24}
                                    className="text-[#19b5fe]"
                                />
                            </div>

                            <p className="mb-2 text-sm font-medium text-[#19b5fe]">
                                Two-factor authentication
                            </p>

                            <h2 className="text-3xl font-bold tracking-tight text-[#07111f]">
                                Verify your identity
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Enter your authenticator code to finish
                                signing in.
                            </p>

                            {loginEmail && (
                                <p className="mt-2 truncate text-xs font-medium text-slate-400">
                                    {loginEmail}
                                </p>
                            )}
                        </div>

                        <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                            <button
                                type="button"
                                onClick={() =>
                                    handleMethodChange(
                                        "totp"
                                    )
                                }
                                disabled={loading}
                                className={`
                                    rounded-lg px-3 py-2.5
                                    text-sm font-semibold
                                    transition
                                    ${
                                        method === "totp"
                                            ? "bg-white text-[#07111f] shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"
                                    }
                                `}
                            >
                                Authenticator
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleMethodChange(
                                        "recovery_code"
                                    )
                                }
                                disabled={loading}
                                className={`
                                    rounded-lg px-3 py-2.5
                                    text-sm font-semibold
                                    transition
                                    ${
                                        method === "recovery_code"
                                            ? "bg-white text-[#07111f] shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"
                                    }
                                `}
                            >
                                Recovery Code
                            </button>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-sm font-medium text-red-600">
                                    {error}
                                </p>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            {method === "totp" ? (
                                <div>
                                    <label
                                        htmlFor="mfa-code"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Authentication code
                                    </label>

                                    <input
                                        id="mfa-code"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        value={code}
                                        onChange={
                                            handleTotpChange
                                        }
                                        placeholder="000000"
                                        disabled={
                                            loading ||
                                            isExpired
                                        }
                                        autoFocus
                                        className="
                                            h-14
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            px-4
                                            text-center
                                            text-2xl
                                            font-semibold
                                            tracking-[0.45em]
                                            text-slate-800
                                            outline-none
                                            transition
                                            placeholder:text-slate-300
                                            focus:border-[#19b5fe]
                                            focus:ring-4
                                            focus:ring-[#19b5fe]/10
                                            disabled:cursor-not-allowed
                                            disabled:bg-slate-50
                                        "
                                    />

                                    <p className="mt-2 text-xs text-slate-400">
                                        Enter the 6-digit code
                                        generated by your authenticator
                                        app.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <label
                                        htmlFor="recovery-code"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Recovery code
                                    </label>

                                    <input
                                        id="recovery-code"
                                        type="text"
                                        value={code}
                                        onChange={
                                            handleRecoveryCodeChange
                                        }
                                        placeholder="XXXXXXXX-XXXXXXXX"
                                        disabled={
                                            loading ||
                                            isExpired
                                        }
                                        autoFocus
                                        className="
                                            h-12
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            px-4
                                            font-medium
                                            tracking-wide
                                            text-slate-800
                                            outline-none
                                            transition
                                            placeholder:text-slate-300
                                            focus:border-[#19b5fe]
                                            focus:ring-4
                                            focus:ring-[#19b5fe]/10
                                            disabled:cursor-not-allowed
                                            disabled:bg-slate-50
                                        "
                                    />

                                    <p className="mt-2 text-xs leading-5 text-slate-400">
                                        Recovery codes can only be used
                                        once.
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <span className="text-xs font-medium text-slate-500">
                                    Verification session
                                </span>

                                <span
                                    className={`
                                        text-xs font-semibold
                                        ${
                                            isExpired
                                                ? "text-red-500"
                                                : secondsLeft <= 60
                                                  ? "text-amber-500"
                                                  : "text-emerald-600"
                                        }
                                    `}
                                >
                                    {isExpired
                                        ? "Expired"
                                        : formattedTime}
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    isExpired
                                }
                                className="
                                    flex
                                    h-12
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-[#19b5fe]
                                    font-semibold
                                    text-white
                                    shadow-lg
                                    shadow-[#19b5fe]/20
                                    transition-all
                                    duration-200
                                    hover:-translate-y-[1px]
                                    hover:bg-[#159edb]
                                    disabled:cursor-not-allowed
                                    disabled:bg-[#19b5fe]/60
                                    disabled:hover:translate-y-0
                                "
                            >
                                {loading && (
                                    <LoaderCircle
                                        size={18}
                                        className="animate-spin"
                                    />
                                )}

                                {loading
                                    ? "Verifying..."
                                    : "Verify and continue"}
                            </button>
                        </form>

                        <div className="mt-7 border-t border-slate-100 pt-6">
                            <button
                                type="button"
                                onClick={handleBackToLogin}
                                className="mx-auto flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#19b5fe]"
                            >
                                <ArrowLeft size={16} />
                                Back to sign in
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-500">
                            © {new Date().getFullYear()} DocuEngine.
                            All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SecurityFeature = ({
    icon: Icon,
    title,
    description,
}) => {
    return (
        <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <Icon
                    size={18}
                    className="text-[#19b5fe]"
                />
            </div>

            <div>
                <h3 className="font-semibold text-white">
                    {title}
                </h3>

                <p className="mt-1 max-w-sm text-sm leading-6 text-slate-400">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default TwoFactorChallengePage;