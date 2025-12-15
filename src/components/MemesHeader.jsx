export default function MemesHeader({
  categories,
  category,
  onCategoryChange,
  onReload,
  loading,
}) {
  return (
    <div className="random-memes-header">
      <h1>🔥 Рандомные мемы</h1>

      <div className="category-select">
        <label>
          Категория:{" "}
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            disabled={loading}
          >
            <option value="all">Все (рандом саб)</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="mixed">mixed</option>
          </select>
        </label>
      </div>

      <button
        className="update-btn"
        onClick={onReload}
        disabled={loading}
      >
        🔄 Обновить мемы
      </button>
    </div>
  );
}
