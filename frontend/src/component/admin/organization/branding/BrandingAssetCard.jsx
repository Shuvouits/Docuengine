import {
    Image,
    Upload,
    X,
} from "lucide-react";

function BrandingAssetCard({
    title,
    description,
    currentUrl,
    file,
    previewUrl,
    onChange,
    onClear,
    accept,
    inputId,
    compact = false,
}) {
    const imageUrl =
        previewUrl ||
        currentUrl ||
        null;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div>
                <h3 className="text-sm font-bold text-slate-900">
                    {title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                    {description}
                </p>
            </div>

            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">

                {/* Preview */}

                <div
                    className={`
                        flex shrink-0 items-center justify-center
                        overflow-hidden
                        border border-slate-200
                        bg-slate-50

                        ${
                            compact
                                ? "h-16 w-16 rounded-xl"
                                : "h-24 w-24 rounded-2xl"
                        }
                    `}
                >
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={`${title} preview`}
                            className="h-full w-full object-contain p-2"
                        />
                    ) : (
                        <Image
                            size={compact ? 22 : 28}
                            className="text-slate-400"
                        />
                    )}
                </div>

                {/* Upload */}

                <div className="flex-1">

                    <input
                        id={inputId}
                        type="file"
                        accept={accept}
                        onChange={onChange}
                        className="hidden"
                    />

                    <div className="flex flex-wrap gap-2">

                        <label
                            htmlFor={inputId}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[#19b5fe] hover:text-[#19b5fe]"
                        >
                            <Upload size={15} />

                            {file
                                ? "Choose another"
                                : "Choose file"}
                        </label>

                        {file && (
                            <button
                                type="button"
                                onClick={onClear}
                                className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                            >
                                <X size={14} />

                                Remove selection
                            </button>
                        )}

                    </div>

                    {file ? (
                        <p className="mt-3 break-all text-xs font-medium text-slate-600">
                            {file.name}
                        </p>
                    ) : (
                        <p className="mt-3 text-xs text-slate-400">
                            Current uploaded asset will remain unchanged.
                        </p>
                    )}

                </div>

            </div>

        </div>
    );
}

export default BrandingAssetCard;