import imageAssets from "./imageAssets.json";

export function ProjectImage({ src, alt }) {
  const name = src.split("/assets/")[1]?.split("?")[0];
  const tiles = imageAssets.tiles[name];
  if (!tiles) return <img src={src} alt={alt} decoding="async" fetchPriority="high" />;
  const base = src.slice(0, src.indexOf("/assets/") + 8);
  return <div className="project-image-tiles" role="img" aria-label={alt}>
    {tiles.map((tile, index) => <img
      key={tile.src}
      src={base + tile.src}
      width={tile.width}
      height={tile.height}
      alt=""
      loading={index === 0 ? "eager" : "lazy"}
      fetchPriority={index === 0 ? "high" : "low"}
      decoding="async"
    />)}
  </div>;
}
