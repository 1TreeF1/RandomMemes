export default function MemeModal({ meme, onClose }) {
  return (
    <div className="meme-modal-backdrop" onClick={onClose}>
      <div
        className="meme-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="meme-modal-img-container">
          <img
            className="meme-modal-img"
            src={meme.url}
            alt={meme.title}
          />
        </div>
        <h2 className="meme-modal-title">
          {meme.title || "Без названия"}
        </h2>
        <button
          className="meme-modal-close-btn"
          onClick={onClose}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
