import { ArrowLeft, Home, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function NotFoundPage() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-5 py-12">

            {/* =========================================================
                BACKGROUND
            ========================================================== */}

            <div className="pointer-events-none absolute inset-0">

                <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#19b5fe]/10 blur-3xl" />

                <div className="absolute -bottom-40 -right-32 h-[460px] w-[460px] rounded-full bg-[#7c3aed]/10 blur-3xl" />

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

            {/* =========================================================
                CONTENT
            ========================================================== */}

            <div className="relative z-10 w-full max-w-2xl text-center">

                {/* Brand */}

                <Link
                    to="/"
                    className="mx-auto mb-10 inline-flex items-center gap-3"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#19b5fe] to-[#7c3aed] shadow-lg shadow-[#19b5fe]/20">
                        <span className="text-xl font-bold text-white">
                            D
                        </span>
                    </div>

                    <div className="text-left">
                        <h1 className="text-xl font-bold tracking-tight text-white">
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

                {/* Error Code */}

                <div className="relative">

                    <h2 className="select-none text-[130px] font-black leading-none tracking-[-0.06em] text-white sm:text-[180px]">
                        404
                    </h2>

                    <div className="absolute inset-x-0 bottom-2 mx-auto h-10 max-w-[300px] bg-[#19b5fe]/10 blur-3xl" />

                </div>

                {/* Content */}

                <div className="relative mt-5">

                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#19b5fe]">
                        Page Not Found
                    </p>

                    <h3 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        This page doesn&apos;t exist.
                    </h3>

                    <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-400 sm:text-base">
                        The page you are looking for may have been moved,
                        removed, or the URL may be incorrect.
                    </p>

                </div>

                {/* Actions */}

                <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white sm:w-auto"
                    >
                        <ArrowLeft size={17} />

                        Go back
                    </button>

                    {token ? (

                        <Link
                            to="/admin/dashboard"
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#19b5fe] px-5 text-sm font-semibold text-white shadow-lg shadow-[#19b5fe]/20 transition hover:bg-[#159edb] sm:w-auto"
                        >
                            <LayoutDashboard size={17} />

                            Back to dashboard
                        </Link>

                    ) : (

                        <Link
                            to="/"
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#19b5fe] px-5 text-sm font-semibold text-white shadow-lg shadow-[#19b5fe]/20 transition hover:bg-[#159edb] sm:w-auto"
                        >
                            <Home size={17} />

                            Back to home
                        </Link>

                    )}

                </div>

                {/* Footer */}

                <p className="mt-12 text-xs text-slate-600">
                    Error 404 · DocuEngine
                </p>

            </div>

        </div>
    );
}

export default NotFoundPage;