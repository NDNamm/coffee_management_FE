
interface Order {
    id: number;
    orderDate: string;
    status: string;
    totalAmount: number;
    paymentMethod: string;
    orderDetail: OrderDetail[];
    name: string;
    note: string;
    user?: Users | null;
    sessionId?: string;
    orderDetailDTO: OrderDetail[];
    addressDTO: Address;

}