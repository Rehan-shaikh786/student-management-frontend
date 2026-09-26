import {
    BookOpen,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    Users,
    UserRound,
    ClipboardList,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import useAuth from "../context/useAuth";

const Sidebar = () => {
    const { user, isAdmin, logout } = useAuth();

    const menuItems = [
        {
            label: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Students",
            path: "/students",
            icon: Users,
        },
        {
            label: "Courses",
            path: "/courses",
            icon: BookOpen,
        },
        {
            label: "Enrollments",
            path: "/enrollments",
            icon: ClipboardList,
        },
    ];

    return (
        <aside className="sidebar">

            {/* ================================================= */}
            {/* LOGO */}
            {/* ================================================= */}

            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <GraduationCap size={26} />
                </div>

                <div>
                    <h2>EduManage</h2>
                    <span>Student Management</span>
                </div>
            </div>


            {/* ================================================= */}
            {/* NAVIGATION */}
            {/* ================================================= */}

            <nav className="sidebar-nav">

                <p className="sidebar-section-title">
                    MAIN MENU
                </p>

                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${
                                    isActive ? "active" : ""
                                }`
                            }
                        >
                            <Icon size={20} />

                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}


                {/* ================================================= */}
                {/* ADMIN SECTION */}
                {/* ================================================= */}

                {isAdmin && (
                    <>
                        <p className="sidebar-section-title admin-section">
                            ADMIN
                        </p>

                        <NavLink
                            to="/students"
                            className={({ isActive }) =>
                                `sidebar-link ${
                                    isActive ? "active" : ""
                                }`
                            }
                        >
                            <UserRound size={20} />

                            <span>Manage Students</span>
                        </NavLink>

                        <NavLink
                            to="/courses"
                            className={({ isActive }) =>
                                `sidebar-link ${
                                    isActive ? "active" : ""
                                }`
                            }
                        >
                            <BookOpen size={20} />

                            <span>Manage Courses</span>
                        </NavLink>
                    </>
                )}

            </nav>


            {/* ================================================= */}
            {/* USER SECTION */}
            {/* ================================================= */}

            <div className="sidebar-bottom">

                <div className="sidebar-user">

                    <div className="avatar">
                        {user?.name
                            ? user.name
                                .charAt(0)
                                .toUpperCase()
                            : "U"}
                    </div>

                    <div className="sidebar-user-info">
                        <strong>
                            {user?.name || "User"}
                        </strong>

                        <span>
                            {user?.role || "USER"}
                        </span>
                    </div>

                </div>


                {/* Logout */}
                <button
                    type="button"
                    className="sidebar-logout"
                    onClick={logout}
                >
                    <LogOut size={19} />

                    <span>Logout</span>
                </button>

            </div>

        </aside>
    );
};

export default Sidebar;