import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Edit,
    Mail,
    MapPin,
    User,
    Calendar,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import useAuth from "../context/useAuth";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import Loading from "../components/Loading";

const StudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        age: "",
        city: "",
    });

    const [toast, setToast] = useState({
        message: "",
        type: "success",
    });

    const showToast = (message, type = "success") => {
        setToast({
            message,
            type,
        });

        setTimeout(() => {
            setToast({
                message: "",
                type: "success",
            });
        }, 3000);
    };

    const fetchStudent = async () => {
        try {
            const response = await api.get(`/students/${id}`);

            return {
                success: true,
                data: response.data,
            };
        } catch (requestError) {
            console.error(
                "Student profile loading error:",
                requestError
            );

            return {
                success: false,
                data: null,
                message:
                    requestError.response?.data?.message ||
                    "Unable to load student profile.",
            };
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeStudent = async () => {
            if (!id) {
                if (mounted) {
                    setError("Invalid student ID.");
                    setLoading(false);
                }
                return;
            }

            const result = await fetchStudent();

            if (!mounted) return;

            if (result.success) {
                setStudent(result.data);

                setFormData({
                    name: result.data.name || "",
                    email: result.data.email || "",
                    age: result.data.age || "",
                    city: result.data.city || "",
                });

                setError("");
            } else {
                setError(result.message);
            }

            setLoading(false);
        };

        initializeStudent();

        return () => {
            mounted = false;
        };
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const openEditModal = () => {
        if (!student) return;

        setFormData({
            name: student.name || "",
            email: student.email || "",
            age: student.age || "",
            city: student.city || "",
        });

        setIsModalOpen(true);
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        if (!formData.name.trim()) {
            showToast("Student name is required.", "error");
            return;
        }

        if (!formData.email.trim()) {
            showToast("Student email is required.", "error");
            return;
        }

        if (!formData.age) {
            showToast("Student age is required.", "error");
            return;
        }

        if (!formData.city.trim()) {
            showToast("Student city is required.", "error");
            return;
        }

        setSaving(true);

        try {
            const response = await api.put(`/students/${id}`, {
                name: formData.name.trim(),
                email: formData.email.trim(),
                age: Number(formData.age),
                city: formData.city.trim(),
            });

            setStudent(response.data);

            setFormData({
                name: response.data.name || "",
                email: response.data.email || "",
                age: response.data.age || "",
                city: response.data.city || "",
            });

            setIsModalOpen(false);

            showToast("Student updated successfully.");
        } catch (requestError) {
            console.error(
                "Student update error:",
                requestError
            );

            showToast(
                requestError.response?.data?.message ||
                "Unable to update student.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loading message="Loading student profile..." />;
    }

    if (error || !student) {
        return (
            <div>
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            Student Profile
                        </h1>

                        <p className="page-description">
                            View student information
                        </p>
                    </div>
                </div>

                <div className="error-container">
                    <div className="error-icon">
                        <User size={28} />
                    </div>

                    <h3>Student not found</h3>

                    <p>
                        {error ||
                            "The requested student could not be found."}
                    </p>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => navigate("/students")}
                    >
                        <ArrowLeft size={18} />
                        Back to Students
                    </button>
                </div>
            </div>
        );
    }

    const studentName = student.name || "Student";
    const initial = studentName.charAt(0).toUpperCase();

    return (
        <>
            <div className="page-header">
                <div>
                    <div style={{ marginBottom: "10px" }}>
                        <Link
                            to="/students"
                            className="back-link"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "#64748b",
                                textDecoration: "none",
                                fontSize: "14px",
                                fontWeight: 600,
                            }}
                        >
                            <ArrowLeft size={17} />
                            Back to Students
                        </Link>
                    </div>

                    <h1 className="page-title">
                        Student Profile
                    </h1>

                    <p className="page-description">
                        View and manage student information
                    </p>
                </div>

                {isAdmin && (
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={openEditModal}
                    >
                        <Edit size={18} />
                        Edit Student
                    </button>
                )}
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "minmax(280px, 1fr) minmax(320px, 2fr)",
                    gap: "24px",
                    alignItems: "stretch",
                }}
            >
                <div
                    className="card"
                    style={{
                        padding: "32px",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            width: "96px",
                            height: "96px",
                            borderRadius: "50%",
                            margin: "0 auto 18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                                "linear-gradient(135deg, #2563eb, #4f46e5)",
                            color: "#ffffff",
                            fontSize: "34px",
                            fontWeight: 800,
                        }}
                    >
                        {initial}
                    </div>

                    <h2
                        style={{
                            margin: "0 0 8px",
                            fontSize: "24px",
                            color: "#0f172a",
                        }}
                    >
                        {studentName}
                    </h2>

                    <p
                        style={{
                            margin: 0,
                            color: "#64748b",
                            fontSize: "14px",
                        }}
                    >
                        Student ID: #{student.id}
                    </p>

                    <div
                        style={{
                            marginTop: "24px",
                            paddingTop: "20px",
                            borderTop: "1px solid #e2e8f0",
                        }}
                    >
                        <span className="badge badge-success">
                            Active Student
                        </span>
                    </div>
                </div>

                <div
                    className="card"
                    style={{
                        padding: "28px",
                    }}
                >
                    <div style={{ marginBottom: "24px" }}>
                        <h2
                            style={{
                                margin: "0 0 6px",
                                fontSize: "20px",
                                color: "#0f172a",
                            }}
                        >
                            Personal Information
                        </h2>

                        <p
                            style={{
                                margin: 0,
                                color: "#64748b",
                                fontSize: "14px",
                            }}
                        >
                            Basic information about this student
                        </p>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(2, minmax(0, 1fr))",
                            gap: "18px",
                        }}
                    >
                        <div
                            style={{
                                padding: "18px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                background: "#f8fafc",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginBottom: "10px",
                                    color: "#2563eb",
                                }}
                            >
                                <Mail size={18} />

                                <span
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: 700,
                                        color: "#64748b",
                                    }}
                                >
                                    EMAIL
                                </span>
                            </div>

                            <div
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    color: "#0f172a",
                                    wordBreak: "break-word",
                                }}
                            >
                                {student.email ||
                                    "Not available"}
                            </div>
                        </div>

                        <div
                            style={{
                                padding: "18px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                background: "#f8fafc",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginBottom: "10px",
                                    color: "#2563eb",
                                }}
                            >
                                <User size={18} />

                                <span
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: 700,
                                        color: "#64748b",
                                    }}
                                >
                                    AGE
                                </span>
                            </div>

                            <div
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    color: "#0f172a",
                                }}
                            >
                                {student.age
                                    ? `${student.age} years`
                                    : "Not available"}
                            </div>
                        </div>

                        <div
                            style={{
                                padding: "18px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                background: "#f8fafc",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginBottom: "10px",
                                    color: "#2563eb",
                                }}
                            >
                                <MapPin size={18} />

                                <span
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: 700,
                                        color: "#64748b",
                                    }}
                                >
                                    CITY
                                </span>
                            </div>

                            <div
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    color: "#0f172a",
                                }}
                            >
                                {student.city ||
                                    "Not available"}
                            </div>
                        </div>

                        <div
                            style={{
                                padding: "18px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                background: "#f8fafc",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginBottom: "10px",
                                    color: "#2563eb",
                                }}
                            >
                                <Calendar size={18} />

                                <span
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: 700,
                                        color: "#64748b",
                                    }}
                                >
                                    STUDENT ID
                                </span>
                            </div>

                            <div
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    color: "#0f172a",
                                }}
                            >
                                #{student.id}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    if (!saving) {
                        setIsModalOpen(false);
                    }
                }}
                title="Edit Student"
                size="medium"
            >
                <form onSubmit={handleUpdate}>
                    <div className="form-group">
                        <label htmlFor="name">
                            Full Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter student name"
                            className="form-input"
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            className="form-input"
                            disabled={saving}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="age">
                                Age
                            </label>

                            <input
                                id="age"
                                name="age"
                                type="number"
                                min="1"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="Enter age"
                                className="form-input"
                                disabled={saving}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="city">
                                City
                            </label>

                            <input
                                id="city"
                                name="city"
                                type="text"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Enter city"
                                className="form-input"
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                                setIsModalOpen(false)
                            }
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>
                    </div>
                </form>
            </Modal>

            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() =>
                    setToast({
                        message: "",
                        type: "success",
                    })
                }
            />
        </>
    );
};

export default StudentProfile;