import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";


const LoginPage = () => {
    const navigate = useNavigate();

    /*
    |--------------------------------------------------------------------------
    | Form State
    |--------------------------------------------------------------------------
    */

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    /*
    |--------------------------------------------------------------------------
    | UI State
    |--------------------------------------------------------------------------
    */

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        /*
        |--------------------------------------------------------------------------
        | Basic Validation
        |--------------------------------------------------------------------------
        */

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        setLoading(true);

        try {
            /*
            |--------------------------------------------------------------------------
            | Login API
            |--------------------------------------------------------------------------
            */

            const response = await api.post("/auth/login", {
                email: email.trim(),
                password,
            });

            const token = response.data?.token;

            if (!token) {
                setError("Authentication token was not received.");
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Store JWT Token
            |--------------------------------------------------------------------------
            */

            localStorage.setItem("token", token);

            /*
            |--------------------------------------------------------------------------
            | Redirect to Admin Dashboard
            |--------------------------------------------------------------------------
            */

            navigate("/admin/dashboard", {
                replace: true,
            });

        } catch (error) {
            /*
            |--------------------------------------------------------------------------
            | API Error Handling
            |--------------------------------------------------------------------------
            */

            if (error.response?.status === 401) {
                setError("Invalid email or password.");
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.request) {
                setError(
                    "Unable to connect to the server. Please try again."
                );
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#07111f] flex items-center justify-center px-4 py-10">

            {/* =========================================================
                BACKGROUND
            ========================================================== */}

            <div className="absolute inset-0 overflow-hidden pointer-events-none">

                <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#19b5fe]/10 rounded-full blur-3xl" />

                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#7c3aed]/10 rounded-full blur-3xl" />

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
                MAIN CONTAINER
            ========================================================== */}

            <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">


                {/* =====================================================
                    LEFT SIDE
                ====================================================== */}

                <div className="hidden lg:block text-white">

                    {/* Logo */}

                    <Link
                        to="/"
                        className="flex items-center gap-3 mb-12 group"
                    >

                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#19b5fe] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#19b5fe]/20 transition-transform duration-300 group-hover:scale-105">

                            <span className="text-white text-xl font-bold">
                                D
                            </span>

                        </div>


                        <div>

                            <h1 className="text-2xl font-bold tracking-tight">
                                Docu<span className="text-[#19b5fe]">Engine</span>
                            </h1>

                            <p className="text-xs text-slate-400 tracking-wide">
                                IT Documentation Platform
                            </p>

                        </div>

                    </Link>


                    {/* Heading */}

                    <div className="max-w-xl">

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] text-sm text-slate-300 mb-7">

                            <span className="w-2 h-2 rounded-full bg-[#19b5fe]" />

                            Secure workspace access

                        </div>


                        <h2 className="text-5xl xl:text-6xl font-bold leading-[1.08] tracking-tight">

                            Your IT knowledge,

                            <span className="block text-[#19b5fe]">
                                always within reach.
                            </span>

                        </h2>


                        <p className="mt-7 text-lg leading-8 text-slate-400 max-w-lg">
                            Access your documentation, assets, credentials,
                            processes and knowledge from one secure workspace.
                        </p>

                    </div>


                    {/* Features */}

                    <div className="mt-12 space-y-5">

                        <Feature
                            number="01"
                            title="Everything connected"
                            description="Keep your team's critical information organized in one place."
                        />

                        <Feature
                            number="02"
                            title="Built for IT teams"
                            description="Manage documentation, assets, processes and infrastructure efficiently."
                        />

                        <Feature
                            number="03"
                            title="Secure by design"
                            description="Keep sensitive organizational information protected and controlled."
                        />

                    </div>

                </div>


                {/* =====================================================
                    RIGHT SIDE - LOGIN
                ====================================================== */}

                <div className="w-full max-w-md mx-auto lg:ml-auto">

                    <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 p-7 sm:p-9">


                        {/* =================================================
                            MOBILE LOGO
                        ================================================== */}

                        <Link
                            to="/"
                            className="lg:hidden flex items-center gap-3 mb-9 group"
                        >

                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#19b5fe] to-[#7c3aed] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">

                                <span className="text-white font-bold">
                                    D
                                </span>

                            </div>


                            <div>

                                <h1 className="text-xl font-bold text-[#07111f]">
                                    Docu<span className="text-[#19b5fe]">Engine</span>
                                </h1>

                                <p className="text-[10px] text-slate-400 tracking-wide">
                                    IT Documentation Platform
                                </p>

                            </div>

                        </Link>


                        {/* =================================================
                            HEADER
                        ================================================== */}

                        <div className="mb-8">

                            <p className="text-sm font-medium text-[#19b5fe] mb-2">
                                Welcome back
                            </p>

                            <h2 className="text-3xl font-bold text-[#07111f] tracking-tight">
                                Sign in to your account
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Enter your credentials to access your workspace.
                            </p>

                        </div>


                        {/* =================================================
                            ERROR MESSAGE
                        ================================================== */}

                        {error && (

                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                                <p className="text-sm font-medium text-red-600">
                                    {error}
                                </p>

                            </div>

                        )}


                        {/* =================================================
                            LOGIN FORM
                        ================================================== */}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {/* Email */}

                            <div>

                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Email address
                                </label>


                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    autoComplete="email"
                                    disabled={loading}
                                    className="
                                        w-full
                                        h-12
                                        px-4
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        text-slate-800
                                        placeholder:text-slate-400
                                        outline-none
                                        transition
                                        focus:border-[#19b5fe]
                                        focus:ring-4
                                        focus:ring-[#19b5fe]/10
                                        disabled:bg-slate-50
                                        disabled:cursor-not-allowed
                                    "
                                />

                            </div>


                            {/* Password */}

                            <div>

                                <div className="flex items-center justify-between mb-2">

                                    <label
                                        htmlFor="password"
                                        className="text-sm font-medium text-slate-700"
                                    >
                                        Password
                                    </label>


                                    <button
                                        type="button"
                                        className="text-sm font-medium text-[#19b5fe] hover:text-[#168dcc] transition"
                                    >
                                        Forgot password?
                                    </button>

                                </div>


                                <div className="relative">

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        disabled={loading}
                                        className="
                                            w-full
                                            h-12
                                            px-4
                                            pr-16
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            text-slate-800
                                            placeholder:text-slate-400
                                            outline-none
                                            transition
                                            focus:border-[#19b5fe]
                                            focus:ring-4
                                            focus:ring-[#19b5fe]/10
                                            disabled:bg-slate-50
                                            disabled:cursor-not-allowed
                                        "
                                    />


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="
                                            absolute
                                            right-4
                                            top-1/2
                                            -translate-y-1/2
                                            text-sm
                                            font-medium
                                            text-slate-500
                                            hover:text-[#19b5fe]
                                            transition
                                        "
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>

                                </div>

                            </div>


                            {/* Remember Me */}

                            <div className="flex items-center">

                                <label className="flex items-center gap-3 cursor-pointer select-none">

                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) =>
                                            setRememberMe(e.target.checked)
                                        }
                                        disabled={loading}
                                        className="
                                            w-4
                                            h-4
                                            rounded
                                            border-slate-300
                                            text-[#19b5fe]
                                            focus:ring-[#19b5fe]
                                        "
                                    />

                                    <span className="text-sm text-slate-600">
                                        Remember me
                                    </span>

                                </label>

                            </div>


                            {/* Login Button */}

                            <button
                                type="submit"
                                disabled={loading}
                                className="
                                    w-full
                                    h-12
                                    rounded-xl
                                    bg-[#19b5fe]
                                    hover:bg-[#159edb]
                                    disabled:bg-[#19b5fe]/70
                                    disabled:cursor-not-allowed
                                    text-white
                                    font-semibold
                                    transition-all
                                    duration-200
                                    shadow-lg
                                    shadow-[#19b5fe]/20
                                    hover:-translate-y-[1px]
                                    disabled:hover:translate-y-0
                                "
                            >
                                {loading ? "Signing in..." : "Sign in"}
                            </button>

                        </form>


                        {/* =================================================
                            DIVIDER
                        ================================================== */}

                        <div className="flex items-center gap-4 my-7">

                            <div className="h-px bg-slate-200 flex-1" />

                            <span className="text-xs text-slate-400 uppercase tracking-wider">
                                or continue with
                            </span>

                            <div className="h-px bg-slate-200 flex-1" />

                        </div>


                        {/* =================================================
                            SOCIAL LOGIN
                        ================================================== */}

                        <div className="grid grid-cols-2 gap-3">

                            <button
                                type="button"
                                className="
                                    h-11
                                    rounded-xl
                                    border border-slate-200
                                    bg-white
                                    hover:bg-slate-50
                                    text-sm
                                    font-medium
                                    text-slate-700
                                    transition
                                "
                            >
                                Google
                            </button>


                            <button
                                type="button"
                                className="
                                    h-11
                                    rounded-xl
                                    border border-slate-200
                                    bg-white
                                    hover:bg-slate-50
                                    text-sm
                                    font-medium
                                    text-slate-700
                                    transition
                                "
                            >
                                Microsoft
                            </button>

                        </div>


                        {/* =================================================
                            SUPPORT
                        ================================================== */}

                        <div className="mt-7 text-center">

                            <p className="text-sm text-slate-500">
                                Having trouble signing in?
                            </p>

                            <button
                                type="button"
                                className="mt-1 text-sm font-medium text-[#19b5fe] hover:underline"
                            >
                                Contact your administrator
                            </button>

                        </div>

                    </div>


                    {/* =====================================================
                        FOOTER
                    ====================================================== */}

                    <div className="mt-6 text-center">

                        <p className="text-xs text-slate-500">
                            © {new Date().getFullYear()} DocuEngine.
                            All rights reserved.
                        </p>


                        <div className="flex justify-center gap-5 mt-2">

                            <button className="text-xs text-slate-500 hover:text-slate-300">
                                Privacy
                            </button>

                            <button className="text-xs text-slate-500 hover:text-slate-300">
                                Terms
                            </button>

                            <button className="text-xs text-slate-500 hover:text-slate-300">
                                Support
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};


/* =========================================================
   FEATURE COMPONENT
========================================================= */

const Feature = ({ number, title, description }) => {
    return (
        <div className="flex gap-4">

            <div className="flex-shrink-0 w-10 h-10 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center">

                <span className="text-xs font-semibold text-[#19b5fe]">
                    {number}
                </span>

            </div>


            <div>

                <h3 className="font-semibold text-white">
                    {title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-400 max-w-sm">
                    {description}
                </p>

            </div>

        </div>
    );
};


export default LoginPage;