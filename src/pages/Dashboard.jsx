import { useEffect, useState } from "react";
import {
    ArrowRight,
    BookOpen,
    ClipboardList,
    GraduationCap,
    Plus,
    Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../services/api";
import useAuth from "../context/useAuth";
import Loading from "../components/Loading";

const Dashboard = () => {
    const { user, isAdmin } = useAuth();

    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            setError("");

            try {
                const [
                    studentsResponse,
                    coursesResponse,
                    enrollmentsResponse,
                ] = await Promise.all([
                    api.get("/students"),
                    api.get("/courses"),
                    api.get("/enrollments"),
                ]);

                setStudents(
                    Array.isArray(studentsResponse.data)
                        ? studentsResponse.data
                        : []
                );

                setCourses(
                    Array.isArray(coursesResponse.data)
                        ? coursesResponse.data
                        : []
                );

                setEnrollments(
                    Array.isArray(enrollmentsResponse.data)
                        ? enrollmentsResponse.data
                        : []
                );
            } catch (requestError) {
                console.error(
                    "Dashboard loading error:",
                    requestError
                );

                setError(
                    requestError.response?.data?.message ||
                    "Unable to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <Loading message="Loading dashboard..." />
        );
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Good to see you,{" "}
                        {user?.name?.split(" ")[0] || "User"} 👋
                    </h1>

                    <p className="page-description">
                        Here's what's happening in your
                        student management system today.
                    </p>
                </div>
            </div>

            {error && (
                <div
                    className="alert alert-error"
                    style={{ marginBottom: "20px" }}
                >
                    {error}
                </div>
            )}

            {/* STAT CARDS */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-top">
                        <div>
                            <div className="stat-label">
                                Total Students
                            </div>

                            <div className="stat-value">
                                {students.length}
                            </div>
                        </div>

                        <div className="stat-icon stat-icon-blue">
                            <Users size={21} />
                        </div>
                    </div>

                    <Link
                        to="/students"
                        className="stat-link"
                    >
                        View students
                        <ArrowRight size={13} />
                    </Link>
                </div>

                <div className="stat-card">
                    <div className="stat-card-top">
                        <div>
                            <div className="stat-label">
                                Total Courses
                            </div>

                            <div className="stat-value">
                                {courses.length}
                            </div>
                        </div>

                        <div className="stat-icon stat-icon-purple">
                            <BookOpen size={21} />
                        </div>
                    </div>

                    <Link
                        to="/courses"
                        className="stat-link"
                    >
                        View courses
                        <ArrowRight size={13} />
                    </Link>
                </div>

                <div className="stat-card">
                    <div className="stat-card-top">
                        <div>
                            <div className="stat-label">
                                Enrollments
                            </div>

                            <div className="stat-value">
                                {enrollments.length}
                            </div>
                        </div>

                        <div className="stat-icon stat-icon-green">
                            <ClipboardList size={21} />
                        </div>
                    </div>

                    <Link
                        to="/enrollments"
                        className="stat-link"
                    >
                        View enrollments
                        <ArrowRight size={13} />
                    </Link>
                </div>

                <div className="stat-card">
                    <div className="stat-card-top">
                        <div>
                            <div className="stat-label">
                                Your Role
                            </div>

                            <div
                                className="stat-value"
                                style={{ fontSize: "22px" }}
                            >
                                {user?.role || "USER"}
                            </div>
                        </div>

                        <div className="stat-icon stat-icon-orange">
                            <GraduationCap size={21} />
                        </div>
                    </div>

                    <div
                        className="stat-link"
                        style={{ cursor: "default" }}
                    >
                        Account access
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div
                className="card"
                style={{ marginBottom: "24px" }}
            >
                <div className="card-header">
                    <div>
                        <h2 className="card-title">
                            Quick actions
                        </h2>

                        <p className="card-subtitle">
                            Quickly access the main areas of
                            your system.
                        </p>
                    </div>
                </div>

                <div style={{ padding: "20px" }}>
                    <div className="quick-actions">
                        <Link
                            to="/students"
                            className="quick-action"
                        >
                            <div className="quick-action-icon">
                                <Users size={19} />
                            </div>

                            <div>
                                <strong>Students</strong>

                                <span>
                                    View and manage student
                                    records
                                </span>
                            </div>
                        </Link>

                        <Link
                            to="/courses"
                            className="quick-action"
                        >
                            <div className="quick-action-icon">
                                <BookOpen size={19} />
                            </div>

                            <div>
                                <strong>Courses</strong>

                                <span>
                                    Manage available courses
                                </span>
                            </div>
                        </Link>

                        <Link
                            to="/enrollments"
                            className="quick-action"
                        >
                            <div className="quick-action-icon">
                                <ClipboardList size={19} />
                            </div>

                            <div>
                                <strong>Enrollments</strong>

                                <span>
                                    Track course enrollments
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "minmax(0, 1.3fr) minmax(0, 0.7fr)",
                    gap: "18px",
                }}
            >
                {/* SYSTEM OVERVIEW */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h2 className="card-title">
                                System overview
                            </h2>

                            <p className="card-subtitle">
                                Current data in your
                                management system.
                            </p>
                        </div>
                    </div>

                    <div
                        className="overview-list"
                        style={{ padding: "0 22px" }}
                    >
                        <div className="overview-item">
                            <div className="overview-icon">
                                <Users size={18} />
                            </div>

                            <div>
                                <strong>
                                    Student records
                                </strong>

                                <span>
                                    {students.length}{" "}
                                    student
                                    {students.length !== 1
                                        ? "s"
                                        : ""}{" "}
                                    currently registered
                                </span>
                            </div>
                        </div>

                        <div className="overview-item">
                            <div className="overview-icon">
                                <BookOpen size={18} />
                            </div>

                            <div>
                                <strong>
                                    Available courses
                                </strong>

                                <span>
                                    {courses.length}{" "}
                                    course
                                    {courses.length !== 1
                                        ? "s"
                                        : ""}{" "}
                                    available
                                </span>
                            </div>
                        </div>

                        <div className="overview-item">
                            <div className="overview-icon">
                                <ClipboardList size={18} />
                            </div>

                            <div>
                                <strong>
                                    Course enrollments
                                </strong>

                                <span>
                                    {enrollments.length}{" "}
                                    enrollment
                                    {enrollments.length !== 1
                                        ? "s"
                                        : ""}{" "}
                                    recorded
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACCOUNT */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h2 className="card-title">
                                Your account
                            </h2>

                            <p className="card-subtitle">
                                Account information
                            </p>
                        </div>
                    </div>

                    <div style={{ padding: "22px" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "13px",
                                marginBottom: "20px",
                            }}
                        >
                            <div className="avatar">
                                {user?.name
                                    ? user.name
                                        .charAt(0)
                                        .toUpperCase()
                                    : "U"}
                            </div>

                            <div>
                                <strong
                                    style={{
                                        display: "block",
                                        fontSize: "14px",
                                    }}
                                >
                                    {user?.name || "User"}
                                </strong>

                                <span
                                    style={{
                                        display: "block",
                                        marginTop: "3px",
                                        color:
                                            "var(--text-muted)",
                                        fontSize: "11px",
                                    }}
                                >
                                    {user?.email || ""}
                                </span>
                            </div>
                        </div>

                        <div
                            style={{
                                padding: "12px 14px",
                                borderRadius: "10px",
                                background:
                                    "var(--primary-light)",
                                color: "var(--primary)",
                                fontSize: "12px",
                                fontWeight: "600",
                            }}
                        >
                            {isAdmin
                                ? "Administrator access"
                                : "Standard user access"}
                        </div>
                    </div>
                </div>
            </div>

            {/* ADMIN ACTION */}
            {isAdmin && (
                <div
                    className="card"
                    style={{
                        marginTop: "18px",
                        padding: "18px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "15px",
                    }}
                >
                    <div>
                        <strong
                            style={{
                                display: "block",
                                fontSize: "14px",
                            }}
                        >
                            Administrator tools
                        </strong>

                        <span
                            style={{
                                display: "block",
                                marginTop: "4px",
                                color: "var(--text-muted)",
                                fontSize: "12px",
                            }}
                        >
                            Add and manage students and
                            courses.
                        </span>
                    </div>

                    <Link
                        to="/students"
                        className="btn btn-primary"
                    >
                        <Plus size={17} />
                        Manage students
                    </Link>
                </div>
            )}
        </>
    );
};

export default Dashboard;