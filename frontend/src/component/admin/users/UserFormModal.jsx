import {
    ChevronDown,
    LoaderCircle,
    UserRound,
    X,
} from "lucide-react";

import {
    useState,
} from "react";

const UserFormModal = ({
    title,
    description,
    roles,
    user = null,
    loading,
    onClose,
    onSubmit,
}) => {
    const isEditing =
        Boolean(user);

    const [form, setForm] =
        useState({
            name:
                user?.user?.name ||
                "",

            email:
                user?.user?.email ||
                "",

            role:
                user?.user
                    ?.roles?.[0] ||
                roles[0] ||
                "",

            password: "",

            password_confirmation:
                "",
        });

    const [
        formError,
        setFormError,
    ] = useState("");

    const handleChange = (
        field,
        value
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setFormError("");
    };

    const submit = async (
        e
    ) => {
        e.preventDefault();

        setFormError("");

        if (!form.name.trim()) {
            setFormError(
                "User name is required."
            );
            return;
        }

        if (!form.email.trim()) {
            setFormError(
                "Email address is required."
            );
            return;
        }

        if (!form.role) {
            setFormError(
                "Select a tenant role."
            );
            return;
        }

        if (!isEditing) {
            if (
                form.password.length <
                8
            ) {
                setFormError(
                    "Password must contain at least 8 characters."
                );
                return;
            }

            if (
                form.password !==
                form.password_confirmation
            ) {
                setFormError(
                    "Password confirmation does not match."
                );
                return;
            }
        }

        const result =
            await onSubmit({
                ...form,

                name:
                    form.name.trim(),

                email:
                    form.email
                        .trim()
                        .toLowerCase(),
            });

        if (
            result?.ok === false
        ) {
            setFormError(
                result.message ||
                    "Unable to save user."
            );
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 py-4 backdrop-blur-[2px]">
            <div className="relative flex max-h-[calc(100vh-32px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                    <X size={18} />
                </button>

                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="shrink-0 border-b border-slate-100 px-6 py-5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#19b5fe]/10 text-[#19b5fe]">
                            <UserRound
                                size={20}
                            />
                        </div>

                        <h2 className="mt-4 text-lg font-bold text-[#07111f]">
                            {title}
                        </h2>

                        <p className="mt-1 pr-8 text-sm leading-6 text-slate-500">
                            {description}
                        </p>
                    </div>

                    <div
                        className="
                            min-h-0
                            flex-1
                            space-y-5
                            overflow-y-auto
                            overscroll-contain
                            p-6
                            pr-4
                            [scrollbar-width:thin]
                            [scrollbar-color:#cbd5e1_transparent]
                        "
                    >
                        {formError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                {formError}
                            </div>
                        )}

                        <FormField
                            label="Full Name"
                            value={
                                form.name
                            }
                            placeholder="Enter full name"
                            onChange={(
                                value
                            ) =>
                                handleChange(
                                    "name",
                                    value
                                )
                            }
                        />

                        <FormField
                            label="Email Address"
                            type="email"
                            value={
                                form.email
                            }
                            placeholder="name@company.com"
                            onChange={(
                                value
                            ) =>
                                handleChange(
                                    "email",
                                    value
                                )
                            }
                        />

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Role
                            </label>

                            <div className="relative">
                                <select
                                    value={
                                        form.role
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        handleChange(
                                            "role",
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none transition focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
                                >
                                    <option value="">
                                        Select role
                                    </option>

                                    {roles.map(
                                        (
                                            role
                                        ) => (
                                            <option
                                                key={
                                                    role
                                                }
                                                value={
                                                    role
                                                }
                                            >
                                                {
                                                    role
                                                }
                                            </option>
                                        )
                                    )}
                                </select>

                                <ChevronDown
                                    size={16}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                            </div>
                        </div>

                        {!isEditing && (
                            <>
                                <FormField
                                    label="Password"
                                    type="password"
                                    value={
                                        form.password
                                    }
                                    placeholder="Minimum 8 characters"
                                    onChange={(
                                        value
                                    ) =>
                                        handleChange(
                                            "password",
                                            value
                                        )
                                    }
                                />

                                <FormField
                                    label="Confirm Password"
                                    type="password"
                                    value={
                                        form.password_confirmation
                                    }
                                    placeholder="Repeat password"
                                    onChange={(
                                        value
                                    ) =>
                                        handleChange(
                                            "password_confirmation",
                                            value
                                        )
                                    }
                                />
                            </>
                        )}

                        <div className="h-2" />
                    </div>

                    <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            disabled={
                                loading
                            }
                            className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                loading
                            }
                            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#19b5fe] text-sm font-semibold text-white transition hover:bg-[#159edb] disabled:opacity-60"
                        >
                            {loading && (
                                <LoaderCircle
                                    size={
                                        16
                                    }
                                    className="animate-spin"
                                />
                            )}

                            {isEditing
                                ? "Save Changes"
                                : "Create User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const FormField = ({
    label,
    value,
    onChange,
    type = "text",
    placeholder = "",
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={(e) =>
                    onChange(
                        e.target.value
                    )
                }
                placeholder={
                    placeholder
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#19b5fe] focus:ring-4 focus:ring-[#19b5fe]/10"
            />
        </div>
    );
};

export default UserFormModal;