import { Flag } from "lucide-react";

import SectionCard from "./SectionCard";

function FeatureFlagsCard({
    featureFlags = [],
}) {
    return (
        <SectionCard
            title="Feature Flags"
            description="Features configured for this organization"
            icon={Flag}
        >

            {featureFlags.length ? (

                featureFlags.map(
                    (feature) => (
                        <div
                            key={feature.key}
                            className="flex items-center justify-between gap-4 border-b border-slate-100 py-3.5 last:border-0"
                        >

                            <div>

                                <p className="text-sm font-medium text-slate-700">
                                    {readableLabel(
                                        feature.key
                                    )}
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    {feature.key}
                                </p>

                            </div>

                            <span
                                className={`
                                    rounded-full px-2.5 py-1
                                    text-[10px] font-semibold

                                    ${
                                        feature.enabled
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-slate-100 text-slate-500"
                                    }
                                `}
                            >
                                {feature.enabled
                                    ? "Enabled"
                                    : "Disabled"}
                            </span>

                        </div>
                    )
                )

            ) : (

                <p className="py-5 text-sm text-slate-400">
                    No feature flags configured.
                </p>

            )}

        </SectionCard>
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

export default FeatureFlagsCard;