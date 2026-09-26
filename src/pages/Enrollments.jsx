import { useEffect, useState } from "react";
import {
    BookOpen,
    ClipboardList,
    Plus,
    Search,
    Trash2,
    UserRound,
} from "lucide-react";

import api from "../services/api";
import useAuth from "../context/useAuth";
import Modal from "../components/Modal";
import Loading from "../components/Loading";
import Toast from "../components/Toast";

const Enrollments = () => {
    const { isAdmin } = useAuth();

    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        studentId: "",
        courseId: "",
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

    const fetchEnrollmentData = async () => {
        try {
            const [
                enrollmentsResponse,
                studentsResponse,
                coursesResponse,
            ] = await Promise.all([
                api.get("/enrollments"),
                api.get("/students"),
                api.get("/courses"),
            ]);

            return {
                success: true,
                enrollments: Array.isArray(
                    enrollmentsResponse.data
                )
                    ? enrollmentsResponse.data
                    : [],
                students: Array.isArray(studentsResponse.data)
                    ? studentsResponse.data
                    : [],
                courses: Array.isArray(coursesResponse.data)
                    ? coursesResponse.data
                    : [],
            };
        } catch (requestError) {
            console.error(
                "Enrollment loading error:",
                requestError
            );

            return {
                success: false,
                enrollments: [],
                students: [],
                courses: [],
                message:
                    requestError.response?.data?.message ||
                    "Unable to load enrollment data.",
            };
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeData = async () => {
            const result = await fetchEnrollmentData();

            if (!mounted) return;

            if (result.success) {
                setEnrollments(result.enrollments);
                setStudents(result.students);
                setCourses(result.courses);
                setError("");
            } else {
                setError(result.message);
            }

            setLoading(false);
        };

        initializeData();

        return () => {
            mounted = false;
        };
    }, []);

    const loadData = async () => {
        const result = await fetchEnrollmentData();

        if (result.success) {
            setEnrollments(result.enrollments);
            setStudents(result.students);
            setCourses(result.courses);
            setError("");
        } else {
            setError(result.message);
        }
    };

    const openAddModal = () => {
        setFormData({
            studentId: "",
            courseId: "",
        });

        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;

        setIsModalOpen(false);

        setFormData({
            studentId: "",
            courseId: "",
        });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const getStudentId = (enrollment) => {
        if (enrollment.student?.id) {
            return enrollment.student.id;
        }

        if (enrollment.studentId) {
            return enrollment.studentId;
        }

        return null;
    };

    const getCourseId = (enrollment) => {
        if (enrollment.course?.id) {
            return enrollment.course.id;
        }

        if (enrollment.courseId) {
            return enrollment.courseId;
        }

        return null;
    };

    const getEnrollmentId = (enrollment) => {
        return (
            enrollment.id ||
            enrollment.enrollmentId ||
            enrollment._id
        );
    };

    const getStudentName = (enrollment) => {
        if (enrollment.student?.name) {
            return enrollment.student.name;
        }

        const studentId = getStudentId(enrollment);

        const student = students.find(
            (item) => String(item.id) === String(studentId)
        );

        return student?.name || "Unknown Student";
    };

    const getStudentEmail = (enrollment) => {
        if (enrollment.student?.email) {
            return enrollment.student.email;
        }

        const studentId = getStudentId(enrollment);

        const student = students.find(
            (item) => String(item.id) === String(studentId)
        );

        return student?.email || "";
    };

    const getCourseName = (enrollment) => {
        if (enrollment.course?.courseName) {
            return enrollment.course.courseName;
        }

        if (enrollment.courseName) {
            return enrollment.courseName;
        }

        const courseId = getCourseId(enrollment);

        const course = courses.find(
            (item) => String(item.id) === String(courseId)
        );

        return course?.courseName || "Unknown Course";
    };

    const getCourseCode = (enrollment) => {
        if (enrollment.course?.courseCode) {
            return enrollment.course.courseCode;
        }

        if (enrollment.courseCode) {
            return enrollment.courseCode;
        }

        const courseId = getCourseId(enrollment);

        const course = courses.find(
            (item) => String(item.id) === String(courseId)
        );

        return course?.courseCode || "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.studentId) {
            showToast(
                "Please select a student.",
                "error"
            );
            return;
        }

        if (!formData.courseId) {
            showToast(
                "Please select a course.",
                "error"
            );
            return;
        }

        setSaving(true);

        try {
            await api.post("/enrollments", {
                studentId: Number(formData.studentId),
                courseId: Number(formData.courseId),
            });

            showToast(
                "Student enrolled successfully."
            );

            setIsModalOpen(false);

            setFormData({
                studentId: "",
                courseId: "",
            });

            await loadData();
        } catch (requestError) {
            console.error(
                "Enrollment creation error:",
                requestError
            );

            showToast(
                requestError.response?.data?.message ||
                "Unable to create enrollment.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (enrollment) => {
        const enrollmentId =
            getEnrollmentId(enrollment);

        if (!enrollmentId) {
            showToast(
                "Enrollment ID could not be found.",
                "error"
            );
            return;
        }

        const studentName =
            getStudentName(enrollment);

        const courseName =
            getCourseName(enrollment);

        const confirmed = window.confirm(
            `Remove ${studentName} from ${courseName}?`
        );

        if (!confirmed) return;

        try {
            await api.delete(
                `/enrollments/${enrollmentId}`
            );

            setEnrollments((previous) =>
                previous.filter(
                    (item) =>
                        String(
                            getEnrollmentId(item)
                        ) !==
                        String(enrollmentId)
                )
            );

            showToast(
                "Enrollment deleted successfully."
            );
        } catch (requestError) {
            console.error(
                "Enrollment delete error:",
                requestError
            );

            showToast(
                requestError.response?.data?.message ||
                "Unable to delete enrollment.",
                "error"
            );
        }
    };

    const filteredEnrollments =
        enrollments.filter((enrollment) => {
            const search = searchTerm
                .toLowerCase()
                .trim();

            if (!search) return true;

            const studentName =
                getStudentName(
                    enrollment
                ).toLowerCase();

            const studentEmail =
                getStudentEmail(
                    enrollment
                ).toLowerCase();

            const courseName =
                getCourseName(
                    enrollment
                ).toLowerCase();

            const courseCode =
                getCourseCode(
                    enrollment
                ).toLowerCase();

            const enrollmentId =
                String(
                    getEnrollmentId(
                        enrollment
                    ) || ""
                ).toLowerCase();

            return (
                studentName.includes(search) ||
                studentEmail.includes(search) ||
                courseName.includes(search) ||
                courseCode.includes(search) ||
                enrollmentId.includes(search)
            );
        });

    if (loading) {
        return (
            <Loading message="Loading enrollments..." />
        );
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Enrollments
                    </h1>

                    <p className="page-description">
                        Track student course enrollments
                    </p>
                </div>

                {isAdmin && (
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={openAddModal}
                    >
                        <Plus size={18} />
                        Add Enrollment
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
                        onClick={loadData}
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="card">
                <div className="table-toolbar">
                    <div>
                        <h2 className="card-title">
                            Enrollment List
                        </h2>

                        <p className="card-subtitle">
                            {
                                filteredEnrollments.length
                            }{" "}
                            enrollment
                            {filteredEnrollments.length !==
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
                            placeholder="Search enrollments..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                        />
                    </div>
                </div>

                {filteredEnrollments.length ===
                0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <ClipboardList
                                size={30}
                            />
                        </div>

                        <h3>
                            No enrollments found
                        </h3>

                        <p>
                            {searchTerm
                                ? "Try changing your search."
                                : "No students have been enrolled in courses yet."}
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
                                    Add First Enrollment
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
                                <th>Course</th>

                                {isAdmin && (
                                    <th>
                                        Actions
                                    </th>
                                )}
                            </tr>
                            </thead>

                            <tbody>
                            {filteredEnrollments.map(
                                (
                                    enrollment,
                                    index
                                ) => {
                                    const enrollmentId =
                                        getEnrollmentId(
                                            enrollment
                                        );

                                    const studentName =
                                        getStudentName(
                                            enrollment
                                        );

                                    const studentEmail =
                                        getStudentEmail(
                                            enrollment
                                        );

                                    const courseName =
                                        getCourseName(
                                            enrollment
                                        );

                                    const courseCode =
                                        getCourseCode(
                                            enrollment
                                        );

                                    return (
                                        <tr
                                            key={
                                                enrollmentId ||
                                                `enrollment-${index}`
                                            }
                                        >
                                            <td>
                                                    <span className="table-id">
                                                        #
                                                        {enrollmentId ||
                                                            index +
                                                            1}
                                                    </span>
                                            </td>

                                            <td>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems:
                                                            "center",
                                                        gap: "12px",
                                                    }}
                                                >
                                                    <div className="avatar avatar-blue">
                                                        <UserRound
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </div>

                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            flexDirection:
                                                                "column",
                                                            gap: "4px",
                                                        }}
                                                    >
                                                        <strong
                                                            style={{
                                                                display:
                                                                    "block",
                                                                lineHeight:
                                                                    "1.3",
                                                            }}
                                                        >
                                                            {
                                                                studentName
                                                            }
                                                        </strong>

                                                        {studentEmail && (
                                                            <span
                                                                style={{
                                                                    display:
                                                                        "block",
                                                                    color:
                                                                        "#64748b",
                                                                    fontSize:
                                                                        "13px",
                                                                    lineHeight:
                                                                        "1.3",
                                                                }}
                                                            >
                                                                    {
                                                                        studentEmail
                                                                    }
                                                                </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems:
                                                            "center",
                                                        gap: "12px",
                                                    }}
                                                >
                                                    <div className="avatar avatar-purple">
                                                        <BookOpen
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </div>

                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            flexDirection:
                                                                "column",
                                                            gap: "4px",
                                                        }}
                                                    >
                                                        <strong
                                                            style={{
                                                                display:
                                                                    "block",
                                                                lineHeight:
                                                                    "1.3",
                                                            }}
                                                        >
                                                            {
                                                                courseName
                                                            }
                                                        </strong>

                                                        {courseCode && (
                                                            <span
                                                                style={{
                                                                    display:
                                                                        "inline-block",
                                                                    width:
                                                                        "fit-content",
                                                                    padding:
                                                                        "2px 8px",
                                                                    borderRadius:
                                                                        "6px",
                                                                    background:
                                                                        "#eef2ff",
                                                                    color:
                                                                        "#4f46e5",
                                                                    fontSize:
                                                                        "12px",
                                                                    fontWeight:
                                                                        "600",
                                                                    lineHeight:
                                                                        "1.4",
                                                                }}
                                                            >
                                                                    {
                                                                        courseCode
                                                                    }
                                                                </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {isAdmin && (
                                                <td>
                                                    <div className="table-actions">
                                                        <button
                                                            type="button"
                                                            className="btn btn-icon btn-danger"
                                                            title="Delete enrollment"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    enrollment
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
                                    );
                                }
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Add Enrollment"
                size="medium"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="studentId">
                            Select Student
                        </label>

                        <select
                            id="studentId"
                            name="studentId"
                            value={
                                formData.studentId
                            }
                            onChange={handleChange}
                            className="form-input"
                            disabled={saving}
                        >
                            <option value="">
                                Choose a student
                            </option>

                            {students.map(
                                (student) => (
                                    <option
                                        key={
                                            student.id
                                        }
                                        value={
                                            student.id
                                        }
                                    >
                                        {
                                            student.name
                                        }{" "}
                                        {student.email
                                            ? `- ${student.email}`
                                            : ""}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="courseId">
                            Select Course
                        </label>

                        <select
                            id="courseId"
                            name="courseId"
                            value={
                                formData.courseId
                            }
                            onChange={handleChange}
                            className="form-input"
                            disabled={saving}
                        >
                            <option value="">
                                Choose a course
                            </option>

                            {courses.map(
                                (course) => (
                                    <option
                                        key={
                                            course.id
                                        }
                                        value={
                                            course.id
                                        }
                                    >
                                        {
                                            course.courseName
                                        }
                                    </option>
                                )
                            )}
                        </select>
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
                                ? "Enrolling..."
                                : "Create Enrollment"}
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

export default Enrollments;