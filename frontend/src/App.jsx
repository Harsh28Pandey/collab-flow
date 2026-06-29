import React, { useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom"
import Login from './pages/Auth/Login.jsx'
import SignUp from './pages/Auth/SignUp.jsx'
import Dashboard from './pages/Admin/Dashboard.jsx'
import ManageTasks from './pages/Admin/ManageTasks.jsx'
import CreateTask from './pages/Admin/CreateTask.jsx'
import ManageUsers from './pages/Admin/ManageUsers.jsx'

import UserDashboard from './pages/User/UserDashboard.jsx'
import MyTasks from './pages/User/MyTasks.jsx'
import ViewTaskDetails from './pages/User/ViewTaskDetails.jsx'

import PrivateRoute from './routes/PrivateRoute.jsx'
import UserProvider, { UserContext } from './context/userContext.jsx'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Landing/Home.jsx'
import Features from './pages/Landing/Features.jsx'
import About from './pages/Landing/About.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import MyGroups from './pages/User/MyGroups.jsx'
import AdminGroups from './pages/Admin/AdminGroups.jsx'
import ManagePolls from './pages/Admin/ManagePolls.jsx'
import MyPolls from './pages/User/MyPolls.jsx'
import VerifyEmail from './pages/Auth/VerifyEmail.jsx'
import Verify from './pages/Auth/Verify.jsx'
import ForgotPassword from './pages/Auth/ForgotPassword.jsx'
import VerifyOTP from './pages/Auth/VerifyOTP.jsx'
import ChangePassword from './pages/Auth/ChangePassword.jsx'
import NotFound from './pages/NotFound.jsx'
import Calendar from './pages/User/Calendar.jsx'
import Files from './pages/User/Files.jsx'
import ProfileSettings from './pages/User/ProfileSettings.jsx'
import FileManager from './pages/Admin/FileManager.jsx'
import TimeSheet from './pages/Admin/TimeSheet.jsx'
import Settings from './pages/Admin/Settings.jsx'
import Expenses from './pages/Admin/Expenses.jsx'
import AddExpense from './pages/Admin/AddExpense.jsx'
import Budgets from './pages/Admin/Budgets.jsx'
import ExpenseAnalytics from './pages/Admin/ExpenseAnalytics.jsx'
import MyExpenses from "./pages/User/MyExpenses.jsx"
import Timesheet from './pages/Admin/TimeSheet.jsx'


const App = () => {
    return (
        <UserProvider>
            <div>
                <Router>
                    <ScrollToTop />

                    <Routes>
                        {/* Public Routes */}
                        <Route path='/' element={<Home />} />
                        <Route path='/features' element={<Features />} />
                        <Route path='/about' element={<About />} />

                        {/* Auth Routes */}
                        <Route path='/login' element={<Login />} />
                        <Route path='/signup' element={<SignUp />} />

                        <Route path='/verify-email' element={<VerifyEmail />} />
                        {/* <Route path='/verify/:token' element={<Verify />} /> */}

                        <Route path='/verify' element={<Verify />} />

                        <Route path='/forgot-password' element={<ForgotPassword />} />
                        <Route path='/verify-otp/:email' element={<VerifyOTP />} />
                        <Route path='/change-password/:email' element={<ChangePassword />} />

                        {/* Admin Routes */}
                        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                            <Route path='/admin/dashboard' element={<Dashboard />} />
                            <Route path='/admin/tasks' element={<ManageTasks />} />
                            <Route path='/admin/create-task' element={<CreateTask />} />
                            <Route path='/admin/users' element={<ManageUsers />} />
                            <Route path='/admin/groups' element={<AdminGroups />} />
                            <Route path='/admin/polls' element={<ManagePolls />} />
                            <Route path='/admin/expenses' element={<Expenses />} />
                            <Route path='/admin/add-expense' element={<AddExpense />} />
                            <Route path='/admin/budgets' element={<Budgets />} />
                            <Route path='/admin/expense-analytics' element={<ExpenseAnalytics />} />
                            <Route path='/admin/file-manager' element={<FileManager />} />
                            <Route path='/admin/timesheet' element={<Timesheet />} />
                            <Route path='/admin/settings' element={<Settings />} />
                        </Route>

                        {/* User Routes */}
                        <Route element={<PrivateRoute allowedRoles={["user"]} />}>
                            <Route path='/user/dashboard' element={<UserDashboard />} />
                            <Route path='/user/tasks' element={<MyTasks />} />
                            <Route path='/user/task-details/:id' element={<ViewTaskDetails />} />
                            <Route path='/user/groups' element={<MyGroups />} />
                            <Route path='/user/polls' element={<MyPolls />} />
                            <Route path='/user/my-expenses' element={<MyExpenses />} />
                            <Route path='/user/calendar' element={<Calendar />} />
                            <Route path='/user/files' element={<Files />} />
                            <Route path='/user/profile-settings' element={<ProfileSettings />} />
                        </Route>

                        <Route path="*" element={<NotFound />} />

                        {/* Default Route */}
                        {/* <Route path='/' element={<Home />} /> */}
                    </Routes>
                </Router>
            </div>

            <Toaster
                toastOptions={{
                    className: '',
                    style: {
                        fontSize: "13px",
                    }
                }}
            />
        </UserProvider>
    )
}

export default App;

const Root = () => {
    const { user, loading } = useContext(UserContext);

    if (loading)
        return <Outlet />

    if (!user) {
        return <Navigate to="/login" />;
    }

    return user.role === "admin" ? <Navigate to="/admin/dashboard" /> : <Navigate to="/user/dashboard" />;
};