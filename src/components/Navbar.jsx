import { Bell, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import useAuth from "../context/useAuth";

const Navbar = () => {
    const { user } = useAuth();
    const location = useLocation();

    const getPageTitle = () => {
        switch (location.pathname) {
            case "/dashboard":
                return "Dashboard";

            case "/students":
                return "Students";

            case "/courses":
                return "Courses";

            case "/enrollments":
                return "Enrollments";

            default:
                return "Student Management";
        }
    };

    const getPageSubtitle = () => {
        switch (location.pathname) {
            case "/dashboard":
                return "Overview of your student management system";

            case "/students":
                return "Manage and view student information";

            case "/courses":
                return "Manage available courses";

            case "/enrollments":
                return "Track student course enrollments";

            default:
                return "Manage your academic information";
        }
    };

    const userInitial = user?.name
        ? user.name.charAt(0).toUpperCase()
        : "U";

    return (
        <header className="navbar">

            {/* ================================================= */}
            {/* PAGE INFORMATION */}
            {/* ================================================= */}

            <div className="navbar-page-info">
                <h1 className="navbar-title">
                    {getPageTitle()}
                </h1>

                <p className="navbar-subtitle">
                    {getPageSubtitle()}
                </p>
            </div>


            {/* ================================================= */}
            {/* RIGHT SIDE */}
            {/* ================================================= */}

            <div className="navbar-actions">

                {/* Search button */}
                <button
                    type="button"
                    className="navbar-icon-button"
                    title="Search"
                >
                    <Search size={19} />
                </button>


                {/* Notification button */}
                <button
                    type="button"
                    className="navbar-icon-button"
                    title="Notifications"
                >
                    <Bell size={19} />

                    <span className="notification-dot"></span>
                </button>


                {/* Divider */}
                <div className="navbar-divider"></div>


                {/* User */}
                <div className="navbar-user">

                    <div className="avatar">
                        {userInitial}
                    </div>

                    <div className="navbar-user-info">
                        <strong>
                            {user?.name || "User"}
                        </strong>

                        <span>
                            {user?.role || "USER"}
                        </span>
                    </div>

                </div>

            </div>

        </header>
    );
};

export default Navbar;