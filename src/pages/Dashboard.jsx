import { useEffect, useState } from "react";
import {
    ArrowUpRight,
    BookOpen,
    ClipboardList,
    GraduationCap,
    Plus,
    Users,
    UserPlus,
    Sparkles,
    TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../services/api";
import useAuth from "../context/useAuth";
import Loading from "../components/Loading";
import "../styles/dashboard.css";

const Dashboard = () => {
    const { user, isAdmin } = useAuth();

    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [studentsRes, coursesRes, enrollmentsRes] =
                    await Promise.all([
                        api.get("/students"),
                        api.get("/courses"),
                        api.get("/enrollments"),
                    ]);

                setStudents(studentsRes.data || []);
                setCourses(coursesRes.data || []);
                setEnrollments(enrollmentsRes.data || []);
            } catch (error) {
                console.error("Dashboard error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return <Loading message="Loading dashboard..." />;
    }

    const recentEnrollments = [...enrollments]
        .sort(
            (a, b) =>
                (b.enrollmentId || 0) - (a.enrollmentId || 0)
        )
        .slice(0, 5);

    const recentStudents = students.slice(-4).reverse();

    return (
        <div className="modern-dashboard">

            {/* HERO */}
            <section className="dashboard-hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <Sparkles size={15} />
                        Student Management System
                    </div>

                    <h1>
                        Welcome back,{" "}
                        <span>{user?.name || "User"}</span> 👋
                    </h1>

                    <p>
                        Manage your students, courses and enrollments
                        from one simple dashboard.
                    </p>

                    <div className="hero-actions">
                        <Link
                            to="/students"
                            className="dashboard-primary-btn"
                        >
                            <Users size={18} />
                            View Students
                            <ArrowUpRight size={17} />
                        </Link>

                        <Link
                            to="/enrollments"
                            className="dashboard-secondary-btn"
                        >
                            View Enrollments
                        </Link>
                    </div>
                </div>

                <div className="hero-illustration">
                    <div className="hero-circle hero-circle-one"></div>
                    <div className="hero-circle hero-circle-two"></div>

                    <div className="hero-icon-card">
                        <GraduationCap size={48} />
                    </div>

                    <div className="floating-card floating-card-top">
                        <TrendingUp size={18} />
                        <div>
                            <strong>{enrollments.length}</strong>
                            <span>Enrollments</span>
                        </div>
                    </div>

                    <div className="floating-card floating-card-bottom">
                        <Users size={18} />
                        <div>
                            <strong>{students.length}</strong>
                            <span>Students</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section className="modern-stats-grid">

                <div className="modern-stat-card stat-blue">
                    <div className="modern-stat-top">
                        <div className="modern-stat-icon">
                            <Users size={22} />
                        </div>

                        <span className="stat-mini-label">
                            Students
                        </span>
                    </div>

                    <div className="modern-stat-number">
                        {students.length}
                    </div>

                    <div className="modern-stat-footer">
                        <span>Total registered students</span>

                        <Link to="/students">
                            <ArrowUpRight size={17} />
                        </Link>
                    </div>
                </div>

                <div className="modern-stat-card stat-purple">
                    <div className="modern-stat-top">
                        <div className="modern-stat-icon">
                            <BookOpen size={22} />
                        </div>

                        <span className="stat-mini-label">
                            Courses
                        </span>
                    </div>

                    <div className="modern-stat-number">
                        {courses.length}
                    </div>

                    <div className="modern-stat-footer">
                        <span>Available courses</span>

                        <Link to="/courses">
                            <ArrowUpRight size={17} />
                        </Link>
                    </div>
                </div>

                <div className="modern-stat-card stat-green">
                    <div className="modern-stat-top">
                        <div className="modern-stat-icon">
                            <ClipboardList size={22} />
                        </div>

                        <span className="stat-mini-label">
                            Enrollments
                        </span>
                    </div>

                    <div className="modern-stat-number">
                        {enrollments.length}
                    </div>

                    <div className="modern-stat-footer">
                        <span>Active enrollments</span>

                        <Link to="/enrollments">
                            <ArrowUpRight size={17} />
                        </Link>
                    </div>
                </div>

                <div className="modern-stat-card stat-orange">
                    <div className="modern-stat-top">
                        <div className="modern-stat-icon">
                            <GraduationCap size={22} />
                        </div>

                        <span className="stat-mini-label">
                            Account
                        </span>
                    </div>

                    <div className="modern-role-value">
                        {user?.role || "USER"}
                    </div>

                    <div className="modern-stat-footer">
                        <span>
                            {isAdmin
                                ? "Administrator access"
                                : "Student access"}
                        </span>

                        <span className="role-dot"></span>
                    </div>
                </div>
            </section>

            {/* MAIN GRID */}
            <section className="dashboard-main-grid">

                {/* RECENT ENROLLMENTS */}
                <div className="dashboard-panel enrollment-panel">

                    <div className="panel-header">
                        <div>
                            <div className="panel-title-row">
                                <div className="panel-title-icon purple">
                                    <ClipboardList size={19} />
                                </div>

                                <h2>Recent Enrollments</h2>
                            </div>

                            <p>
                                Latest course enrollment activity
                            </p>
                        </div>

                        <Link
                            to="/enrollments"
                            className="panel-view-link"
                        >
                            View all
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>

                    {recentEnrollments.length === 0 ? (
                        <div className="dashboard-empty">
                            <ClipboardList size={35} />
                            <h3>No enrollments yet</h3>
                            <p>
                                Enrollment activity will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="enrollment-list">
                            {recentEnrollments.map((enrollment) => (
                                <div
                                    className="enrollment-row"
                                    key={enrollment.enrollmentId}
                                >
                                    <div className="enrollment-student">
                                        <div className="student-avatar">
                                            {(
                                                enrollment.studentName ||
                                                "U"
                                            )
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="enrollment-person">
                                            <strong>
                                                {enrollment.studentName ||
                                                    "Unknown Student"}
                                            </strong>

                                            <span>
                                                {enrollment.studentEmail ||
                                                    "No email"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="enrollment-course">
                                        <strong>
                                            {enrollment.courseName ||
                                                "Unknown Course"}
                                        </strong>

                                        <span>
                                            {enrollment.courseCode ||
                                                "N/A"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RECENT STUDENTS */}
                <div className="dashboard-panel">

                    <div className="panel-header">
                        <div>
                            <div className="panel-title-row">
                                <div className="panel-title-icon blue">
                                    <Users size={19} />
                                </div>

                                <h2>Students</h2>
                            </div>

                            <p>
                                Recently registered students
                            </p>
                        </div>

                        <Link
                            to="/students"
                            className="panel-view-link"
                        >
                            View all
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>

                    <div className="recent-student-list">
                        {recentStudents.map((student) => (
                            <Link
                                to={`/students/${student.id}`}
                                className="recent-student"
                                key={student.id}
                            >
                                <div className="student-avatar blue-avatar">
                                    {(student.name || "U")
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div className="recent-student-info">
                                    <strong>
                                        {student.name}
                                    </strong>

                                    <span>
                                        {student.email}
                                    </span>
                                </div>

                                <ArrowUpRight size={17} />
                            </Link>
                        ))}
                    </div>

                    {recentStudents.length === 0 && (
                        <div className="dashboard-empty">
                            <Users size={32} />
                            <h3>No students</h3>
                            <p>
                                Registered students will appear here.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* QUICK ACTIONS */}
            <section className="dashboard-panel quick-panel">

                <div className="panel-header">
                    <div>
                        <div className="panel-title-row">
                            <div className="panel-title-icon orange">
                                <Plus size={19} />
                            </div>

                            <h2>Quick Actions</h2>
                        </div>

                        <p>
                            Quickly access the most-used sections
                        </p>
                    </div>
                </div>

                <div className="quick-action-grid">

                    <Link
                        to="/students"
                        className="modern-quick-action"
                    >
                        <div className="quick-action-icon blue">
                            <UserPlus size={22} />
                        </div>

                        <div>
                            <strong>Manage Students</strong>
                            <span>
                                Add, edit and view students
                            </span>
                        </div>

                        <ArrowUpRight size={18} />
                    </Link>

                    <Link
                        to="/courses"
                        className="modern-quick-action"
                    >
                        <div className="quick-action-icon purple">
                            <BookOpen size={22} />
                        </div>

                        <div>
                            <strong>Manage Courses</strong>
                            <span>
                                View and manage courses
                            </span>
                        </div>

                        <ArrowUpRight size={18} />
                    </Link>

                    <Link
                        to="/enrollments"
                        className="modern-quick-action"
                    >
                        <div className="quick-action-icon green">
                            <ClipboardList size={22} />
                        </div>

                        <div>
                            <strong>Manage Enrollments</strong>
                            <span>
                                Track student enrollments
                            </span>
                        </div>

                        <ArrowUpRight size={18} />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;