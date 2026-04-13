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
import YearlyReport from "./pages/YearlyReport";
import NewspaperAttendance from "./pages/NewspaperAttendance";
import MemberAttendancePage from "./pages/MemberAttendancePage";
import MonthlyReport from "./pages/MonthlyReport";
// import NewspaperAttendance from "./pages/NewspaperAttendance";
// import NewspaperMaster from "./pages/NewspaperMaster";
// import NewspaperMembers from "./pages/NewspaperMembers";
// import NewspaperReports from "./pages/NewspaperReports";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ❌ No Sidebar */}
        <Route path="/" element={<Login />} />

        {/* ✅ Layout with Sidebar */}
        <Route element={<Layout />}>

          {/* ── Existing pages ────────────────────────────────── */}
          <Route
            path="/dashboard"
            element={<PrivateRoute><Dashboard /></PrivateRoute>}
          />
          <Route
            path="/members"
            element={<PrivateRoute><Members /></PrivateRoute>}
          />
          <Route
            path="/book-category"
            element={<PrivateRoute><BookCategory /></PrivateRoute>}
          />
          <Route
            path="/transactions"
            element={<PrivateRoute><TransactionView /></PrivateRoute>}
          />
          <Route
            path="/issue"
            element={<PrivateRoute><IssueBook /></PrivateRoute>}
          />
          <Route
            path="/return"
            element={<PrivateRoute><ReturnBook /></PrivateRoute>}
          />
          <Route
            path="/books"
            element={<PrivateRoute><Books /></PrivateRoute>}
          />
          <Route
            path="/yearly-report"
            element={<PrivateRoute><YearlyReport /></PrivateRoute>}
          />
          <Route
            path="/monthly-report"
            element={<PrivateRoute><MonthlyReport /></PrivateRoute>}
          />
          <Route
            path="/member-attendance"
            element={<PrivateRoute><MemberAttendancePage /></PrivateRoute>}
          />
          <Route
            path="/newspaper-attendance"
            element={<PrivateRoute><NewspaperAttendance /></PrivateRoute>}
          />

          {/* ── 📰 Newspaper Attendance section ────────────────
          <Route
            path="/newspaper-attendance"
            element={<PrivateRoute><NewspaperAttendance /></PrivateRoute>}
          />
          <Route
            path="/newspaper-attendance/newspapers"
            element={<PrivateRoute><NewspaperMaster /></PrivateRoute>}
          />
          <Route
            path="/newspaper-attendance/members"
            element={<PrivateRoute><NewspaperMembers /></PrivateRoute>}
          />
          <Route
            path="/newspaper-attendance/reports"
            element={<PrivateRoute><NewspaperReports /></PrivateRoute>}
          /> */}

        </Route>
      </Routes>
    </BrowserRouter>
  );
}