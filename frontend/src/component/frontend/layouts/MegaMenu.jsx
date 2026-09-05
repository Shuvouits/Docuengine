import {
    BookOpen,
    Server,
    ShieldCheck,
    KeyRound,
    FileText,
    Network,
    Users,
    Building2,
    UserRound,
    BriefcaseBusiness,
    Headphones,
    MessageCircle,
    BookMarked,
    ArrowUpRight,
} from "lucide-react";

import { Link } from "react-router-dom";

function MegaMenu({ type }) {

    if (type === "platform") {
        return (
            <div className="absolute left-0 right-0 top-[82px] px-4 xl:px-8">

                <div className="mx-auto max-w-[1180px] overflow-hidden rounded-2xl bg-white text-[#171329] shadow-2xl ring-1 ring-black/5">

                    <div className="grid grid-cols-3 gap-10 p-8">

                        {/* Products */}
                        <div>

                            <MenuHeading>
                                PRODUCTS
                            </MenuHeading>

                            <div className="space-y-6">

                                <MegaItem
                                    icon={<BookOpen />}
                                    title="Documentation"
                                    description="Centralize your company knowledge."
                                />

                                <MegaItem
                                    icon={<Server />}
                                    title="Asset Management"
                                    description="Track devices, infrastructure and assets."
                                />

                                <MegaItem
                                    icon={<KeyRound />}
                                    title="Password Management"
                                    description="Securely manage credentials and access."
                                />

                                <MegaItem
                                    icon={<FileText />}
                                    title="Knowledge Base"
                                    description="Build structured internal documentation."
                                />

                            </div>

                        </div>


                        {/* Features */}
                        <div>

                            <MenuHeading>
                                FEATURES
                            </MenuHeading>

                            <div className="space-y-6">

                                <MegaItem
                                    icon={<Network />}
                                    title="Network Management"
                                    description="Keep your infrastructure organized."
                                />

                                <MegaItem
                                    icon={<ShieldCheck />}
                                    title="Security"
                                    description="Protect sensitive documentation."
                                />

                                <MegaItem
                                    icon={<Users />}
                                    title="Team Collaboration"
                                    description="Work together from one platform."
                                />

                                <MegaItem
                                    icon={<FileText />}
                                    title="Documents"
                                    description="Store and organize important files."
                                />

                            </div>

                        </div>


                        {/* Featured */}
                        <div>

                            <MenuHeading>
                                EXPLORE DOCUENGAINE
                            </MenuHeading>

                            <div className="rounded-2xl bg-gradient-to-br from-[#f0eaff] via-[#f8f5ff] to-white p-6">

                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#7046f5] text-white">
                                    <BookMarked size={22} />
                                </div>

                                <h3 className="text-xl font-bold">
                                    Everything documented.
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-gray-500">
                                    Keep your knowledge, assets,
                                    passwords and business information
                                    connected in one secure platform.
                                </p>

                                <Link
                                    to="/platform"
                                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7046f5]"
                                >
                                    Explore platform
                                    <ArrowUpRight size={16} />
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        );
    }


    if (type === "solutions") {
        return (
            <div className="absolute left-0 right-0 top-[82px] px-4 xl:px-8">

                <div className="mx-auto max-w-[1180px] rounded-2xl bg-white text-[#171329] shadow-2xl ring-1 ring-black/5">

                    <div className="grid grid-cols-3 gap-10 p-8">

                        {/* For Organizations */}
                        <div>

                            <MenuHeading>
                                FOR ORGANIZATIONS
                            </MenuHeading>

                            <div className="space-y-6">

                                <MegaItem
                                    icon={<Building2 />}
                                    title="Companies"
                                    description="Centralize organizational knowledge."
                                />

                                <MegaItem
                                    icon={<BriefcaseBusiness />}
                                    title="IT Teams"
                                    description="Give your team one source of truth."
                                />

                                <MegaItem
                                    icon={<Server />}
                                    title="MSPs"
                                    description="Manage documentation across clients."
                                />

                            </div>

                        </div>


                        {/* For Users */}
                        <div>

                            <MenuHeading>
                                FOR USERS
                            </MenuHeading>

                            <div className="space-y-6">

                                <MegaItem
                                    icon={<UserRound />}
                                    title="Administrators"
                                    description="Control users, roles and permissions."
                                />

                                <MegaItem
                                    icon={<Users />}
                                    title="Technicians"
                                    description="Access information when you need it."
                                />

                                <MegaItem
                                    icon={<Headphones />}
                                    title="Support Teams"
                                    description="Improve support and onboarding."
                                />

                            </div>

                        </div>


                        {/* CTA */}
                        <div>

                            <MenuHeading>
                                GET STARTED
                            </MenuHeading>

                            <div className="rounded-2xl bg-[#0d0224] p-7 text-white">

                                <h3 className="text-xl font-semibold">
                                    Build your knowledge hub
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-white/60">
                                    Bring your documentation,
                                    people and infrastructure together.
                                </p>

                                <Link
                                    to="/get-started"
                                    className="mt-6 inline-flex rounded-full bg-[#7046f5] px-5 py-3 text-sm font-semibold"
                                >
                                    Get started
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        );
    }


    if (type === "resources") {
        return (
            <div className="absolute left-0 right-0 top-[82px] px-4 xl:px-8">

                <div className="mx-auto max-w-[1180px] rounded-2xl bg-white text-[#171329] shadow-2xl ring-1 ring-black/5">

                    <div className="grid grid-cols-3 gap-10 p-8">

                        <div>

                            <MenuHeading>
                                RESOURCES
                            </MenuHeading>

                            <div className="space-y-6">

                                <MegaItem
                                    icon={<BookOpen />}
                                    title="Documentation"
                                    description="Learn how Docuengaine works."
                                />

                                <MegaItem
                                    icon={<MessageCircle />}
                                    title="Blog"
                                    description="Product news and useful insights."
                                />

                                <MegaItem
                                    icon={<BookMarked />}
                                    title="Guides"
                                    description="Practical guides and tutorials."
                                />

                            </div>

                        </div>


                        <div>

                            <MenuHeading>
                                HELP CENTER
                            </MenuHeading>

                            <div className="space-y-6">

                                <MegaItem
                                    icon={<Headphones />}
                                    title="Support Center"
                                    description="Get help from our support team."
                                />

                                <MegaItem
                                    icon={<MessageCircle />}
                                    title="Community"
                                    description="Connect with other users."
                                />

                                <MegaItem
                                    icon={<FileText />}
                                    title="API Documentation"
                                    description="Build with the Docuengaine API."
                                />

                            </div>

                        </div>


                        <div>

                            <MenuHeading>
                                DISCOVER
                            </MenuHeading>

                            <div className="rounded-2xl border border-gray-200 p-6">

                                <h3 className="text-xl font-bold">
                                    Learn more
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-gray-500">
                                    Explore documentation,
                                    guides and resources.
                                </p>

                                <Link
                                    to="/resources"
                                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7046f5]"
                                >
                                    View resources
                                    <ArrowUpRight size={16} />
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        );
    }

    return null;
}


function MenuHeading({ children }) {
    return (
        <h4 className="mb-5 border-b border-gray-200 pb-3 text-[11px] font-bold tracking-[0.16em] text-gray-500">
            {children}
        </h4>
    );
}


function MegaItem({
    icon,
    title,
    description,
}) {
    return (
        <Link
            to="#"
            className="group flex gap-3"
        >

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition group-hover:border-[#7046f5] group-hover:bg-[#f3efff] group-hover:text-[#7046f5]">
                {icon}
            </div>

            <div>

                <div className="text-[14px] font-semibold transition group-hover:text-[#7046f5]">
                    {title}
                </div>

                <p className="mt-1 text-[12px] leading-5 text-gray-500">
                    {description}
                </p>

            </div>

        </Link>
    );
}

export default MegaMenu;