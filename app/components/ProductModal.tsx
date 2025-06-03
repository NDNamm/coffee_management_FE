import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import axiosInstance from "../config/axiosInstance";

interface ProductModalProps {
    open: boolean;
    onClose: () => void;
    onAddOrUpdate: () => void;
    initialProduct?: Product | null;
}

const STATUS_OPTIONS = [
    { value: "DISCONTINUED", label: "Ngừng bán" },
    { value: "OUT_OF_STOCK", label: "Hết hàng" },
    { value: "AVAILABLE", label: "Còn hàng" },
];

export default function ProductModal({
    open,
    onClose,
    onAddOrUpdate,
    initialProduct,
}: ProductModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [status, setStatus] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [categoryList, setCategoryList] = useState<Category[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const firstRes = await axiosInstance.get("/category", {
                    params: { page: 0, size: 1 },
                });
                const totalElements = firstRes.data.totalElements;

                const fullRes = await axiosInstance.get("/category", {
                    params: { page: 0, size: totalElements },
                });
                setCategoryList(fullRes.data.content);
            } catch (error) {
                console.error("Lỗi khi load danh mục:", error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (initialProduct) {
            setName(initialProduct.name || "");
            setDescription(initialProduct.description || "");
            setPrice(initialProduct.price?.toString() || "");
            setStatus(initialProduct.status || "");
            setSelectedCategory(initialProduct.categoryId?.toString() || "");
            setImages([]);
            setPreviewUrls(initialProduct.imagesDTO?.map(img => img.imageUrl) || []);
        } else {
            setName("");
            setDescription("");
            setPrice("");
            setStatus("");
            setSelectedCategory("");
            setImages([]);
            setPreviewUrls([]);
        }
    }, [initialProduct, open]);

    const handleSubmit = async () => {
        if (!name.trim() || !price || !selectedCategory) {
            alert("Vui lòng nhập đầy đủ tên, giá và chọn loại sản phẩm.");
            return;
        }

        const productDTO: any = {
            name,
            description,
            price: parseFloat(price),
        };
        if (status) {
            productDTO.status = status;
        }

        const formData = new FormData();
        const blob = new Blob([JSON.stringify(productDTO)], {
            type: "application/json",
        });
        formData.append("productDTO", blob);
        images.forEach((file) => formData.append("image", file));

        try {
            if (initialProduct?.id) {
                await axiosInstance.put(`/product/update/${initialProduct.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setSuccessMessage("Cập nhật sản phẩm thành công!");
            } else {
                if (images.length === 0) {
                    alert("Vui lòng chọn ít nhất một ảnh.");
                    return; 
                }
                await axiosInstance.post(`/product/add/${selectedCategory}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setSuccessMessage("Thêm sản phẩm thành công!");
            }

            setTimeout(() => {
                onAddOrUpdate();
                onClose();
                setSuccessMessage(null);
            }, 1000);
        } catch (error: any) {
            console.error("Lỗi khi thêm/sửa sản phẩm:", error);
            alert(error.response?.data || "Lỗi không xác định");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
            <div className="bg-white rounded-xl p-6 z-50 shadow-xl w-[400px] overflow-y-auto max-h-[90vh]">
                {successMessage && (
                    <div className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4 text-center">
                        {successMessage}
                    </div>
                )}

                <Dialog.Title className="text-lg font-semibold mb-4">
                    {initialProduct ? "Sửa Sản Phẩm" : "Thêm Sản Phẩm"}
                </Dialog.Title>

                {!initialProduct && (
                    <select
                        className="w-full border px-3 py-2 mb-3 rounded"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">-- Chọn loại sản phẩm --</option>
                        {categoryList.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                )}

                <input
                    className="w-full border px-3 py-2 mb-3 rounded"
                    placeholder="Tên sản phẩm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    className="w-full border px-3 py-2 mb-3 rounded"
                    placeholder="Giá"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />

                {initialProduct && (
                    <select
                        className="w-full border px-3 py-2 mb-3 rounded"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">-- Chọn trạng thái --</option>
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                )}

                <textarea
                    className="w-full border px-3 py-2 mb-3 rounded"
                    placeholder="Mô tả"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setImages(files);
                        setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
                    }}
                    className="hidden"
                />

                {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        {previewUrls.map((url, idx) => (
                            <img
                                key={idx}
                                src={url}
                                alt={`Preview ${idx}`}
                                className="h-24 w-full object-cover rounded border"
                            />
                        ))}
                    </div>
                )}

                <label
                    htmlFor="image-upload"
                    className="block bg-indigo-500 hover:bg-indigo-600 text-white text-center cursor-pointer px-4 py-2 rounded mb-4"
                >
                    {images.length > 0 ? "Chọn ảnh khác" : "Chọn ảnh"}
                </label>

                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-500 px-4 py-2 text-white rounded hover:bg-blue-600"
                    >
                        {initialProduct ? "Cập nhật" : "Thêm"}
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
