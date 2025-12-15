import { useEffect, useState } from "react";
import "./RandomMemes.css";
import MemesHeader from "./components/MemesHeader.jsx";
import MemesGrid from "./components/MemesGrid.jsx";
import MemeModal from "./components/MemeModal.jsx";

const CATEGORIES = [
  "memes",
  "dankmemes",
  "funny",
  "me_irl",
  "wholesomememes",
  "HistoryMemes",
  "terriblefacebookmemes",
  "PrequelMemes",
  "ProgrammingHumor",
  "AnimalsBeingDerps",
  "teenagers",
  "techsupportgore",
  "surrealmemes",
  "memeconomy",
  "comedyheaven",
  "funnyandsad",
  "unexpected",
  "gamingmemes",
  "officehumor",
];

export default function RandomMemes() {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [category, setCategory] = useState("all"); // all | mixed | сабреддит

  function getRandomFromArray(arr, count = 5) {
    if (!arr || arr.length === 0) return [];
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  async function fetchCategoryMemes(sub) {
    const params = sub ? `?sub=${encodeURIComponent(sub)}` : "";
    const res = await fetch(`http://localhost:5000/api/memes${params}`);
    const data = await res.json();

    if (!res.ok || data.error) {
      if (res.status === 404) throw new Error("Сорян, ничего не нашли 😢");
      if (res.status >= 500)
        throw new Error("Серверу плохо, не можем порадовать вас мемами 😔");
      throw new Error(data.error || "Что-то пошло не так 🤔");
    }

    return Array.isArray(data) ? data : [];
  }

  async function loadMemesByCategory() {
    setLoading(true);
    setErrorMessage(null);
    setMemes([]);

    try {
      if (category === "mixed") {
        const result = [];
        for (let i = 0; i < 5; i++) {
          const randomCategory =
            CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
          try {
            const list = await fetchCategoryMemes(randomCategory);
            const one = getRandomFromArray(list, 1)[0];
            if (one) result.push(one);
          } catch (e) {
            console.warn("Ошибка по категории", randomCategory, e.message);
          }
        }
        setMemes(result);
      } else if (category === "all") {
        const list = await fetchCategoryMemes(null); // бэк выберет саб сам
        setMemes(getRandomFromArray(list, 5));
      } else {
        const list = await fetchCategoryMemes(category);
        setMemes(getRandomFromArray(list, 5));
      }
    } catch (e) {
      console.error(e);
      setErrorMessage(e.message || "Не удалось подключиться к серверу 😢");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadMemesByCategory();
  }, [category]);

  const firstRow = memes.slice(0, 3);
  const secondRow = memes.slice(3, 5);

  return (
    <div className="random-memes-container">
      <MemesHeader
        categories={CATEGORIES}
        category={category}
        onCategoryChange={setCategory}
        onReload={loadMemesByCategory}
        loading={loading}
      />

      {loading && <p>Загрузка...</p>}

      {!loading && errorMessage && (
        <p className="error">{errorMessage}</p>
      )}

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
    </div>
  );
}
