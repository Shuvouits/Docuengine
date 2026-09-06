import { Globe2 } from "lucide-react";

import SectionCard from "./SectionCard";
import InfoRow from "./InfoRow";

function RegionalSettingsCard({
    organization,
    settings,
}) {
    return (
        <SectionCard
            title="Regional Settings"
            description="Localization preferences"
            icon={Globe2}
        >
            <InfoRow
                label="Timezone"
                value={organization?.timezone}
            />

            <InfoRow
                label="Date Format"
                value={settings?.date_format}
            />

            <InfoRow
                label="Time Format"
                value={settings?.time_format}
            />

            <InfoRow
                label="Week Starts"
                value={capitalize(
                    settings?.week_start
                )}
            />

            <InfoRow
                label="Language"
                value={organization?.locale}
            />
        </SectionCard>
    );
}

function capitalize(value) {
    if (!value) {
        return "Not set";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}

export default RegionalSettingsCard;