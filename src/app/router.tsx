import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.tsx";
import { AppLayout } from "../layouts/AppLayout";
import Login from "../pages/Login.tsx";
import { protectedChildRoutes } from "./routes/protectedChildRoutes";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: protectedChildRoutes,
  },
]);
