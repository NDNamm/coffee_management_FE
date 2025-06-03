// SideBar.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "~/components/ConfirmDialog";

export default function SideBar() {
    const [fullName, setFullname] = useState<string | null>(null);
    const navigate = useNavigate();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);

    const handleLogout = () => {
        localStorage.removeItem("fullname");
        localStorage.removeItem("accessToken");
        setConfirmDialogOpen(false);
        navigate("/login");
    };

    useEffect(() => {
        const name = localStorage.getItem("fullname");
        setFullname(name);
    }, []);

    return (
        <>
            <div className="flex flex-col h-screen w-64 bg-[#e8dfd7] text-[#8B5E3C] fixed left-0 top-0 shadow-lg">
                {/* Phần header cố định */}
                <div className="flex items-center h-30 justify-center border-b border-[#e0d6cc] shrink-0 p-4 bg-[#f8f5f2]">
                    <a href="/">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="h-20 rounded-full"
                        />
                    </a>
                </div>

                {/* Phần menu cuộn được */}
                <div className="flex-1 overflow-y-auto py-6">
                    <ul className="space-y-2 px-4">
                        <li>
                            <a
                                href="/admin/dashboard"
                                className="block px-4 py-3 rounded-lg hover:bg-[#8B5E3C] hover:text-white transition-all font-medium"
                            >
                                Dashboard
                            </a>
                        </li>
                        <li>
                            <a
                                href="/admin/category"
                                className="block px-4 py-3 rounded-lg hover:bg-[#8B5E3C] hover:text-white transition-all font-medium"
                            >
                                Category
                            </a>
                        </li>
                        <li>
                            <a
                                href="/admin/product"
                                className="block px-4 py-3 rounded-lg hover:bg-[#8B5E3C] hover:text-white transition-all font-medium"
                            >
                                Product
                            </a>
                        </li>
                        <li>
                            <a
                                href="/admin/order"
                                className="block px-4 py-3 rounded-lg hover:bg-[#8B5E3C] hover:text-white transition-all font-medium"
                            >
                                Order
                            </a>
                        </li>
                        <li>
                            <a
                                href="/admin/users"
                                className="block px-4 py-3 rounded-lg hover:bg-[#8B5E3C] hover:text-white transition-all font-medium"
                            >
                                Users
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Phần footer cố định */}
                <div className="px-4 py-4 border-t border-[#e0d6cc] shrink-0 bg-white">
                    <div className="flex flex-col items-center">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSClMXGbEi5cprRWAF_GvC5x_mTnf7TsGPUgw&s"
                            alt="avatar"
                            className="w-12 h-12 rounded-full mb-2 border-2 border-[#8B5E3C]"
                        />
                        <h2 className="text-md font-semibold mb-3 text-center">{fullName}</h2>
                        <button
                            onClick={() => {
                                setDialogMessage("Bạn có chắc chắn muốn đăng xuất không?");
                                setDialogAction(() => handleLogout);
                                setConfirmDialogOpen(true);
                            }}
                            className="px-6 py-2 bg-[#8B5E3C] text-white rounded-full hover:bg-[#6d4a30] transition-all font-medium text-sm"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={confirmDialogOpen}
                message={dialogMessage}
                onConfirm={() => dialogAction?.()}
                onCancel={() => setConfirmDialogOpen(false)}
            />
        </>
    );
}