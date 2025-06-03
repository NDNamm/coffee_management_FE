import React from "react";
import { Dialog } from "@headlessui/react";

interface Props {
    open: boolean;
    onClose: () => void;
    items: OrderDetail[];
}

export default function OrderHistoryDialog({ open, onClose, items }: Props) {
    return (
        <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4 bg-opacity-100">
                <Dialog.Panel className="bg-white rounded-lg max-w-xl w-full p-6 shadow-xl">
                    <Dialog.Title className="text-lg font-bold mb-4">Chi tiết đơn hàng</Dialog.Title>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2">#</th>
                                    <th className="p-2">Sản phẩm</th>
                                    <th className="p-2">Image</th>
                                    <th className="p-2">Số lượng</th>
                                    <th className="p-2">Giá</th>
                                    <th className="p-2">Tổng tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="p-2">{index + 1}</td>
                                        <td className="p-2">{item.productName}</td>
                                        <td className="p-2">
                                            <img src={item.urlProductImage}
                                            className="w-15 rounded"/>
                                        </td>
                                        <td className="p-2">{item.quantity}</td>
                                        <td className="p-2">{item.price.toLocaleString()}₫</td>
                                        <td className="p-2">{item.totalPrice.toLocaleString()}₫</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                        >
                            Đóng
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}