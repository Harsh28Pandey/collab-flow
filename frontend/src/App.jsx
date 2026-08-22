import React, { useContext, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom"
import PrivateRoute from './routes/PrivateRoute.jsx'
import UserProvider, { UserContext } from './context/userContext.jsx'
import { Toaster } from 'react-hot-toast'
import ScrollToTop from './components/ScrollToTop.jsx'

// ✅ Landing page — sabse pehle load hota hai (first paint / LCP), isliye eager import
import Home from './pages/Landing/Home.jsx'

// ✅ Public / Landing — lazy
const Features = lazy(() => import('./pages/Landing/Features.jsx'))
const About = lazy(() => import('./pages/Landing/About.jsx'))
const Playground = lazy(() => import('./pages/Landing/Playground.jsx'))

// ✅ Auth — lazy
const Login = lazy(() => import('./pages/Auth/Login.jsx'))
const SignUp = lazy(() => import('./pages/Auth/SignUp.jsx'))
const VerifyEmail = lazy(() => import('./pages/Auth/VerifyEmail.jsx'))
const Verify = lazy(() => import('./pages/Auth/Verify.jsx'))
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword.jsx'))
const VerifyOTP = lazy(() => import('./pages/Auth/VerifyOTP.jsx'))
const ChangePassword = lazy(() => import('./pages/Auth/ChangePassword.jsx'))

// ✅ Admin — lazy
const Dashboard = lazy(() => import('./pages/Admin/Dashboard.jsx'))
const ManageTasks = lazy(() => import('./pages/Admin/ManageTasks.jsx'))
const CreateTask = lazy(() => import('./pages/Admin/CreateTask.jsx'))
const ManageUsers = lazy(() => import('./pages/Admin/ManageUsers.jsx'))
const AdminGroups = lazy(() => import('./pages/Admin/AdminGroups.jsx'))
const ManagePolls = lazy(() => import('./pages/Admin/ManagePolls.jsx'))
const Expenses = lazy(() => import('./pages/Admin/Expenses.jsx'))
const ManageExpenses = lazy(() => import('./pages/Admin/ManageExpenses.jsx'))
const AddExpense = lazy(() => import('./pages/Admin/AddExpense.jsx'))
const Budgets = lazy(() => import('./pages/Admin/Budgets.jsx'))
const ExpenseAnalytics = lazy(() => import('./pages/Admin/ExpenseAnalytics.jsx'))
const ManageHolidays = lazy(() => import('./pages/Admin/ManageHolidays.jsx'))
const FileManager = lazy(() => import('./pages/Admin/FileManager.jsx'))
const MeetingControls = lazy(() => import('./pages/Admin/MeetingControls.jsx'))
const AdminCalendar = lazy(() => import('./pages/Admin/AdminCalendar.jsx'))
const TimeSheet = lazy(() => import('./pages/Admin/TimeSheet.jsx'))
const Settings = lazy(() => import('./pages/Admin/Settings.jsx'))
const ManageProjects = lazy(() => import('./pages/Admin/ManageProjects.jsx'))
const AdminInsights = lazy(() => import('./pages/Admin/Insights.jsx'))
const AdminCollabAI = lazy(() => import('./pages/Admin/CollabAI.jsx'))

// ✅ User — lazy
const UserDashboard = lazy(() => import('./pages/User/UserDashboard.jsx'))
const MyTasks = lazy(() => import('./pages/User/MyTasks.jsx'))
const ViewTaskDetails = lazy(() => import('./pages/User/ViewTaskDetails.jsx'))
const MyGroups = lazy(() => import('./pages/User/MyGroups.jsx'))
const MyPolls = lazy(() => import('./pages/User/MyPolls.jsx'))
const Calendar = lazy(() => import('./pages/User/Calendar.jsx'))
const Files = lazy(() => import('./pages/User/Files.jsx'))
const ProfileSettings = lazy(() => import('./pages/User/ProfileSettings.jsx'))
const MyTimesheets = lazy(() => import('./pages/User/MyTimesheets.jsx'))
const MyHolidays = lazy(() => import('./pages/User/MyHolidays.jsx'))
const MyMeetings = lazy(() => import('./pages/User/MyMeetings.jsx'))
const MyProjects = lazy(() => import('./pages/User/MyProjects.jsx'))
const UserInsights = lazy(() => import('./pages/User/Insights.jsx'))
const UserCollabAI = lazy(() => import('./pages/User/CollabAI.jsx'))

// ✅ Shared — lazy
const ProjectDetails = lazy(() => import('./components/Projects/ProjectDetails.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

// ✅ Lightweight fallback shown while a lazy chunk downloads — pure CSS, no extra JS/image cost
const RouteLoader = () => (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 rounded-full border-2 border-zinc-700 border-t-cyan-400 animate-spin" />
    </div>
);

const App = () => {
    return (
        <UserProvider>
            <div>
                <Router>
                    <ScrollToTop />

                    <Suspense fallback={<RouteLoader />}>
                        <Routes>
                            {/* Public Routes */}
                            <Route path='/' element={<Home />} />
                            <Route path='/features' element={<Features />} />
                            <Route path='/playground' element={<Playground />} />
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
                                <Route path='/admin/projects' element={<ManageProjects />} />
                                <Route path='/admin/projects/:id' element={<ProjectDetails />} />
                                <Route path='/admin/create-task' element={<CreateTask />} />
                                <Route path='/admin/users' element={<ManageUsers />} />
                                <Route path='/admin/groups' element={<AdminGroups />} />
                                <Route path='/admin/polls' element={<ManagePolls />} />
                                <Route path='/admin/expenses' element={<Expenses />} />
                                <Route path='/admin/manage-expenses' element={<ManageExpenses />} />
                                <Route path='/admin/add-expense' element={<AddExpense />} />
                                <Route path='/admin/budgets' element={<Budgets />} />
                                <Route path='/admin/expense-analytics' element={<ExpenseAnalytics />} />
                                <Route path='/admin/holidays' element={<ManageHolidays />} />
                                <Route path='/admin/file-manager' element={<FileManager />} />
                                <Route path='/admin/meeting-controls' element={<MeetingControls />} />
                                <Route path='/admin/calendar' element={<AdminCalendar />} />
                                <Route path='/admin/timesheet' element={<TimeSheet />} />
                                <Route path='/admin/insights' element={<AdminInsights />} />
                                <Route path='/admin/collab-ai' element={<AdminCollabAI />} />
                                <Route path='/admin/settings' element={<Settings />} />
                            </Route>

                            {/* User Routes */}
                            <Route element={<PrivateRoute allowedRoles={["user"]} />}>
                                <Route path='/user/dashboard' element={<UserDashboard />} />
                                <Route path='/user/tasks' element={<MyTasks />} />
                                <Route path='/user/projects' element={<MyProjects />} />
                                <Route path='/user/projects/:id' element={<ProjectDetails />} />
                                <Route path='/user/task-details/:id' element={<ViewTaskDetails />} />
                                <Route path='/user/groups' element={<MyGroups />} />
                                <Route path='/user/polls' element={<MyPolls />} />
                                <Route path='/user/timesheet' element={<MyTimesheets />} />
                                <Route path='/user/holidays' element={<MyHolidays />} />
                                <Route path='/user/meetings' element={<MyMeetings />} />
                                <Route path='/user/calendar' element={<Calendar />} />
                                <Route path='/user/files' element={<Files />} />
                                <Route path='/user/insights' element={<UserInsights />} />
                                <Route path='/user/collab-ai' element={<UserCollabAI />} />
                                <Route path='/user/profile-settings' element={<ProfileSettings />} />
                            </Route>

                            <Route path="*" element={<NotFound />} />

                            {/* Default Route */}
                            {/* <Route path='/' element={<Home />} /> */}
                        </Routes>
                    </Suspense>
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