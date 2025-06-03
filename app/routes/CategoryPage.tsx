import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "~/components/Header";
import axiosInstance from "../config/axiosInstance";

export default function Category() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryIdFromURL = queryParams.get("id");

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(7);

  // Lấy danh sách category
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get(`/category?page=${page}&size=${size}`);
        if (res.data && res.data.content) {
          const allCategories: Category[] = res.data.content;
          setCategories(allCategories);

          // Nếu URL có ?id= thì tìm category tương ứng
          if (categoryIdFromURL) {
            const matched = allCategories.find(c => String(c.id) === categoryIdFromURL);
            setSelectedCategory(matched || allCategories[0]);
          } else {
            setSelectedCategory(allCategories[0]);
          }
        }
      } catch (err) {
        console.error("Lỗi khi fetch category:", err);
      }
    };

    fetchCategories();
  }, [page, size, categoryIdFromURL]);

  // Lấy sản phẩm theo category
  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedCategory) return;

      try {
        const res = await axiosInstance.get(`product/select/${selectedCategory.id}`);
        setProducts(res.data || []);
      } catch (err) {
        console.error("Lỗi khi fetch sản phẩm theo category:", err);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  return (
    <div className="bg-white min-h-screen">
      <Header />

      {/* Menu Section */}
      <section className="py-16 px-8 bg-[#f8f5f2]">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-[#8B5E3C] font-bold uppercase">
              {selectedCategory?.name || 'Danh mục sản phẩm'}
            </h2>
            <div className="w-20 h-1 bg-[#8B5E3C] mx-auto mt-4"></div>
            <p className="italic text-gray-500 mt-2">Khám phá hương vị độc đáo</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c)}
                className={`px-5 py-2 rounded-full cursor-pointer border-2 transition-all font-semibold
                                    ${selectedCategory?.id === c.id
                    ? "bg-[#8B5E3C] text-white border-[#8B5E3C]"
                    : "bg-white text-[#8B5E3C] border-[#8B5E3C] hover:bg-[#8B5E3C] hover:text-white"
                  }
                                `}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
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
                      className="w-20 h-20 rounded-full object-cover border-2 border-[#8B5E3C] flex-shrink-0"
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

            {selectedCategory && products.length === 0 && (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">Hiện không có sản phẩm nào trong danh mục này.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}