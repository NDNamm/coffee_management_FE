import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import axiosInstance from "../config/axiosInstance";

interface OrderModalProps {
    open: boolean;
    onClose: () => void;
    onAddOrUpdate: () => void;
    initialOrder?: Order | null;
}

const STATUS_OPTIONS = [
    { value: "PENDING", label: "Chờ xác nhận" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "IN_PREPARATION", label: "Đang pha chế" },
    { value: "SERVED", label: "Đã phục vụ" },
    { value: "COMPLETED", label: "Hoàn tất" },
    { value: "CANCELED", label: "Đã hủy" },
];

export default function OrderModal({
    open,
    onClose,
    onAddOrUpdate,
    initialOrder,
}: OrderModalProps) {
    const [status, setStatus] = useState("");
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (initialOrder) {
            setStatus(initialOrder.status || "");
        } else {
            setStatus("");
        }
    }, [initialOrder, open]);

    const handleSubmit = async () => {
        if (!status.trim()) {
            alert("Vui lòng chọn trạng thái đơn hàng.");
            return;
        }

        console.log("Loi " + initialOrder);
        if (!initialOrder?.id) {
            alert("Đơn hàng không hợp lệ.");
            return;
        }

        const orderDTO = {
            status,
        };

        const userId = initialOrder.user?.id || 0;
        const sessionId = initialOrder.sessionId || "";

        try {

            await axiosInstance.put(`/order/update/${initialOrder.id}`, orderDTO);

            setSuccessMessage("Cập nhật đơn hàng thành công!");
            setTimeout(() => {
                onAddOrUpdate();
                onClose();
                setSuccessMessage(null);
            }, 1000);
        } catch (error: any) {
            console.error("Lỗi khi cập nhật đơn hàng:", error);
            alert(error.response?.data || "Lỗi không xác định");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
            <div className="bg-white rounded-xl p-6 z-50 shadow-xl w-[400px] max-h-[90vh] overflow-y-auto">
                {successMessage && (
                    <div className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4 text-center">
                        {successMessage}
                    </div>
                )}

                <Dialog.Title className="text-lg font-semibold mb-4">Cập nhật Đơn Hàng</Dialog.Title>

                <select
                    className="w-full border px-3 py-2 mb-3 rounded"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">-- Chọn trạng thái --</option>
                    {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-500 px-4 py-2 text-white rounded hover:bg-blue-600"
                    >
                        Cập nhật
                    </button>
                </div>
            </div>
        </Dialog>
    );
}