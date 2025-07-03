import React, { useState } from "react";
import Header from "~/components/Header";
import axiosInstance from '../config/axiosInstance';
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post("auth/login", { email, password });
            console.log("Login successful:", response.data.data);
            // Sau khi gọi API đăng nhập thành công:
            localStorage.setItem("accessToken", response.data.data.token);
            localStorage.setItem("phoneNumber", response.data.data.phoneNumber);
            localStorage.setItem("fullname", response.data.data.fullName);
            localStorage.setItem("userId", response.data.data.userId.toString());
            localStorage.setItem("userRole", response.data.data.nameRole);



            window.dispatchEvent(new CustomEvent("userLogin", { detail: response.data.name }));

            const roles = response.data.data.nameRole;
            console.log("Roles from token:", roles);
            if (roles == "ADMIN" || roles == "ROLE_ADMIN") {
                navigate("/admin/dashboard");
            }
            else {
                navigate("/");
            }

        } catch (error) {
            console.error("Login failed:", error);
            alert("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
        }
    };

    return (
        <div className="bg-white min-h-screen">
            <Header />

            <section className="py-16 px-8 bg-[#f8f5f2]">
                <div className="container mx-auto max-w-md">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl text-[#8B5E3C] font-bold uppercase">Đăng nhập</h2>
                        <div className="w-20 h-1 bg-[#8B5E3C] mx-auto mt-4"></div>
                        <p className="italic text-gray-500 mt-2">Vui lòng nhập thông tin đăng nhập</p>
                    </div>

                    <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-[#8B5E3C]">
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="username">Email</label>
                            <input
                                type="text"
                                id="username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                                required
                            />
                        </div>
                        <div className="mb-8">
                            <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="password">Mật khẩu</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-[#8B5E3C] text-white py-3 rounded-lg hover:bg-[#6d4b2f] transition-colors font-medium"
                        >
                            Đăng nhập
                        </button>

                        <div className="text-center mt-6">
                            <span className="text-sm text-gray-600">
                                Chưa có tài khoản?{" "}
                                <a
                                    href="/register"
                                    className="text-[#8B5E3C] hover:underline font-medium"
                                >
                                    Đăng ký ngay
                                </a>
                            </span>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}