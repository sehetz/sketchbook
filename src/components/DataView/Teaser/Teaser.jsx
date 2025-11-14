import "./Teaser.css";

export default function Teaser({ project }) {
  return (
    <div className="teaser">
      <div className="teaser__text text-2">{project["Short Summary"]}</div>

      {project.teaserImage ? (
        <img
          src={project.teaserImage}
          alt={project.Title}
          className="teaser__image"
        />
      ) : (
        <div className="teaser__image placeholder" />
      )}
    </div>
  );
}
