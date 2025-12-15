export default function MemeCard({ meme, onClick, style }) {
  return (
    <div className="meme-card" onClick={onClick} style={style}>
      <img src={meme.url} alt={meme.title} />
      <div className="meme-title">{meme.title}</div>
    </div>
  );
}
