import React from "react";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-black text-gray-300 pt-12 pb-6">
            <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 sm:grid-cols-2 gap-8">
                {/* Thông tin cửa hàng */}
                <div>
                    <h3 className="text-white text-lg font-semibold mb-4">Coffee NDN</h3>
                    <p className="text-sm text-gray-400 mb-2">Địa chỉ: Tiên Dương - Đông Anh - Hà Nội</p>
                    <p className="text-sm text-gray-400 mb-2">Điện thoại: 0936 106 205</p>
                    <p className="text-sm text-gray-400">Email: nam08122004@gmail.com</p>
                </div>

                {/* Liên kết nhanh */}
                <div>
                    <h3 className="text-white text-lg font-semibold mb-4">Liên kết nhanh</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="/" className="hover:text-[#8B5E3C] transition">Trang chủ</a></li>
                        <li><a href="/gt" className="hover:text-[#8B5E3C] transition">Giới thiệu</a></li>
                        <li><a href="/services" className="hover:text-[#8B5E3C] transition">Dịch vụ</a></li>
                        <li><a href="/contact" className="hover:text-[#8B5E3C] transition">Liên hệ</a></li>
                    </ul>
                </div>

                {/* Giờ mở cửa */}
                <div>
                    <h3 className="text-white text-lg font-semibold mb-4">Giờ mở cửa</h3>
                    <ul className="text-sm space-y-1 text-gray-400">
                        <li>Thứ 2 - Thứ 6: 7:00 - 22:00</li>
                        <li>Thứ 7: 8:00 - 23:00</li>
                        <li>Chủ nhật: 8:00 - 21:00</li>
                    </ul>
                </div>

                {/* Mạng xã hội */}
                <div>
                    <h3 className="text-white text-lg font-semibold mb-4">Kết nối với chúng tôi</h3>
                    <div className="flex gap-4 text-xl">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#8B5E3C] transition">
                            <FaFacebookF />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#8B5E3C] transition">
                            <FaInstagram />
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#8B5E3C] transition">
                            <FaYoutube />
                        </a>
                    </div>
                </div>
            </div>

            <div className="text-center text-sm text-gray-500 mt-10 border-t border-[#2f2210] pt-4">
                © {new Date().getFullYear()} Coffee NDN. All rights reserved.
            </div>
        </footer>
    );
}
