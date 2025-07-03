interface Product {
    id: number;
    namePro: string;
    price: number;
    description: string;
    imageUrl: string; // ảnh đại diện
    imagesDTO: Images[]; // danh sách ảnh
    categoryId: number;
    status: string; // trạng thái sản phẩm (còn hàng, hết hàng, sắp có hàng)
    rating: Rating[];
    averageRating: number;
    createdAt: string | Date;
    updatedAt: string | Date;
    categoryName: string;
}