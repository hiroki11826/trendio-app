
import { RouteObject } from "react-router-dom";
import { lazy } from "react";

const Home = lazy(() => import("../pages/home/page"));
const Login = lazy(() => import("../pages/login/page"));
const Dashboard = lazy(() => import("../pages/dashboard/page"));
const Comments = lazy(() => import("../pages/comments/page"));
const Trends = lazy(() => import("../pages/trends/page"));
const AIContent = lazy(() => import("../pages/ai-content/page"));
const Settings = lazy(() => import("../pages/settings/page"));
const NotFound = lazy(() => import("../pages/NotFound"));

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
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
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
