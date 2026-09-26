import { useEffect, useState } from "react";
import {
    BookOpen,
    Edit,
    Plus,
    Search,
    Trash2,
} from "lucide-react";

import api from "../services/api";
import useAuth from "../context/useAuth";
import Modal from "../components/Modal";
import Loading from "../components/Loading";
import Toast from "../components/Toast";

const Courses = () => {
    const { isAdmin } = useAuth();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        courseName: "",
        courseCode: "",
        duration: "",
        fees: "",
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

    const fetchCourses = async () => {
        try {
            const response = await api.get("/courses");

            return {
                success: true,
                data: Array.isArray(response.data)
                    ? response.data
                    : [],
            };
        } catch (requestError) {
            console.error("Courses loading error:", requestError);

            return {
                success: false,
                data: [],
                message:
                    requestError.response?.data?.message ||
                    "Unable to load courses.",
            };
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeCourses = async () => {
            const result = await fetchCourses();

            if (!mounted) return;

            if (result.success) {
                setCourses(result.data);
                setError("");
            } else {
                setError(result.message);
            }

            setLoading(false);
        };

        initializeCourses();

        return () => {
            mounted = false;
        };
    }, []);

    const loadCourses = async () => {
        const result = await fetchCourses();

        if (result.success) {
            setCourses(result.data);
            setError("");
        } else {
            setError(result.message);
        }
    };

    const openAddModal = () => {
        setEditingCourse(null);

        setFormData({
            courseName: "",
            courseCode: "",
            duration: "",
            fees: "",
        });

        setIsModalOpen(true);
    };

    const openEditModal = (course) => {
        setEditingCourse(course);

        setFormData({
            courseName: course.courseName || "",
            courseCode: course.courseCode || "",
            duration: course.duration || "",
            fees:
                course.fees !== null &&
                course.fees !== undefined
                    ? String(course.fees)
                    : "",
        });

        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;

        setIsModalOpen(false);
        setEditingCourse(null);

        setFormData({
            courseName: "",
            courseCode: "",
            duration: "",
            fees: "",
        });
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

        if (!formData.courseName.trim()) {
            showToast("Course name is required.", "error");
            return;
        }

        if (!formData.courseCode.trim()) {
            showToast("Course code is required.", "error");
            return;
        }

        if (!formData.duration.trim()) {
            showToast("Course duration is required.", "error");
            return;
        }

        if (!formData.fees || Number(formData.fees) < 0) {
            showToast("Please enter a valid course fee.", "error");
            return;
        }

        setSaving(true);

        const courseData = {
            courseName: formData.courseName.trim(),
            courseCode: formData.courseCode.trim(),
            duration: formData.duration.trim(),
            fees: Number(formData.fees),
        };

        try {
            if (editingCourse) {
                await api.put(
                    `/courses/${editingCourse.id}`,
                    courseData
                );

                showToast("Course updated successfully.");
            } else {
                await api.post("/courses", courseData);

                showToast("Course added successfully.");
            }

            setIsModalOpen(false);
            setEditingCourse(null);

            setFormData({
                courseName: "",
                courseCode: "",
                duration: "",
                fees: "",
            });

            await loadCourses();
        } catch (requestError) {
            console.error("Course save error:", requestError);

            showToast(
                requestError.response?.data?.message ||
                "Unable to save course.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (course) => {
        const courseName =
            course.courseName || "this course";

        const confirmed = window.confirm(
            `Are you sure you want to delete "${courseName}"?`
        );

        if (!confirmed) return;

        try {
            await api.delete(`/courses/${course.id}`);

            setCourses((previous) =>
                previous.filter(
                    (item) => item.id !== course.id
                )
            );

            showToast("Course deleted successfully.");
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
        }
    };

    const filteredCourses = courses.filter((course) => {
        const search = searchTerm.toLowerCase().trim();

        if (!search) return true;

        return (
            String(course.id || "")
                .toLowerCase()
                .includes(search) ||
            String(course.courseName || "")
                .toLowerCase()
                .includes(search) ||
            String(course.courseCode || "")
                .toLowerCase()
                .includes(search) ||
            String(course.duration || "")
                .toLowerCase()
                .includes(search) ||
            String(course.fees || "")
                .toLowerCase()
                .includes(search)
        );
    });

    if (loading) {
        return <Loading message="Loading courses..." />;
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Courses</h1>

                    <p className="page-description">
                        Manage and view available courses
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

            {error && (
                <div
                    className="alert alert-error"
                    style={{
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                    }}
                >
                    <span>{error}</span>

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={loadCourses}
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="card">
                <div className="table-toolbar">
                    <div>
                        <h2 className="card-title">
                            Course List
                        </h2>

                        <p className="card-subtitle">
                            {filteredCourses.length} course
                            {filteredCourses.length !== 1
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

                        <h3>No courses found</h3>

                        <p>
                            {searchTerm
                                ? "Try changing your search."
                                : "No courses have been added yet."}
                        </p>

                        {isAdmin && !searchTerm && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={openAddModal}
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
                                <th>Code</th>
                                <th>Duration</th>
                                <th>Fees</th>

                                {isAdmin && (
                                    <th>Actions</th>
                                )}
                            </tr>
                            </thead>

                            <tbody>
                            {filteredCourses.map(
                                (course) => (
                                    <tr
                                        key={course.id}
                                    >
                                        <td>
                                                <span className="table-id">
                                                    #
                                                    {course.id}
                                                </span>
                                        </td>

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

                                        <td>
                                                <span className="badge badge-blue">
                                                    {
                                                        course.courseCode
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                                <span
                                                    style={{
                                                        color:
                                                            "#64748b",
                                                    }}
                                                >
                                                    {
                                                        course.duration
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                            <strong>
                                                ₹
                                                {Number(
                                                    course.fees ||
                                                    0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </strong>
                                        </td>

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
                                                            handleDelete(
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
                        <label htmlFor="course-name">
                            Course Name
                        </label>

                        <input
                            id="course-name"
                            name="courseName"
                            type="text"
                            value={formData.courseName}
                            onChange={handleChange}
                            placeholder="Enter course name"
                            className="form-input"
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="course-code">
                            Course Code
                        </label>

                        <input
                            id="course-code"
                            name="courseCode"
                            type="text"
                            value={formData.courseCode}
                            onChange={handleChange}
                            placeholder="Example: JFSD"
                            className="form-input"
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="course-duration">
                            Duration
                        </label>

                        <input
                            id="course-duration"
                            name="duration"
                            type="text"
                            value={formData.duration}
                            onChange={handleChange}
                            placeholder="Example: 6 Months"
                            className="form-input"
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="course-fees">
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

export default Courses;