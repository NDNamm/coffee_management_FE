import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosInstance";
import Header from "~/components/Header";
import { getUserIdFromToken } from "~/utils/authUtils";

export default function OrderPage() {
    const { state } = useLocation();
    const { cartItems } = state || {};
    const navigate = useNavigate();
    const [cities, setCities] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);

    const [selectedCity, setSelectedCity] = useState<string>("");
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");
    const [selectedWard, setSelectedWard] = useState<string>("");


    const [takeAway, setTakeAway] = useState(false);
    const [tableId, setTableId] = useState<number | null>(null);
    const [availableTables, setAvailableTables] = useState<{ id: number; name: string; status: string }[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [userFullname, setUserFullname] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [homeAddress, setHomeAddress] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [vnpayUrl, setVnpayUrl] = useState<string | null>(null);
    const [note, setNote] = useState<string | null>(null);

    useEffect(() => {
        const id = getUserIdFromToken();
        if (id) {
            setUserId(id);
            const storedFullname = localStorage.getItem("fullname");
            const storedPhoneNumber = localStorage.getItem("phoneNumber");
            setUserFullname(storedFullname);
            setPhoneNumber(storedPhoneNumber);
            console.log("Token id:", id);
            console.log("Fullname trong localStorage:", storedFullname);
            console.log("Phone number trong localStorage:", storedPhoneNumber);
        }
    }, []);

    useEffect(() => {
        axiosInstance.get("/payment/payment-methods")
            .then(res => setPaymentMethods(res.data))
            .catch(err => console.error("Lỗi lấy phương thức thanh toán:", err));
    }, []);

    useEffect(() => {
        if (!selectedCity) return;
        fetch(`https://provinces.open-api.vn/api/p/${selectedCity}?depth=2`)
            .then((res) => res.json())
            .then((data) => setDistricts(data.districts || []));
    }, [selectedCity]);

    useEffect(() => {
        if (!selectedDistrict) return;
        fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
            .then((res) => res.json())
            .then((data) => setWards(data.wards || []));
    }, [selectedDistrict]);


    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/p/")
            .then((res) => res.json())
            .then((data) => setCities(data))
            .catch((err) => console.error("Lỗi lấy tỉnh/thành:", err));
    }, []);


    const handlePlaceOrder = async () => {

        if (!cartItems || cartItems.length === 0) {
            alert("Giỏ hàng trống");
            return;
        }

        const selectedCityName = cities.find(c => c.code === +selectedCity)?.name || "";
        const selectedDistrictName = districts.find(d => d.code === +selectedDistrict)?.name || "";
        const selectedWardName = wards.find(w => w.code === +selectedWard)?.name || "";

        const orderData = {
            note, // hoặc để người dùng nhập ghi chú
            paymentMethod,
            addressDTO: {
                receiverName: userFullname,
                phoneNumber: phoneNumber,
                homeAddress,
                city: selectedCityName,
                district: selectedDistrictName,
                commune: selectedWardName,
            },
            items: cartItems.map((item: any) => ({
                productId: item.product.id,
                quantity: item.quantity,
                price: item.product.price,
            })),
        };

        try {
            let sessionId = localStorage.getItem("sessionId");
            console.log("sessionId:", sessionId);

            if (paymentMethod === "VNPAY") {
                const res = await axiosInstance.post(
                    userId ? "/payment/create-vnpay" : `/payment/create-vnpay?sessionId=${sessionId}`,
                    orderData
                );
                setVnpayUrl(res.data.paymentUrl);
            } else {
                if (userId) {
                    // ✅ Đã đăng nhập => không gửi sessionId!
                    console.log("orderData gửi lên:", orderData);

                    await axiosInstance.post("/order/add", orderData);
                } else {
                    // ❌ Chỉ gửi sessionId khi chưa đăng nhập
                    if (!sessionId) {
                        alert("Không tìm thấy sessionId!");
                        return;
                    }
                    await axiosInstance.post(`/order/add?sessionId=${sessionId}`, orderData);
                }

                alert("Đặt hàng thành công!");
                navigate("/");
            }
        } catch (err) {
            console.error("Lỗi đặt hàng:", err);
            alert("Đặt hàng thất bại. Vui lòng kiểm tra lại.");
        };
    }

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

                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
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

                                />
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 font-medium text-gray-700">Số điện thoại:</label>
                                <input
                                    type="text"
                                    className="border w-full mb-4 p-3 rounded bg-gray-50 border-[#d1c7bb] focus:border-[#8B5E3C] focus:ring-1 focus:ring-[#8B5E3C]"
                                    value={phoneNumber ?? ""}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="Nhập sđt khách hàng"

                                />
                            </div>
                            <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Tỉnh / Thành phố */}
                                <div className="mb-4">
                                    <label className="block mb-2 font-medium text-gray-700">Tỉnh / Thành phố:</label>
                                    <select
                                        className="border w-full p-3 rounded bg-gray-50 border-[#d1c7bb]"
                                        value={selectedCity}
                                        onChange={(e) => {
                                            setSelectedCity(e.target.value);
                                            setSelectedDistrict("");
                                            setSelectedWard("");
                                        }}
                                    >
                                        <option value="">-- Chọn tỉnh / thành phố --</option>
                                        {cities.map(city => (
                                            <option key={city.code} value={city.code}>{city.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quận / Huyện */}
                                <div className="mb-4">
                                    <label className="block mb-2 font-medium text-gray-700">Quận / Huyện:</label>
                                    <select
                                        className="border w-full p-3 rounded bg-gray-50 border-[#d1c7bb]"
                                        value={selectedDistrict}
                                        onChange={(e) => {
                                            setSelectedDistrict(e.target.value);
                                            setSelectedWard(""); // reset xã
                                        }}
                                        disabled={!selectedCity}
                                    >
                                        <option value="">-- Chọn quận / huyện --</option>
                                        {districts.map(d => (
                                            <option key={d.code} value={d.code}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Phường / Xã */}
                                <div className="mb-4">
                                    <label className="block mb-2 font-medium text-gray-700">Phường / Xã:</label>
                                    <select
                                        className="border w-full p-3 rounded bg-gray-50 border-[#d1c7bb]"
                                        value={selectedWard}
                                        onChange={(e) => setSelectedWard(e.target.value)}
                                        disabled={!selectedDistrict}
                                    >
                                        <option value="">-- Chọn phường / xã --</option>
                                        {wards.map(w => (
                                            <option key={w.code} value={w.code}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 font-medium text-gray-700">Địa chỉ nhà:</label>
                                <input
                                    type="text"
                                    className="border w-full mb-4 p-3 rounded bg-gray-50 border-[#d1c7bb] focus:border-[#8B5E3C] focus:ring-1 focus:ring-[#8B5E3C]"
                                    placeholder="Nhập địa chỉ cụ thể"
                                    value={homeAddress ?? ""}
                                    onChange={(e) => setHomeAddress(e.target.value)}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 font-medium text-gray-700">Ghi chú:</label>
                                <input
                                    type="text"
                                    className="border w-full mb-4 p-3 rounded bg-gray-50 border-[#d1c7bb] focus:border-[#8B5E3C] focus:ring-1 focus:ring-[#8B5E3C]"
                                    placeholder="Nhập ghi chú (nếu có)"
                                />
                            </div>


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
                                    <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 items-center">
                                        <span className="text-sm text-gray-600 text-center md:text-left">
                                            <a
                                                href="/cart"
                                                className="text-[#8B5E3C] hover:underline font-medium"
                                            >
                                                Quay về giỏ hàng
                                            </a>
                                        </span>

                                        <button
                                            className="bg-[#8B5E3C] text-white px-6 py-3 rounded-lg hover:bg-[#6d4a30] transition-colors w-full font-medium text-lg"
                                            onClick={handlePlaceOrder}
                                        >
                                            Xác nhận đặt hàng
                                        </button>
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
