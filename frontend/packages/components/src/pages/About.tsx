import { Founders } from "@coaster/assets";

export const About: React.FC = () => {
  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-py-24 sm:tw-py-32">
      <div className="tw-flex tw-flex-col tw-items-center tw-max-w-[300px] sm:tw-max-w-[600px]">
        <img
          className="tw-rounded-xl tw-mb-5 sm:tw-mb-8 tw-max-w-[80%] sm:tw-max-w-xs"
          src={Founders.src}
          alt="The founders of Coaster"
        />
        <div className="tw-text-center tw-text-4xl sm:tw-text-5xl tw-font-bold tw-mb-4 sm:tw-mb-8">
          Find your next adventure
        </div>
        <p className="tw-text-center tw-text-base">
          Our marketplace is curated to help you find your dream adventure. Discover amazing trips, book with our
          money-back guarantee, and coordinate easily with your guide. Coaster is bringing adventure travel to a new
          level.
        </p>
      </div>
    </div>
  );
};
