import Camping1 from "@coaster/assets/listings/camping-1.jpg";
import Camping2 from "@coaster/assets/listings/camping-2.jpg";
import Camping3 from "@coaster/assets/listings/camping-3.jpg";
import Climbing1 from "@coaster/assets/listings/climbing-1.jpg";
import Climbing2 from "@coaster/assets/listings/climbing-2.jpg";
import Climbing3 from "@coaster/assets/listings/climbing-3.jpg";
import Cycling1 from "@coaster/assets/listings/cycling-1.jpg";
import Cycling2 from "@coaster/assets/listings/cycling-2.jpg";
import Cycling3 from "@coaster/assets/listings/cycling-3.jpg";
import Diving1 from "@coaster/assets/listings/diving-1.jpg";
import Diving2 from "@coaster/assets/listings/diving-2.jpg";
import Diving3 from "@coaster/assets/listings/diving-3.jpg";
import FlyFishing1 from "@coaster/assets/listings/fly-fishing-1.jpg";
import FlyFishing2 from "@coaster/assets/listings/fly-fishing-2.jpg";
import FlyFishing3 from "@coaster/assets/listings/fly-fishing-3.jpg";
import Hiking1 from "@coaster/assets/listings/hiking-1.jpg";
import Hiking2 from "@coaster/assets/listings/hiking-2.jpg";
import Hiking3 from "@coaster/assets/listings/hiking-3.jpg";
import IceClimbing1 from "@coaster/assets/listings/ice-climbing-1.jpg";
import IceClimbing2 from "@coaster/assets/listings/ice-climbing-2.jpg";
import IceClimbing3 from "@coaster/assets/listings/ice-climbing-3.jpg";
import OceanFishing1 from "@coaster/assets/listings/ocean-fishing-1.jpg";
import OceanFishing2 from "@coaster/assets/listings/ocean-fishing-2.jpg";
import OceanFishing3 from "@coaster/assets/listings/ocean-fishing-3.jpg";
import Skiing1 from "@coaster/assets/listings/skiing-1.jpg";
import Skiing2 from "@coaster/assets/listings/skiing-2.jpg";
import Skiing3 from "@coaster/assets/listings/skiing-3.jpg";
import Snorkeling1 from "@coaster/assets/listings/snorkeling-1.jpg";
import Snorkeling2 from "@coaster/assets/listings/snorkeling-2.jpg";
import Snorkeling3 from "@coaster/assets/listings/snorkeling-3.jpg";
import Sup1 from "@coaster/assets/listings/sup-1.jpg";
import Sup2 from "@coaster/assets/listings/sup-2.jpg";
import Sup3 from "@coaster/assets/listings/sup-3.jpg";
import Surfing1 from "@coaster/assets/listings/surfing-1.jpg";
import Surfing2 from "@coaster/assets/listings/surfing-2.jpg";
import Surfing3 from "@coaster/assets/listings/surfing-3.jpg";
import Yoga1 from "@coaster/assets/listings/yoga-1.jpg";
import Yoga2 from "@coaster/assets/listings/yoga-2.jpg";
import Yoga3 from "@coaster/assets/listings/yoga-3.jpg";
import { GeneratedCategoryType, GeneratedListing, Image as ImageType } from "@coaster/types";
import { mergeClasses } from "@coaster/utils/common";
import Image from "next/image";
import Link from "next/link";
import { getCategoryForDisplay } from "../icons/Category";

