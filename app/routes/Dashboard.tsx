import { useEffect, useState } from "react";
import axiosInstance from "~/config/axiosInstance";
import SideBar from "~/components/SideBar";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Area
} from "recharts";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

export default function Dashboard() {
    const [dailyRevenue, setDailyRevenue] = useState([]);
    type MonthlyRevenue = { month: string; fullMonth: string; totalAmount: number };
    const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
    const [statusCount, setStatusCount] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const months = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        revenue: 0,
        orderCount: 0
    }));


    useEffect(() => {
        const fetchData = async () => {
            try {
                const today = new Date();
                const lastWeek = new Date(today.setDate(today.getDate() - 7));

                const [dailyRes, monthlyRes, statusRes, productsRes] = await Promise.all([
                    axiosInstance.get(`/dashboard/revenue/daily?fromDate=${lastWeek.toISOString()}&toDate=${new Date().toISOString()}`),
                    axiosInstance.get("/dashboard/revenue/month?year=2025"),
                    axiosInstance.get("/dashboard/orders/status-count"),
                    axiosInstance.get("/dashboard/product/top-selling")
                ]);

                // Xử lý dữ liệu doanh thu ngày
                const fixed7Days = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    return {
                        isoDate: date.toISOString().split("T")[0], // dùng để so sánh
                        date: format(date, "dd/MM"),
                        shortDate: format(date, "dd/MM"),
                    };
                });

                const revenueMap = new Map();
                dailyRes.data.forEach(item => {
                    const key = item.date.split("T")[0]; // yyyy-MM-dd
                    revenueMap.set(key, item);
                });

                const mergedData = fixed7Days.map(d => {
                    const item = revenueMap.get(d.isoDate);
                    return {
                        ...d,
                        totalAmount: item?.revenue || 0,
                        orderCount: item?.orderCount || 0,
                    };
                });

                setDailyRevenue(mergedData);


                // Xử lý dữ liệu doanh thu tháng
                monthlyRes.data.forEach(item => {
                    const index = months.findIndex(m => m.month === item.month);
                    if (index !== -1) {
                        months[index].revenue = item.revenue;
                        months[index].orderCount = item.orderCount || 0;
                    }
                });


                // Gán vào state
                setMonthlyRevenue(months.map(item => ({
                    month: format(new Date(2025, item.month - 1), "MMM", { locale: vi }),
                    fullMonth: format(new Date(2025, item.month - 1), "MMMM", { locale: vi }),
                    totalAmount: item.revenue,
                    orderCount: item.orderCount
                })));


                // Xử lý dữ liệu trạng thái đơn hàng
                setStatusCount(statusRes.data.map(([status, count]) => ({
                    status: status.replace("_", " "),
                    count
                })));

                // Xử lý dữ liệu sản phẩm bán chạy
                setTopProducts(productsRes.data.slice(0, 10).map(item => ({
                    productName: item.productName,
                    shortName: item.productName.length > 15
                        ? `${item.productName.substring(0, 15)}...`
                        : item.productName,
                    totalSold: item.totalSold
                })));

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8E44AD", "#E84393"];

    const formatCurrency = (value) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <SideBar />
                <main className="flex-1 p-8 flex items-center justify-center">
                    <div className="text-xl">Đang tải dữ liệu...</div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideBar />

            {/* Main content với padding left bằng width của SideBar */}
            <main className="flex-1 ml-64 p-6 md:p-8 overflow-auto">
                <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

                <div className="space-y-6">
                    {/* Biểu đồ doanh thu 7 ngày */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="font-semibold mb-4 text-lg">Doanh thu 7 ngày gần nhất</h2>
                        <div className="h-80">
                            {dailyRevenue.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={dailyRevenue}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="shortDate" />
                                        <YAxis yAxisId="left" orientation="left" tickFormatter={(v) => `${v / 1000000}tr`} />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip
                                            formatter={(value, name) =>
                                                name === 'Doanh thu' ? formatCurrency(value) : [`${value} đơn`, name]
                                            }
                                            labelFormatter={(date) => `Ngày ${date}`}
                                        />
                                        <Legend />
                                        <Area
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="orderCount"
                                            name="Số đơn"
                                            fill="#8884d8"
                                            stroke="#8884d8"
                                            fillOpacity={0.2}
                                        />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="totalAmount"
                                            name="Doanh thu"
                                            stroke="#ff7300"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    Không có dữ liệu
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Biểu đồ doanh thu tháng */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="font-semibold mb-4 text-lg">Doanh thu theo tháng (2025)</h2>
                        <div className="h-80">
                            {monthlyRevenue.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyRevenue}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" />
                                        <YAxis yAxisId="left" tickFormatter={(v) => `${v / 1000000}tr`} />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip
                                            formatter={(value, name) =>
                                                name === 'Doanh thu' ? formatCurrency(value) : [`${value} đơn`, name]
                                            }
                                            labelFormatter={(month) => `Tháng ${month}`}
                                        />
                                        <Legend />
                                        <Bar
                                            yAxisId="left"
                                            dataKey="totalAmount"
                                            name="Doanh thu"
                                            fill="#0088FE"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            yAxisId="right"
                                            dataKey="orderCount"
                                            name="Số đơn"
                                            fill="#FF8042"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>

                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    Không có dữ liệu
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Biểu đồ trạng thái đơn hàng */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Biểu đồ trạng thái đơn hàng */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="font-semibold mb-4 text-lg">Trạng thái đơn hàng</h2>
                            <div className="h-80">
                                {statusCount.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusCount}
                                                dataKey="count"
                                                nameKey="status"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                innerRadius={40}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {statusCount.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value} đơn`, 'Số lượng']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        Không có dữ liệu
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Biểu đồ sản phẩm bán chạy */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="font-semibold mb-4 text-lg">Top sản phẩm bán chạy</h2>
                            <div className="h-80">
                                {topProducts.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={topProducts}
                                            layout="vertical"
                                            margin={{ left: 30, right: 20 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis type="number" />
                                            <YAxis
                                                dataKey="shortName"
                                                type="category"
                                                width={110}
                                                tick={{ fontSize: 14 }}
                                            />
                                            <Tooltip
                                                formatter={(value) => [`${value} sản phẩm`, 'Số lượng bán']}
                                                labelFormatter={(name) => `Sản phẩm: ${name}`}
                                            />
                                            <Bar
                                                dataKey="totalSold"
                                                name="Số lượng bán"
                                                fill="#ff7f50"
                                                radius={[0, 4, 4, 0]}
                                            >
                                                {topProducts.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        Không có dữ liệu
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>


    );
}