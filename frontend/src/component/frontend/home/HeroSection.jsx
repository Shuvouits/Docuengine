import React from "react";
import { ArrowRight, Play } from "lucide-react";

const HeroSection = () => {
    return (
        <section className="relative overflow-hidden bg-[#07111f]">
            {/* Background Effects */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[8%] top-[-180px] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[140px]" />

                <div className="absolute right-[5%] top-[10%] h-[450px] w-[450px] rounded-full bg-violet-600/20 blur-[140px]" />

                <div className="absolute bottom-[-200px] left-[35%] h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[130px]" />
            </div>

            {/* Subtle Grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Main Container */}
            <div className="relative mx-auto flex min-h-[720px] max-w-[1550px] items-center px-6 py-24 sm:px-10 lg:px-16 xl:px-20">
                <div className="grid w-full items-center gap-16 lg:grid-cols-[1fr_0.95fr] xl:gap-24">

                    {/* LEFT */}
                    <div className="max-w-3xl">
                        {/* Badge */}
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 backdrop-blur-sm">
                            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />

                            Modern IT Documentation Platform
                        </div>

                        {/* Heading */}
                        <h1 className="text-5xl font-bold leading-[1.05] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl xl:text-[80px]">
                            Your IT knowledge,
                            <br />

                            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                                organized intelligently.
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                            Bring documentation, assets, processes, credentials,
                            and infrastructure together in one powerful platform
                            built for modern IT teams.
                        </p>

                        {/* Buttons */}
                        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                            <a
                                href="/register"
                                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-[#07111f] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
                            >
                                Get Started

                                <ArrowRight
                                    size={17}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </a>

                            <a
                                href="/demo"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/[0.08]"
                            >
                                <Play size={16} />

                                Book a Demo
                            </a>
                        </div>

                        {/* Trust Points */}
                        <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <span className="text-cyan-400">✓</span>
                                Centralized Documentation
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <span className="text-cyan-400">✓</span>
                                Secure &amp; Organized
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <span className="text-cyan-400">✓</span>
                                Built to Scale
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — PRODUCT PREVIEW */}
                    <div className="relative">
                        {/* Glow */}
                        <div className="absolute inset-10 rounded-full bg-blue-500/20 blur-[100px]" />

                        {/* Main Card */}
                        <div className="relative rounded-[24px] border border-white/10 bg-[#0c1a2c]/90 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">

                            {/* Browser Header */}
                            <div className="flex items-center justify-between rounded-t-[18px] border-b border-white/10 bg-white/[0.025] px-5 py-4">
                                <div className="flex gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                                </div>

                                <div className="rounded-md border border-white/5 bg-white/[0.04] px-5 py-1.5 text-[10px] text-slate-500">
                                    app.docuengaine.com
                                </div>

                                <div className="w-8" />
                            </div>

                            {/* Dashboard */}
                            <div className="grid min-h-[390px] grid-cols-[145px_1fr]">

                                {/* Sidebar */}
                                <div className="border-r border-white/10 p-4">
                                    <div className="mb-7 flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-xs font-bold text-white">
                                            D
                                        </div>

                                        <span className="text-xs font-semibold text-white">
                                            Docuengaine
                                        </span>
                                    </div>

                                    <div className="space-y-1.5">
                                        {[
                                            "Dashboard",
                                            "Companies",
                                            "Documentation",
                                            "Assets",
                                            "Processes",
                                            "Network",
                                            "Passwords",
                                        ].map((item, index) => (
                                            <div
                                                key={item}
                                                className={`rounded-lg px-3 py-2 text-[10px] ${
                                                    index === 0
                                                        ? "bg-blue-500/15 text-blue-300"
                                                        : "text-slate-500"
                                                }`}
                                            >
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="mb-5">
                                        <p className="text-[10px] text-slate-500">
                                            Overview
                                        </p>

                                        <h3 className="mt-1 text-lg font-semibold text-white">
                                            Welcome back
                                        </h3>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            ["Companies", "42"],
                                            ["Assets", "1,284"],
                                            ["Documents", "3,892"],
                                        ].map(([label, value]) => (
                                            <div
                                                key={label}
                                                className="rounded-xl border border-white/10 bg-white/[0.035] p-3"
                                            >
                                                <p className="text-[9px] text-slate-500">
                                                    {label}
                                                </p>

                                                <p className="mt-1 text-lg font-bold text-white">
                                                    {value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Health */}
                                    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.035] p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-slate-500">
                                                    Documentation Health
                                                </p>

                                                <p className="mt-1 text-2xl font-bold text-white">
                                                    94%
                                                </p>
                                            </div>

                                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-blue-500/20 text-xs font-bold text-blue-300">
                                                94
                                            </div>
                                        </div>

                                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                                            <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                                        </div>
                                    </div>

                                    {/* Activity */}
                                    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.035] p-4">
                                        <p className="mb-3 text-[10px] text-slate-500">
                                            Recent Activity
                                        </p>

                                        <div className="space-y-3">
                                            {[
                                                "Network documentation updated",
                                                "New asset added",
                                                "Security procedure published",
                                            ].map((item) => (
                                                <div
                                                    key={item}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

                                                    <span className="text-[10px] text-slate-400">
                                                        {item}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;