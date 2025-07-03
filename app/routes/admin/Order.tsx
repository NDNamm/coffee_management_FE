import { useEffect, useState } from "react";
import { MdAdd, MdEdit, MdDelete, MdHistory, MdSearch } from "react-icons/md";
import axiosInstance from "../../config/axiosInstance";
import SideBar from "~/components/SideBar";
import ConfirmDialog from "~/components/ConfirmDialog";
import OrderModal from "~/components/OrderModal";
import OrderHistoryDialog from "~/components/OrderDetailModal";

export default function Order() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [page, setPage] = useState<number>(0);
    const [size, setSize] = useState<number>(8);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [orderEditing, setOrderEditing] = useState<Order | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetail[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 500);

        return () => clearTimeout(timer);
    }, [page, size, searchTerm]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            let res;
            if (searchTerm.trim()) {
                res = await axiosInstance.get(`/order/search/${searchTerm.trim()}`, {
                    params: { page, size }
                });
            } else {
                res = await axiosInstance.get(`/order`, {
                    params: { page, size }
                });
            }

            if (res.data?.data?.content) {
                setOrders(res.data.data.content);
                setTotalPages(res.data.data.totalPages);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
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
        fetchOrders();
    };

    const handleAddClick = () => {
        setOrderEditing(null);
        setModalOpen(true);
    };

    const handleEditClick = (order: Order) => {
        setOrderEditing(order);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setOrderEditing(null);
    };

    const handleShowHistory = async (orderId: number) => {
        try {
            const res = await axiosInstance.get(`/orderDetail/${orderId}`);
            setSelectedOrderDetails(res.data);
            setHistoryDialogOpen(true);
        } catch (err) {
            console.error("Error fetching order history:", err);
        }
    };

    const handleDelete = async (orderId: number, userId: number | null, sessionId?: string) => {
        try {
            await axiosInstance.delete(`/order/delete/${orderId}`);
            // If we're on the last page and delete the last item, go to previous page
            if (orders.length === 1 && page > 0) {
                setPage(page - 1);
            } else {
                fetchOrders();
            }
        } catch (err) {
            console.error("Error deleting order:", err);
        }
        setConfirmDialogOpen(false);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideBar />
            <main className="flex-1 p-8 ml-64">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Order Management</h1>

                </div>


                <div className="mb-4">
                    <form onSubmit={handleSearchSubmit} className="flex items-center max-w-md mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
                        <input
                            type="text"
                            placeholder="Search orders..."
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
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-3 text-center">
                                            <div className="animate-pulse flex justify-center">
                                                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : orders.length > 0 ? (
                                    orders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-3 whitespace-nowrap">{order.id}</td>
                                            <td className="px-3 py-3 whitespace-nowrap">{order.addressDTO
                                                ? `${order.addressDTO.receiverName}`
                                                : <span className="italic text-gray-400">Chưa có ten</span>}</td>

                                            <td className="px-3 py-3 whitespace-nowrap">{order.totalAmount?.toLocaleString()}₫</td>
                                            <td className="px-3 py-3 max-w-xs truncate">{order.addressDTO
                                                ? `${order.addressDTO.phoneNumber}`
                                                : <span className="italic text-gray-400">Chưa có sdt</span>
                                            }</td>
                                            <td className="px-3 py-3 max-w-xs truncate">{order.note}</td>
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <span className={`
                                                    px-2 py-1 rounded-full text-xs font-semibold
                                                    ${order.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : ""}
                                                    ${order.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" : ""}
                                                    ${order.status === "IN_PREPARATION" ? "bg-purple-100 text-purple-800" : ""}
                                                    ${order.status === "SERVED" ? "bg-green-100 text-green-800" : ""}
                                                    ${order.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : ""}
                                                    ${order.status === "CANCELED" ? "bg-red-100 text-red-800" : ""}
                                                `}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap">
                                                {order.addressDTO
                                                    ? `${order.addressDTO.homeAddress} - ${order.addressDTO.commune} - ${order.addressDTO.district} - ${order.addressDTO.city}`
                                                    : <span className="italic text-gray-400">Chưa có địa chỉ</span>
                                                }
                                            </td>


                                            <td className="px-3 py-4 whitespace-nowrap">{order.paymentMethod}</td>
                                            <td className="px-3 py-4 whitespace-nowrap">
                                                {new Date(order.orderDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditClick(order)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                        title="Edit"
                                                    >
                                                        <MdEdit size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setDialogMessage("Are you sure you want to delete this order?");
                                                            setDialogAction(() => () => handleDelete(order.id, order.user?.id ?? null, order.sessionId));
                                                            setConfirmDialogOpen(true);
                                                        }}
                                                        className="text-red-500 hover:text-red-700"
                                                        title="Delete"
                                                    >
                                                        <MdDelete size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleShowHistory(order.id)}
                                                        className="text-purple-500 hover:text-purple-700"
                                                        title="History"
                                                    >
                                                        <MdHistory size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                            No orders found
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

                <OrderModal
                    open={modalOpen}
                    onClose={handleModalClose}
                    onAddOrUpdate={fetchOrders}
                    initialOrder={orderEditing}
                />

                <OrderHistoryDialog
                    open={historyDialogOpen}
                    onClose={() => setHistoryDialogOpen(false)}
                    items={selectedOrderDetails}
                />
            </main >
        </div >
    );
}
