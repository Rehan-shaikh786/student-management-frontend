import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import AuthProvider from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentProfile from "./pages/StudentProfile";
import Courses from "./pages/Courses";
import Enrollments from "./pages/Enrollments";

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>

                    {/* Public Routes */}
                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>

                            <Route
                                path="/dashboard"
                                element={<Dashboard />}
                            />

                            <Route
                                path="/students"
                                element={<Students />}
                            />

                            <Route
                                path="/students/:id"
                                element={<StudentProfile />}
                            />

                            <Route
                                path="/courses"
                                element={<Courses />}
                            />

                            <Route
                                path="/enrollments"
                                element={<Enrollments />}
                            />

                        </Route>
                    </Route>

                    {/* Default Route */}
                    <Route
                        path="/"
                        element={
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        }
                    />

                    {/* Unknown Route */}
                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        }
                    />

                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;