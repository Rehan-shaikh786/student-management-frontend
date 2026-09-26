import { useState } from "react";
import {
    CheckCircle,
    Eye,
    EyeOff,
    GraduationCap,
    Lock,
    Mail,
    User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (
            !name.trim() ||
            !email.trim() ||
            !password.trim() ||
            !confirmPassword.trim()
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (password.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        const result = await register(
            name.trim(),
            email.trim(),
            password
        );

        setLoading(false);

        if (result.success) {
            setSuccess(
                "Account created successfully. Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login", {
                    replace: true,
                });
            }, 1200);
        } else {
            setError(
                result.message ||
                "Registration failed. Please try again."
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
                        START YOUR JOURNEY
                    </span>

                    <h2>
                        Organize learning.
                        <br />
                        Simplify management.
                    </h2>

                    <p>
                        Create your EduManage account and
                        manage students, courses and
                        enrollments from one simple platform.
                    </p>

                    <div className="auth-features">
                        <div className="auth-feature">
                            <CheckCircle size={18} />
                            <span>
                                Centralized student management
                            </span>
                        </div>

                        <div className="auth-feature">
                            <CheckCircle size={18} />
                            <span>
                                Easy course organization
                            </span>
                        </div>

                        <div className="auth-feature">
                            <CheckCircle size={18} />
                            <span>
                                Simple enrollment tracking
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
                        Create account
                    </h1>

                    <p className="auth-subtitle">
                        Register to start using EduManage
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

                    {success && (
                        <div
                            className="alert alert-success"
                            style={{
                                marginBottom: "18px",
                            }}
                        >
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* NAME */}
                        <div className="form-group">
                            <label
                                htmlFor="name"
                                className="form-label"
                            >
                                Full name
                            </label>

                            <div className="input-with-icon">
                                <User size={18} />

                                <input
                                    id="name"
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(event) =>
                                        setName(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="name"
                                    disabled={loading}
                                />
                            </div>
                        </div>

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
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="new-password"
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

                        {/* CONFIRM PASSWORD */}
                        <div className="form-group">
                            <label
                                htmlFor="confirmPassword"
                                className="form-label"
                            >
                                Confirm password
                            </label>

                            <div className="input-with-icon">
                                <Lock size={18} />

                                <input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    className="form-input"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="new-password"
                                    disabled={loading}
                                    style={{
                                        paddingRight: "45px",
                                    }}
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* REGISTER BUTTON */}
                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={loading}
                            style={{
                                height: "44px",
                                marginTop: "4px",
                            }}
                        >
                            {loading
                                ? "Creating account..."
                                : "Create account"}
                        </button>
                    </form>

                    {/* LOGIN LINK */}
                    <div className="auth-footer">
                        Already have an account?{" "}
                        <Link to="/login">
                            Sign in
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Register;