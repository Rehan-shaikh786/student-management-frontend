import { LoaderCircle } from "lucide-react";

const Loading = ({ message = "Loading..." }) => {
    return (
        <div className="loading-container">
            <div className="spinner">
                <LoaderCircle size={32} />
            </div>

            <p className="loading-text">
                {message}
            </p>
        </div>
    );
};

export default Loading;