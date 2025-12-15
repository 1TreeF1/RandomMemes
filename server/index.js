import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import translate from "translate";

translate.engine = "google";
translate.key = null;

const app = express();
app.use(cors());

const PORT = 5000;

const subs = [
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

async function translateText(text) {
  try {
    return await translate(text, { to: "ru" });
  } catch (e) {
    console.error("Ошибка перевода:", e);
    return text;
  }
}

// Берём и hot, и new для сабреддита
async function fetchPostsFromSub(subreddit) {
  const endpoints = ["hot", "new"];
  const allChildren = [];

  for (const type of endpoints) {
    const url = `https://www.reddit.com/r/${subreddit}/${type}.json?limit=100`;
    console.log("REQ to Reddit:", url);

    const r = await fetch(url);

    if (!r.ok) {
      console.error("Reddit status:", r.status, await r.text());
      continue;
    }

    const json = await r.json();
    allChildren.push(...json.data.children);
  }

  return allChildren;
}

app.get("/api/memes", async (req, res) => {
  try {
    const { sub } = req.query;

    const chosenSub =
      sub && subs.includes(sub)
        ? sub
        : subs[Math.floor(Math.random() * subs.length)];

    const children = await fetchPostsFromSub(chosenSub);

    let posts = children
      .map((p) => ({
        url: p.data.url_overridden_by_dest,
        title: p.data.title,
        category: chosenSub,
      }))
      .filter((p) => p.url && p.url.match(/\.(jpg|jpeg|png|gif)$/i));

    posts = await Promise.all(
      posts.map(async (p) => ({
        ...p,
        title: await translateText(p.title),
      }))
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: "Сорян, мемов не найдено 😢" });
    }

    res.json(posts);
  } catch (err) {
    console.error("Ошибка в /api/memes:", err);
    res
      .status(500)
      .json({ error: "Серверу плохо, не можем порадовать вас мемами 😔" });
  }
});

app.listen(PORT, () =>
  console.log(`🔥 Сервер мемов запущен: http://localhost:${PORT}`)
);
