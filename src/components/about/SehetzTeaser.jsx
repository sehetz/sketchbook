
import { useData } from "../../contexts/DataContext.jsx";
import MasterMediaImage from "../media/MasterMediaImage.jsx";

export default function SehetzTeaser({ variant = "sehetz" }) {
  const { sehetz, sehetzWorkspace } = useData();
  const data = variant === "workspace" ? sehetzWorkspace : sehetz;

  const imageFile = data?.image?.[0];
  const useStaticPortrait = variant === "sehetz";
  const staticImageUrl = "/media/Sarah-Heitz-sehetz.jpg";
  const altDescription =
    variant === "workspace"
      ? "Sarah Heitz' Atelier"
      : "Sarah Heitz, a graphic designer and illustrator";

  return (
    <div className="sehetz-teaser">
      <div className="sehetz-teaser__title text-1">{data?.title}</div>
      <div className="flex p-6-all">
        <div className="flex-1 flex flex-col gap-">
          <div className="sehetz-teaser__description pr-8 text-2">
            {data?.description}
          </div>
          <div className="sehetz-teaser__achievements flex flex-col gap-3">
            <div className="flex flex-col gap-3 text-3">
              {data?.Achievment_1 && <div>{data.Achievment_1}</div>}
              {data?.Achievment_2 && <div>{data.Achievment_2}</div>}
              {data?.Achievment_3 && <div>{data.Achievment_3}</div>}
            </div>
          </div>
        </div>
        {useStaticPortrait ? (
          <img
            src={staticImageUrl}
            alt={altDescription}
            className="teaser__image sehetz-teaser__image"
            loading="lazy"
          />
        ) : imageFile ? (
          <MasterMediaImage
            file={imageFile}
            alt={altDescription}
            className="teaser__image sehetz-teaser__image"
            loading="lazy"
          />
        ) : (
          <div className="teaser__image sehetz-teaser__image placeholder" />
        )}
      </div>
    </div>
  );
}

