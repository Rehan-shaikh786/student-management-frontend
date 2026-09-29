import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Edit,
    Mail,
    MapPin,
    User,
    Calendar,
    GraduationCap,
    Hash,
} from "lucide-react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

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

    useEffect(() => {
        let cancelled = false;

        const loadStudent = async () => {
            if (!id) {
                if (!cancelled) {
                    setError("Invalid student ID.");
                    setLoading(false);
                }

                return;
            }

            try {
                setError("");

                const response = await api.get(
                    `/students/${id}`
                );

                if (cancelled) {
                    return;
                }

                const studentData = response.data;

                setStudent(studentData);

                setFormData({
                    name: studentData.name || "",
                    email: studentData.email || "",
                    age: studentData.age ?? "",
                    city: studentData.city || "",
                });
            } catch (requestError) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Student profile loading error:",
                    requestError
                );

                setError(
                    requestError.response?.data?.message ||
                    "Unable to load student profile."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadStudent().catch((requestError) => {
            if (cancelled) {
                return;
            }

            console.error(
                "Unexpected student profile error:",
                requestError
            );

            setError(
                "Unable to load student profile."
            );

            setLoading(false);
        });

        return () => {
            cancelled = true;
        };
    }, [id]);

    const showToast = (
        message,
        type = "success"
    ) => {
        setToast({
            message,
            type,
        });

        window.setTimeout(() => {
            setToast({
                message: "",
                type: "success",
            });
        }, 3000);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const openEditModal = () => {
        if (!student) {
            return;
        }

        setFormData({
            name: student.name || "",
            email: student.email || "",
            age: student.age ?? "",
            city: student.city || "",
        });

        setIsModalOpen(true);
    };

    const closeEditModal = () => {
        if (saving) {
            return;
        }

        setIsModalOpen(false);
    };

    const validateForm = () => {
        const name = formData.name.trim();
        const email = formData.email.trim();
        const city = formData.city.trim();
        const age = Number(formData.age);

        if (!name) {
            showToast(
                "Student name is required.",
                "error"
            );

            return false;
        }

        if (name.length < 2) {
            showToast(
                "Student name must contain at least 2 characters.",
                "error"
            );

            return false;
        }

        if (!email) {
            showToast(
                "Student email is required.",
                "error"
            );

            return false;
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            showToast(
                "Please enter a valid email address.",
                "error"
            );

            return false;
        }

        if (!formData.age) {
            showToast(
                "Student age is required.",
                "error"
            );

            return false;
        }

        if (
            !Number.isInteger(age) ||
            age < 1 ||
            age > 120
        ) {
            showToast(
                "Age must be between 1 and 120.",
                "error"
            );

            return false;
        }

        if (!city) {
            showToast(
                "Student city is required.",
                "error"
            );

            return false;
        }

        return true;
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        if (saving) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            const studentData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                age: Number(formData.age),
                city: formData.city.trim(),
            };

            const response = await api.put(
                `/students/${id}`,
                studentData
            );

            const updatedStudent = response.data;

            setStudent(updatedStudent);

            setFormData({
                name: updatedStudent.name || "",
                email: updatedStudent.email || "",
                age: updatedStudent.age ?? "",
                city: updatedStudent.city || "",
            });

            setIsModalOpen(false);

            showToast(
                "Student updated successfully."
            );
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
        return (
            <Loading message="Loading student profile..." />
        );
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
                        onClick={() =>
                            navigate("/students")
                        }
                    >
                        <ArrowLeft size={18} />
                        Back to Students
                    </button>
                </div>
            </div>
        );
    }

    const studentName =
        student.name || "Student";

    const initial = studentName
        .charAt(0)
        .toUpperCase();

    return (
        <>
            {/* PAGE HEADER */}
            <div className="page-header">
                <div>
                    <div
                        style={{
                            marginBottom: "10px",
                        }}
                    >
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
                        View and manage student information.
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

            {/* PROFILE GRID */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "minmax(280px, 0.8fr) minmax(320px, 2fr)",
                    gap: "24px",
                    alignItems: "stretch",
                }}
            >
                {/* PROFILE CARD */}
                <div
                    className="card"
                    style={{
                        padding: "32px",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            width: "104px",
                            height: "104px",
                            borderRadius: "50%",
                            margin: "0 auto 18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                                "linear-gradient(135deg, #2563eb, #4f46e5)",
                            color: "#ffffff",
                            fontSize: "38px",
                            fontWeight: 800,
                            boxShadow:
                                "0 12px 30px rgba(37, 99, 235, 0.22)",
                        }}
                    >
                        {initial}
                    </div>

                    <h2
                        style={{
                            margin: "0 0 8px",
                            fontSize: "24px",
                            color: "#0f172a",
                            fontWeight: 750,
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
                        Student ID #{student.id}
                    </p>

                    <div
                        style={{
                            marginTop: "24px",
                            paddingTop: "20px",
                            borderTop:
                                "1px solid #e2e8f0",
                        }}
                    >
                        <span className="badge badge-success">
                            Active Student
                        </span>
                    </div>

                    <div
                        style={{
                            marginTop: "24px",
                            padding: "14px",
                            borderRadius: "12px",
                            background: "#f8fafc",
                            textAlign: "left",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "9px",
                                marginBottom: "7px",
                                color: "#2563eb",
                            }}
                        >
                            <GraduationCap
                                size={18}
                            />

                            <span
                                style={{
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    color: "#64748b",
                                }}
                            >
                                STUDENT
                            </span>
                        </div>

                        <p
                            style={{
                                margin: 0,
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#0f172a",
                            }}
                        >
                            Registered student
                        </p>
                    </div>
                </div>

                {/* INFORMATION CARD */}
                <div
                    className="card"
                    style={{
                        padding: "28px",
                    }}
                >
                    <div
                        style={{
                            marginBottom: "24px",
                        }}
                    >
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
                            Basic information about this
                            student.
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
                        {/* EMAIL */}
                        <div
                            style={{
                                padding: "18px",
                                border:
                                    "1px solid #e2e8f0",
                                borderRadius: "12px",
                                background: "#f8fafc",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    gap: "10px",
                                    marginBottom: "10px",
                                    color: "#2563eb",
                                }}
                            >
                                <Mail size={18} />

                                <span
                                    style={{
                                        fontSize: "12px",
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
                                    wordBreak:
                                        "break-word",
                                }}
                            >
                                {student.email ||
                                    "Not available"}
                            </div>
                        </div>

                        {/* AGE */}
                        <div
                            style={{
                                padding: "18px",
                                border:
                                    "1px solid #e2e8f0",
                                borderRadius: "12px",
                                background: "#f8fafc",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    gap: "10px",
                                    marginBottom: "10px",
                                    color: "#2563eb",
                                }}
                            >
                                <User size={18} />

                                <span
                                    style={{
                                        fontSize: "12px",
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

                        {/* CITY */}
                        <div
                            style={{
                                padding: "18px",
                                border:
                                    "1px solid #e2e8f0",
                                borderRadius: "12px",
                                background: "#f8fafc",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    gap: "10px",
                                    marginBottom: "10px",
                                    color: "#2563eb",
                                }}
                            >
                                <MapPin size={18} />

                                <span
                                    style={{
                                        fontSize: "12px",
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

                        {/* STUDENT ID */}
                        <div
                            style={{
                                padding: "18px",
                                border:
                                    "1px solid #e2e8f0",
                                borderRadius: "12px",
                                background: "#f8fafc",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    gap: "10px",
                                    marginBottom: "10px",
                                    color: "#2563eb",
                                }}
                            >
                                <Hash size={18} />

                                <span
                                    style={{
                                        fontSize: "12px",
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

                        {/* NAME */}
                        <div
                            style={{
                                padding: "18px",
                                border:
                                    "1px solid #e2e8f0",
                                borderRadius: "12px",
                                background: "#f8fafc",
                                gridColumn:
                                    "1 / -1",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    gap: "10px",
                                    marginBottom: "10px",
                                    color: "#2563eb",
                                }}
                            >
                                <User size={18} />

                                <span
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        color: "#64748b",
                                    }}
                                >
                                    FULL NAME
                                </span>
                            </div>

                            <div
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    color: "#0f172a",
                                }}
                            >
                                {studentName}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* EDIT MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeEditModal}
                title="Edit Student"
                size="medium"
            >
                <form onSubmit={handleUpdate}>
                    <div className="form-group">
                        <label
                            htmlFor="student-profile-name"
                            className="form-label"
                        >
                            Full Name
                        </label>

                        <input
                            id="student-profile-name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter student name"
                            className="form-input"
                            disabled={saving}
                            autoComplete="name"
                        />
                    </div>

                    <div className="form-group">
                        <label
                            htmlFor="student-profile-email"
                            className="form-label"
                        >
                            Email
                        </label>

                        <input
                            id="student-profile-email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            className="form-input"
                            disabled={saving}
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label
                                htmlFor="student-profile-age"
                                className="form-label"
                            >
                                Age
                            </label>

                            <input
                                id="student-profile-age"
                                name="age"
                                type="number"
                                min="1"
                                max="120"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="Enter age"
                                className="form-input"
                                disabled={saving}
                            />
                        </div>

                        <div className="form-group">
                            <label
                                htmlFor="student-profile-city"
                                className="form-label"
                            >
                                City
                            </label>

                            <input
                                id="student-profile-city"
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
                            onClick={closeEditModal}
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

            {/* TOAST */}
            <div className="toast-container">
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
            </div>
        </>
    );
};

export default StudentProfile;