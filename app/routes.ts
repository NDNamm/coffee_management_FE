import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  {
    path: "/",
    file: "routes/HomePage.tsx",
  },
  {
    path: "/login",
    file: "routes/LoginPage.tsx",
  },
  {
    path: "/product",
    file: "routes/ProductPage.tsx",
  },
  {
    path: "/category",
    file: "routes/CategoryPage.tsx",
  },
  {
    path: "/cart",
    file: "routes/CartPage.tsx",
  },
  {
    path: "/order",
    file: "routes/OrderPage.tsx",
  },
  {
    path: "/register",
    file: "routes/RegisterPage.tsx",
  },
  {
    path: "/product/search",
    file: "routes/SearchProductPage.tsx",
  },
  {
    path: "/order/detail/:id",
    file: "routes/OrderDetailPage.tsx"
  },

  // Admin routes
  {
    path: "/admin/dashboard",
    file: "routes/Dashboard.tsx",
  },
  {
    path: "/admin/product",
    file: "routes/admin/Product.tsx",
  },
  {
    path: "/admin/category",
    file: "routes/admin/Category.tsx",
  },
  {
    path: "/admin/order",
    file: "routes/admin/Order.tsx",
  },
  {
    path: "/admin/users",
    file: "routes/admin/Users.tsx",
  },


] satisfies RouteConfig;
