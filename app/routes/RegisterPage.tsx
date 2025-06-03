import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "~/components/Header";
import axiosInstance from "../config/axiosInstance";

export default function Register() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        try {
            const payload = {
                fullName,
                email,
                phone,
                password,
                confirmPassword,
            };

            await axiosInstance.post("auth/register", payload);
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            navigate("/login");
        } catch (err: any) {
            if (err.response && err.response.data) {
                setError(err.response.data.message || "Đăng ký thất bại");
            } else {
                setError("Lỗi kết nối đến server");
            }
        }
    };

    return (
        <div className="bg-white min-h-screen">
            <Header />

            <section className="py-16 px-8 bg-[#f8f5f2]">
                <div className="container mx-auto max-w-md">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl text-[#8B5E3C] font-bold uppercase">Đăng ký</h2>
                        <div className="w-20 h-1 bg-[#8B5E3C] mx-auto mt-4"></div>
                        <p className="italic text-gray-500 mt-2">Tạo tài khoản mới</p>
                    </div>

                    <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-[#8B5E3C]">
                        {error && (
                            <div className="mb-6 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-gray-700">Họ và tên</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-gray-700">Số điện thoại</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-gray-700">Mật khẩu</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-medium mb-2 text-gray-700">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#8B5E3C] text-white py-3 rounded-lg hover:bg-[#6d4b2f] transition-colors font-medium"
                        >
                            Đăng ký
                        </button>

                        <div className="text-center mt-6">
                            <span className="text-sm text-gray-600">
                                Đã có tài khoản?{" "}
                                <Link to="/login" className="text-[#8B5E3C] hover:underline font-medium">
                                    Đăng nhập ngay
                                </Link>
                            </span>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}