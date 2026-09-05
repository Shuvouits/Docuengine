import {
    ArrowUpRight,
    Code2,
    Globe2,
    Mail,
} from "lucide-react";

function Footer() {
    return (
        <footer className="relative overflow-hidden bg-[#0d0224] text-white">

            {/* =====================================================
                BACKGROUND DECORATION
            ====================================================== */}
            <div className="pointer-events-none absolute -left-40 bottom-0 h-[500px] w-[500px] rounded-full bg-violet-700/10 blur-3xl" />

            <div className="pointer-events-none absolute -right-40 top-0 h-[450px] w-[450px] rounded-full bg-indigo-600/10 blur-3xl" />

            <div className="relative mx-auto max-w-[1550px] px-6 sm:px-8 lg:px-12 xl:px-16">

                {/* =================================================
                    TOP CTA
                ================================================== */}
                <div className="border-b border-white/10 py-16 sm:py-20 lg:py-24">

                    <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">

                        <div className="max-w-3xl">

                            <div className="mb-5 inline-flex items-center rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-xs font-medium text-violet-200">
                                Build a better knowledge workspace
                            </div>

                            <h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                                Bring your team's knowledge
                                <span className="block text-violet-400">
                                    together with Docuengaine.
                                </span>
                            </h2>

                            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                                Organize documentation, companies, assets and
                                operational knowledge in one connected workspace.
                            </p>

                        </div>


                        {/* CTA */}
                        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">

                            <a
                                href="/contact"
                                className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold transition duration-300 hover:border-white/40 hover:bg-white/5"
                            >
                                Book a demo

                                <ArrowUpRight
                                    size={16}
                                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                />
                            </a>

                            <a
                                href="/get-started"
                                className="inline-flex items-center justify-center rounded-full bg-violet-600 px-7 py-3.5 text-sm font-semibold transition duration-300 hover:bg-violet-500"
                            >
                                Get started
                            </a>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    MAIN FOOTER
                ================================================== */}
                <div className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.5fr_repeat(4,1fr)] lg:gap-10">

                    {/* =================================================
                        BRAND
                    ================================================== */}
                    <div className="max-w-sm">

                      <a
    href="/"
    className="group flex items-center gap-3 shrink-0"
>
    {/* Brand Icon */}
    <div
        className="
            flex h-10 w-10 items-center justify-center
            rounded-[11px]
            bg-gradient-to-br from-[#4da3ff] via-[#6674f4] to-[#7046f5]
            shadow-[0_8px_24px_rgba(112,70,245,0.25)]
            transition-all duration-300
            group-hover:scale-105
            group-hover:shadow-[0_10px_30px_rgba(112,70,245,0.4)]
        "
    >
        <span className="text-[21px] font-bold text-white leading-none">
            D
        </span>
    </div>

    {/* Brand Text */}
    <div className="flex flex-col leading-none">
        <span
            className="
                text-[23px]
                font-bold
                tracking-[-0.045em]
                text-white
            "
        >
            Docu<span className="text-[#22b7f4]">Engine</span>
        </span>

        <span
            className="
                mt-1
                text-[10px]
                font-medium
                tracking-[0.02em]
                text-[#7f9abc]
            "
        >
            IT Documentation Platform
        </span>
    </div>
</a>


                        <p className="mt-6 text-sm leading-7 text-white/50">
                            A connected workspace for managing documentation,
                            assets, companies, knowledge and the information
                            your team relies on every day.
                        </p>


                        {/* Social */}
                        <div className="mt-7 flex items-center gap-2">

                            <SocialButton icon={Globe2} href="#" />

                            <SocialButton icon={Code2} href="#" />

                            <SocialButton icon={Mail} href="/contact" />

                        </div>

                    </div>


                    {/* =================================================
                        PLATFORM
                    ================================================== */}
                    <FooterColumn
                        title="Platform"
                        links={[
                            ["Overview", "/platform"],
                            ["Documentation", "/documentation"],
                            ["Knowledge Base", "/knowledge-base"],
                            ["Asset Management", "/assets"],
                            ["Companies", "/companies"],
                        ]}
                    />


                    {/* =================================================
                        SOLUTIONS
                    ================================================== */}
                    <FooterColumn
                        title="Solutions"
                        links={[
                            ["IT Teams", "/solutions/it-teams"],
                            ["MSPs", "/solutions/msps"],
                            ["Operations", "/solutions/operations"],
                            ["Security", "/solutions/security"],
                            ["Enterprise", "/solutions/enterprise"],
                        ]}
                    />


                    {/* =================================================
                        RESOURCES
                    ================================================== */}
                    <FooterColumn
                        title="Resources"
                        links={[
                            ["Help Center", "/help"],
                            ["Documentation", "/docs"],
                            ["Guides", "/guides"],
                            ["Blog", "/blog"],
                            ["Contact", "/contact"],
                        ]}
                    />


                    {/* =================================================
                        COMPANY
                    ================================================== */}
                    <FooterColumn
                        title="Company"
                        links={[
                            ["About us", "/about"],
                            ["Pricing", "/pricing"],
                            ["Careers", "/careers"],
                            ["Security", "/security"],
                            ["Login", "/login"],
                        ]}
                    />

                </div>


                {/* =================================================
                    NEWSLETTER / PRODUCT STRIP
                ================================================== */}
                <div className="border-t border-white/10 py-8">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div>
                            <p className="text-sm font-semibold">
                                Stay in the loop
                            </p>

                            <p className="mt-1 text-xs text-white/40">
                                Get product updates and useful resources.
                            </p>
                        </div>


                        <div className="flex w-full max-w-md">

                            <div className="flex w-full items-center rounded-full border border-white/10 bg-white/5 p-1.5">

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/30"
                                />

                                <button className="shrink-0 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-[#0d0224] transition hover:bg-violet-100">
                                    Subscribe
                                </button>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    BOTTOM BAR
                ================================================== */}
                <div className="flex flex-col gap-5 border-t border-white/10 py-7 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">

                    <p>
                        © {new Date().getFullYear()} Docuengaine. All rights reserved.
                    </p>


                    <div className="flex flex-wrap items-center gap-5">

                        <a
                            href="/privacy"
                            className="transition hover:text-white/70"
                        >
                            Privacy Policy
                        </a>

                        <a
                            href="/terms"
                            className="transition hover:text-white/70"
                        >
                            Terms of Service
                        </a>

                        <a
                            href="/security"
                            className="transition hover:text-white/70"
                        >
                            Security
                        </a>

                    </div>

                </div>

            </div>
        </footer>
    );
}


/* =========================================================
   FOOTER COLUMN
========================================================= */

function FooterColumn({ title, links }) {
    return (
        <div>
            <h3 className="text-sm font-semibold text-white">
                {title}
            </h3>

            <ul className="mt-5 space-y-3.5">
                {links.map(([label, href]) => (
                    <li key={label}>
                        <a
                            href={href}
                            className="group inline-flex items-center gap-1 text-sm text-white/45 transition duration-200 hover:text-white"
                        >
                            {label}

                            <ArrowUpRight
                                size={12}
                                className="opacity-0 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                            />
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}


/* =========================================================
   SOCIAL BUTTON
========================================================= */

function SocialButton({ icon: Icon, href }) {
    return (
        <a
            href={href}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition duration-200 hover:border-violet-400/30 hover:bg-violet-600 hover:text-white"
        >
            <Icon size={15} />
        </a>
    );
}

export default Footer;