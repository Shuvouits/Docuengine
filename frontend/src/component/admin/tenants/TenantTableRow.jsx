import {
    MoreHorizontal,
    Users,
    FileText,
    Eye,
    Pencil,
    Ban,
    CheckCircle,
    Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import TenantStatusBadge from "./TenantStatusBadge";
import TenantSetupProgress from "./TenantSetupProgress";

function TenantTableRow({ tenant }) {
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({
        top: 0,
        left: 0,
    });

    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    /*
    |--------------------------------------------------------------------------
    | Safe tenant values
    |--------------------------------------------------------------------------
    */

    const tenantName = tenant?.name || "Unnamed Organization";

    const initials =
        tenant?.initials ||
        tenantName
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();

    const adminName = tenant?.admin?.name || "Not assigned";
    const adminEmail = tenant?.admin?.email || "Not assigned";

    const users = tenant?.users ?? "—";
    const documents = tenant?.documents ?? "—";
    const plan = tenant?.plan || "—";
    const status = tenant?.status || "active";
    const setupProgress = tenant?.setupProgress ?? 0;

    /*
    |--------------------------------------------------------------------------
    | Dropdown position
    |--------------------------------------------------------------------------
    */

    const updateMenuPosition = () => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();

        const menuWidth = 190;
        const menuHeight = 220;
        const spacing = 8;

        let left = rect.right - menuWidth;
        let top = rect.bottom + spacing;

        /*
        | Keep dropdown inside viewport horizontally
        */

        if (left < 8) {
            left = 8;
        }

        if (left + menuWidth > window.innerWidth - 8) {
            left = window.innerWidth - menuWidth - 8;
        }

        /*
        | If there isn't enough room below,
        | open above the button.
        */

        if (top + menuHeight > window.innerHeight - 8) {
            top = rect.top - menuHeight - spacing;
        }

        /*
        | Final safety
        */

        if (top < 8) {
            top = 8;
        }

        setMenuPosition({
            top,
            left,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Open dropdown
    |--------------------------------------------------------------------------
    */

    const handleToggleMenu = () => {
        if (!isOpen) {
            updateMenuPosition();
        }

        setIsOpen((prev) => !prev);
    };

    /*
    |--------------------------------------------------------------------------
    | Close on outside click
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (event) => {
            if (
                buttonRef.current &&
                !buttonRef.current.contains(event.target) &&
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    /*
    |--------------------------------------------------------------------------
    | Reposition on scroll / resize
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!isOpen) return;

        const handleReposition = () => {
            updateMenuPosition();
        };

        window.addEventListener("resize", handleReposition);
        window.addEventListener("scroll", handleReposition, true);

        return () => {
            window.removeEventListener("resize", handleReposition);
            window.removeEventListener("scroll", handleReposition, true);
        };
    }, [isOpen]);

    /*
    |--------------------------------------------------------------------------
    | Actions
    |--------------------------------------------------------------------------
    */

    const handleView = () => {
        setIsOpen(false);

        navigate(`/admin/tenants/${tenant.id}`);
    };

    const handleEdit = () => {
        setIsOpen(false);

        navigate(`/admin/tenants/${tenant.id}/edit`);
    };

    const handleStatusChange = () => {
        setIsOpen(false);

        // API integration can be added here later.
        console.log(
            status === "active"
                ? "Suspend tenant:"
                : "Activate tenant:",
            tenant.id
        );
    };

    const handleDelete = () => {
        setIsOpen(false);

        // API integration can be added here later.
        console.log("Delete tenant:", tenant.id);
    };

    /*
    |--------------------------------------------------------------------------
    | Dropdown
    |--------------------------------------------------------------------------
    */

    const dropdownMenu = isOpen
        ? createPortal(
              <div
                  ref={menuRef}
                  style={{
                      position: "fixed",
                      top: `${menuPosition.top}px`,
                      left: `${menuPosition.left}px`,
                      width: "190px",
                  }}
                  className="z-[9999] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.16)] ring-1 ring-black/5"
              >
                  <div className="border-b border-slate-100 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                          Tenant actions
                      </p>
                  </div>

                  <div className="p-1.5">
                      {/* View */}
                      <button
                          type="button"
                          onClick={handleView}
                          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                          <Eye
                              size={16}
                              strokeWidth={1.8}
                              className="text-slate-400"
                          />

                          <span>View details</span>
                      </button>

                      {/* Edit */}
                      <button
                          type="button"
                          onClick={handleEdit}
                          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                          <Pencil
                              size={16}
                              strokeWidth={1.8}
                              className="text-slate-400"
                          />

                          <span>Edit tenant</span>
                      </button>

                      {/* Status */}
                      <button
                          type="button"
                          onClick={handleStatusChange}
                          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                          {status === "active" ? (
                              <Ban
                                  size={16}
                                  strokeWidth={1.8}
                                  className="text-slate-400"
                              />
                          ) : (
                              <CheckCircle
                                  size={16}
                                  strokeWidth={1.8}
                                  className="text-slate-400"
                              />
                          )}

                          <span>
                              {status === "active"
                                  ? "Suspend tenant"
                                  : "Activate tenant"}
                          </span>
                      </button>
                  </div>

                  {/* Delete */}
                  <div className="border-t border-slate-100 p-1.5">
                      <button
                          type="button"
                          onClick={handleDelete}
                          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                          <Trash2
                              size={16}
                              strokeWidth={1.8}
                          />

                          <span>Delete tenant</span>
                      </button>
                  </div>
              </div>,
              document.body
          )
        : null;

    return (
        <>
            <tr className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/70">
                {/* Organization */}
                <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#19b5fe]/15 to-[#7c3aed]/15 text-sm font-bold text-[#635bff]">
                            {initials}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                                {tenantName}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                                ID: TEN-
                                {tenant?.id
                                    ? String(tenant.id).substring(0, 8)
                                    : "0000"}
                            </p>
                        </div>
                    </div>
                </td>

                {/* Administrator */}
                <td className="px-6 py-5">
                    <div>
                        <p className="text-sm font-medium text-slate-800">
                            {adminName}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                            {adminEmail}
                        </p>
                    </div>
                </td>

                {/* Users */}
                <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users
                            size={15}
                            strokeWidth={1.8}
                            className="text-slate-400"
                        />

                        {users}
                    </div>
                </td>

                {/* Documents */}
                <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FileText
                            size={15}
                            strokeWidth={1.8}
                            className="text-slate-400"
                        />

                        {documents}
                    </div>
                </td>

                {/* Plan */}
                <td className="px-6 py-5">
                    <span className="text-sm text-slate-600">
                        {plan}
                    </span>
                </td>

                {/* Status */}
                <td className="px-6 py-5">
                    <TenantStatusBadge status={status} />
                </td>

                {/* Setup */}
                <td className="px-6 py-5">
                    <TenantSetupProgress progress={setupProgress} />
                </td>

                {/* Actions */}
                <td className="px-6 py-5 text-right">
                    <button
                        ref={buttonRef}
                        type="button"
                        onClick={handleToggleMenu}
                        aria-label="Tenant actions"
                        aria-expanded={isOpen}
                        className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition ${
                            isOpen
                                ? "border-slate-300 bg-slate-100 text-slate-700"
                                : "border-transparent text-slate-400 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700"
                        }`}
                    >
                        <MoreHorizontal size={18} />
                    </button>
                </td>
            </tr>

            {dropdownMenu}
        </>
    );
}

export default TenantTableRow;