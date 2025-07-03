import React, { useState, useEffect } from "react";
import { FaSearch, FaShoppingBag } from "react-icons/fa";
import axiosInstance from '../config/axiosInstance';
import { getUserIdFromToken } from "~/utils/authUtils";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "~/components/ConfirmDialog";

function Header() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [fullname, setFullname] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [cartCount, setCartCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/product/search?name=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);

    const handleLogout = () => {
        localStorage.removeItem("fullname");
        localStorage.removeItem("accessToken");
        setConfirmDialogOpen(false);
        navigate("/login");
    };

    useEffect(() => {
        const id = getUserIdFromToken();
        setUserId(id);
        const storedFullname = localStorage.getItem("fullname");
        setFullname(storedFullname);
    }, []);

    useEffect(() => {
        const handleUserLogin = (event: any) => {
            setFullname(event.detail);
        };
        window.addEventListener("userLogin", handleUserLogin);
        return () => window.removeEventListener("userLogin", handleUserLogin);
    }, []);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await axiosInstance.get(`/category?page=0&size=7`);
                if (res.data && res.data.data && res.data.data.content) {
                    setCategories(res.data.data.content);
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        fetchCategory();
    }, []);

    useEffect(() => {
        const fetchCartCount = async () => {
            try {
                if (userId) {
                    const res = await axiosInstance.get("/cart");
                    const cartItems = res.data.data.cartItems || [];
                    const total = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
                    setCartCount(total);
                } else {
                    const sessionId = localStorage.getItem("sessionId");
                    if (sessionId) {
                        const res = await axiosInstance.get("/cart/session", { params: { sessionId } });
                        const cartItems = res.data.data.cartItems || [];
                        const total = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
                        setCartCount(total);
                    } else {
                        setCartCount(0);
                    }
                }
            } catch (err) {
                console.error("Lỗi khi lấy giỏ hàng:", err);
                setCartCount(0);
            }
        };

        fetchCartCount();
    }, [userId]);

    return (
        <header className="bg-black text-white shadow-lg font-sans">
            {/* Top bar */}
            <div className="flex justify-between px-12 py-2 text-sm bg-[#2f2210] text-gray-200">
                <span>☕ Chào mừng đến Coffee House - Nơi hương vị cà phê đích thực</span>
                <div>
                    {fullname ? (
                        <div className="flex items-center gap-4">
                            <span className="text-[#D6C6B8]">Xin chào, {fullname}</span>
                            <button
                                onClick={() => {
                                    setDialogMessage("Bạn có chắc chắn muốn đăng xuất không?");
                                    setDialogAction(() => handleLogout);
                                    setConfirmDialogOpen(true);
                                }}
                                className="text-[#D6C6B8] hover:text-white transition"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <a
                            href="/login"
                            className="hover:text-white transition text-[#8B5E3C] font-medium"
                        >
                            Đăng nhập / Đăng ký
                        </a>
                    )}
                </div>
            </div>

            {/* Main nav */}
            <nav className="px-12 py-4 flex items-center justify-between relative bg-black border-b border-[#2f2210]">
                {/* Left navigation */}
                <ul className="flex gap-8 items-center text-sm font-medium">
                    <li>
                        <a
                            href="/"
                            className="hover:text-[#8B5E3C] transition-colors duration-300 py-2 px-1 border-b-2 border-transparent hover:border-[#8B5E3C]"
                        >
                            Trang chủ
                        </a>
                    </li>
                    <li>
                        <a
                            href="/gt"
                            className="hover:text-[#8B5E3C] transition-colors duration-300 py-2 px-1 border-b-2 border-transparent hover:border-[#8B5E3C]"
                        >
                            Giới thiệu
                        </a>
                    </li>
                    <li className="relative group">
                        <span className="flex items-center gap-1 cursor-pointer py-2 px-1 border-b-2 border-transparent group-hover:border-[#8B5E3C]">
                            Sản phẩm <span className="text-xs">▼</span>
                        </span>
                        <div className="absolute left-0 top-full mt-2 w-48 bg-white text-black rounded-md shadow-xl opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 z-50 border border-[#8B5E3C]">
                            {categories.length > 0 ? (
                                categories.map(c => (
                                    <a
                                        key={c.id}
                                        href={`/category?id=${c.id}`}
                                        className="block px-4 py-2 hover:bg-[#8B5E3C] hover:text-white transition-colors first:rounded-t-md last:rounded-b-md"
                                    >
                                        {c.nameCate}
                                    </a>
                                ))
                            ) : (
                                <p className="px-4 py-2 text-gray-600">Loading...</p>
                            )}
                        </div>
                    </li>
                </ul>

                {/* Logo center */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <a href="/">
                        <img
                            src="/logo.png"
                            alt="Coffee House Logo"
                            className="w-20 h-20 rounded-full object-contain hover:opacity-90 transition"
                        />
                    </a>
                </div>

                {/* Right navigation */}
                <ul className="flex gap-8 items-center text-sm font-medium">
                    <li>
                        <a
                            href="/services"
                            className="hover:text-[#8B5E3C] transition-colors duration-300 py-2 px-1 border-b-2 border-transparent hover:border-[#8B5E3C]"
                        >
                            Dịch vụ
                        </a>
                    </li>
                    <li>
                        <a
                            href="/news"
                            className="hover:text-[#8B5E3C] transition-colors duration-300 py-2 px-1 border-b-2 border-transparent hover:border-[#8B5E3C]"
                        >
                            Tin tức
                        </a>
                    </li>
                    <li>
                        <a
                            href="/contact"
                            className="hover:text-[#8B5E3C] transition-colors duration-300 py-2 px-1 border-b-2 border-transparent hover:border-[#8B5E3C]"
                        >
                            Liên hệ
                        </a>
                    </li>

                    {/* Search */}
                    <li>
                        <div className="relative group">
                            <form
                                onSubmit={handleSearchSubmit}
                                className="flex items-center gap-0"
                            >
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="absolute right-8 opacity-0 group-hover:opacity-100 group-hover:relative group-hover:right-0 transition-all duration-300 ease-in-out border border-[#2f2210] bg-black text-white px-3 py-2 text-sm rounded-l focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] w-48"
                                    placeholder="Tìm kiếm sản phẩm..."
                                />
                                <button
                                    type="submit"
                                    className="bg-[#8B5E3C] text-white px-3 py-2 rounded hover:bg-[#704326] transition-colors"
                                >
                                    <FaSearch size={14} />
                                </button>
                            </form>
                        </div>

                    </li>

                    {/* Cart */}
                    <li className="relative">
                        <a
                            href="/cart"
                            className="flex items-center gap-1 hover:text-[#8B5E3C] transition-colors"
                        >
                            <FaShoppingBag size={18} />
                            <span className="absolute -top-2 -right-2 text-xs bg-[#8B5E3C] text-white rounded-full w-5 h-5 flex items-center justify-center">
                                {cartCount}
                            </span>
                        </a>
                    </li>
                </ul>
            </nav>

            <ConfirmDialog
                open={confirmDialogOpen}
                message={dialogMessage}
                onConfirm={() => dialogAction?.()}
                onCancel={() => setConfirmDialogOpen(false)}
            />
        </header>
    );
}

export default Header;