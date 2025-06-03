import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosInstance";
import Header from "~/components/Header";
import ConfirmDialog from "~/components/ConfirmDialog";
import { getUserIdFromToken } from "~/utils/authUtils";

export default function Cart() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [btnLoadingId, setBtnLoadingId] = useState<number | null>(null);
    const [orderHistory, setOrderHistory] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    const userId = getUserIdFromToken();
    const navigate = useNavigate();

    // Dialog state
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);

    // Lấy giỏ hàng theo user hoặc sessionId
    useEffect(() => {
        const fetchCart = async () => {
            setLoading(true);
            try {
                if (userId) {
                    const res = await axiosInstance.get("/cart");
                    setCartItems(res.data.cartItems || []);
                } else {
                    const sessionId = localStorage.getItem("sessionId");
                    if (sessionId) {
                        const res = await axiosInstance.get("/cart/session", { params: { sessionId } });
                        setCartItems(res.data.cartItems || []);
                    } else {
                        setCartItems([]);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi lấy giỏ hàng:", error);
                setCartItems([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [userId]);

    const reloadCart = async () => {
        setLoading(true);
        try {
            if (userId) {
                const res = await axiosInstance.get("/cart");
                setCartItems(res.data.cartItems || []);
            } else {
                const sessionId = localStorage.getItem("sessionId");
                if (sessionId) {
                    const res = await axiosInstance.get("/cart/session", { params: { sessionId } });
                    setCartItems(res.data.cartItems || []);
                } else {
                    setCartItems([]);
                }
            }
        } catch (error) {
            console.error("Lỗi khi reload giỏ hàng:", error);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    // Tăng số lượng sản phẩm
    const handleIncrease = async (item: CartItem) => {
        setBtnLoadingId(item.id);
        try {
            const data = {
                product: { id: item.product.id },
                quantity: 1,
                price: item.product.price,
            };
            if (userId) {
                await axiosInstance.post("/cart/add", data);
            } else {
                const sessionId = localStorage.getItem("sessionId");
                await axiosInstance.post(`/cart/session/add?sessionId=${sessionId}`, { ...data });
            }
            await reloadCart();
        } catch (error) {
            console.error("Lỗi tăng số lượng:", error);
        } finally {
            setBtnLoadingId(null);
        }
    };

    // Giảm số lượng sản phẩm
    const handleDecrease = async (item: CartItem) => {
        if (item.quantity <= 1) return;
        setBtnLoadingId(item.id);
        try {
            const updatedQuantity = item.quantity - 1;
            const updatedCartItemDTO = {
                product: { id: item.product.id },
                quantity: updatedQuantity,
                price: item.price,
            };
            if (userId) {
                await axiosInstance.post("/cart/update", updatedCartItemDTO);
            } else {
                const sessionId = localStorage.getItem("sessionId");
                await axiosInstance.post(`/cart/session/update?sessionId=${sessionId}`, { ...updatedCartItemDTO });
            }
            await reloadCart();
        } catch (error) {
            console.error("Lỗi giảm số lượng:", error);
        } finally {
            setBtnLoadingId(null);
        }
    };

    // Xóa sản phẩm khỏi giỏ hàng
    const confirmDeleteItem = (itemId: number) => {
        setDialogMessage("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?");
        setDialogAction(() => async () => {
            try {
                if (userId) {
                    await axiosInstance.delete(`/cart/delete/${itemId}`);
                } else {
                    const sessionId = localStorage.getItem("sessionId");
                    await axiosInstance.delete(`/cart/session/delete/${itemId}`, { params: { sessionId } });
                }
                await reloadCart();
            } catch (error) {
                console.error("Lỗi xoá sản phẩm:", error);
            } finally {
                setConfirmDialogOpen(false);
            }
        });
        setConfirmDialogOpen(true);
    };

    // Xóa toàn bộ giỏ hàng
    const confirmDeleteAll = () => {
        setDialogMessage("Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng không?");
        setDialogAction(() => async () => {
            try {
                if (userId) {
                    await axiosInstance.delete(`/cart/delete`);
                } else {
                    const sessionId = localStorage.getItem("sessionId");
                    await axiosInstance.delete(`/cart/session/delete?sessionId=${sessionId}`, { params: { sessionId } });
                }
                await reloadCart();
            } catch (error) {
                console.error("Lỗi xoá toàn bộ giỏ hàng:", error);
            } finally {
                setConfirmDialogOpen(false);
            }
        });
        setConfirmDialogOpen(true);
    };

    const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const handlePlaceOrder = () => {
        if (cartItems.length === 0) {
            alert("Giỏ hàng rỗng");
            return;
        }
        navigate("/order", { state: { cartItems } });
    };

    // Hàm lấy order history
    const fetchOrderHistory = async () => {
        setLoadingOrders(true);
        try {
            const sessionId = localStorage.getItem("sessionId");
            const params: any = {};
            if (sessionId) params.sessionId = sessionId;

            const res = await axiosInstance.get("order/history", { params });
            setOrderHistory(res.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử đơn hàng:", error);
            setOrderHistory([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    const toggleOrderDetails = (orderId: number) => {
        setExpandedOrderId(prev => (prev === orderId ? null : orderId));
    };

    // Gọi fetchOrderHistory mỗi khi userId hoặc sessionId thay đổi
    useEffect(() => {
        fetchOrderHistory();
    }, [userId]);

    return (
        <div className="bg-white min-h-screen">
            <Header />

            <section className="py-16 px-8 bg-[#f8f5f2]">
                <div className="container mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl text-[#8B5E3C] font-bold uppercase">Giỏ hàng của bạn</h2>
                        <div className="w-20 h-1 bg-[#8B5E3C] mx-auto mt-4"></div>
                        <p className="italic text-gray-500 mt-2">Kiểm tra các sản phẩm bạn đã chọn</p>
                    </div>

                    {loading ? (
                        <p className="text-center">Đang tải giỏ hàng...</p>
                    ) : cartItems.length === 0 ? (
                        <p className="text-center text-gray-500 italic">Chưa có sản phẩm nào trong giỏ hàng.</p>
                    ) : (
                        <div className="max-w-3xl mx-auto">
                            <div className="flex justify-end mb-6">
                                <button
                                    onClick={confirmDeleteAll}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                >
                                    Xóa tất cả giỏ hàng
                                </button>
                            </div>

                            <div className="grid md:grid-cols-1 gap-5 ">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-[#8B5E3C]"
                                    >
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 w-full">
                                                <img
                                                    src={item.product.imageUrl || "/default.png"}
                                                    alt={item.product.name}
                                                    className="w-20 h-20 rounded-full object-cover border-2 border-[#8B5E3C] flex-shrink-0"
                                                />
                                                <div className="flex-grow">
                                                    <h3 className="font-bold text-gray-800 text-lg">
                                                        <span className="font-bold text-gray-800 text-lg mb-1">{item.product.name}</span>
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <button
                                                            disabled={btnLoadingId === item.id}
                                                            onClick={() => handleDecrease(item)}
                                                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="font-medium">{item.quantity}</span>
                                                        <button
                                                            disabled={btnLoadingId === item.id}
                                                            onClick={() => handleIncrease(item)}
                                                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end items-center gap-4 w-full">
                                                <div className="flex flex-col text-right">
                                                    <span className="font-bold text-[#8B5E3C] text-lg">
                                                        {item.price.toLocaleString()}đ
                                                    </span>
                                                    <p className="text-gray-600 mt-1">
                                                        Tổng: {(item.quantity * item.price).toLocaleString()}đ
                                                    </p>
                                                </div>

                                                <button
                                                    disabled={btnLoadingId === item.id}
                                                    onClick={() => confirmDeleteItem(item.id)}
                                                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50"
                                                >
                                                    Xoá
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-center border-t pt-6 mt-8 gap-4">
                                <p className="text-xl font-semibold">
                                    Tổng tiền: <span className="text-[#8B5E3C]">{totalPrice.toLocaleString()}đ</span>
                                </p>
                                <button
                                    onClick={handlePlaceOrder}
                                    className="px-6 py-3 bg-[#8B5E3C] text-white rounded hover:bg-[#6d4b2f] transition-colors font-medium"
                                >
                                    Đặt hàng
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="px-8 pb-20">
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-2xl font-semibold text-[#8B5E3C] mb-4">Lịch sử đơn hàng</h2>

                    {loadingOrders ? (
                        <p className="text-gray-500 italic">Đang tải lịch sử đơn hàng...</p>
                    ) : orderHistory.length === 0 ? (
                        <p className="text-gray-500 italic">Bạn chưa có đơn hàng nào.</p>
                    ) : (
                        <div className="space-y-6">
                            {orderHistory.map((order) => (
                                <div key={order.id} className="space-y-2">
                                    <div
                                        className="bg-white rounded-lg shadow p-5 border-l-4 border-[#8B5E3C] hover:shadow-lg transition-all cursor-pointer"
                                        onClick={() => toggleOrderDetails(order.id)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-lg font-semibold">Mã đơn hàng: #{order.id}</p>
                                                <p className="text-sm text-gray-600">Ngày đặt: {new Date(order.orderDate).toLocaleString()}</p>
                                                <p className="text-sm text-gray-600">Trạng thái: <span className={`
                                                    px-2 py-1 rounded-full text-xs font-semibold
                                                    ${order.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : ""}
                                                    ${order.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" : ""}
                                                    ${order.status === "IN_PREPARATION" ? "bg-purple-100 text-purple-800" : ""}
                                                    ${order.status === "SERVED" ? "bg-green-100 text-green-800" : ""}
                                                    ${order.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : ""}
                                                    ${order.status === "CANCELED" ? "bg-red-100 text-red-800" : ""}
                                                `}>
                                                    {order.status}
                                                </span></p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[#8B5E3C] text-lg font-bold">{order.totalAmount.toLocaleString()}đ</p>
                                                <p className="text-sm italic text-gray-500">Phương thức: {order.paymentMethod}</p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleOrderDetails(order.id);
                                                    }}
                                                    className="text-blue-600 hover:underline text-sm mt-1"
                                                >
                                                    {expandedOrderId === order.id ? "Ẩn chi tiết" : "Xem chi tiết"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {expandedOrderId === order.id && (
                                        <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                                            <h3 className="font-semibold text-lg mb-3">Chi tiết đơn hàng</h3>
                                            <div className="space-y-3">
                                                {order.orderDetailDTO.map((detail) => (
                                                    <div key={detail.id} className="flex items-center justify-between p-2 border-b">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={detail.urlProductImage || "/default.png"}
                                                                alt={detail.productName}
                                                                className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                                            />
                                                            <div>
                                                                <p className="font-medium">{detail.productName}</p>
                                                                <p className="text-sm text-gray-500">{detail.price.toLocaleString()}đ x {detail.quantity}</p>
                                                            </div>
                                                        </div>
                                                        <p className="font-semibold">{(detail.price * detail.quantity).toLocaleString()}đ</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-center mt-4 pt-3 border-t">
                                                <p className="font-semibold">Tổng cộng:</p>
                                                <p className="text-lg font-bold text-[#8B5E3C]">{order.totalAmount.toLocaleString()}đ</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <ConfirmDialog
                open={confirmDialogOpen}
                message={dialogMessage}
                onConfirm={() => {
                    if (dialogAction) dialogAction();
                }}
                onCancel={() => setConfirmDialogOpen(false)}
            />
        </div>
    );
}