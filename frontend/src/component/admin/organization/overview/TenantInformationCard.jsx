import { CalendarDays } from "lucide-react";

import SectionCard from "./SectionCard";
import InfoRow from "./InfoRow";

function TenantInformationCard({
    organization,
    user,
}) {
    return (
        <SectionCard
            title="Tenant Information"
            description="System-level organization details"
            icon={CalendarDays}
        >
            <InfoRow
                label="Tenant ID"
                value={organization?.id}
                allowWrap
            />

            <InfoRow
                label="Created"
                value={formatDate(
                    organization?.created_at
                )}
            />

            <InfoRow
                label="Last Updated"
                value={formatDate(
                    organization?.updated_at
                )}
            />

            <InfoRow
                label="Administrator"
                value={user?.email}
            />
        </SectionCard>
    );
}

function formatDate(value) {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}

export default TenantInformationCard;