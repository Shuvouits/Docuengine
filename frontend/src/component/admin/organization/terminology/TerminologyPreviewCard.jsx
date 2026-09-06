import {
    ArrowRight,
    Languages,
} from "lucide-react";

function TerminologyPreviewCard({
    terminology = {},
}) {
    const entries =
        Object.entries(terminology);

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

            {/* Header */}

            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7046f5]/10">

                    <Languages
                        size={17}
                        className="text-[#7046f5]"
                    />

                </div>

                <div>

                    <h2 className="text-sm font-bold text-slate-900">
                        Terminology Preview
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                        Preview how organization-specific names will appear.
                    </p>

                </div>

            </div>

            {/* Preview */}

            <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">

                {entries.map(
                    ([key, value]) => (

                        <div
                            key={key}
                            className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                        >

                            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                System Concept
                            </p>

                            <div className="mt-3 flex items-center gap-3">

                                <span className="text-xs font-medium text-slate-500">
                                    {readableLabel(
                                        key
                                    )}
                                </span>

                                <ArrowRight
                                    size={13}
                                    className="text-slate-300"
                                />

                                <span className="text-sm font-bold text-[#07111f]">
                                    {value ||
                                        "Not set"}
                                </span>

                            </div>

                        </div>

                    )
                )}

            </div>

        </section>
    );
}

function readableLabel(value) {
    return String(value || "")
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase()
        );
}

export default TerminologyPreviewCard;