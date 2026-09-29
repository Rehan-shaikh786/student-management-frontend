import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Edit,
    Eye,
    Plus,
    Search,
    Trash2,
    Users,
    UserPlus,
    MapPin,
    Mail,
    Calendar,
    Phone,
    UserRound,
    X,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../services/api";
import useAuth from "../context/useAuth";

import Modal from "../components/Modal";
import Loading from "../components/Loading";
import Toast from "../components/Toast";

const EMPTY_FORM = {
    name: "",
    email: "",
    phone: "",
    gender: "",
    age: "",
    city: "",
};

const Students = () => {
    const { isAdmin } = useAuth();

    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteStudent, setDeleteStudent] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null);

    const [formData, setFormData] = useState({
        ...EMPTY_FORM,
    });

    const [toast, setToast] = useState({
        message: "",
        type: "success",
    });

    useEffect(() => {
        let cancelled = false;

        const fetchStudents = async () => {
            try {
                const response = await api.get("/students");

                if (cancelled) {
                    return;
                }

                setStudents(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error("Students API error:", err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load students."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchStudents().catch((err) => {
            console.error(
                "Unexpected students loading error:",
                err
            );

            if (!cancelled) {
                setError("Failed to load students.");
                setLoading(false);
            }
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const refreshStudents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/students");

            setStudents(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error(
                "Students refresh error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load students."
            );
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = "success") => {
        setToast({
            message,
            type,
        });
    };

    const closeToast = useCallback(() => {
        setToast({
            message: "",
            type: "success",
        });
    }, []);
    const filteredStudents = useMemo(() => {
        const text = search.trim().toLowerCase();

        if (!text) {
            return students;
        }

        return students.filter((student) => {
            return (
                String(student.id || "")
                    .toLowerCase()
                    .includes(text) ||
                String(student.name || "")
                    .toLowerCase()
                    .includes(text) ||
                String(student.email || "")
                    .toLowerCase()
                    .includes(text) ||
                String(student.phone || "")
                    .toLowerCase()
                    .includes(text) ||
                String(student.gender || "")
                    .toLowerCase()
                    .includes(text) ||
                String(student.city || "")
                    .toLowerCase()
                    .includes(text) ||
                String(student.age || "")
                    .toLowerCase()
                    .includes(text)
            );
        });
    }, [students, search]);

    const openAddModal = () => {
        setEditingStudent(null);

        setFormData({
            ...EMPTY_FORM,
        });

        setIsModalOpen(true);
    };

    const openEditModal = (student) => {
        setEditingStudent(student);

        setFormData({
            name: student.name || "",
            email: student.email || "",
            phone: student.phone || "",
            gender: student.gender || "",
            age: student.age ?? "",
            city: student.city || "",
        });

        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (saving) {
            return;
        }

        setIsModalOpen(false);
        setEditingStudent(null);

        setFormData({
            ...EMPTY_FORM,
        });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const validateForm = () => {
        const name = formData.name.trim();
        const email = formData.email.trim();
        const phone = formData.phone.trim();
        const gender = formData.gender.trim();
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

        if (!phone) {
            showToast(
                "Phone number is required.",
                "error"
            );
            return false;
        }

        const phonePattern = /^[0-9]{10}$/;

        if (!phonePattern.test(phone)) {
            showToast(
                "Phone number must contain exactly 10 digits.",
                "error"
            );
            return false;
        }

        if (!gender) {
            showToast(
                "Please select gender.",
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

    const handleSubmit = async (event) => {
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
                phone: formData.phone.trim(),
                gender: formData.gender.trim(),
                age: Number(formData.age),
                city: formData.city.trim(),
            };

            if (editingStudent) {
                await api.put(
                    `/students/${editingStudent.id}`,
                    studentData
                );

                showToast(
                    "Student updated successfully."
                );
            } else {
                await api.post(
                    "/students",
                    studentData
                );

                showToast(
                    "Student added successfully."
                );
            }

            setIsModalOpen(false);
            setEditingStudent(null);

            setFormData({
                ...EMPTY_FORM,
            });

            await refreshStudents();
        } catch (err) {
            console.error(
                "Student save error:",
                err
            );

            showToast(
                err.response?.data?.message ||
                "Failed to save student.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const openDeleteModal = (student) => {
        setDeleteStudent(student);
    };

    const closeDeleteModal = () => {
        if (deleting) {
            return;
        }

        setDeleteStudent(null);
    };

    const handleDelete = async () => {
        if (!deleteStudent || deleting) {
            return;
        }

        try {
            setDeleting(true);

            await api.delete(
                `/students/${deleteStudent.id}`
            );

            showToast(
                "Student deleted successfully."
            );

            setDeleteStudent(null);

            await refreshStudents();
        } catch (err) {
            console.error(
                "Student delete error:",
                err
            );

            showToast(
                err.response?.data?.message ||
                "Failed to delete student.",
                "error"
            );
        } finally {
            setDeleting(false);
        }
    };

    const clearSearch = () => {
        setSearch("");
    };

    if (loading) {
        return (
            <Loading message="Loading students..." />
        );
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "5px",
                        }}
                    >
                        <div
                            style={{
                                width: "38px",
                                height: "38px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "10px",
                                background: "#eff6ff",
                                color: "#2563eb",
                            }}
                        >
                            <Users size={20} />
                        </div>

                        <h2 className="page-title">
                            Students
                        </h2>
                    </div>

                    <p className="page-description">
                        Manage student information,
                        profiles and records.
                    </p>
                </div>

                {isAdmin && (
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={openAddModal}
                    >
                        <Plus size={18} />
                        Add Student
                    </button>
                )}
            </div>

            {error && (
                <div className="alert alert-error">
                    <span>{error}</span>

                    <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => {
                            refreshStudents().catch(
                                (err) => {
                                    console.error(
                                        "Retry error:",
                                        err
                                    );
                                }
                            );
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="card students-card">
                <div className="table-toolbar">
                    <div>
                        <h3 className="card-title">
                            Student Directory
                        </h3>

                        <p className="card-subtitle">
                            {search
                                ? `${filteredStudents.length} of ${students.length} students`
                                : `${students.length} ${
                                    students.length === 1
                                        ? "student"
                                        : "students"
                                } registered`}
                        </p>
                    </div>

                    <div
                        className="search-box"
                        style={{
                            position: "relative",
                        }}
                    >
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search name, email, city..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                aria-label="Clear search"
                                style={{
                                    border: "none",
                                    background:
                                        "transparent",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    padding: "2px",
                                    color: "#94a3b8",
                                }}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            {search ? (
                                <Search size={28} />
                            ) : (
                                <Users size={28} />
                            )}
                        </div>

                        <h3>
                            {search
                                ? "No students found"
                                : "No students available"}
                        </h3>

                        <p>
                            {search
                                ? "Try a different name, email or city."
                                : "Add your first student to get started."}
                        </p>

                        {!search && isAdmin && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={
                                    openAddModal
                                }
                                style={{
                                    marginTop: "14px",
                                }}
                            >
                                <UserPlus size={17} />
                                Add First Student
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Student</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Gender</th>
                                <th>Age</th>
                                <th>City</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredStudents.map(
                                (student) => (
                                    <tr
                                        key={
                                            student.id
                                        }
                                    >
                                        <td>
                                                <span className="table-id">
                                                    #
                                                    {
                                                        student.id
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                            <div className="table-user">
                                                <div className="avatar avatar-blue">
                                                    {(
                                                        student.name ||
                                                        "U"
                                                    )
                                                        .charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}
                                                </div>

                                                <div
                                                    style={{
                                                        minWidth:
                                                            0,
                                                    }}
                                                >
                                                    <strong>
                                                        {
                                                            student.name
                                                        }
                                                    </strong>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: "7px",
                                                    minWidth:
                                                        0,
                                                }}
                                            >
                                                <Mail
                                                    size={
                                                        14
                                                    }
                                                    style={{
                                                        color: "#94a3b8",
                                                        flexShrink: 0,
                                                    }}
                                                />

                                                <span
                                                    style={{
                                                        overflow:
                                                            "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        whiteSpace:
                                                            "nowrap",
                                                    }}
                                                >
                                                        {
                                                            student.email
                                                        }
                                                    </span>
                                            </div>
                                        </td>

                                        <td>
                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: "6px",
                                                }}
                                            >
                                                <Phone
                                                    size={
                                                        14
                                                    }
                                                    style={{
                                                        color: "#94a3b8",
                                                    }}
                                                />
                                                {
                                                    student.phone
                                                }
                                            </div>
                                        </td>

                                        <td>
                                                <span className="badge badge-blue">
                                                    {
                                                        student.gender
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: "6px",
                                                }}
                                            >
                                                <Calendar
                                                    size={
                                                        14
                                                    }
                                                    style={{
                                                        color: "#94a3b8",
                                                    }}
                                                />
                                                {
                                                    student.age
                                                }
                                            </div>
                                        </td>

                                        <td>
                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: "6px",
                                                }}
                                            >
                                                <MapPin
                                                    size={
                                                        14
                                                    }
                                                    style={{
                                                        color: "#94a3b8",
                                                    }}
                                                />
                                                {
                                                    student.city
                                                }
                                            </div>
                                        </td>

                                        <td>
                                            <div className="table-actions">
                                                <Link
                                                    to={`/students/${student.id}`}
                                                    className="btn btn-icon"
                                                    title="View profile"
                                                >
                                                    <Eye
                                                        size={
                                                            17
                                                        }
                                                    />
                                                </Link>

                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="btn btn-icon btn-edit"
                                                            title="Edit student"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    student
                                                                )
                                                            }
                                                        >
                                                            <Edit
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-icon btn-danger"
                                                            title="Delete student"
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    student
                                                                )
                                                            }
                                                        >
                                                            <Trash2
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ADD / EDIT MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={
                    editingStudent
                        ? "Edit Student"
                        : "Add New Student"
                }
                size="medium"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label
                            htmlFor="student-name"
                            className="form-label"
                        >
                            Full Name
                        </label>

                        <input
                            id="student-name"
                            type="text"
                            name="name"
                            className="form-input"
                            placeholder="Enter student name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={saving}
                            autoComplete="name"
                        />
                    </div>

                    <div className="form-group">
                        <label
                            htmlFor="student-email"
                            className="form-label"
                        >
                            Email
                        </label>

                        <input
                            id="student-email"
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="student@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={saving}
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label
                                htmlFor="student-phone"
                                className="form-label"
                            >
                                Phone Number
                            </label>

                            <input
                                id="student-phone"
                                type="tel"
                                name="phone"
                                className="form-input"
                                placeholder="10 digit phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={saving}
                                maxLength={10}
                                inputMode="numeric"
                            />
                        </div>

                        <div className="form-group">
                            <label
                                htmlFor="student-gender"
                                className="form-label"
                            >
                                Gender
                            </label>

                            <div
                                style={{
                                    position: "relative",
                                }}
                            >
                                <UserRound
                                    size={17}
                                    style={{
                                        position:
                                            "absolute",
                                        left: "12px",
                                        top: "50%",
                                        transform:
                                            "translateY(-50%)",
                                        color: "#94a3b8",
                                        pointerEvents:
                                            "none",
                                    }}
                                />

                                <select
                                    id="student-gender"
                                    name="gender"
                                    className="form-input"
                                    value={
                                        formData.gender
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={saving}
                                    style={{
                                        paddingLeft:
                                            "38px",
                                    }}
                                >
                                    <option value="">
                                        Select gender
                                    </option>
                                    <option value="MALE">
                                        Male
                                    </option>
                                    <option value="FEMALE">
                                        Female
                                    </option>
                                    <option value="OTHER">
                                        Other
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label
                                htmlFor="student-age"
                                className="form-label"
                            >
                                Age
                            </label>

                            <input
                                id="student-age"
                                type="number"
                                name="age"
                                className="form-input"
                                placeholder="Age"
                                min="1"
                                max="120"
                                value={formData.age}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </div>

                        <div className="form-group">
                            <label
                                htmlFor="student-city"
                                className="form-label"
                            >
                                City
                            </label>

                            <input
                                id="student-city"
                                type="text"
                                name="city"
                                className="form-input"
                                placeholder="City"
                                value={formData.city}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={closeModal}
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
                                : editingStudent
                                    ? "Update Student"
                                    : "Add Student"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* DELETE MODAL */}
            <Modal
                isOpen={Boolean(deleteStudent)}
                onClose={closeDeleteModal}
                title="Delete Student"
                size="small"
            >
                {deleteStudent && (
                    <div>
                        <div
                            style={{
                                width: "54px",
                                height: "54px",
                                display: "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                margin: "0 auto 16px",
                                borderRadius: "50%",
                                background: "#fef2f2",
                                color: "#dc2626",
                            }}
                        >
                            <Trash2 size={25} />
                        </div>

                        <div
                            style={{
                                textAlign: "center",
                            }}
                        >
                            <h3
                                style={{
                                    margin: "0 0 8px",
                                    fontSize: "17px",
                                    color: "#111827",
                                }}
                            >
                                Delete this student?
                            </h3>

                            <p
                                style={{
                                    margin: "0 auto",
                                    maxWidth: "340px",
                                    color: "#64748b",
                                    fontSize: "13px",
                                    lineHeight: 1.6,
                                }}
                            >
                                You are about to delete{" "}
                                <strong
                                    style={{
                                        color: "#334155",
                                    }}
                                >
                                    {deleteStudent.name}
                                </strong>
                                . This action cannot
                                be undone.
                            </p>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={
                                    closeDeleteModal
                                }
                                disabled={deleting}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                <Trash2 size={16} />

                                {deleting
                                    ? "Deleting..."
                                    : "Delete Student"}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* TOAST */}
            <div className="toast-container">
                {/* CENTERED SUCCESS / ERROR POPUP */}
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
            </div>
        </>
    );
};

export default Students;