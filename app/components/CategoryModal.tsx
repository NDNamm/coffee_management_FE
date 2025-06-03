import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import axiosInstance from "../config/axiosInstance";

interface CategoriesDTO {
    id?: number;
    name: string;
    description?: string;
    imageUrl?: string; // Nếu có đường dẫn ảnh lưu rồi
}

interface AddCategoryModalProps {
    open: boolean;
    onClose: () => void;
    onAddOrUpdate: () => void; // callback reload danh sách sau thêm hoặc sửa
    initialCategory?: CategoriesDTO | null; // nếu có thì modal ở trạng thái sửa
}

export default function AddCategoryModal({ open, onClose, onAddOrUpdate, initialCategory }: AddCategoryModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (initialCategory) {
            setName(initialCategory.name || "");
            setDescription(initialCategory.description || "");
            setPreviewUrl(initialCategory.imageUrl || null);
            setImage(null); // ban đầu không đổi ảnh
        } else {
            // reset form nếu không có category sửa
            setName("");
            setDescription("");
            setImage(null);
            setPreviewUrl(null);
        }
    }, [initialCategory, open]);

    const handleSubmit = async () => {
        if (!name) return;

        const categoryDTO = { name, description };
        const formData = new FormData();
        formData.append("categoryDTO", JSON.stringify(categoryDTO));
        if (image) {
            formData.append("image", image);
        }

        try {
            if (initialCategory && initialCategory.id) {
                // Gọi API sửa
                await axiosInstance.put(`/category/update/${initialCategory.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setSuccessMessage("Cập nhật danh mục thành công!");
            } else {
                // Gọi API thêm mới
                if (!image) {
                    alert("Vui lòng chọn ảnh khi thêm danh mục mới.");
                    return;
                }
                await axiosInstance.post("/category/add", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setSuccessMessage("Thêm danh mục thành công!");
            }

            setTimeout(() => {
                onAddOrUpdate();
                onClose();
                setSuccessMessage(null);
                setName("");
                setDescription("");
                setImage(null);
                setPreviewUrl(null);
            }, 1000);
        } catch (error) {
            console.error("Lỗi khi thêm/sửa danh mục:", error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
            <div className="bg-white rounded-xl p-6 z-50 shadow-xl w-[400px]">
                {successMessage && (
                    <div className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4 text-center">{successMessage}</div>
                )}

                <Dialog.Title className="text-lg font-semibold mb-4">
                    {initialCategory ? "Sửa Danh Mục" : "Thêm Danh Mục"}
                </Dialog.Title>

                <input
                    className="w-full border px-3 py-2 mb-3 rounded"
                    placeholder="Tên danh mục"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    className="w-full border px-3 py-2 mb-3 rounded"
                    placeholder="Mô tả"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                {/* Input file ẩn */}
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            setImage(file);
                            setPreviewUrl(URL.createObjectURL(file));
                        }
                    }}
                    className="hidden"
                />

                {/* Hiển thị ảnh nếu có */}
                {previewUrl && (
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded mb-2 border"
                    />
                )}

                {/* Nút chọn ảnh */}
                <label
                    htmlFor="image-upload"
                    className="block bg-indigo-500 hover:bg-indigo-600 text-white text-center cursor-pointer px-4 py-2 rounded mb-4"
                >
                    {image ? "Chọn ảnh khác" : "Chọn ảnh"}
                </label>

                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
                        Hủy
                    </button>
                    <button onClick={handleSubmit} className="bg-blue-500 px-4 py-2 text-white rounded hover:bg-blue-600">
                        {initialCategory ? "Cập nhật" : "Thêm"}
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
