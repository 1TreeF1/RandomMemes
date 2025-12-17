import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import translate from "translate";
import dotenv from "dotenv";

dotenv.config();

translate.engine = "google";
translate.key = null;

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

const subs = [
  "memes",
  "dankmemes",
  "funny",
  "me_irl",
  "wholesomememes",
  "HistoryMemes",
  "ProgrammingHumor",
  "surrealmemes",
  "memeconomy",
  "gamingmemes",
];

async function translateText(text) {
  try {
    return await translate(text, { to: "ru" });
  } catch (e) {
    console.error("Ошибка перевода:", e);
    return text;
  }
}

async function isSubredditAlive(subreddit) {
  const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=1`;
  try {
    const r = await fetch(url);
    return r.ok;
  } catch {
    return false;
  }
}

async function fetchListingPage(subreddit, type, limit = 50, after = null) {
  const params = new URLSearchParams({
    limit: String(limit),
    ...(after && { after }), 
  });

  const url = `https://www.reddit.com/r/${subreddit}/${type}.json?${params}`;
  console.log("REQ to Reddit:", url);

  const r = await fetch(url);

  if (!r.ok) {
    console.error(`❌ Ошибка Reddit ${subreddit}/${type}:`, r.status, await r.text());
    return { children: [], after: null };
  }

  const json = await r.json();
  const children = json.data?.children || [];
  const nextAfter = json.data?.after || null; 

  return { children, after: nextAfter };
}

async function fetchPostsFromSub(subreddit, limit = 20, after = null) {
  if (!(await isSubredditAlive(subreddit))) {
    console.log(`❌ Сабреддит ${subreddit} недоступен`);
    return { children: [], nextAfter: null };
  }

  const perFeed = Math.max(1, Math.floor(limit / 2));

  const hotPage = await fetchListingPage(subreddit, "hot", perFeed, after);
  const newPage = await fetchListingPage(subreddit, "new", perFeed, after);

  const allChildren = [...hotPage.children, ...newPage.children];

  const nextAfter = hotPage.after || newPage.after || null;

  console.log(
    `📊 ${subreddit}: всего получено ${allChildren.length} постов, nextAfter=${nextAfter}`
  );

  return { children: allChildren, nextAfter };
}

app.get("/api/memes", async (req, res) => {
  try {
    const { sub, after, count = 5 } = req.query;
    const targetCount = parseInt(count) || 5;

    const chosenSub =
      sub && subs.includes(sub)
        ? sub
        : subs[Math.floor(Math.random() * subs.length)];

    console.log(`🌟 /api/memes: sub=${chosenSub}, count=${targetCount}, after=${after || "null"}`);

    const { children, nextAfter } = await fetchPostsFromSub(
      chosenSub,
      targetCount * 3, 
      after || null
    );

    let posts = children
      .map((p) => {
        const data = p.data;
        const url = data.url_overridden_by_dest;
        const preview = data.preview?.images?.[0]?.source?.url;

        return {
          id: data.name, 
          url: url || preview,
          title: data.title,
          category: chosenSub,
          is_gallery: data.is_gallery,
          post_hint: data.post_hint,
        };
      })
      .filter(
        (p) =>
          p.url &&
          (p.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
            p.is_gallery ||
            p.post_hint === "image")
      );

    console.log(
      `✅ После фильтра осталось ${posts.length} постов, нужно отдать ${targetCount}`
    );

    
    const postsToTranslate = posts.slice(0, targetCount * 2);
    const translatedPosts = await Promise.all(
      postsToTranslate.map(async (p) => ({
        ...p,
        title: await translateText(p.title),
      }))
    );

    const finalPosts = translatedPosts.slice(0, targetCount);

    const response = {
      posts: finalPosts,
      pagination: {
        nextAfter: nextAfter,            
        hasMore: !!nextAfter,           
        requestedCount: targetCount,
        returnedCount: finalPosts.length,
        sub: chosenSub,
      },
    };

    if (finalPosts.length === 0) {
      console.log("⚠️ Нет картинок, возвращаем пустой список");
      return res.json({
        posts: [],
        pagination: response.pagination,
        message: "Картинок не найдено в этом сабреддите",
      });
    }

    console.log(`🎉 Отправляем клиенту ${finalPosts.length} мемов`);
    res.json(response);
  } catch (err) {
    console.error("Ошибка в /api/memes:", err);
    res.status(500).json({ error: "Серверу плохо 😔" });
  }
});

app.listen(PORT, () =>
  console.log(`🔥 Сервер мемов запущен: http://localhost:${PORT}`)
);
