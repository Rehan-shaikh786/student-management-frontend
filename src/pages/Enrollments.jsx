import { useCallback, useEffect, useState } from "react";
import {
    BookOpen,
    ClipboardList,
    Plus,
    Search,
    Trash2,
    UserRound,
    AlertTriangle,
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
    const [isDeleteModalOpen, setIsDeleteModalOpen] =
        useState(false);

    const [selectedEnrollment, setSelectedEnrollment] =
        useState(null);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        studentId: "",
        courseId: "",
    });

    const [toast, setToast] = useState({
        message: "",
        type: "success",
    });

    // =========================================================
    // TOAST
    // =========================================================

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

    // =========================================================
    // HELPER FUNCTIONS
    // =========================================================

    const getEnrollmentId = (enrollment) => {
        return (
            enrollment?.id ||
            enrollment?.enrollmentId ||
            enrollment?._id
        );
    };

    const getStudentId = (enrollment) => {
        if (enrollment?.student?.id) {
            return enrollment.student.id;
        }

        if (enrollment?.studentId) {
            return enrollment.studentId;
        }

        return null;
    };

    const getCourseId = (enrollment) => {
        if (enrollment?.course?.id) {
            return enrollment.course.id;
        }

        if (enrollment?.courseId) {
            return enrollment.courseId;
        }

        return null;
    };

    const getStudentName = (enrollment) => {
        if (enrollment?.student?.name) {
            return enrollment.student.name;
        }

        const studentId = getStudentId(enrollment);

        const student = students.find(
            (item) =>
                String(item.id) === String(studentId)
        );

        return student?.name || "Unknown Student";
    };

    const getStudentEmail = (enrollment) => {
        if (enrollment?.student?.email) {
            return enrollment.student.email;
        }

        const studentId = getStudentId(enrollment);

        const student = students.find(
            (item) =>
                String(item.id) === String(studentId)
        );

        return student?.email || "";
    };

    const getCourseName = (enrollment) => {
        if (enrollment?.course?.courseName) {
            return enrollment.course.courseName;
        }

        if (enrollment?.courseName) {
            return enrollment.courseName;
        }

        const courseId = getCourseId(enrollment);

        const course = courses.find(
            (item) =>
                String(item.id) === String(courseId)
        );

        return course?.courseName || "Unknown Course";
    };

    const getCourseCode = (enrollment) => {
        if (enrollment?.course?.courseCode) {
            return enrollment.course.courseCode;
        }

        if (enrollment?.courseCode) {
            return enrollment.courseCode;
        }

        const courseId = getCourseId(enrollment);

        const course = courses.find(
            (item) =>
                String(item.id) === String(courseId)
        );

        return course?.courseCode || "";
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const loadInitialData = async () => {
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

                if (cancelled) return;

                setEnrollments(
                    Array.isArray(enrollmentsResponse.data)
                        ? enrollmentsResponse.data
                        : []
                );

                setStudents(
                    Array.isArray(studentsResponse.data)
                        ? studentsResponse.data
                        : []
                );

                setCourses(
                    Array.isArray(coursesResponse.data)
                        ? coursesResponse.data
                        : []
                );

                setError("");
            } catch (requestError) {
                if (cancelled) return;

                console.error(
                    "Enrollment loading error:",
                    requestError
                );

                setError(
                    requestError.response?.data?.message ||
                    "Unable to load enrollment data."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadInitialData().catch((unexpectedError) => {
            if (cancelled) return;

            console.error(
                "Unexpected enrollment loading error:",
                unexpectedError
            );

            setError(
                "Unable to load enrollment data."
            );

            setLoading(false);
        });

        return () => {
            cancelled = true;
        };
    }, []);

    // =========================================================
    // REFRESH DATA
    // =========================================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                enrollmentsResponse,
                studentsResponse,
                coursesResponse,
            ] = await Promise.all([
                api.get("/enrollments"),
                api.get("/students"),
                api.get("/courses"),
            ]);

            setEnrollments(
                Array.isArray(enrollmentsResponse.data)
                    ? enrollmentsResponse.data
                    : []
            );

            setStudents(
                Array.isArray(studentsResponse.data)
                    ? studentsResponse.data
                    : []
            );

            setCourses(
                Array.isArray(coursesResponse.data)
                    ? coursesResponse.data
                    : []
            );
        } catch (requestError) {
            console.error(
                "Enrollment refresh error:",
                requestError
            );

            setError(
                requestError.response?.data?.message ||
                "Unable to refresh enrollment data."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // ADD ENROLLMENT
    // =========================================================

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

    // =========================================================
    // DELETE ENROLLMENT
    // =========================================================

    const openDeleteModal = (enrollment) => {
        const enrollmentId =
            getEnrollmentId(enrollment);

        if (!enrollmentId) {
            showToast(
                "Enrollment ID could not be found.",
                "error"
            );
            return;
        }

        setSelectedEnrollment(enrollment);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (deleting) return;

        setIsDeleteModalOpen(false);
        setSelectedEnrollment(null);
    };

    const handleDelete = async () => {
        if (!selectedEnrollment) return;

        const enrollmentId =
            getEnrollmentId(selectedEnrollment);

        if (!enrollmentId) {
            showToast(
                "Enrollment ID could not be found.",
                "error"
            );
            return;
        }

        setDeleting(true);

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

            setIsDeleteModalOpen(false);
            setSelectedEnrollment(null);
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
        } finally {
            setDeleting(false);
        }
    };

    // =========================================================
    // SEARCH
    // =========================================================

    const filteredEnrollments =
        enrollments.filter((enrollment) => {
            const search =
                searchTerm.toLowerCase().trim();

            if (!search) return true;

            const studentName =
                getStudentName(enrollment).toLowerCase();

            const studentEmail =
                getStudentEmail(enrollment).toLowerCase();

            const courseName =
                getCourseName(enrollment).toLowerCase();

            const courseCode =
                getCourseCode(enrollment).toLowerCase();

            const enrollmentId = String(
                getEnrollmentId(enrollment) || ""
            ).toLowerCase();

            return (
                studentName.includes(search) ||
                studentEmail.includes(search) ||
                courseName.includes(search) ||
                courseCode.includes(search) ||
                enrollmentId.includes(search)
            );
        });

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <Loading message="Loading enrollments..." />
        );
    }

    // =========================================================
    // PAGE
    // =========================================================

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
                        onClick={() => {
                            loadData().catch(
                                (requestError) => {
                                    console.error(
                                        requestError
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
                <div
                    className="table-toolbar"
                    style={{
                        padding: "20px 22px",
                        marginBottom: 0,
                    }}
                >
                    <div>
                        <h2 className="card-title">
                            Enrollment List
                        </h2>

                        <p className="card-subtitle">
                            {filteredEnrollments.length}{" "}
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
                        <div className="empty-state-icon">
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
                                    style={{
                                        marginTop:
                                            "18px",
                                    }}
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
                    <div className="table-container">
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
                                                <div className="table-user">
                                                    <div className="avatar">
                                                        <UserRound
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <div className="table-user-name">
                                                            {
                                                                studentName
                                                            }
                                                        </div>

                                                        {studentEmail && (
                                                            <div className="table-user-email">
                                                                {
                                                                    studentEmail
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="table-user">
                                                    <div
                                                        className="avatar"
                                                        style={{
                                                            background:
                                                                "#f5f3ff",
                                                            color:
                                                                "#7c3aed",
                                                        }}
                                                    >
                                                        <BookOpen
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <div className="table-user-name">
                                                            {
                                                                courseName
                                                            }
                                                        </div>

                                                        {courseCode && (
                                                            <span className="badge badge-primary">
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
                                                                openDeleteModal(
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

            {/* =================================================
                ADD ENROLLMENT MODAL
            ================================================= */}

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Add Enrollment"
                size="medium"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label
                            htmlFor="studentId"
                            className="form-label"
                        >
                            Select Student
                        </label>

                        <select
                            id="studentId"
                            name="studentId"
                            value={
                                formData.studentId
                            }
                            onChange={handleChange}
                            className="form-select"
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
                                        {student.name}
                                        {student.email
                                            ? ` - ${student.email}`
                                            : ""}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label
                            htmlFor="courseId"
                            className="form-label"
                        >
                            Select Course
                        </label>

                        <select
                            id="courseId"
                            name="courseId"
                            value={
                                formData.courseId
                            }
                            onChange={handleChange}
                            className="form-select"
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

            {/* =================================================
                DELETE MODAL
            ================================================= */}

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                title="Delete Enrollment"
                size="small"
            >
                <div
                    style={{
                        textAlign: "center",
                        padding: "8px 0",
                    }}
                >
                    <div
                        style={{
                            width: "54px",
                            height: "54px",
                            margin: "0 auto 16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "50%",
                            background: "#fef2f2",
                            color: "#dc2626",
                        }}
                    >
                        <AlertTriangle size={27} />
                    </div>

                    <h3
                        style={{
                            margin: "0 0 8px",
                            fontSize: "17px",
                        }}
                    >
                        Remove this enrollment?
                    </h3>

                    <p
                        style={{
                            margin: 0,
                            color: "#667085",
                            fontSize: "13px",
                            lineHeight: 1.6,
                        }}
                    >
                        <span>
                            {selectedEnrollment
                                ? getStudentName(
                                    selectedEnrollment
                                )
                                : ""}
                        </span>{" "}
                        will be removed from{" "}
                        <span>
                            {selectedEnrollment
                                ? getCourseName(
                                    selectedEnrollment
                                )
                                : ""}
                        </span>
                        .
                    </p>
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={closeDeleteModal}
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
                            : "Delete Enrollment"}
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

export default Enrollments;