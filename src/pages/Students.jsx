import { useEffect, useState } from "react";
import {
    Edit,
    Eye,
    Plus,
    Search,
    Trash2,
    Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../services/api";
import useAuth from "../context/useAuth";

import Modal from "../components/Modal";
import Loading from "../components/Loading";
import Toast from "../components/Toast";

const Students = () => {
    const { isAdmin } = useAuth();

    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editingStudent, setEditingStudent] = useState(null);

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
        const loadInitialStudents = async () => {
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
                    "Students API error:",
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

        loadInitialStudents().catch((err) => {
            console.error(
                "Unexpected students error:",
                err
            );

            setLoading(false);
            setError("Failed to load students.");
        });
    }, []);

    const loadStudents = async () => {
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
                "Students API error:",
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

    const filteredStudents = students.filter(
        (student) => {
            const text = search.toLowerCase();

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
                String(student.city || "")
                    .toLowerCase()
                    .includes(text)
            );
        }
    );

    const openAddModal = () => {
        setEditingStudent(null);

        setFormData({
            name: "",
            email: "",
            age: "",
            city: "",
        });

        setIsModalOpen(true);
    };

    const openEditModal = (student) => {
        setEditingStudent(student);

        setFormData({
            name: student.name || "",
            email: student.email || "",
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
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name.trim()) {
            showToast(
                "Student name is required.",
                "error"
            );
            return;
        }

        if (!formData.email.trim()) {
            showToast(
                "Student email is required.",
                "error"
            );
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

            await loadStudents();
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

    const handleDelete = async (student) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${student.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/students/${student.id}`
            );

            showToast(
                "Student deleted successfully."
            );

            await loadStudents();
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
        }
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
                    <h2 className="page-title">
                        Students
                    </h2>

                    <p className="page-description">
                        Manage and view student
                        information.
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
                            loadStudents().catch(
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

            <div className="card">
                <div className="table-toolbar">
                    <div>
                        <h3 className="card-title">
                            Student List
                        </h3>

                        <p className="card-subtitle">
                            {students.length}{" "}
                            {students.length === 1
                                ? "student"
                                : "students"}
                        </p>
                    </div>

                    <div className="search-box">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search students..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />
                    </div>
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Users size={28} />
                        </div>

                        <h3>
                            {search
                                ? "No students found"
                                : "No students available"}
                        </h3>

                        <p>
                            {search
                                ? "Try changing your search."
                                : "Add your first student to get started."}
                        </p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Student</th>
                                <th>Email</th>
                                <th>Age</th>
                                <th>City</th>

                                {isAdmin && (
                                    <th>
                                        Actions
                                    </th>
                                )}
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
                                                    {student.name
                                                        ?.charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}
                                                </div>

                                                <strong>
                                                    {
                                                        student.name
                                                    }
                                                </strong>
                                            </div>
                                        </td>

                                        <td>
                                            {
                                                student.email
                                            }
                                        </td>

                                        <td>
                                            {
                                                student.age
                                            }
                                        </td>

                                        <td>
                                            {
                                                student.city
                                            }
                                        </td>

                                        {isAdmin && (
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
                                                            handleDelete(
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
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                )
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={
                    editingStudent
                        ? "Edit Student"
                        : "Add New Student"
                }
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
                            value={formData.name}
                            onChange={handleChange}
                            disabled={saving}
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
                            value={formData.email}
                            onChange={handleChange}
                            disabled={saving}
                        />
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

export default Students;