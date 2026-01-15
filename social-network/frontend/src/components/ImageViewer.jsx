import "./imageViewer.css";

export default function ImageViewer({ imageUrl, onClose }) {
    if (!imageUrl) return null;

    return (
        <div className="imageViewerOverlay" onClick={onClose}>
            <span className="imageViewerClose">✕</span>

            <img
                src={imageUrl}
                alt="preview"
                className="imageViewerImage"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}
