import { Feather } from "lucide-react";

function GlobalLoader() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07111f]">

            {/* Background glow */}

            <div className="absolute inset-0 overflow-hidden">

                <div
                    className="
                        absolute
                        left-1/2
                        top-1/2
                        h-[420px]
                        w-[420px]
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        bg-[#7046f5]/10
                        blur-[100px]
                    "
                />

                <div
                    className="
                        absolute
                        left-[20%]
                        top-[20%]
                        h-[200px]
                        w-[200px]
                        rounded-full
                        bg-[#19b5fe]/10
                        blur-[80px]
                    "
                />

            </div>


            {/* Loader */}

            <div className="relative flex flex-col items-center">

                {/* Logo */}

                <div
                    className="
                        relative
                        mb-6
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-2xl
                        bg-gradient-to-br
                        from-[#19b5fe]
                        to-[#7c3aed]
                        shadow-[0_0_45px_rgba(25,181,254,0.25)]
                    "
                >

                    <Feather
                        size={34}
                        strokeWidth={2}
                        className="rotate-[-18deg] text-white"
                    />

                    {/* Pulse */}

                    <span
                        className="
                            absolute
                            inset-0
                            animate-ping
                            rounded-2xl
                            bg-[#19b5fe]/20
                        "
                    />

                </div>


                {/* Brand */}

                <h1 className="text-xl font-bold tracking-tight text-white">
                    Docu<span className="text-[#19b5fe]">Engine</span>
                </h1>


                <p className="mt-2 text-sm text-slate-400">
                    Preparing your workspace...
                </p>


                {/* Loading line */}

                <div className="mt-6 h-1 w-32 overflow-hidden rounded-full bg-white/10">

                    <div
                        className="
                            h-full
                            w-1/2
                            animate-[loader_1.2s_ease-in-out_infinite]
                            rounded-full
                            bg-gradient-to-r
                            from-[#19b5fe]
                            to-[#7c3aed]
                        "
                    />

                </div>

            </div>

        </div>
    );
}

export default GlobalLoader;