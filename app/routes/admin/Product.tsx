import { useEffect, useState } from "react";
import { MdAdd, MdEdit, MdDelete, MdSearch } from "react-icons/md";
import axiosInstance from "../../config/axiosInstance";
import SideBar from "~/components/SideBar";
import ConfirmDialog from "~/components/ConfirmDialog";
import ProductModal from "~/components/ProductModal";

export default function Product() {
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState<number>(0);
    const [size, setSize] = useState<number>(6);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [productEditing, setProductEditing] = useState<Product | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");


    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 500);

        return () => clearTimeout(timer);
    }, [page, size, searchTerm]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let res;
            if (searchTerm.trim()) {
                res = await axiosInstance.get(`/product/search/${searchTerm.trim()}`, {
                    params: { page, size }
                });
            } else {
                res = await axiosInstance.get(`/product`, {
                    params: { page, size }
                });
            }

            if (res.data?.data?.content) {
                setProducts(res.data.data.content);
                setTotalPages(res.data.data.totalPages);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };



    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(0);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProducts();
    };

    const handleAddClick = () => {
        setProductEditing(null);
        setModalOpen(true);
    };

    const handleEditClick = (product: Product) => {
        setProductEditing(product);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setProductEditing(null);
    };

    const handleDelete = async (id: number) => {
        try {
            await axiosInstance.delete(`/product/delete/${id}`);
            // If we're on the last page and delete the last item, go to previous page
            if (products.length === 1 && page > 0) {
                setPage(page - 1);
            } else {
                fetchProducts();
            }
            setConfirmDialogOpen(false);
        } catch (err) {
            console.error("Error deleting product:", err);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideBar />
            <main className="flex-1 p-8 ml-64">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Product Management</h1>
                    <button
                        type="button"
                        onClick={handleAddClick}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <MdAdd size={20} />
                        Add Product
                    </button>
                </div>


                <div className="mb-4">
                    <form onSubmit={handleSearchSubmit} className="flex items-center max-w-md mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
                        <input
                            type="text"
                            placeholder="Search products..."
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
                                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="px-5 py-2 text-center">
                                            <div className="animate-pulse flex justify-center">
                                                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : products.length > 0 ? (
                                    products.map(product => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-3 whitespace-nowrap">{product.id}</td>
                                            <td className="px-5 py-3 whitespace-nowrap">{product.namePro}</td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                {product.imageUrl?.[0] && (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.namePro}
                                                        className="h-12 w-16 object-cover rounded mx-auto"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-5 py-3 whitespace">{product.price?.toLocaleString()}₫</td>
                                            <td className="px-5 py-3 max-w-xs">{product.description}</td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <span
                                                    className={`
                                                        px-2 py-1 rounded-full text-xs font-semibold
                                                        ${product.status === "AVAILABLE" ? "bg-green-200 text-green-800" : ""}
                                                        ${product.status === "OUT_OF_STOCK" ? "bg-red-200 text-red-800" : ""}
                                                        ${product.status === "DISCONTINUED" ? "bg-gray-300 text-gray-800" : ""}
                                                    `}
                                                >
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="px-5py-3 whitespace-nowrap">
                                                {new Date(product.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                {new Date(product.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditClick(product)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                        title="Edit"
                                                    >
                                                        <MdEdit size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setDialogMessage("Are you sure you want to delete this product?");
                                                            setDialogAction(() => () => handleDelete(product.id));
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
                                        <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                                            No products found
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

                <ProductModal
                    open={modalOpen}
                    onClose={handleModalClose}
                    onAddOrUpdate={fetchProducts}
                    initialProduct={productEditing}
                />
            </main>
        </div>
    );
}