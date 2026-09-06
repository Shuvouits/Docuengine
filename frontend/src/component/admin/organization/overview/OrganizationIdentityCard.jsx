import { Building2 } from "lucide-react";

import SectionCard from "./SectionCard";
import InfoRow from "./InfoRow";

function OrganizationIdentityCard({
    organization,
    branding,
}) {
    return (
        <SectionCard
            title="Organization Identity"
            description="Core tenant information"
            icon={Building2}
        >
            <InfoRow
                label="Organization Name"
                value={organization?.name}
            />

            <InfoRow
                label="Display Name"
                value={branding?.display_name}
            />

            <InfoRow
                label="Slug"
                value={organization?.slug}
            />

            <InfoRow
                label="Status"
                value={capitalize(
                    organization?.status
                )}
            />

            <InfoRow
                label="Locale"
                value={organization?.locale}
            />
        </SectionCard>
    );
}

function capitalize(value) {
    if (!value) {
        return "Unknown";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}

export default OrganizationIdentityCard;