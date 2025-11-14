import "./Teaser.css";

const NOCO_BASE_URL =
  import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";

export default function Teaser({ project }) {
  const summary = project["Short Summary"];
  const file = project["Teaser-Image"]?.[0];

  let teaserImage = null;

  if (file) {
    // bevorzugt signedPath (für secure attachments), sonst path
    const relPath = file.signedPath || file.path; // z.B. "dltemp/..." oder "download/..."
    teaserImage = `${NOCO_BASE_URL}/${relPath}`;
    console.log("Teaser Image URL:", teaserImage);
  } else {
    console.log("Kein Teaser-Image im Projekt:", project.Title);
  }

  return (
    <div className="teaser">
      <div className="teaser__text text-2">{summary}</div>

      {teaserImage ? (
        <img
          src={teaserImage}
          alt={project.Title}
          className="teaser__image"
        />
      ) : (
        <div className="teaser__image placeholder" />
      )}
    </div>
  );
}
