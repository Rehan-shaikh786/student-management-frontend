
import { useEffect } from "react";
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    X,
} from "lucide-react";
import "./Toast.css";

const Toast = ({
                   message,
                   type = "success",
                   onClose,
               }) => {
    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            onClose?.();
        }, 3000);

        return () => clearTimeout(timer);
    }, [message, onClose]);

    if (!message) return null;

    const icons = {
        success: <CheckCircle size={42} />,
        error: <XCircle size={42} />,
        warning: <AlertTriangle size={42} />,
        info: <Info size={42} />,
    };

    const titles = {
        success: "Success!",
        error: "Error!",
        warning: "Warning!",
        info: "Information",
    };

    return (
        <div className="toast-overlay">
            <div
                className={`toast toast-${type}`}
                role="alert"
                aria-live="assertive"
            >
                <button
                    type="button"
                    className="toast-close"
                    onClick={onClose}
                    aria-label="Close notification"
                >
                    <X size={20} />
                </button>

                <div className="toast-icon">
                    {icons[type] || icons.info}
                </div>

                <h3 className="toast-title">
                    {titles[type] || "Notification"}
                </h3>

                <p className="toast-message">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default Toast;