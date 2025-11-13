import "./Teaser.css";

export default function Teaser({ project }) {
  const summary = project["Short Summary"];
  const image = project.image_url; // später aus Noco

  return (
    <div className="teaser">
      <div className="teaser__text text-2">{summary}</div>

      {image ? (
        <img src={image} alt={project.Title} className="teaser__image" />
      ) : (
        <div className="teaser__image placeholder" />
      )}
    </div>
  );
}
