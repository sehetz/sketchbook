
import { useData } from "../../contexts/DataContext.jsx";

export default function SehetzTeaser() {
  const { sehetz } = useData();
  const imageUrl = "/media/Sarah-Heitz-sehetz.jpg";
  const altDescription = "Sarah Heitz, a graphic designer and illustrator";

  return (
    <div className="sehetz-teaser">
      <div className="sehetz-teaser__title text-1">{sehetz?.title}</div>
      <div className="flex p-6-all">
        <div className="flex-1 flex flex-col gap-">
          <div className="sehetz-teaser__description pr-8 text-2">
            {sehetz?.description}
          </div>
          <div className="sehetz-teaser__achievements flex flex-col gap-3">
            {/* <div className="text-3">The more you know</div> */}
            <div className="flex flex-col gap-3 text-3">
              {sehetz?.Achievment_1 && <div>{sehetz.Achievment_1}</div>}
              {sehetz?.Achievment_2 && <div>{sehetz.Achievment_2}</div>}
              {sehetz?.Achievment_3 && <div>{sehetz.Achievment_3}</div>}
            </div>
          </div>
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
