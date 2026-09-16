import {
    Activity,
    AlertTriangle,
    BookOpen,
    CheckCircle2,
    Clock3,
    FileText,
    Flag,
    Heart,
    KeyRound,
    Network,
    ShieldCheck,
    Star,
    Users,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../../api/axios";

const TenantWorkspaceDashboard = ({
    authData,
    user,
    tenant,
    currentTenant,
}) => {
    const navigate = useNavigate();

    const tenantId =
        currentTenant?.id ||
        tenant?.id ||
        null;

    const permissions =
        currentTenant?.access?.permissions || [];

    const [usersCount, setUsersCount] = useState(0);
    const [groupsCount, setGroupsCount] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) {
            return;
        }

        let cancelled = false;

        const loadWorkspace = async () => {
            setLoading(true);

            const requests = [];

            if (permissions.includes("users.view")) {
                requests.push(
                    api
                        .get(
                            `/tenants/${tenantId}/users`
                        )
                        .then((response) => {
                            const payload =
                                response.data?.data || {};

                            const rows =
                                Array.isArray(payload?.users)
                                    ? payload.users
                                    : Array.isArray(payload?.data)
                                        ? payload.data
                                        : Array.isArray(payload)
                                            ? payload
                                            : [];

                            return {
                                key: "users",
                                value:
                                    Number(
                                        payload?.total ||
                                            payload?.count ||
                                            rows.length
                                    ) || 0,
                            };
                        })
                        .catch(() => ({
                            key: "users",
                            value: 0,
                        }))
                );
            }

            if (
                permissions.includes(
                    "security_groups.view"
                )
            ) {
                requests.push(
                    api
                        .get(
                            `/tenants/${tenantId}/security-groups`
                        )
                        .then((response) => {
                            const payload =
                                response.data?.data || {};

                            const rows =
                                Array.isArray(
                                    payload?.security_groups
                                )
                                    ? payload.security_groups
                                    : Array.isArray(
                                          payload?.data
                                      )
                                        ? payload.data
                                        : [];

                            return {
                                key: "groups",
                                value:
                                    Number(
                                        payload?.count ||
                                            rows.length
                                    ) || 0,
                            };
                        })
                        .catch(() => ({
                            key: "groups",
                            value: 0,
                        }))
                );
            }

            if (
                permissions.includes(
                    "access_reviews.view"
                )
            ) {
                requests.push(
                    api
                        .get(
                            `/tenants/${tenantId}/access-reviews`,
                            {
                                params: {
                                    per_page: 25,
                                },
                            }
                        )
                        .then((response) => {
                            const payload =
                                response.data?.data || {};

                            const rows =
                                Array.isArray(payload?.data)
                                    ? payload.data
                                    : Array.isArray(payload)
                                        ? payload
                                        : [];

                            return {
                                key: "reviews",
                                value: rows,
                            };
                        })
                        .catch(() => ({
                            key: "reviews",
                            value: [],
                        }))
                );
            }

            if (
                permissions.includes(
                    "security.events.view"
                )
            ) {
                requests.push(
                    api
                        .get(
                            `/tenants/${tenantId}/security-events`,
                            {
                                params: {
                                    per_page: 8,
                                },
                            }
                        )
                        .then((response) => {
                            const payload =
                                response.data?.data || {};

                            const rows =
                                Array.isArray(payload?.data)
                                    ? payload.data
                                    : Array.isArray(payload)
                                        ? payload
                                        : [];

                            return {
                                key: "events",
                                value: rows,
                            };
                        })
                        .catch(() => ({
                            key: "events",
                            value: [],
                        }))
                );
            }

            try {
                const results =
                    await Promise.all(requests);

                if (cancelled) {
                    return;
                }

                results.forEach((result) => {
                    if (result.key === "users") {
                        setUsersCount(result.value);
                    }

                    if (result.key === "groups") {
                        setGroupsCount(result.value);
                    }

                    if (result.key === "reviews") {
                        setReviews(result.value);
                    }

                    if (result.key === "events") {
                        setEvents(result.value);
                    }
                });
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadWorkspace();

        return () => {
            cancelled = true;
        };
    }, [
        tenantId,
        permissions,
    ]);

    const inProgressReviews = useMemo(
        () =>
            reviews.filter(
                (review) =>
                    review.status === "in_progress"
            ),
        [reviews]
    );

    const completedReviews = useMemo(
        () =>
            reviews.filter(
                (review) =>
                    review.status === "completed"
            ).length,
        [reviews]
    );

    const recentItems = useMemo(() => {
        return events
            .slice(0, 4)
            .map((event) => ({
                id: event.id,
                title: formatEventType(
                    event.event_type
                ),
                subtitle:
                    event.description ||
                    event.category ||
                    "Security activity",
                icon: Activity,
            }));
    }, [events]);

    const tasks = useMemo(() => {
        const rows = [];

        inProgressReviews.forEach((review) => {
            rows.push({
                id: review.id,
                title: review.name,
                subtitle:
                    "Access review requires completion",
                route: "/admin/access-reviews",
            });
        });

        return rows.slice(0, 4);
    }, [inProgressReviews]);

    const mostVisited = [
        {
            title: "Users",
            subtitle: "Identity & Access",
            icon: Users,
            route: "/admin/users",
            permission: "users.view",
        },
        {
            title: "Access Reviews",
            subtitle: "Identity & Access",
            icon: ShieldCheck,
            route: "/admin/access-reviews",
            permission: "access_reviews.view",
        },
        {
            title: "Security Events",
            subtitle: "Security",
            icon: Activity,
            route: "/admin/security-events",
            permission: "security.events.view",
        },
        {
            title: "IP Access",
            subtitle: "Security",
            icon: Network,
            route: "/admin/ip-access",
            permission:
                "security.ip_allowlist.view",
        },
    ].filter((item) =>
        permissions.includes(item.permission)
    );

    const favoriteItems = mostVisited.slice(0, 3);

    const statItems = [
        {
            label: "Users",
            value: usersCount,
            icon: Users,
        },
        {
            label: "Security Groups",
            value: groupsCount,
            icon: ShieldCheck,
        },
        {
            label: "Access Reviews",
            value: reviews.length,
            icon: FileText,
        },
        {
            label: "Completed Reviews",
            value: completedReviews,
            icon: CheckCircle2,
        },
    ];

    return (
        <div className="space-y-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#19b5fe]" />

                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#19b5fe]">
                            Workspace
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-[#07111f] lg:text-3xl">
                        Welcome back,{" "}
                        {user?.name ||
                            "Administrator"}
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Your DocuEngine workspace for{" "}
                        <span className="font-semibold text-slate-700">
                            {tenant?.name ||
                                currentTenant?.name ||
                                "your organization"}
                        </span>
                        .
                    </p>
                </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
                <DashboardCard
                    title="My Favorites"
                    icon={Heart}
                >
                    {favoriteItems.length ? (
                        <WorkspaceList>
                            {favoriteItems.map(
                                (item) => (
                                    <WorkspaceItem
                                        key={item.title}
                                        {...item}
                                        onClick={() =>
                                            navigate(
                                                item.route
                                            )
                                        }
                                    />
                                )
                            )}
                        </WorkspaceList>
                    ) : (
                        <EmptyCard
                            icon={Heart}
                            title="No favorites yet"
                            description="Your saved DocuEngine items will appear here."
                        />
                    )}
                </DashboardCard>

                <DashboardCard
                    title="My Recents"
                    icon={Clock3}
                >
                    {recentItems.length ? (
                        <WorkspaceList>
                            {recentItems.map(
                                (item) => (
                                    <WorkspaceItem
                                        key={item.id}
                                        {...item}
                                        onClick={() =>
                                            navigate(
                                                "/admin/security-events"
                                            )
                                        }
                                    />
                                )
                            )}
                        </WorkspaceList>
                    ) : (
                        <EmptyCard
                            icon={Clock3}
                            title="No recent activity"
                            description="Recently accessed and updated items will appear here."
                        />
                    )}
                </DashboardCard>

                <DashboardCard
                    title="My Tasks"
                    icon={CheckCircle2}
                >
                    {tasks.length ? (
                        <WorkspaceList>
                            {tasks.map((task) => (
                                <WorkspaceItem
                                    key={task.id}
                                    title={task.title}
                                    subtitle={
                                        task.subtitle
                                    }
                                    icon={
                                        CheckCircle2
                                    }
                                    onClick={() =>
                                        navigate(
                                            task.route
                                        )
                                    }
                                />
                            ))}
                        </WorkspaceList>
                    ) : (
                        <EmptyCard
                            icon={CheckCircle2}
                            title="You're all caught up"
                            description="There are no open tasks requiring your attention."
                        />
                    )}
                </DashboardCard>

                <DashboardCard
                    title="Expiring Soon"
                    icon={AlertTriangle}
                >
                    <EmptyCard
                        icon={Clock3}
                        title="Nothing expiring soon"
                        description="Expiring passwords, assets and documentation will appear here when those modules are available."
                    />
                </DashboardCard>

                <DashboardCard
                    title="Recently Flagged"
                    icon={Flag}
                >
                    <EmptyCard
                        icon={Flag}
                        title="No flagged items"
                        description="Flagged documentation and review items will appear here."
                    />
                </DashboardCard>

                <DashboardCard
                    title="Activity Feed"
                    icon={Activity}
                    actionLabel="View all"
                    onAction={() =>
                        navigate(
                            "/admin/security-events"
                        )
                    }
                >
                    {events.length ? (
                        <div className="max-h-[270px] space-y-1 overflow-y-auto pr-1">
                            {events
                                .slice(0, 6)
                                .map((event) => (
                                    <ActivityItem
                                        key={event.id}
                                        event={event}
                                    />
                                ))}
                        </div>
                    ) : (
                        <EmptyCard
                            icon={Activity}
                            title="No activity yet"
                            description="Security and workspace activity will appear here."
                        />
                    )}
                </DashboardCard>

                <DashboardCard
                    title="Stats"
                    icon={Activity}
                >
                    <div className="grid grid-cols-2 gap-3">
                        {statItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.label}
                                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <Icon
                                            size={17}
                                            className="text-[#7046f5]"
                                        />

                                        <span className="text-2xl font-bold text-[#07111f]">
                                            {loading
                                                ? "..."
                                                : item.value}
                                        </span>
                                    </div>

                                    <p className="mt-3 text-xs font-medium text-slate-500">
                                        {item.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </DashboardCard>

                <DashboardCard
                    title="Documentation Quality"
                    icon={BookOpen}
                >
                    <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#19b5fe]/10 to-[#7046f5]/10">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white">
                                <BookOpen
                                    size={30}
                                    className="text-[#7046f5]"
                                />
                            </div>
                        </div>

                        <p className="mt-5 text-sm font-semibold text-slate-800">
                            Quality scoring coming soon
                        </p>

                        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                            Documentation quality metrics will become available when documentation modules are connected.
                        </p>
                    </div>
                </DashboardCard>

                <DashboardCard
                    title="My Most Visited"
                    icon={Star}
                >
                    {mostVisited.length ? (
                        <WorkspaceList>
                            {mostVisited.map(
                                (item) => (
                                    <WorkspaceItem
                                        key={item.title}
                                        {...item}
                                        onClick={() =>
                                            navigate(
                                                item.route
                                            )
                                        }
                                    />
                                )
                            )}
                        </WorkspaceList>
                    ) : (
                        <EmptyCard
                            icon={Star}
                            title="No visited items yet"
                            description="Frequently accessed workspace areas will appear here."
                        />
                    )}
                </DashboardCard>
            </div>
        </div>
    );
};

function DashboardCard({
    title,
    icon: Icon,
    children,
    actionLabel,
    onAction,
}) {
    return (
        <section className="flex min-h-[330px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#19b5fe]/10 to-[#7046f5]/10">
                        <Icon
                            size={17}
                            className="text-[#7046f5]"
                        />
                    </div>

                    <h2 className="text-sm font-bold text-slate-900">
                        {title}
                    </h2>
                </div>

                {actionLabel && (
                    <button
                        type="button"
                        onClick={onAction}
                        className="text-xs font-semibold text-[#19b5fe] transition hover:text-sky-600"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                {children}
            </div>
        </section>
    );
}

function WorkspaceList({
    children,
}) {
    return (
        <div className="space-y-2">
            {children}
        </div>
    );
}

function WorkspaceItem({
    title,
    subtitle,
    icon: Icon,
    onClick,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition hover:border-slate-100 hover:bg-slate-50"
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#19b5fe]/10">
                <Icon
                    size={18}
                    className="text-[#19b5fe]"
                />
            </div>

            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                    {title}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-500">
                    {subtitle}
                </p>
            </div>
        </button>
    );
}

function ActivityItem({
    event,
}) {
    const actor =
        event.actor?.name ||
        event.subject?.name ||
        "System";

    return (
        <div className="flex gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#7046f5]/10">
                <Activity
                    size={16}
                    className="text-[#7046f5]"
                />
            </div>

            <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800">
                    {actor}
                </p>

                <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500">
                    {event.description ||
                        formatEventType(
                            event.event_type
                        )}
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                    {formatDateTime(
                        event.occurred_at
                    )}
                </p>
            </div>
        </div>
    );
}

function EmptyCard({
    icon: Icon,
    title,
    description,
}) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                <Icon
                    size={24}
                    className="text-slate-300"
                />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700">
                {title}
            </p>

            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                {description}
            </p>
        </div>
    );
}

function formatEventType(
    value
) {
    if (!value) {
        return "Workspace activity";
    }

    return value
        .replaceAll("_", " ")
        .replaceAll(".", " ")
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );
}

function formatDateTime(
    value
) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString();
}

export default TenantWorkspaceDashboard;