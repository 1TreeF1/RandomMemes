import MemeCard from "./MemeCard.jsx";

export default function MemesGrid({ firstRow, secondRow, onSelect }) {
  return (
    <>
      <div className="memes-grid">
        {firstRow.map((meme) => (
          <MemeCard
            key={meme.url}
            meme={meme}
            onClick={() => onSelect(meme)}
          />
        ))}
      </div>

      <div className="memes-row-center">
        {secondRow.map((meme) => (
          <MemeCard
            key={meme.url}
            meme={meme}
            onClick={() => onSelect(meme)}
            style={{ width: "32%", maxWidth: 320 }}
          />
        ))}
      </div>
    </>
  );
}
