import React from "react";

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    open,
    title = "Xác nhận",
    message,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-opacity-20 flex justify-center items-center z-50 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
            onClick={onCancel}
        >
            <div
                className="bg-white rounded p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()} // ngăn không cho click ngoài đóng dialog
            >
                <h3 className="text-xl font-semibold mb-4 text-black">{title}</h3>
                <p className="mb-6 text-black">{message}</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
}
