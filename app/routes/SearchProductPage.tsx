import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "~/components/Header";
import axiosInstance from "../config/axiosInstance";

// Hook lấy query param
function useQueryParam(param: string): string {
    return new URLSearchParams(useLocation().search).get(param) || "";
}

export default function SearchProductPage() {
    const query = useQueryParam("name");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            if (!query.trim()) return;

            setLoading(true);
            setError("");
            try {
                const res = await axiosInstance.get(
                    `/product/search?name=${encodeURIComponent(query)}`
                );
                setProducts(res.data.content || []);
            } catch (err) {
                console.error("Lỗi tìm kiếm:", err);
                setError("Đã xảy ra lỗi khi tìm kiếm sản phẩm.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [query]);

    return (
        <div className="bg-white min-h-screen">
            <Header />

            {/* Search Results Header */}
            <section className="py-16 px-8 bg-[#f8f5f2]">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl text-[#8B5E3C] font-bold uppercase">Kết quả tìm kiếm</h2>
                    <div className="w-20 h-1 bg-[#8B5E3C] mx-auto mt-4"></div>
                    <p className="text-xl text-gray-600 mt-4">
                        Tìm kiếm cho: <span className="font-semibold italic">"{query}"</span>
                    </p>
                </div>
            </section>

            {/* Products Section */}
            <section className="py-12 px-8 bg-white">
                <div className="container mx-auto">
                    {loading && (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Đang tải kết quả...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8">
                            <p className="text-red-500">{error}</p>
                        </div>
                    )}

                    {!loading && !error && products.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Không tìm thấy sản phẩm nào phù hợp.</p>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                        {products.map((item, index) => (
                            <a
                                key={index}
                                href={`/product?id=${item.id}`}
                                className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-dotted pb-4 hover:bg-[#f1ebe6] transition gap-2"
                            >
                                <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex justify-between items-center border-l-4 border-[#8B5E3C] w-full">
                                    <div className="flex-grow flex items-center gap-4">
                                        <img
                                            src={item.imageUrl || "/default.png"}
                                            alt={item.name}
                                            className="w-18 h-18 rounded-full object-cover border-2 border-[#8B5E3C] flex-shrink-0"
                                        />
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-gray-800 text-lg mb-1">{item.name}</h3>
                                            <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
                                        </div>
                                        <div className="text-right min-w-[100px]">
                                            <span className="block font-bold text-[#8B5E3C] text-lg">
                                                {item.price.toLocaleString("vi-VN")}đ
                                            </span>
                                            <div className="text-sm mt-2">
                                                {item.status?.toUpperCase() === "AVAILABLE" && (
                                                    <span className="inline-block px-2 py-1 text-green-600 bg-green-100 rounded-full font-semibold">Còn hàng</span>
                                                )}
                                                {item.status?.toUpperCase() === "OUT_OF_STOCK" && (
                                                    <span className="inline-block px-2 py-1 text-red-600 bg-red-100 rounded-full font-semibold">Hết hàng</span>
                                                )}
                                                {item.status?.toUpperCase() === "DISCONTINUED" && (
                                                    <span className="inline-block px-2 py-1 text-gray-500 bg-gray-100 rounded-full font-semibold">Ngừng bán</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}