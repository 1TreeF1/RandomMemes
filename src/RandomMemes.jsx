import { useEffect, useState } from "react";
import "./RandomMemes.css";

export default function RandomMemes() {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  async function loadMemes() {
    setLoading(true);
    setErrorMessage(null); 
    try {
      const res = await fetch("http://localhost:5000/api/memes");

      const data = await res.json();

      // Если сервер вернул ошибку
      if (!res.ok || data.error) {
        setMemes([]);
        if (res.status === 404) {
          setErrorMessage("Сорян, ничего не нашли 😢");
        } else if (res.status >= 500) {
          setErrorMessage("Серверу плохо, не можем порадовать вас мемами 😔");
        } else if (data.error) {
          setErrorMessage(data.error);
        } else {
          setErrorMessage("Что-то пошло не так 🤔");
        }
      } else {
        // Выбираем случайные 5 мемов без повторов
        const uniqueMemes = getRandomMemes(data, 5);
        setMemes(uniqueMemes);
      }
    } catch (e) {
      console.error("Ошибка загрузки мемов:", e);
      setMemes([]);
      setErrorMessage("Не удалось подключиться к серверу 😢");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadMemes();
  }, []);

  const firstRow = memes.slice(0, 3);
  const secondRow = memes.slice(3, 5);

  // Вспомогательная функция для случайных мемов
  function getRandomMemes(allMemes, count = 5) {
    if (!allMemes || allMemes.length === 0) return [];
    const shuffled = [...allMemes].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  return (
    <div className="random-memes-container">
      <div className="random-memes-header">
        <h1>🔥 Рандомные мемы</h1>
      </div>

      {loading && <p>Загрузка...</p>}

      {!loading && errorMessage && (
        <p className="error">{errorMessage}</p>
      )}

      {!loading && !errorMessage && memes.length === 0 && (
        <p>Мемы не найдены 😢</p>
      )}

      {!loading && !errorMessage && memes.length > 0 && (
        <>
          <div className="memes-grid">
            {firstRow.map((meme) => (
              <div key={meme.url} className="meme-card" onClick={() => setSelected(meme)}>
                <img src={meme.url} alt="" />
                <div className="meme-title">{meme.title}</div>
              </div>
            ))}
          </div>

          <div className="memes-row-center">
            {secondRow.map((meme) => (
              <div
                key={meme.url}
                className="meme-card"
                onClick={() => setSelected(meme)}
                style={{ width: "32%", maxWidth: 320 }}
              >
                <img src={meme.url} alt="" />
                <div className="meme-title">{meme.title}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <button className="update-btn" onClick={loadMemes}>
        🔄 Обновить мемы
      </button>

      {selected && (
        <div className="meme-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="meme-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="meme-modal-img-container">
              <img className="meme-modal-img" src={selected.url} alt={selected.title} />
            </div>
            <h2 className="meme-modal-title">{selected.title || "Без названия"}</h2>
            <button className="meme-modal-close-btn" onClick={() => setSelected(null)}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
