function TenantStatusBadge({ status }) {
    const styles = {
        Active: {
            wrapper:
                "bg-emerald-50 text-emerald-600 border-emerald-100",
            dot: "bg-emerald-500",
        },

        Onboarding: {
            wrapper:
                "bg-amber-50 text-amber-600 border-amber-100",
            dot: "bg-amber-500",
        },

        Suspended: {
            wrapper:
                "bg-red-50 text-red-600 border-red-100",
            dot: "bg-red-500",
        },
    };

    const style = styles[status] || styles.Active;

    return (
        <span
            className={`
                inline-flex items-center gap-2
                rounded-full border
                px-3 py-1
                text-xs font-medium
                ${style.wrapper}
            `}
        >
            <span
                className={`
                    h-1.5 w-1.5
                    rounded-full
                    ${style.dot}
                `}
            />

            {status}
        </span>
    );
}

export default TenantStatusBadge;