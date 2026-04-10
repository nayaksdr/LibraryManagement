import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import PrivateRoute from "./utils/PrivateRoute";
import IssueBook from "./pages/IssueBook";
import ReturnBook from "./pages/ReturnBook";
import TransactionView from "./pages/TransactionView";
import Members from "./pages/Members";
import BookCategory from "./pages/BookCategory";
import Layout from "./components/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ❌ No Sidebar here */}
        <Route path="/" element={<Login />} />

        {/* ✅ Sidebar वाला Layout */}
        <Route element={<Layout />}>

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/members"
            element={
              <PrivateRoute>
                <Members />
              </PrivateRoute>
            }
          />

          <Route
            path="/book-category"
            element={
              <PrivateRoute>
                <BookCategory />
              </PrivateRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <TransactionView />
              </PrivateRoute>
            }
          />

          <Route
            path="/issue"
            element={
              <PrivateRoute>
                <IssueBook />
              </PrivateRoute>
            }
          />

          <Route
            path="/return"
            element={
              <PrivateRoute>
                <ReturnBook />
              </PrivateRoute>
            }
          />

          <Route
            path="/books"
            element={
              <PrivateRoute>
                <Books />
              </PrivateRoute>
            }
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}