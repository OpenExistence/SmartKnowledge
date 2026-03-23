import { createBrowserRouter } from "react-router";
import { Login } from "./pages/login";
import { Dashboard } from "./pages/dashboard";
import { Interviews } from "./pages/interviews";
import { InterviewDetail } from "./pages/interview-detail";
import { KnowledgeBase } from "./pages/knowledge-base";
import { UserManagement } from "./pages/user-management";
import { Layout } from "./components/layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "dashboard",
        Component: Dashboard,
      },
      {
        path: "interviews",
        Component: Interviews,
      },
      {
        path: "interviews/:id",
        Component: InterviewDetail,
      },
      {
        path: "knowledge",
        Component: KnowledgeBase,
      },
      {
        path: "admin/users",
        Component: UserManagement,
      },
    ],
  },
]);
