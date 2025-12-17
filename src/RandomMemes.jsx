import { useEffect, useState } from "react";
import "./RandomMemes.css";
import MemesGrid from "./components/MemesGrid.jsx";
import MemeModal from "./components/MemeModal.jsx";

const CATEGORIES = [
  "memes",
  "dankmemes",
  "funny",
  "me_irl",
  "wholesomememes",
  "HistoryMemes",
  "ProgrammingHumor",
  "surrealmemes",
  "memeconomy",
];

const CATEGORY_LABELS = {
  memes: "Мемы",
  dankmemes: "Чёрный юмор",
  funny: "Просто смешное",
  me_irl: "Мемы “я в жизни”",
  wholesomememes: "Добрые мемы",
  HistoryMemes: "Исторические мемы",
  ProgrammingHumor: "Мемы про прогу",
  surrealmemes: "Сюрреалистичные мемы",
  memeconomy: "Биржа мемов",
};

export default function RandomMemes() {
  const [memes, setMemes] = useState([]);
  const [category, setCategory] = useState("memes"); 
  const [after, setAfter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selected, setSelected] = useState(null);

  async function fetchPage(sub, cursor = null) {
  const params = new URLSearchParams({
    sub,
    count: "5",
    ...(cursor && { after: cursor }),
  });

  let res;
  try {
    res = await fetch(`http://localhost:5000/api/memes?${params}`);
  } catch (e) {
    throw new Error("Сервер мемов ушёл за сигаретами и не вернулся 😢");
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Сервер ответил какой‑то ерундой, мемы поломались 🤯");
  }

  if (!res.ok || data.error) {
    throw new Error(
      data.error || "Реддит обиделся и не отдаёт мемы, попробуй позже 🥲"
    );
  }

  return data;
}

  useEffect(() => {
    loadFirstPage("all");
  }, []);

  async function loadFirstPage(sub) {
    try {
      setLoading(true);
      setErrorMessage(null);
      setMemes([]);
      setAfter(null);

      const data = await fetchPage(sub, null);
      setMemes(data.posts);
      setAfter(data.pagination?.nextAfter || null);
    } catch (e) {
      console.error(e);
      setErrorMessage(e.message || "Не удалось загрузить мемы 😢");
    } finally {
      setLoading(false);
    }
  }

  async function handleTabClick(sub) {
    if (sub === category) {
      await handleReload();
      return;
    }
    setCategory(sub);
    await loadFirstPage(sub);
  }

  async function handleReload() {
    try {
      setLoading(true);
      setErrorMessage(null);

      const cursorToUse = after || null;
      const data = await fetchPage(category, cursorToUse);

      setMemes(data.posts);
      setAfter(data.pagination?.nextAfter || null);
    } catch (e) {
      console.error(e);
      setErrorMessage(e.message || "Не удалось обновить мемы 😢");
    } finally {
      setLoading(false);
    }
  }

  const firstRow = memes.slice(0, 3);
  const secondRow = memes.slice(3, 5);

  return (
    <div className="random-memes-container">
      <div className="tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`tab-btn ${cat === category ? "active" : ""}`}
            onClick={() => handleTabClick(cat)}
            disabled={loading && cat !== category}
          >
            {CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {loading && <p>Загрузка...</p>}
      {!loading && errorMessage && <p className="error">{errorMessage}</p>}
      {!loading && !errorMessage && memes.length === 0 && (
        <p>Мемы не найдены 😢</p>
      )}

      {!loading && !errorMessage && memes.length > 0 && (
        <MemesGrid
          firstRow={firstRow}
          secondRow={secondRow}
          onSelect={setSelected}
        />
      )}

      {selected && (
        <MemeModal meme={selected} onClose={() => setSelected(null)} />
      )}

      <button
        className="update-btn"
        onClick={handleReload}
        disabled={loading}
      >
        🔄 Обновить мемы
      </button>
    </div>
  );
}
