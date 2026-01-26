


export default function SehetzTeaser() {
  // Hardcoded content for SEO
  const title = "Sarah Heitz";
  const altDescription = "Sarah Heitz, a graphic designer and illustrator";
  const description = "If you skipped the site tour and landed straight here in the hidden section below the visualization: Congratulations and welcome! I'm Sarah, a graphic designer and illustrator, and I've done nothing else my entire professional life (wow!). ";
  const imageUrl = "/media/Sarah-Heitz-sehetz.jpg";

  return (
    <div className="sehetz-teaser">
      <div className="sehetz-teaser__title text-1">{title}</div>
      <div className="flex gap-6 p-6-all">
        <div className="sehetz-teaser__description flex-1 pr-8 text-2">
          {description}
        </div>
        <img
          src={imageUrl}
          alt={altDescription}
          className="teaser__image sehetz-teaser__image"
          loading="lazy"
        />
      </div>
    </div>
  );
}
