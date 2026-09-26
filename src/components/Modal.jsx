import { X } from "lucide-react";

const Modal = ({
                   isOpen,
                   onClose,
                   title,
                   children,
                   size = "medium",
               }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
        >
            <div
                className={`modal modal-${size}`}
                onClick={(event) => event.stopPropagation()}
            >
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">
                            {title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="btn btn-icon"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;