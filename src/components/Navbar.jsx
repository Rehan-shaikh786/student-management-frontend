import { useState } from "react";
import {
    Bell,
    Search,
    X,
    CheckCircle,
    Info,
    AlertCircle,
    CheckCheck,
    Mail,
    ShieldCheck,
    LogOut,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import useAuth from "../context/useAuth";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const pageInfo = {
        "/dashboard": {
            title: "Dashboard",
            subtitle: "Overview of your student management system",
        },
        "/students": {
            title: "Students",
            subtitle: "Manage and view student records",
        },
        "/courses": {
            title: "Courses",
            subtitle: "Manage available courses",
        },
        "/enrollments": {
            title: "Enrollments",
            subtitle: "Track student course enrollments",
        },
    };

    const currentPage =
        pageInfo[location.pathname] || {
            title: "Student Management",
            subtitle: "Manage your system",
        };

    const notifications = [
        {
            id: 1,
            type: "success",
            title: "System is running",
            message: "Student Management System is working normally.",
            time: "Now",
        },
        {
            id: 2,
            type: "info",
            title: "Dashboard updated",
            message: "Your latest student and enrollment data is available.",
            time: "Recently",
        },
        {
            id: 3,
            type: "warning",
            title: "Review enrollments",
            message: "Check recent course enrollments for updates.",
            time: "Today",
        },
    ];

    const handleSearch = (event) => {
        event.preventDefault();

        const value = searchText.trim().toLowerCase();

        if (!value) return;

        if (
            value.includes("student") ||
            value.includes("students")
        ) {
            navigate("/students");
        } else if (
            value.includes("course") ||
            value.includes("courses")
        ) {
            navigate("/courses");
        } else if (
            value.includes("enrollment") ||
            value.includes("enrollments")
        ) {
            navigate("/enrollments");
        }

        setSearchText("");
        setSearchOpen(false);
    };

    const handleNotificationClick = (notification) => {
        if (
            notification.title
                .toLowerCase()
                .includes("enrollment")
        ) {
            navigate("/enrollments");
        } else if (
            notification.title
                .toLowerCase()
                .includes("student")
        ) {
            navigate("/students");
        }

        setNotificationOpen(false);
    };

    const handleProfileToggle = () => {
        setProfileOpen((previous) => !previous);
        setNotificationOpen(false);
        setSearchOpen(false);
    };

    const handleLogout = () => {
        setProfileOpen(false);
        logout();
    };

    return (
        <header className="top-navbar">

            <div className="navbar-page-info">
                <div>
                    <h1>{currentPage.title}</h1>

                    <p className="navbar-subtitle">
                        {currentPage.subtitle}
                    </p>
                </div>
            </div>

            <div className="navbar-actions">

                {/* SEARCH */}
                {searchOpen ? (
                    <form
                        className="navbar-search-form"
                        onSubmit={handleSearch}
                    >
                        <Search size={17} />

                        <input
                            type="text"
                            value={searchText}
                            onChange={(event) =>
                                setSearchText(event.target.value)
                            }
                            placeholder="Search students, courses..."
                            autoFocus
                        />

                        <button
                            type="button"
                            onClick={() => {
                                setSearchOpen(false);
                                setSearchText("");
                            }}
                            aria-label="Close search"
                            title="Close"
                        >
                            <X size={16} />
                        </button>
                    </form>
                ) : (
                    <button
                        type="button"
                        className="navbar-icon-button"
                        onClick={() => {
                            setSearchOpen(true);
                            setNotificationOpen(false);
                            setProfileOpen(false);
                        }}
                        aria-label="Search"
                        title="Search"
                    >
                        <Search size={19} />
                    </button>
                )}

                {/* NOTIFICATIONS */}
                <div className="notification-wrapper">

                    <button
                        type="button"
                        className="navbar-icon-button notification-button"
                        onClick={() => {
                            setNotificationOpen(
                                (previous) => !previous
                            );
                            setSearchOpen(false);
                            setProfileOpen(false);
                        }}
                        aria-label="Notifications"
                        title="Notifications"
                    >
                        <Bell size={19} />

                        <span className="notification-dot"></span>
                    </button>

                    {notificationOpen && (
                        <div className="notification-dropdown">

                            <div className="notification-header">
                                <div>
                                    <h3>Notifications</h3>

                                    <span>
                                        {notifications.length} updates
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="notification-close"
                                    onClick={() =>
                                        setNotificationOpen(false)
                                    }
                                    aria-label="Close notifications"
                                >
                                    <X size={17} />
                                </button>
                            </div>

                            <div className="notification-list">

                                {notifications.map(
                                    (notification) => {
                                        const Icon =
                                            notification.type ===
                                            "success"
                                                ? CheckCircle
                                                : notification.type ===
                                                "warning"
                                                    ? AlertCircle
                                                    : Info;

                                        return (
                                            <button
                                                type="button"
                                                className="notification-item"
                                                key={notification.id}
                                                onClick={() =>
                                                    handleNotificationClick(
                                                        notification
                                                    )
                                                }
                                            >
                                                <div
                                                    className={`notification-item-icon notification-${notification.type}`}
                                                >
                                                    <Icon size={17} />
                                                </div>

                                                <div className="notification-content">
                                                    <strong>
                                                        {
                                                            notification.title
                                                        }
                                                    </strong>

                                                    <p>
                                                        {
                                                            notification.message
                                                        }
                                                    </p>

                                                    <span>
                                                        {
                                                            notification.time
                                                        }
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    }
                                )}

                            </div>

                            <div className="notification-footer">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setNotificationOpen(false)
                                    }
                                >
                                    <CheckCheck size={15} />
                                    Mark all as read
                                </button>
                            </div>

                        </div>
                    )}
                </div>

                {/* DIVIDER */}
                <div className="navbar-divider"></div>

                {/* USER PROFILE */}
                <div className="profile-wrapper">

                    <button
                        type="button"
                        className="navbar-user profile-trigger"
                        onClick={handleProfileToggle}
                        aria-label="Open profile menu"
                        title="Profile"
                    >
                        <div className="avatar avatar-blue">
                            {(user?.name || "U")
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="navbar-user-info">
                            <strong>
                                {user?.name || "User"}
                            </strong>

                            <span>
                                {user?.role || "USER"}
                            </span>
                        </div>
                    </button>

                    {profileOpen && (
                        <div className="profile-dropdown">

                            <div className="profile-dropdown-header">

                                <div className="profile-dropdown-avatar">
                                    {(user?.name || "U")
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div className="profile-dropdown-user">
                                    <strong>
                                        {user?.name || "User"}
                                    </strong>

                                    <span>
                                        {user?.role || "USER"}
                                    </span>
                                </div>

                            </div>

                            <div className="profile-dropdown-divider"></div>

                            <div className="profile-information">

                                <div className="profile-info-row">
                                    <Mail size={16} />

                                    <div>
                                        <span>Email</span>

                                        <strong>
                                            {user?.email ||
                                                "No email available"}
                                        </strong>
                                    </div>
                                </div>

                                <div className="profile-info-row">
                                    <ShieldCheck size={16} />

                                    <div>
                                        <span>Access level</span>

                                        <strong>
                                            {user?.role ||
                                                "USER"}
                                        </strong>
                                    </div>
                                </div>

                            </div>

                            <div className="profile-dropdown-divider"></div>

                            <button
                                type="button"
                                className="profile-logout-button"
                                onClick={handleLogout}
                            >
                                <LogOut size={17} />
                                Logout
                            </button>

                        </div>
                    )}

                </div>

            </div>
        </header>
    );
};

export default Navbar;