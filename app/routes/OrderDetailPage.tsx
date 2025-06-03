import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosInstance";
import Header from "~/components/Header";

export default function OrderDetailPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [orderDetail, setOrderDetail] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrderDetail = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get(`/orderDetail/${orderId}`);
                setOrderDetail(res.data.content);
                console.log("detail : " + res.data.content);
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId]);

    if (loading) return <p>Đang tải chi tiết đơn hàng...</p>;
    if (!orderDetail) return <p>Không tìm thấy đơn hàng</p>;

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <div className="container mx-auto p-8">
                <h2 className="text-3xl font-bold text-[#8B5E3C] mb-6">Chi tiết đơn hàng #{orderDetail.id}</h2>
                <p>Ngày đặt: {new Date(orderDetail.orderDate).toLocaleString()}</p>
                <p>Trạng thái: {orderDetail.status}</p>
                <p>Phương thức thanh toán: {orderDetail.paymentMethod}</p>
                <p>Tổng tiền: {orderDetail.totalAmount.toLocaleString()}đ</p>

                <h3 className="text-xl font-semibold mt-6 mb-4">Sản phẩm trong đơn</h3>
                <div className="space-y-4">
                    {orderDetail.orderDetailDTO && orderDetail.orderDetailDTO.length > 0 ? (
                        orderDetail.orderDetailDTO.map((item: any) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 border rounded p-4 shadow-sm"
                            >
                                <img
                                    src={item.urlProductImage || "/default.png"}
                                    alt={item.productName}
                                    className="w-20 h-20 object-cover rounded"
                                />
                                <div className="flex-grow">
                                    <p className="font-semibold">{item.productName}</p>
                                    <p>Số lượng: {item.quantity}</p>
                                    <p>Đơn giá: {item.price.toLocaleString()}đ</p>
                                    <p>Tổng: {item.totalPrice.toLocaleString()}đ</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Đơn hàng không có sản phẩm nào.</p>
                    )}
                </div>

                <button
                    className="mt-8 px-6 py-3 bg-[#8B5E3C] text-white rounded hover:bg-[#6d4b2f]"
                    onClick={() => navigate(-1)}
                >
                    Quay lại
                </button>
            </div>
        </div>
    );
}
