import { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import SideBar from "~/components/SideBar";
import { MdAdd, MdEdit, MdDelete, MdSearch } from "react-icons/md";
import ConfirmDialog from "~/components/ConfirmDialog";
import AddCategoryModal from "~/components/CategoryModal";

export default function Category() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [page, setPage] = useState<number>(0);
    const [size, setSize] = useState<number>(6);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [categoryEditing, setCategoryEditing] = useState<Category | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCategory();
        }, 500); // Debounce search by 500ms

        return () => clearTimeout(timer);
    }, [page, size, searchTerm]);

    const fetchCategory = async () => {
        try {
            setLoading(true);
            let res;
            if (searchTerm.trim()) {
                res = await axiosInstance.get(`/category/search/${searchTerm.trim()}`, {
                    params: { page, size }
                });
            } else {
                res = await axiosInstance.get(`/category`, {
                    params: { page, size }
                });
            }

            if (res.data?.data?.content) {
                setCategories(res.data.data.content);
                setTotalPages(res.data.data.totalPages);
            }

        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await axiosInstance.delete(`/category/delete/${id}`);
            // If we're on the last page and delete the last item, go to previous page
            if (categories.length === 1 && page > 0) {
                setPage(page - 1);
            } else {
                fetchCategory();
            }
            setConfirmDialogOpen(false);
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const handleEditClick = (category: Category) => {
        setCategoryEditing(category);
        setModalOpen(true);
    };

    const handleAddClick = () => {
        setCategoryEditing(null);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setCategoryEditing(null);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(0); // Reset to first page when typing
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCategory();
    };


    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideBar />
            <main className="flex-1 p-8 ml-64">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Category Management</h1>
                    <button
                        type="button"
                        onClick={handleAddClick}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <MdAdd size={20} />
                        Add Category
                    </button>
                </div>

                <div className="mb-4">
                    <form onSubmit={handleSearchSubmit} className="flex items-center max-w-md mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
                        <input
                            type="text"
                            placeholder="Search categories..."
                            className="flex-1 px-4 py-2 focus:outline-none"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                            <MdSearch size={20} />
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-3 text-center">
                                            <div className="animate-pulse flex justify-center">
                                                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : categories.length > 0 ? (
                                    categories.map(cate => (
                                        <tr key={cate.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-3 whitespace-nowrap">{cate.id}</td>
                                            <td className="px-5 py-3 whitespace-nowrap">{cate.nameCate}</td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                {cate.imageUrl && (
                                                    <img
                                                        src={cate.imageUrl}
                                                        alt={cate.nameCate}
                                                        className="h-12 w-16 object-cover rounded"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-5 py-3 max-w-xs truncate">{cate.description}</td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                {new Date(cate.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                {new Date(cate.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditClick(cate)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                        title="Edit"
                                                    >
                                                        <MdEdit size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setDialogMessage("Are you sure you want to delete this category?");
                                                            setDialogAction(() => () => handleDelete(cate.id));
                                                            setConfirmDialogOpen(true);
                                                        }}
                                                        type="button"
                                                        className="text-red-500 hover:text-red-700"
                                                        title="Delete"
                                                    >
                                                        <MdDelete size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                            {searchTerm ? "No matching categories found" : "No categories available"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                                disabled={page === 0}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                                disabled={page >= totalPages - 1}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing page <span className="font-medium">{page + 1}</span> of{' '}
                                    <span className="font-medium">{totalPages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                                        disabled={page === 0}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Previous</span>
                                        &larr;
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === i ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                                        disabled={page >= totalPages - 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Next</span>
                                        &rarr;
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                <ConfirmDialog
                    open={confirmDialogOpen}
                    message={dialogMessage}
                    onConfirm={async () => {
                        if (dialogAction) dialogAction();
                    }}
                    onCancel={() => setConfirmDialogOpen(false)}
                />

                <AddCategoryModal
                    open={modalOpen}
                    onClose={handleModalClose}
                    onAddOrUpdate={fetchCategory}
                    initialCategory={categoryEditing}
                />
            </main>
        </div>
    );
}
