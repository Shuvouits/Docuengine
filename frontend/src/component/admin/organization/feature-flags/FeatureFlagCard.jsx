import {
    ChevronDown,
    ChevronUp,
    Code2,
    Flag,
} from "lucide-react";

import { useState } from "react";

function FeatureFlagCard({
    flag,
    onChange,
}) {
    const [configOpen, setConfigOpen] =
        useState(false);

    const handleToggle = () => {
        onChange(flag.key, {
            enabled: !flag.enabled,
        });
    };

    const handleConfigChange = (
        event
    ) => {
        onChange(flag.key, {
            configText:
                event.target.value,
        });
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

            {/* =========================================================
                FEATURE HEADER
            ========================================================== */}

            <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">

                <div className="flex min-w-0 items-center gap-4">

                    {/* Icon */}

                    <div
                        className={`
                            flex h-11 w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl

                            ${
                                flag.enabled
                                    ? "bg-emerald-50"
                                    : "bg-slate-100"
                            }
                        `}
                    >
                        <Flag
                            size={19}
                            className={
                                flag.enabled
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                            }
                        />
                    </div>

                    {/* Feature Info */}

                    <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-sm font-bold text-slate-900">
                                {readableLabel(
                                    flag.key
                                )}
                            </h3>

                            <span
                                className={`
                                    rounded-full
                                    px-2.5 py-1
                                    text-[10px]
                                    font-semibold

                                    ${
                                        flag.enabled
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-slate-100 text-slate-500"
                                    }
                                `}
                            >
                                {flag.enabled
                                    ? "Enabled"
                                    : "Disabled"}
                            </span>

                        </div>

                        <p className="mt-1 font-mono text-[10px] text-slate-400">
                            {flag.key}
                        </p>

                    </div>

                </div>

                {/* =====================================================
                    TOGGLE
                ====================================================== */}

                <button
                    type="button"
                    onClick={
                        handleToggle
                    }
                    className={`
                        relative
                        h-7 w-12
                        shrink-0
                        rounded-full
                        transition-colors
                        duration-200

                        ${
                            flag.enabled
                                ? "bg-emerald-500"
                                : "bg-slate-300"
                        }
                    `}
                    aria-label={`Toggle ${readableLabel(
                        flag.key
                    )}`}
                >
                    <span
                        className={`
                            absolute
                            top-1
                            h-5 w-5
                            rounded-full
                            bg-white
                            shadow-sm
                            transition-all
                            duration-200

                            ${
                                flag.enabled
                                    ? "left-6"
                                    : "left-1"
                            }
                        `}
                    />
                </button>

            </div>

            {/* =========================================================
                CONFIGURATION BUTTON
            ========================================================== */}

            <div className="border-t border-slate-100">

                <button
                    type="button"
                    onClick={() =>
                        setConfigOpen(
                            (current) =>
                                !current
                        )
                    }
                    className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition hover:bg-slate-50"
                >

                    <div className="flex items-center gap-2">

                        <Code2
                            size={14}
                            className="text-slate-400"
                        />

                        <span className="text-xs font-semibold text-slate-600">
                            Feature Configuration
                        </span>

                    </div>

                    {configOpen ? (
                        <ChevronUp
                            size={15}
                            className="text-slate-400"
                        />
                    ) : (
                        <ChevronDown
                            size={15}
                            className="text-slate-400"
                        />
                    )}

                </button>

                {/* =====================================================
                    CONFIG EDITOR
                ====================================================== */}

                {configOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-5">

                        <label className="mb-2 block text-xs font-semibold text-slate-700">
                            Configuration JSON
                        </label>

                        <textarea
                            value={
                                flag.configText
                            }
                            onChange={
                                handleConfigChange
                            }
                            rows={7}
                            spellCheck={false}
                            className="w-full resize-y rounded-xl border border-slate-200 bg-white p-4 font-mono text-xs leading-6 text-slate-700 outline-none transition focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
                        />

                        <p className="mt-2 text-[11px] leading-5 text-slate-400">
                            Optional feature-specific
                            configuration stored as JSON.
                        </p>

                    </div>
                )}

            </div>

        </div>
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

export default FeatureFlagCard;