export const GeneratedSearchResult: React.FC<{ listing: GeneratedListing; className?: string }> = ({
  listing,
  className,
}) => {
  const image = getImagesForGeneratedListing(listing.category)[0];

  return (
    <Link
      className={mergeClasses(
        "tw-flex tw-flex-col tw-w-full tw-text-base tw-font-medium tw-cursor-pointer tw-text-ellipsis",
        className,
      )}
      href={`/listings/operated/${listing.category}/${listing.place}`}
      target="_blank"
      rel="noreferrer"
    >
      <Image
        width={image.width}
        height={image.height}
        alt="Listing image"
        sizes="(max-width: 400px) 75vw, (max-width: 640px) 30vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, (max-width: 1536px) 18vw, (max-width: 2000px) 15vw, 12vw"
        placeholder="data:image/svg+xml;base64,PHN2ZwogICAgICB3aWR0aD0iMTAwJSIKICAgICAgaGVpZ2h0PSIxMDAlIgogICAgICB2aWV3Qm94PSIwIDAgMTAwIDEwMCIKICAgICAgdmVyc2lvbj0iMS4xIgogICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgIHhtbG5zWGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiCiAgICA+CiAgICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWUiPgogICAgICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iI2VlZTsjZGRkOyNlZWUiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPgogICAgICA8L3JlY3Q+CiAgICA8L3N2Zz4="
        tabIndex={-1}
        className="tw-flex tw-rounded-xl tw-aspect-square tw-flex-none tw-object-cover"
        src={image.url}
      />
      <span className="tw-mt-2 sm:tw-mt-3 tw-font-bold tw-text-lg">
        {getCategoryForDisplay(listing.category) + " Experience by Coaster"}
      </span>
      <span>{listing.place}</span>
      <span>$100 • 2 hours</span>
    </Link>
  );
};

export const getImagesForGeneratedListing = (category: GeneratedCategoryType): ImageType[] => {
  switch (category) {
    case "surfing":
      return [
        {
          id: 0,
          url: Surfing1.src,
          width: 2307,
          height: 3078,
        },
        {
          id: 0,
          url: Surfing2.src,
          width: 4242,
          height: 2828,
        },
        {
          id: 0,
          url: Surfing3.src,
          width: 3200,
          height: 4000,
        },
      ];
    case "skiing":
      return [
        {
          id: 0,
          url: Skiing1.src,
          width: 5826,
          height: 3884,
        },
        {
          id: 0,
          url: Skiing2.src,
          width: 4959,
          height: 3306,
        },
        {
          id: 0,
          url: Skiing3.src,
          width: 1934,
          height: 2961,
        },
      ];
    case "hiking":
      return [
        {
          id: 0,
          url: Hiking1.src,
          width: 4592,
          height: 3064,
        },
        {
          id: 0,
          url: Hiking2.src,
          width: 5760,
          height: 3840,
        },
        {
          id: 0,
          url: Hiking3.src,
          width: 1382,
          height: 2074,
        },
      ];
    case "oceanfishing":
      return [
        {
          id: 0,
          url: OceanFishing1.src,
          width: 5085,
          height: 3390,
        },
        {
          id: 0,
          url: OceanFishing2.src,
          width: 3907,
          height: 5860,
        },
        {
          id: 0,
          url: OceanFishing3.src,
          width: 3000,
          height: 2000,
        },
      ];
    case "flyfishing":
      return [
        {
          id: 0,
          url: FlyFishing1.src,
          width: 5400,
          height: 3600,
        },
        {
          id: 0,
          url: FlyFishing2.src,
          width: 3543,
          height: 2612,
        },
        {
          id: 0,
          url: FlyFishing3.src,
          width: 5464,
          height: 3643,
        },
      ];
    case "climbing":
      return [
        {
          id: 0,
          url: Climbing1.src,
          width: 2000,
          height: 3000,
        },
        {
          id: 0,
          url: Climbing2.src,
          width: 3744,
          height: 4680,
        },
        {
          id: 0,
          url: Climbing3.src,
          width: 3264,
          height: 4928,
        },
      ];
    case "iceclimbing":
      return [
        {
          id: 0,
          url: IceClimbing1.src,
          width: 2000,
          height: 3000,
        },
        {
          id: 0,
          url: IceClimbing2.src,
          width: 4000,
          height: 6000,
        },
        {
          id: 0,
          url: IceClimbing3.src,
          width: 4032,
          height: 3024,
        },
      ];
    case "cycling":
      return [
        {
          id: 0,
          url: Cycling1.src,
          width: 3949,
          height: 2633,
        },
        {
          id: 0,
          url: Cycling2.src,
          width: 6000,
          height: 4000,
        },
        {
          id: 0,
          url: Cycling3.src,
          width: 3600,
          height: 2400,
        },
      ];
    case "diving":
      return [
        {
          id: 0,
          url: Diving1.src,
          width: 3182,
          height: 3093,
        },
        {
          id: 0,
          url: Diving2.src,
          width: 4000,
          height: 3000,
        },
        {
          id: 0,
          url: Diving3.src,
          width: 2592,
          height: 3872,
        },
      ];
    case "sup":
      return [
        {
          id: 0,
          url: Sup1.src,
          width: 4536,
          height: 4593,
        },
        {
          id: 0,
          url: Sup2.src,
          width: 6016,
          height: 4000,
        },
        {
          id: 0,
          url: Sup3.src,
          width: 4392,
          height: 2930,
        },
      ];
    case "camping":
      return [
        {
          id: 0,
          url: Camping1.src,
          width: 2062,
          height: 2113,
        },
        {
          id: 0,
          url: Camping2.src,
          width: 3000,
          height: 2000,
        },
        {
          id: 0,
          url: Camping3.src,
          width: 2208,
          height: 1472,
        },
      ];
    case "yoga":
      return [
        {
          id: 0,
          url: Yoga1.src,
          width: 2873,
          height: 2986,
        },
        {
          id: 0,
          url: Yoga2.src,
          width: 2908,
          height: 1833,
        },
        {
          id: 0,
          url: Yoga3.src,
          width: 3181,
          height: 2122,
        },
      ];
    case "snorkeling":
      return [
        {
          id: 0,
          url: Snorkeling1.src,
          width: 1333,
          height: 1333,
        },
        {
          id: 0,
          url: Snorkeling2.src,
          width: 2592,
          height: 1728,
        },
        {
          id: 0,
          url: Snorkeling3.src,
          width: 4608,
          height: 3456,
        },
      ];
  }
};

