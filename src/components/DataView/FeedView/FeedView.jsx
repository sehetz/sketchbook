/**
 * FeedView - Grid layout for projects (alternative to list view)
 * Shows all projects as cards in a responsive grid
 */

import MasterMediaImage from "../../media/MasterMediaImage.jsx";
import MasterMediaVideo from "../../media/MasterMediaVideo.jsx";
import { text_labelToSlug } from "../../../utils/routing.js";

export default function FeedView({ projects, groupLabel, filterType, isLast }) {
  if (!projects || projects.length === 0) return null;

  // Helper: Check if file is video based on extension
  const isVideoFile = (file) => {
    if (!file) return false;
    const filename = file.name || file.title || "";
    return /\.(mp4|webm|mov)$/i.test(filename);
  };

  // Handle project card click - navigate to project detail view
  const handleProjectClick = (project) => {
    if (!project || !project.Title) return;

    const projectSlug = text_labelToSlug(project.Title);

    // For gears/teams: navigate to the project's first skill category instead
    if (filterType === "gears" || filterType === "teams") {
      const firstSkill = project["_nc_m2m_sehetz_skills"]?.[0]?.skill?.Skill || "";
      if (firstSkill) {
        const url = `/skills/${text_labelToSlug(firstSkill)}/${projectSlug}`;
        window.history.pushState(null, "", url);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
      return;
    }

    // For skills: navigate to project within current category (without view=feed)
    const url = `/${filterType}/${text_labelToSlug(groupLabel)}/${projectSlug}`;
    window.history.pushState(null, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  // Handle header click - navigate to the container's list view
  const handleHeaderClick = () => {
    const url = `/${filterType}/${text_labelToSlug(groupLabel)}`;
    window.history.pushState(null, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="feed-view" style={{ borderBottom: isLast ? "var(--line-width) solid var(--color-fg)" : "none" }}>
      {/* Group Header */}
      {groupLabel && (
        <h2
          className="feed-view__header text-1"
          onClick={handleHeaderClick}
          style={{ cursor: 'pointer' }}
        >
          <span className="text-1 dice">{projects.length}</span>
          {groupLabel}
          <span className="text-1 project-s">{" "}project{projects.length !== 1 ? 's' : ''}</span>
        </h2>
      )}

      {/* Grid */}
      <div className="feed-view__grid">
        {projects.map((project, index) => {
          const teaserEmbed = project.teaserEmbedUrl;
          const teaserImage = project.teaserImageFile || project["Teaser-Image"]?.[0];
          const description = project.description || "";
          const title = project.Title || "";
          const isVideo = isVideoFile(teaserImage);
          const embedRatio = project.teaserEmbedRatio || "3x4";

          return (
            <div
              key={project.id || index}
              className="feed-card"
              onClick={() => handleProjectClick(project)}
              style={{ cursor: 'pointer' }}
            >
              {/* Title above image */}
              <h3 className="text-2"><span className="feed-card__title">{title}</span></h3>

              {/* Media: Embed, Video, or Image */}
              <div className="feed-card__image">
                {teaserEmbed ? (
                  <iframe
                    src={teaserEmbed}
                    className="feed-card__img"
                    title={title}
                    loading="lazy"
                  />
                ) : teaserImage ? (
                  isVideo ? (
                    <MasterMediaVideo
                      file={teaserImage}
                      className="feed-card__img"
                      autoPlay={true}
                      loop={true}
                      muted={true}
                      playsInline={true}
                    />
                  ) : (
                    <MasterMediaImage
                      file={teaserImage}
                      alt={title}
                      className="feed-card__img"
                      loading={index < 6 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  )
                ) : (
                  <div className="feed-card__img placeholder" />
                )}
              </div>

              {/* Description */}
              {description && (
                <div className="feed-card__content">
                  <p className="text-3">{description}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
