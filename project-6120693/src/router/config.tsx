import { RouteObject, Navigate } from "react-router-dom";
import { lazy } from "react";

const Login = lazy(() => import("../pages/login/page"));
const Register = lazy(() => import("../pages/register/page"));
const Dashboard = lazy(() => import("../pages/dashboard/page"));
const Comments = lazy(() => import("../pages/comments/page"));
const Trends = lazy(() => import("../pages/trends/page"));
const AIContent = lazy(() => import("../pages/ai-content/page"));
const Settings = lazy(() => import("../pages/settings/page"));
const Privacy = lazy(() => import("../pages/privacy/page"));
const Terms = lazy(() => import("../pages/terms/page"));
const DataDeletion = lazy(() => import("../pages/data-deletion/page"));
const DataDeletionInfo = lazy(() => import("../pages/data-deletion-info/page"));
const NotFound = lazy(() => import("../pages/NotFound"));

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/comments",
    element: <Comments />,
  },
  {
    path: "/trends",
    element: <Trends />,
  },
  {
    path: "/ai-content",
    element: <AIContent />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/privacy",
    element: <Privacy />,
  },
  {
    path: "/data-deletion",
    element: <DataDeletion />,
  },
  {
    path: "/data-deletion-info",
    element: <DataDeletionInfo />,
  },
  {
    path: "/terms",
    element: <Terms />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
