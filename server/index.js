import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import translate from "translate";

translate.engine = "google";
translate.key = null;

const app = express();
app.use(cors());

const PORT = 5000;

// Функция перевода текста
async function translateText(text) {
  try {
    return await translate(text, { to: "ru" });
  } catch (e) {
    console.error("Ошибка перевода:", e);
    return text;
  }
}

app.get("/api/memes", async (req, res) => {
  try {
    const subs = [
      "memes",               // обычные мемы
      "dankmemes",           // более «тёмные» мемы, интернет-сленг
      "funny",               // просто смешные посты
      "me_irl",              // мемы про жизнь / юмор от лица автора
      "wholesomememes",      // милые и добрые мемы
      "HistoryMemes",        // мемы про историю
      "terriblefacebookmemes", // плохие/неудачные мемы
      "PrequelMemes",        // мемы по Звёздным войнам (prequel)
      "ProgrammingHumor",    // мемы для программистов
      "AnimalsBeingDerps",   // смешные животные
      "teenagers",           // мемы про подростковую жизнь
      "techsupportgore",     // мемы про IT и баги
      "surrealmemes",        // сюрреалистические мемы
      "memeconomy",          // мемы про мемы и тренды
      "comedyheaven",        // очень смешные мемы
      "funnyandsad",         // грустно-смешные мемы
      "unexpected",          // неожиданный юмор
      "gamingmemes",         // мемы про игры
      "officehumor",         // мемы про работу и офис
    ];

    const sub = subs[Math.floor(Math.random() * subs.length)];
    const redditURL = `https://www.reddit.com/r/${sub}/hot.json?limit=50`;

    const r = await fetch(redditURL);

    if (!r.ok) {
      if (r.status === 404) {
        return res.status(404).json({ error: "Сорян, ничего не нашли 😢" });
      } else {
        return res.status(500).json({ error: "Сервер Reddit недоступен 😔" });
      }
    }

    const json = await r.json();

    let posts = json.data.children
      .map((p) => ({
        url: p.data.url_overridden_by_dest,
        title: p.data.title,
      }))
      .filter((p) => p.url && p.url.match(/\.(jpg|jpeg|png|gif)$/i));

    // Переводим заголовки
    posts = await Promise.all(
      posts.map(async (p) => ({
        url: p.url,
        title: await translateText(p.title),
      }))
    );

    // Случайно перемешиваем и берём 6 мемов
    const randomMemes = posts.sort(() => Math.random() - 0.5).slice(0, 6);

    if (randomMemes.length === 0) {
      return res.status(404).json({ error: "Сорян, мемов не найдено 😢" });
    }

    res.json(randomMemes);
  } catch (err) {
    console.error("Ошибка Reddit:", err);
    res.status(500).json({ error: "Серверу плохо, не можем порадовать вас мемами 😔" });
  }
});

app.listen(PORT, () =>
  console.log(`🔥 Сервер мемов запущен: http://localhost:${PORT}`)
);
