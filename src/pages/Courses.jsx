import {
    BookOpen,
    Edit,
    Plus,
    Search,
    Trash2,
    Clock,
    IndianRupee,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import useAuth from "../context/useAuth";

import Modal from "../components/Modal";
import Loading from "../components/Loading";
import Toast from "../components/Toast";

const EMPTY_FORM = {
    courseName: "",
    courseCode: "",
    duration: "",
    fees: "",
};

const Courses = () => {
    const { isAdmin } = useAuth();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] =
        useState(false);
    const [courseToDelete, setCourseToDelete] =
        useState(null);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] =
        useState(EMPTY_FORM);

    const [toast, setToast] = useState({
        message: "",
        type: "success",
    });

    useEffect(() => {
        let cancelled = false;

        const loadInitialCourses = async () => {
            try {
                const response = await api.get(
                    "/courses"
                );

                if (cancelled) {
                    return;
                }

                setCourses(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );

                setError("");
            } catch (requestError) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Courses loading error:",
                    requestError
                );

                setError(
                    requestError.response?.data?.message ||
                    "Unable to load courses."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadInitialCourses().catch((requestError) => {
            if (cancelled) {
                return;
            }

            console.error(
                "Unexpected courses loading error:",
                requestError
            );

            setError(
                "Unable to load courses."
            );

            setLoading(false);
        });

        return () => {
            cancelled = true;
        };
    }, []);

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

    const refreshCourses = async () => {
        try {
            setError("");

            const response = await api.get(
                "/courses"
            );

            setCourses(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (requestError) {
            console.error(
                "Courses refresh error:",
                requestError
            );

            setError(
                requestError.response?.data?.message ||
                "Unable to load courses."
            );
        }
    };

    const resetForm = () => {
        setFormData({
            ...EMPTY_FORM,
        });
    };

    const openAddModal = () => {
        setEditingCourse(null);
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (course) => {
        setEditingCourse(course);

        setFormData({
            courseName:
                course.courseName || "",
            courseCode:
                course.courseCode || "",
            duration:
                course.duration || "",
            fees:
                course.fees !== null &&
                course.fees !== undefined
                    ? String(course.fees)
                    : "",
        });

        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (saving) {
            return;
        }

        setIsModalOpen(false);
        setEditingCourse(null);
        resetForm();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const validateForm = () => {
        const courseName =
            formData.courseName.trim();

        const courseCode =
            formData.courseCode.trim();

        const duration =
            formData.duration.trim();

        const fees = Number(formData.fees);

        if (!courseName) {
            showToast(
                "Course name is required.",
                "error"
            );

            return false;
        }

        if (courseName.length < 2) {
            showToast(
                "Course name must contain at least 2 characters.",
                "error"
            );

            return false;
        }

        if (!courseCode) {
            showToast(
                "Course code is required.",
                "error"
            );

            return false;
        }

        if (courseCode.length < 2) {
            showToast(
                "Course code must contain at least 2 characters.",
                "error"
            );

            return false;
        }

        if (!duration) {
            showToast(
                "Course duration is required.",
                "error"
            );

            return false;
        }

        if (!formData.fees) {
            showToast(
                "Course fees are required.",
                "error"
            );

            return false;
        }

        if (
            !Number.isFinite(fees) ||
            fees < 0
        ) {
            showToast(
                "Please enter a valid course fee.",
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

        setSaving(true);

        const courseData = {
            courseName:
                formData.courseName.trim(),

            courseCode:
                formData.courseCode
                    .trim()
                    .toUpperCase(),

            duration:
                formData.duration.trim(),

            fees: Number(formData.fees),
        };

        try {
            if (editingCourse) {
                await api.put(
                    `/courses/${editingCourse.id}`,
                    courseData
                );

                showToast(
                    "Course updated successfully."
                );
            } else {
                await api.post(
                    "/courses",
                    courseData
                );

                showToast(
                    "Course added successfully."
                );
            }

            setIsModalOpen(false);
            setEditingCourse(null);
            resetForm();

            await refreshCourses();
        } catch (requestError) {
            console.error(
                "Course save error:",
                requestError
            );

            showToast(
                requestError.response?.data?.message ||
                "Unable to save course.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const openDeleteModal = (course) => {
        setCourseToDelete(course);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (deleting) {
            return;
        }

        setIsDeleteModalOpen(false);
        setCourseToDelete(null);
    };

    const handleDelete = async () => {
        if (!courseToDelete || deleting) {
            return;
        }

        try {
            setDeleting(true);

            await api.delete(
                `/courses/${courseToDelete.id}`
            );

            setCourses((previous) =>
                previous.filter(
                    (course) =>
                        course.id !==
                        courseToDelete.id
                )
            );

            showToast(
                "Course deleted successfully."
            );

            setIsDeleteModalOpen(false);
            setCourseToDelete(null);
        } catch (requestError) {
            console.error(
                "Course delete error:",
                requestError
            );

            showToast(
                requestError.response?.data?.message ||
                "Unable to delete course.",
                "error"
            );
        } finally {
            setDeleting(false);
        }
    };

    const filteredCourses = courses.filter(
        (course) => {
            const search =
                searchTerm
                    .toLowerCase()
                    .trim();

            if (!search) {
                return true;
            }

            return (
                String(course.id || "")
                    .toLowerCase()
                    .includes(search) ||
                String(
                    course.courseName || ""
                )
                    .toLowerCase()
                    .includes(search) ||
                String(
                    course.courseCode || ""
                )
                    .toLowerCase()
                    .includes(search) ||
                String(
                    course.duration || ""
                )
                    .toLowerCase()
                    .includes(search) ||
                String(course.fees || "")
                    .toLowerCase()
                    .includes(search)
            );
        }
    );

    const formatFees = (fees) => {
        return Number(fees || 0).toLocaleString(
            "en-IN"
        );
    };

    if (loading) {
        return (
            <Loading message="Loading courses..." />
        );
    }

    return (
        <>
            {/* PAGE HEADER */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Courses
                    </h1>

                    <p className="page-description">
                        Manage and view available
                        courses.
                    </p>
                </div>

                {isAdmin && (
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={openAddModal}
                    >
                        <Plus size={18} />
                        Add Course
                    </button>
                )}
            </div>

            {/* ERROR */}
            {error && (
                <div
                    className="alert alert-error"
                    style={{
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "space-between",
                        gap: "16px",
                    }}
                >
                    <span>{error}</span>

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                            refreshCourses().catch(
                                (requestError) =>
                                    console.error(
                                        requestError
                                    )
                            )
                        }
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* COURSE TABLE CARD */}
            <div className="card">
                <div className="table-toolbar">
                    <div>
                        <h2 className="card-title">
                            Course List
                        </h2>

                        <p className="card-subtitle">
                            {filteredCourses.length}{" "}
                            course
                            {filteredCourses.length !==
                            1
                                ? "s"
                                : ""}{" "}
                            found
                        </p>
                    </div>

                    <div className="search-box">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                        />
                    </div>
                </div>

                {filteredCourses.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <BookOpen size={30} />
                        </div>

                        <h3>
                            No courses found
                        </h3>

                        <p>
                            {searchTerm
                                ? "Try changing your search."
                                : "No courses have been added yet."}
                        </p>

                        {isAdmin &&
                            !searchTerm && (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={
                                        openAddModal
                                    }
                                >
                                    <Plus size={18} />
                                    Add First Course
                                </button>
                            )}
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Course</th>
                                <th>
                                    Code
                                </th>
                                <th>
                                    Duration
                                </th>
                                <th>Fees</th>

                                {isAdmin && (
                                    <th>
                                        Actions
                                    </th>
                                )}
                            </tr>
                            </thead>

                            <tbody>
                            {filteredCourses.map(
                                (course) => (
                                    <tr
                                        key={
                                            course.id
                                        }
                                    >
                                        {/* ID */}
                                        <td>
                                                <span className="table-id">
                                                    #
                                                    {
                                                        course.id
                                                    }
                                                </span>
                                        </td>

                                        {/* COURSE */}
                                        <td>
                                            <div className="table-user">
                                                <div className="avatar avatar-blue">
                                                    <BookOpen
                                                        size={
                                                            17
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <strong>
                                                        {
                                                            course.courseName
                                                        }
                                                    </strong>
                                                </div>
                                            </div>
                                        </td>

                                        {/* CODE */}
                                        <td>
                                                <span className="badge badge-blue">
                                                    {
                                                        course.courseCode
                                                    }
                                                </span>
                                        </td>

                                        {/* DURATION */}
                                        <td>
                                            <div
                                                style={{
                                                    display:
                                                        "inline-flex",
                                                    alignItems:
                                                        "center",
                                                    gap: "7px",
                                                    color: "#64748b",
                                                }}
                                            >
                                                <Clock
                                                    size={
                                                        15
                                                    }
                                                />

                                                {
                                                    course.duration
                                                }
                                            </div>
                                        </td>

                                        {/* FEES */}
                                        <td>
                                            <div
                                                style={{
                                                    display:
                                                        "inline-flex",
                                                    alignItems:
                                                        "center",
                                                    gap: "4px",
                                                    fontWeight:
                                                        700,
                                                    color: "#0f172a",
                                                }}
                                            >
                                                <IndianRupee
                                                    size={
                                                        15
                                                    }
                                                />

                                                {formatFees(
                                                    course.fees
                                                )}
                                            </div>
                                        </td>

                                        {/* ACTIONS */}
                                        {isAdmin && (
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        type="button"
                                                        className="btn btn-icon btn-secondary"
                                                        title="Edit course"
                                                        onClick={() =>
                                                            openEditModal(
                                                                course
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
                                                        title="Delete course"
                                                        onClick={() =>
                                                            openDeleteModal(
                                                                course
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

            {/* ADD / EDIT MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={
                    editingCourse
                        ? "Edit Course"
                        : "Add New Course"
                }
                size="medium"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label
                            htmlFor="course-name"
                            className="form-label"
                        >
                            Course Name
                        </label>

                        <input
                            id="course-name"
                            name="courseName"
                            type="text"
                            value={
                                formData.courseName
                            }
                            onChange={handleChange}
                            placeholder="Enter course name"
                            className="form-input"
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label
                            htmlFor="course-code"
                            className="form-label"
                        >
                            Course Code
                        </label>

                        <input
                            id="course-code"
                            name="courseCode"
                            type="text"
                            value={
                                formData.courseCode
                            }
                            onChange={handleChange}
                            placeholder="Example: JFSD"
                            className="form-input"
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label
                            htmlFor="course-duration"
                            className="form-label"
                        >
                            Duration
                        </label>

                        <input
                            id="course-duration"
                            name="duration"
                            type="text"
                            value={
                                formData.duration
                            }
                            onChange={handleChange}
                            placeholder="Example: 6 Months"
                            className="form-input"
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label
                            htmlFor="course-fees"
                            className="form-label"
                        >
                            Fees
                        </label>

                        <input
                            id="course-fees"
                            name="fees"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fees}
                            onChange={handleChange}
                            placeholder="Enter course fees"
                            className="form-input"
                            disabled={saving}
                        />
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
                                : editingCourse
                                    ? "Update Course"
                                    : "Create Course"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* DELETE CONFIRMATION MODAL */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                title="Delete Course"
                size="small"
            >
                <div
                    style={{
                        textAlign: "center",
                        padding: "8px 0 4px",
                    }}
                >
                    <div
                        style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            margin: "0 auto 16px",
                            display: "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            background:
                                "#fef2f2",
                            color: "#dc2626",
                        }}
                    >
                        <Trash2 size={26} />
                    </div>

                    <h3
                        style={{
                            margin:
                                "0 0 8px",
                            color: "#0f172a",
                            fontSize: "18px",
                        }}
                    >
                        Delete this course?
                    </h3>

                    <p
                        style={{
                            margin: 0,
                            color: "#64748b",
                            fontSize: "14px",
                            lineHeight: 1.6,
                        }}
                    >
                        Are you sure you want
                        to delete{" "}
                        <strong>
                            {
                                courseToDelete?.courseName
                            }
                        </strong>
                        ? This action cannot be
                        undone.
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
                        {deleting
                            ? "Deleting..."
                            : "Delete Course"}
                    </button>
                </div>
            </Modal>

            {/* CENTERED TOAST */}
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={closeToast}
            />
        </>
    );
};

export default Courses;