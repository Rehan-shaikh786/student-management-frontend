import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const Toast = ({
                   message,
                   type = "success",
                   onClose,
               }) => {
    if (!message) {
        return null;
    }

    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        warning: <AlertTriangle size={20} />,
        info: <Info size={20} />,
    };

    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-icon">
                {icons[type] || icons.info}
            </div>

            <div className="toast-message">
                {message}
            </div>

            <button
                type="button"
                className="toast-close"
                onClick={onClose}
                aria-label="Close notification"
            >
                <X size={18} />
            </button>
        </div>
    );
};

export default Toast;