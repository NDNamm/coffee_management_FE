import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "~/components/Header";
import axiosInstance from "../config/axiosInstance";
import { getUserIdFromToken } from "~/utils/authUtils";

export default function Product() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get("id");
  const userId = getUserIdFromToken();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!productId) {
      setError("Không tìm thấy sản phẩm");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`/product/${productId}`);
        setProduct(res.data);
        setLoading(false);
      } catch (err) {
        setError("Lỗi khi tải sản phẩm");
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get(`/rating/${productId}`);
        const ratings = res.data;
        setProduct((prev) =>
          prev ? { ...prev, rating: ratings } : prev
        );
      } catch (error) {
        console.error("Lỗi khi lấy đánh giá:", error);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) return (
    <div className="min-h-screen bg-[#f8f5f2]">
      <Header />
      <div className="max-w-5xl mx-auto px-8 py-12 text-center">
        <p className="text-[#8B5E3C]">Đang tải sản phẩm...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#f8f5f2]">
      <Header />
      <div className="max-w-5xl mx-auto px-8 py-12 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    </div>
  );

  if (!product) return null;

  const handleAddToCart = async () => {
    if (!product) return;
    const cartItemDTO = {
      product: { id: product.id },
      quantity: quantity,
      price: product.price,
    };

    try {
      if (userId) {
        await axiosInstance.post("/cart/add", cartItemDTO);
      } else {
        let sessionId = localStorage.getItem("sessionId");
        if (!sessionId) {
          const newSession = await axiosInstance.post("/cart/session/create");
          sessionId = newSession.data.sessionId;
          localStorage.setItem("sessionId", sessionId!);
        }
        await axiosInstance.post(`cart/session/add?sessionId=${sessionId}`, {
          ...cartItemDTO,
          sessionId,
        });
      }
      alert("Đã thêm vào giỏ hàng thành công!");
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi thêm vào giỏ hàng!");
    }
  };

  const handleSubmitReview = async () => {
    if (!userId) {
      alert("Bạn cần đăng nhập để gửi đánh giá.");
      return;
    }
    if (rating === 0) {
      alert("Vui lòng chọn số sao đánh giá.");
      return;
    }
    setSubmittingReview(true);
    try {
      const reviewDTO = {
        productId: product.id,
        ratingValue: rating,
        comment: comment.trim(),
      };
      const res = await axiosInstance.post("/rating/add", reviewDTO);
      const newReview = res.data;
      setProduct((prev) =>
        prev
          ? {
            ...prev,
            rating: prev.rating ? [newReview, ...prev.rating] : [newReview],
            averageRating:
              prev.rating && prev.rating.length > 0
                ? (
                  (prev.averageRating * prev.rating.length + rating) /
                  (prev.rating.length + 1)
                )
                : rating,
          }
          : prev
      );
      setRating(0);
      setComment("");
      alert("Cảm ơn bạn đã đánh giá!");
    } catch (error) {
      console.error(error);
      alert("Gửi đánh giá thất bại, vui lòng thử lại.");
    }
    setSubmittingReview(false);
  };

  const renderAverageStars = (average?: number) => {
    if (average === undefined || average === null || isNaN(average)) {
      return <span className="text-gray-500">Chưa có đánh giá</span>;
    }

    const rounded = Math.round(average);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-xl ${star <= rounded ? "text-[#8B5E3C]" : "text-gray-300"}`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">({average.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="bg-[#f8f5f2] min-h-screen">
      <Header />
      <section className="max-w-5xl mx-auto px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Product Images */}
            <div className="md:w-1/2">
              <img
                src={product.imageUrl || "/default.png"}
                alt={product.name}
                className="w-full h-96 rounded-lg object-cover mb-4 border-2 border-[#8B5E3C]"
              />
              {product.imagesDTO && product.imagesDTO.length > 1 && (
                <div className="flex gap-3 overflow-x-auto">
                  {product.imagesDTO.map((img) => (
                    <img
                      key={img.id}
                      src={img.imageUrl}
                      alt={`Ảnh phụ ${img.id}`}
                      className="w-20 h-20 border-2 border-gray-300 cursor-pointer hover:border-[#8B5E3C] object-cover rounded"
                      onClick={() =>
                        setProduct((prev) =>
                          prev ? { ...prev, imageUrl: img.imageUrl } : prev
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="md:w-1/2">
              <h1 className="text-3xl font-bold text-[#2f2210] mb-4">{product.name}</h1>

              <div className="mb-6">
                {product.averageRating ? (
                  <div className="flex items-center gap-2">
                    {renderAverageStars(product.averageRating)}
                    <span className="text-sm text-gray-600">
                      ({product.rating?.length || 0} đánh giá)
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500">Chưa có đánh giá</span>
                )}
              </div>

              <p className="text-gray-700 mb-6">{product.description}</p>

              <div className="mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${product.status === "AVAILABLE"
                  ? "bg-green-200 text-green-800"
                  : product.status === "OUT_OF_STOCK"
                    ? "bg-red-200 text-red-800"
                    : "bg-gray-200 text-gray-800"
                  }`}>
                  {product.status === "AVAILABLE" ? "Còn hàng" :
                    product.status === "OUT_OF_STOCK" ? "Hết hàng" : "Ngừng kinh doanh"}
                </span>
              </div>

              <p className="text-2xl font-bold text-[#8B5E3C] mb-6">{product.price.toLocaleString("vi-VN")}đ</p>

              <div className="flex items-center gap-4 mb-8">
                <label htmlFor="quantity" className="font-semibold text-[#2f2210]">
                  Số lượng:
                </label>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={100}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Math.min(100, Number(e.target.value))))
                  }
                  className="w-20 border-2 border-[#8B5E3C] rounded px-3 py-2 text-center focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                />
              </div>

              <button
                disabled={product.status !== "AVAILABLE"}
                onClick={handleAddToCart}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${product.status === "AVAILABLE"
                  ? "bg-[#8B5E3C] text-white hover:bg-[#704326]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                {product.status === "AVAILABLE" ? "Thêm vào giỏ hàng" : "Sản phẩm không khả dụng"}
              </button>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 pt-8 border-t border-[#D6C6B8]">
            <h2 className="text-2xl font-bold text-[#2f2210] mb-6">Đánh giá sản phẩm</h2>

            {product.rating && product.rating.length > 0 ? (
              <div className="space-y-6">
                {product.rating.map((review) => (
                  <div key={review.id} className="border-b border-[#D6C6B8] pb-6 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-[#2f2210]">{review.userName}</h3>
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mb-3">
                      {renderAverageStars(review.ratingValue)}
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Chưa có đánh giá nào.</p>
            )}

            {/* Review Form */}
            <div className="mt-12 bg-[#f8f5f2] p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-[#2f2210] mb-4">Viết đánh giá của bạn</h3>

              <div className="mb-4">
                <label className="block font-medium text-[#2f2210] mb-2">Đánh giá của bạn</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl ${star <= rating ? "text-[#8B5E3C]" : "text-gray-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="comment" className="block font-medium text-[#2f2210] mb-2">
                  Nhận xét
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  className="w-full border-2 border-[#D6C6B8] rounded p-3 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                />
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || !userId}
                className={`px-6 py-2 rounded-lg font-medium ${submittingReview || !userId
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#8B5E3C] text-white hover:bg-[#704326]"
                  }`}
              >
                {!userId ? "Đăng nhập để đánh giá" : submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}