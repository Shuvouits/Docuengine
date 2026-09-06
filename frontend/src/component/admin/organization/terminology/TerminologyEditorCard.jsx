import {
    Languages,
    Type,
} from "lucide-react";

function TerminologyEditorCard({
    terminology = {},
    setTerminology,
}) {
    const entries =
        Object.entries(terminology);

    const updateTerm = (
        key,
        value
    ) => {
        setTerminology(
            (current) => ({
                ...current,
                [key]: value,
            })
        );
    };

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

            {/* Header */}

            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#19b5fe]/10">

                    <Languages
                        size={17}
                        className="text-[#19b5fe]"
                    />

                </div>

                <div>

                    <h2 className="text-sm font-bold text-slate-900">
                        Organization Terminology
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                        Customize the names used for common platform concepts.
                    </p>

                </div>

            </div>

            {/* Fields */}

            {entries.length ? (

                <div className="grid gap-5 p-6 md:grid-cols-2">

                    {entries.map(
                        ([key, value]) => (

                            <div
                                key={key}
                            >

                                <div className="mb-2 flex items-center justify-between gap-3">

                                    <div className="flex items-center gap-2">

                                        <Type
                                            size={13}
                                            className="text-slate-400"
                                        />

                                        <label className="text-xs font-semibold text-slate-700">
                                            {readableLabel(
                                                key
                                            )}
                                        </label>

                                    </div>

                                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[9px] text-slate-400">
                                        {key}
                                    </span>

                                </div>

                                <input
                                    type="text"
                                    value={
                                        value || ""
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateTerm(
                                            key,
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder={`Enter ${readableLabel(
                                        key
                                    )}`}
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
                                />

                                <p className="mt-2 text-[11px] leading-5 text-slate-400">
                                    Controls how this concept is named for your organization.
                                </p>

                            </div>

                        )
                    )}

                </div>

            ) : (

                <div className="p-10 text-center">

                    <Languages
                        size={26}
                        className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-500">
                        No terminology settings found.
                    </p>

                </div>

            )}

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

export default TerminologyEditorCard;