export const getDescriptionForCategory = (category: GeneratedCategoryType): string => {
  switch (category) {
    case "surfing":
      return `
Dive into an exhilarating two-hour surfing escapade that will leave you breathless and craving more! Join us for an unforgettable journey where you'll conquer the waves and dance on the water.

We'll start with a quick safety briefing and then get you fitted with a wetsuit and surfboard. Then we'll head out to the water and get you up on your board in no time!

Whether you're a beginner or an experienced surfer, we'll make sure you have a great time. We'll teach you how to catch waves, pop up on your board, and ride the waves like a pro. You'll be surfing in no time!
`;
    case "skiing":
      return `
Join us for a day of skiing in the mountains. We'll take you on a guided tour through some of the best terrain in the area, and we'll make sure you have an unforgettable experience.

We'll start with a quick safety briefing and then get you fitted with skis and poles. Then we'll head out to the slopes and get you up on your skis in no time!

Whether you're a beginner or an experienced skier, we'll make sure you have a great time. We'll teach you how to carve turns, stop, and ride the slopes like a pro. You'll be skiing in no time!
`;
    case "hiking":
      return `
Lace up your boots and venture into a world of natural wonder! Imagine yourself surrounded by lush greenery, breathing in the crisp, fresh air as you step onto the trailhead. In just two hours, immerse yourself in the beauty of nature, where every step leads to breathtaking vistas and newfound serenity.

Feel the thrill of conquering trails that wind through stunning landscapes. With each ascent, witness panoramic views that steal your breath away. This short but invigorating hike offers a glimpse into the splendor of the outdoors, a chance to reconnect with nature and find solace in its tranquility.

As the hike concludes, bask in the glow of accomplishment and the awe-inspiring sights you've witnessed. Capture memories of this brief but profound journey, where every step brings you closer to the heart of the wilderness.

Don't miss this chance to explore the great outdoors! Join us for a two-hour hiking adventure and uncover the magic that lies within nature's embrace.
`;
    case "oceanfishing":
      return `
Step aboard for an incredible fishing journey that spans two hours. Feel the tranquility of the open waters and the thrill of the catch as you indulge in this serene yet exciting adventure.

Cast your line into the depths, surrounded by the peaceful embrace of the sea. Whether you're a seasoned angler or new to fishing, this trip offers the perfect chance to reel in your prize and forge unforgettable moments.

As the sun begins its descent, cherish the camaraderie and the joy of every catch. Whether it's a big haul or quiet moments on the water, this two-hour fishing escapade promises a serene escape into nature's beauty.

Don't miss out on this opportunity to enjoy two hours of fishing bliss on a boat. Join us for an adventure on the water and discover the thrill of angling in a tranquil and beautiful setting.
`;
    case "flyfishing":
      return `
Step into the world of fly fishing for an unforgettable two-hour adventure. Immerse yourself in the artistry of casting and the tranquility of the water as you hone your skills in this timeless and rewarding sport.

Feel the anticipation as your fly lands gently on the water's surface, inviting the dance of the elusive fish. Whether you're a seasoned fly fisher or just starting, this excursion provides the perfect opportunity to refine your technique and connect with nature.

As you wade through the serene waters and cast your line, relish the peaceful ambiance and the artful rhythm of the sport. Whether you hook the grand prize or savor the quiet moments, this two-hour fly fishing experience promises a serene escape into the beauty of the outdoors.

Don't miss this chance to spend two hours mastering the art of fly fishing. Join us for an enriching adventure and discover the harmony between angler and nature in a tranquil and picturesque setting.
`;
    case "climbing":
      return `
Prepare to scale new heights in a thrilling two-hour climbing expedition. Whether you're a novice or seasoned climber, this adventure promises an adrenaline-pumping experience amidst breathtaking landscapes.

Strap on your harness and chalk up your hands as you navigate rock faces and cliffs. Feel the rush of pushing your limits, conquering obstacles, and immersing yourself in the sheer joy of ascending into the sky.

With every grip and foothold, absorb the stunning views and the sense of accomplishment as you ascend. Whether you aim for the peak or revel in the challenge of the climb, this two-hour adventure is an invitation to push boundaries and relish the thrill of vertical exploration.

Don't miss this chance to spend two hours climbing to new heights. Join us for an exhilarating journey and discover the thrill of reaching summits in a safe and adventurous setting.
`;
    case "iceclimbing":
      return `
Gear up for an exhilarating two-hour ice climbing adventure amidst stunning icy landscapes. Whether you're a beginner or seasoned climber, this journey promises an adrenaline-filled experience in a winter wonderland.

Harness yourself and pick your ice axes, ready to conquer frozen walls and icy peaks. Feel the adrenaline surge as you navigate the crystalline surfaces, finding your grip and rhythm in the challenge of scaling icy cliffs.

With each calculated step and swing of your axe, embrace the breathtaking surroundings and the thrill of ascending sheer ice. Whether you aim to conquer a specific peak or relish the sheer thrill of the climb, this two-hour adventure is an invitation to push limits in a frozen playground.

Don't miss the opportunity to spend two hours scaling icy heights. Join us for a thrilling ice climbing expedition and discover the sheer excitement of conquering frozen terrains in a safe and exhilarating environment.
`;
    case "cycling":
      return `
Get ready to hit the road for an invigorating two-hour cycling escapade through picturesque landscapes. Whether you're a casual rider or an enthusiast, this journey promises an exhilarating ride in the great outdoors.

Hop on your bike and feel the wind against your face as you navigate winding trails and scenic paths. Embrace the rhythm of your pedals as you explore the beauty of nature, soaking in the sights and sounds along the way.

With each turn of the wheel, immerse yourself in the tranquility of the surroundings. Whether you're chasing speed or enjoying a leisurely ride, this two-hour cycling adventure is an opportunity to connect with nature and experience the freedom of the open road.

Don't miss this chance to spend two hours pedaling through stunning landscapes. Join us for a cycling adventure and discover the joy of exploring scenic routes in a refreshing and active outdoor experience.
`;
    case "diving":
      return `
Join us for an incredible two-hour diving expedition into the mesmerizing world beneath the waves. Whether you're a seasoned diver or a beginner, this journey offers an immersive experience in the vibrant underwater realm.

Gear up and descend into the crystal-clear waters, surrounded by an array of marine life. Feel the weightlessness as you glide through the aquatic world, mesmerized by the colorful corals and the dance of sea creatures.

With each dive, discover a new dimension of beauty and tranquility. Whether you're exploring shipwrecks, encountering exotic fish, or marveling at underwater landscapes, this two-hour adventure is a gateway to uncovering the mysteries of the ocean.

Don't miss the chance to spend two hours exploring the underwater wonders. Join us for a diving excursion and delve into a world of enchantment, discovering the beauty and serenity that lie beneath the surface.
`;
    case "sup":
      return `
Get ready for an exciting two-hour stand-up paddle boarding (SUP) journey across serene waters. Whether you're a beginner or an experienced paddler, this experience offers a blend of relaxation and adventure on the water.

Grab your board and paddle and step onto the calm surface, feeling the stability beneath your feet as you navigate the gentle waves. Embrace the peaceful rhythm of paddling, exploring the beauty of the surroundings from a unique vantage point.

With each stroke, immerse yourself in the tranquility of the water and the scenic views around you. Whether you're aiming for a leisurely glide or seeking a bit of exercise, this two-hour SUP adventure invites you to enjoy the serene and meditative experience on the water.

Don't miss this chance to spend two hours gliding on tranquil waters. Join us for a stand-up paddle boarding adventure and discover the joy of exploring serene landscapes while floating atop the water's surface.
`;
    case "camping":
      return `
Prepare for a brief yet enchanting two-hour camping experience nestled in the heart of nature. Whether you're a seasoned camper or new to outdoor adventures, this journey promises a serene connection with the great outdoors.

Pitch your tent amidst the natural beauty surrounding you, setting the stage for a peaceful retreat. Immerse yourself in the tranquility of the wilderness, listening to the soothing sounds of nature and feeling the crisp air enveloping you.

With the soft glow of the setting sun, relish the simple joys of a campfire, storytelling, or simply soaking in the beauty of the starlit sky. This two-hour camping experience offers a brief but profound respite, a chance to unwind and appreciate the serenity of nature's embrace.

Don't miss the opportunity to spend two hours immersed in a camping escape. Join us for a tranquil camping adventure and discover the simple pleasures of reconnecting with nature in a serene and secluded setting.
`;
    case "yoga":
      return `
Indulge in a serene two-hour yoga experience that transcends the ordinary. Whether you're a seasoned yogi or just beginning your journey, this retreat promises a tranquil space to reconnect with your body and mind.

Find your mat in a serene setting, surrounded by nature's calm or in a peaceful studio. Engage in gentle stretches, breathing exercises, and mindful movements that invite relaxation and inner balance.

With each pose, embrace a sense of peace and harmony, allowing the stresses of the day to melt away. Whether you seek a rejuvenating flow or a moment of stillness, this two-hour yoga retreat offers an oasis of tranquility and self-discovery.

Don't miss this chance to spend two hours nurturing your body and spirit through yoga. Join us for a blissful retreat and discover the profound serenity and rejuvenation that comes from embracing yoga's gentle embrace.
`;
    case "snorkeling":
      return `
Prepare for an incredible two-hour snorkeling escapade in the vibrant underwater world. Whether you're a novice or an experienced snorkeler, this journey invites you to discover the mesmerizing beauty beneath the waves.

Equip your snorkel gear and glide into the crystal-clear waters, surrounded by a kaleidoscope of marine life. Feel the thrill as you float effortlessly, observing the colorful coral reefs and the graceful movements of underwater creatures.

With each dive, immerse yourself in a world of breathtaking beauty and tranquility. Whether you're exploring hidden coves, encountering tropical fish, or marveling at the diverse marine ecosystem, this two-hour adventure unveils the enchantment of the ocean's depths.

Don't miss the opportunity to spend two hours exploring the underwater marvels. Join us for a snorkeling expedition and uncover the wonders of the underwater realm, experiencing the awe-inspiring beauty that lies beneath the surface.
`;
  }
};
