import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosInstance";
import Header from "~/components/Header";
import { getUserIdFromToken } from "~/utils/authUtils";

export default function OrderPage() {
    const { state } = useLocation();
    const { cartItems, userId } = state || {};
    const navigate = useNavigate();

    const [takeAway, setTakeAway] = useState(false);
    const [tableId, setTableId] = useState<number | null>(null);
    const [availableTables, setAvailableTables] = useState<{ id: number; name: string; status: string }[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [userFullname, setUserFullname] = useState<string | null>(null);
    const [userId1, setUserId] = useState<string | null>(null);
    const [vnpayUrl, setVnpayUrl] = useState<string | null>(null);

    useEffect(() => {
        const id = getUserIdFromToken();
        if (id) {
            setUserId(id);
            const storedFullname = localStorage.getItem("fullname");
            setUserFullname(storedFullname);
            console.log("Token id:", id);
            console.log("Fullname trong localStorage:", storedFullname);
        }
    }, []);

    useEffect(() => {
        if (!takeAway) {
            axiosInstance.get("/table")
                .then(res => setAvailableTables(res.data))
                .catch(err => console.error("Lỗi lấy bàn trống:", err));
        }
    }, [takeAway]);

    useEffect(() => {
        axiosInstance.get("/payment/payment-methods")
            .then(res => setPaymentMethods(res.data))
            .catch(err => console.error("Lỗi lấy phương thức thanh toán:", err));
    }, []);

    const handlePlaceOrder = async () => {
        if (!takeAway && !tableId) {
            alert("Vui lòng chọn bàn");
            return;
        }

        if (!cartItems || cartItems.length === 0) {
            alert("Giỏ hàng trống");
            return;
        }

        const orderData = {
            takeAway,
            tableId: takeAway ? null : tableId,
            paymentMethod,
            items: cartItems.map((item: any) => ({
                productId: item.product.id,
                quantity: item.quantity,
                price: item.product.price,
            })),
        };

        try {
            let sessionId = localStorage.getItem("sessionId");

            if (paymentMethod === "VNPAY") {
                const res = await axiosInstance.post(
                    userId ? "/payment/create-vnpay" : `/payment/create-vnpay?sessionId=${sessionId}`,
                    orderData
                );
                setVnpayUrl(res.data.paymentUrl); // URL trả về từ VNPay
            } else {
                if (userId) {
                    await axiosInstance.post("/order/add", orderData);
                } else {
                    await axiosInstance.post(`/order/add?sessionId=${sessionId}`, orderData);
                }
                alert("Đặt hàng thành công!");
                navigate("/");
            }
        } catch (err) {
            console.error("Lỗi đặt hàng:", err);
            alert("Đặt hàng thất bại. Vui lòng kiểm tra lại.");
        }
    };

    const totalPrice = cartItems?.reduce(
        (sum: number, item: any) => sum + item.product.price * item.quantity,
        0
    ) || 0;

    return (
        <div className="bg-white min-h-screen">
            <Header />

            <section className="py-16 px-8 bg-[#f1ebe7]">
                <div className="container mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl text-[#8B5E3C] font-bold uppercase">Đặt hàng</h2>
                        <div className="w-20 h-1 bg-[#8B5E3C] mx-auto mt-4"></div>
                        <p className="italic text-gray-500 mt-2">Hoàn tất thông tin đặt hàng của bạn</p>
                    </div>

                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Order Form */}
                        <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-[#8B5E3C]">
                            <h2 className="text-xl font-bold mb-6 text-[#8B5E3C]">Thông tin đặt hàng</h2>

                            <div className="mb-4">
                                <label className="block mb-2 font-medium text-gray-700">Tên khách hàng:</label>
                                <input
                                    type="text"
                                    className="border w-full mb-4 p-3 rounded bg-gray-50 border-[#d1c7bb] focus:border-[#8B5E3C] focus:ring-1 focus:ring-[#8B5E3C]"
                                    value={userFullname ?? ""}
                                    onChange={(e) => setUserFullname(e.target.value)}
                                    placeholder="Nhập tên khách hàng"
                                    disabled={!!userId}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 font-medium text-gray-700">Loại đơn:</label>
                                <select
                                    className="border w-full mb-4 p-3 rounded bg-gray-50 border-[#d1c7bb] focus:border-[#8B5E3C] focus:ring-1 focus:ring-[#8B5E3C]"
                                    value={takeAway ? "TAKEAWAY" : "IN-HOUSE"}
                                    onChange={(e) => setTakeAway(e.target.value === "TAKEAWAY")}
                                >
                                    <option value="IN-HOUSE">Ăn tại chỗ</option>
                                    <option value="TAKEAWAY">Mang đi</option>
                                </select>
                            </div>

                            {!takeAway && (
                                <div className="mb-4">
                                    <label className="block mb-2 font-medium text-gray-700">Chọn bàn:</label>
                                    <select
                                        className="border w-full mb-4 p-3 rounded bg-gray-50 border-[#d1c7bb] focus:border-[#8B5E3C] focus:ring-1 focus:ring-[#8B5E3C]"
                                        value={tableId ?? ""}
                                        onChange={(e) => setTableId(Number(e.target.value))}
                                    >
                                        <option value="">-- Chọn bàn --</option>
                                        {availableTables.map(table => (
                                            <option
                                                key={table.id}
                                                value={table.id}
                                                disabled={table.status !== "AVAILABLE"}
                                            >
                                                {table.name} ({table.status === "AVAILABLE" ? "Sẵn sàng" : "Đang dùng"})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="mb-6">
                                <label className="block mb-3 font-medium text-gray-700">Phương thức thanh toán:</label>
                                <div className="space-y-2">
                                    {paymentMethods.map(pm => (
                                        <div key={pm} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`payment-${pm}`}
                                                name="paymentMethod"
                                                value={pm}
                                                checked={paymentMethod === pm}
                                                onChange={() => setPaymentMethod(pm)}
                                                className="h-4 w-4 text-[#8B5E3C] border-gray-300"
                                            />
                                            <label htmlFor={`payment-${pm}`} className="ml-2 text-sm text-gray-700">
                                                {pm}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                className="bg-[#8B5E3C] text-white px-6 py-3 rounded-lg hover:bg-[#6d4a30] transition-colors w-full font-medium text-lg"
                                onClick={handlePlaceOrder}
                            >
                                Xác nhận đặt hàng
                            </button>

                            {vnpayUrl && (
                                <div className="mt-6 bg-green-100 text-green-800 p-4 rounded">
                                    <p className="font-medium mb-2">Link thanh toán VNPay:</p>
                                    <a href={vnpayUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
                                        {vnpayUrl}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Cart Summary */}
                        <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-[#8B5E3C]">
                            <h2 className="text-xl font-bold mb-6 text-[#8B5E3C]">Sản phẩm đặt</h2>

                            {cartItems && cartItems.length > 0 ? (
                                <div className="space-y-4">
                                    {cartItems.map((item: any) => (
                                        <div key={item.id} className="flex items-center justify-between py-3 border-b border-[#e0d6cc]">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={item.product.imageUrl || "/default.png"}
                                                    alt={item.product.name}
                                                    className="w-16 h-16 rounded-full object-cover border-2 border-[#8B5E3C]"
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-800">{item.product.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {item.quantity} x {item.product.price.toLocaleString("vi-VN")}đ
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-semibold text-[#8B5E3C]">
                                                {(item.quantity * item.product.price).toLocaleString("vi-VN")}đ
                                            </p>
                                        </div>
                                    ))}
                                    <div className="mt-6 pt-4 border-t border-[#e0d6cc]">
                                        <p className="text-right text-xl font-bold text-gray-800">
                                            Tổng: <span className="text-[#8B5E3C]">{totalPrice.toLocaleString("vi-VN")}đ</span>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">Không có sản phẩm nào trong giỏ hàng</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
