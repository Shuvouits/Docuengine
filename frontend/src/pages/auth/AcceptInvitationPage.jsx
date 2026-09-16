import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
    AlertTriangle,
    Building2,
    CheckCircle2,
    KeyRound,
    LoaderCircle,
    ShieldCheck,
    UserPlus,
} from "lucide-react";

import api from "../../api/axios";

const AcceptInvitationPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token") || "";

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [invitation, setInvitation] = useState(null);

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] =
        useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const validateInvitation = async () => {
            if (!token) {
                setError(
                    "This invitation link is missing its access token."
                );

                setLoading(false);
                return;
            }

            try {
                const response = await api.post(
                    "/invitations/validate",
                    {
                        token,
                    }
                );

                const data =
                    response.data?.data?.invitation || null;

                setInvitation(data);

                if (data?.name) {
                    setName(data.name);
                }
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                        "This invitation is invalid or no longer available."
                );
            } finally {
                setLoading(false);
            }
        };

        validateInvitation();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!name.trim()) {
            setError("Please enter your name.");
            return;
        }

        if (password.length < 8) {
            setError(
                "Password must contain at least 8 characters."
            );
            return;
        }

        if (password !== passwordConfirmation) {
            setError(
                "Password confirmation does not match."
            );
            return;
        }

        setSubmitting(true);

        try {
            await api.post(
                "/invitations/accept",
                {
                    token,
                    name: name.trim(),
                    password,
                    password_confirmation:
                        passwordConfirmation,
                }
            );

            setSuccess(true);

            window.setTimeout(() => {
                navigate("/login", {
                    replace: true,
                });
            }, 1800);
        } catch (error) {
            const validationErrors =
                error.response?.data?.errors;

            if (validationErrors) {
                const firstError =
                    Object.values(
                        validationErrors
                    )?.[0]?.[0];

                if (firstError) {
                    setError(firstError);
                    return;
                }
            }

            setError(
                error.response?.data?.message ||
                    "Unable to accept this invitation."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#07111f]">
                <div className="text-center">
                    <LoaderCircle
                        size={32}
                        className="mx-auto animate-spin text-[#19b5fe]"
                    />

                    <p className="mt-4 text-sm text-slate-400">
                        Validating invitation...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#07111f] px-4 py-10">
            <div className="pointer-events-none absolute inset-0">
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

            <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
                <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-[0.85fr_1.15fr]">
                    <div className="bg-[#0a1727] p-8 text-white lg:p-10">
                        <Link
                            to="/"
                            className="flex items-center gap-3"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#19b5fe] to-[#7c3aed]">
                                <span className="text-xl font-bold">
                                    D
                                </span>
                            </div>

                            <div>
                                <h1 className="text-xl font-bold">
                                    Docu
                                    <span className="text-[#19b5fe]">
                                        Engine
                                    </span>
                                </h1>

                                <p className="text-[10px] text-slate-400">
                                    IT Documentation Platform
                                </p>
                            </div>
                        </Link>

                        <div className="mt-12">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#19b5fe]/10 text-[#19b5fe]">
                                <UserPlus size={24} />
                            </div>

                            <h2 className="mt-6 text-3xl font-bold leading-tight">
                                You've been invited to join DocuEngine.
                            </h2>

                            <p className="mt-4 text-sm leading-6 text-slate-400">
                                Create your account credentials and
                                access the organization securely.
                            </p>
                        </div>

                        {invitation && (
                            <div className="mt-10 space-y-4">
                                <InfoRow
                                    icon={Building2}
                                    label="Organization"
                                    value={
                                        invitation.tenant?.name ||
                                        "Organization"
                                    }
                                />

                                <InfoRow
                                    icon={ShieldCheck}
                                    label="Assigned Role"
                                    value={
                                        invitation.role?.name ||
                                        "Member"
                                    }
                                />

                                <InfoRow
                                    icon={KeyRound}
                                    label="Email"
                                    value={invitation.email}
                                />
                            </div>
                        )}
                    </div>

                    <div className="p-7 sm:p-9 lg:p-10">
                        {success ? (
                            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                                    <CheckCircle2
                                        size={32}
                                        className="text-emerald-500"
                                    />
                                </div>

                                <h2 className="mt-5 text-2xl font-bold text-[#07111f]">
                                    Invitation accepted
                                </h2>

                                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                    Your account is ready. Redirecting
                                    you to sign in...
                                </p>
                            </div>
                        ) : error && !invitation ? (
                            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                                    <AlertTriangle
                                        size={30}
                                        className="text-red-500"
                                    />
                                </div>

                                <h2 className="mt-5 text-2xl font-bold text-[#07111f]">
                                    Invitation unavailable
                                </h2>

                                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                    {error}
                                </p>

                                <Link
                                    to="/login"
                                    className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#19b5fe] px-5 text-sm font-semibold text-white"
                                >
                                    Back to Sign In
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <p className="text-sm font-semibold text-[#19b5fe]">
                                        Accept invitation
                                    </p>

                                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#07111f]">
                                        Set up your account
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        You're joining{" "}
                                        <span className="font-semibold text-slate-700">
                                            {invitation?.tenant?.name}
                                        </span>{" "}
                                        as{" "}
                                        <span className="font-semibold text-slate-700">
                                            {invitation?.role?.name}
                                        </span>.
                                    </p>
                                </div>

                                {error && (
                                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                        <p className="text-sm font-medium text-red-600">
                                            {error}
                                        </p>
                                    </div>
                                )}

                                <form
                                    onSubmit={handleSubmit}
                                    className="mt-7 space-y-5"
                                >
                                    <FormField
                                        label="Full Name"
                                        value={name}
                                        onChange={setName}
                                        placeholder="Enter your full name"
                                    />

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Email Address
                                        </label>

                                        <input
                                            type="email"
                                            value={
                                                invitation?.email || ""
                                            }
                                            disabled
                                            className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500"
                                        />
                                    </div>

                                    <FormField
                                        label="Password"
                                        type="password"
                                        value={password}
                                        onChange={setPassword}
                                        placeholder="Minimum 8 characters"
                                    />

                                    <FormField
                                        label="Confirm Password"
                                        type="password"
                                        value={passwordConfirmation}
                                        onChange={
                                            setPasswordConfirmation
                                        }
                                        placeholder="Repeat your password"
                                    />

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#19b5fe] font-semibold text-white shadow-lg shadow-[#19b5fe]/20 transition hover:bg-[#159edb] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {submitting && (
                                            <LoaderCircle
                                                size={18}
                                                className="animate-spin"
                                            />
                                        )}

                                        {submitting
                                            ? "Accepting..."
                                            : "Accept Invitation"}
                                    </button>
                                </form>

                                <p className="mt-6 text-center text-xs text-slate-400">
                                    Already have access?{" "}
                                    <Link
                                        to="/login"
                                        className="font-semibold text-[#19b5fe]"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({
    icon: Icon,
    label,
    value,
}) => {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <Icon
                size={18}
                className="mt-0.5 shrink-0 text-[#19b5fe]"
            />

            <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-slate-200">
                    {value}
                </p>
            </div>
        </div>
    );
};

const FormField = ({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                placeholder={placeholder}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
            />
        </div>
    );
};

export default AcceptInvitationPage;