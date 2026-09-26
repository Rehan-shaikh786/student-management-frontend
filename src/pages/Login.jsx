import { useState } from "react";
import {
    CheckCircle,
    Eye,
    EyeOff,
    GraduationCap,
    Lock,
    Mail,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);

        const result = await login(
            email.trim(),
            password
        );

        setLoading(false);

        if (result.success) {
            navigate("/dashboard", {
                replace: true,
            });
        } else {
            setError(
                result.message ||
                "Invalid email or password."
            );
        }
    };

    return (
        <div className="auth-page">

            {/* LEFT SIDE */}
            <section className="auth-hero">
                <div className="auth-hero-content">

                    <div className="auth-logo">
                        <div className="auth-logo-icon">
                            <GraduationCap size={23} />
                        </div>

                        <strong>EduManage</strong>
                    </div>

                    <span
                        style={{
                            display: "block",
                            marginBottom: "14px",
                            fontSize: "13px",
                            fontWeight: "600",
                            letterSpacing: "0.08em",
                            color: "#a5b4fc",
                        }}
                    >
                        SMART ACADEMIC MANAGEMENT
                    </span>

                    <h2>
                        Manage students.
                        <br />
                        Manage success.
                    </h2>

                    <p>
                        A modern platform for managing
                        students, courses, enrollments and
                        academic information in one place.
                    </p>

                    <div className="auth-features">

                        <div className="auth-feature">
                            <CheckCircle size={18} />
                            <span>
                                Manage student records
                            </span>
                        </div>

                        <div className="auth-feature">
                            <CheckCircle size={18} />
                            <span>
                                Organize academic courses
                            </span>
                        </div>

                        <div className="auth-feature">
                            <CheckCircle size={18} />
                            <span>
                                Track course enrollments
                            </span>
                        </div>

                    </div>
                </div>
            </section>

            {/* RIGHT SIDE */}
            <section className="auth-panel">
                <div className="auth-form-container">

                    {/* MOBILE LOGO */}
                    <div className="auth-mobile-logo auth-logo">
                        <div className="auth-logo-icon">
                            <GraduationCap size={23} />
                        </div>

                        <strong>EduManage</strong>
                    </div>

                    <h1 className="auth-title">
                        Welcome back
                    </h1>

                    <p className="auth-subtitle">
                        Sign in to continue to your dashboard
                    </p>

                    {error && (
                        <div
                            className="alert alert-error"
                            style={{
                                marginBottom: "18px",
                            }}
                        >
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* EMAIL */}
                        <div className="form-group">
                            <label
                                htmlFor="email"
                                className="form-label"
                            >
                                Email address
                            </label>

                            <div className="input-with-icon">
                                <Mail size={18} />

                                <input
                                    id="email"
                                    type="email"
                                    className="form-input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="email"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="form-group">
                            <label
                                htmlFor="password"
                                className="form-label"
                            >
                                Password
                            </label>

                            <div className="input-with-icon">
                                <Lock size={18} />

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="current-password"
                                    disabled={loading}
                                    style={{
                                        paddingRight: "45px",
                                    }}
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* LOGIN BUTTON */}
                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={loading}
                            style={{
                                height: "44px",
                                marginTop: "6px",
                            }}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign in"}
                        </button>
                    </form>

                    {/* REGISTER */}
                    <div className="auth-footer">
                        Don't have an account?{" "}
                        <Link to="/register">
                            Create an account
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Login;