interface Rating {
    id: number; // ID của đánh giá
    productId: number; // ID của sản phẩm được đánh giá
    userName: string; // ID của người dùng đã đánh giá
    ratingValue: number; // Điểm đánh giá (1-5)
    comment: string; // Bình luận của người dùng
    createdAt: string; // Ngày tạo đánh giá
    updatedAt: string; // Ngày cập nhật đánh giá
}