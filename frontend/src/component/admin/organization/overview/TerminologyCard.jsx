import { Languages } from "lucide-react";

import SectionCard from "./SectionCard";
import InfoRow from "./InfoRow";

function TerminologyCard({
    terminology = {},
}) {
    return (
        <SectionCard
            title="Organization Terminology"
            description="Naming conventions used by this MSP"
            icon={Languages}
        >

            {Object.keys(terminology).length ? (

                Object.entries(
                    terminology
                ).map(
                    ([key, value]) => (
                        <InfoRow
                            key={key}
                            label={readableLabel(
                                key
                            )}
                            value={value}
                        />
                    )
                )

            ) : (

                <p className="py-5 text-sm text-slate-400">
                    No terminology configured.
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

export default TerminologyCard;