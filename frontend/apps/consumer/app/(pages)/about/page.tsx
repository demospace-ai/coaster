import BigSur from "@coaster/assets/bigsur.jpeg";
import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="tw-flex tw-items-center tw-justify-center tw-w-full tw-px-5 sm:tw-px-20 tw-mt-6 sm:tw-mt-10 tw-pb-16 sm:tw-pb-32">
      <div className="tw-w-full tw-max-w-4xl tw-text-base">
        <h1 className="tw-font-bold tw-text-4xl sm:tw-text-5xl tw-mb-4 sm:tw-mb-6">About Us</h1>
        <Image src={BigSur} alt="Big Sur" className="tw-rounded-xl tw-mb-5 sm:tw-mb-8" sizes="60vw" />
        <h2 className="tw-text-2xl tw-font-semibold tw-mb-4">Find your next adventure</h2>
        <p className="tw-mb-5">
          At Coaster, we're passionate about transforming regular vacations into unforgettable adventures. Born from a
          desire to make adventure travel more accessible for everyone, our marketplace is the best way to find
          hand-selected outdoor experiences without any of the hassle. From iconic peaks to hidden treasures off the
          beaten path, we curate a diverse array of adventures tailored for every adventurer.
        </p>
        <div className="tw-flex tw-gap-4">
          <div>
            <h2 className="tw-text-2xl tw-font-semibold tw-mb-4">Unparalleled Convenience, Seamless Travel</h2>
            <p className="tw-mb-5">
              We understand that trip planning can be overwhelming and time-consuming. That's why Coaster is built to
              make finding the perfect trip entirely stress-free. Our app lets you find the perfect experience without
              fretting over logistics. Whether you're seeking a once-in-a-lifetime mountain expedition or just a
              two-hour surf lesson, our flexible policies and round-the-clock multilingual customer support ensure a
              smooth journey, leaving you to relish every moment.
            </p>
          </div>
        </div>
        <h2 className="tw-text-2xl tw-font-semibold tw-mb-4">Discover Your Adventure</h2>
        <p className="tw-mb-5">
          With thousands of experiences across 150 countries, Coaster helps you explore the extraordinary. Dive into our
          extensive array of unique trips, backed by insights from fellow travelers and millions of verified reviews.
          Your next unforgettable escapade awaits, brimming with tips and guidance for an unparalleled experience.
        </p>
        <h2 className="tw-text-2xl tw-font-semibold tw-mb-4">Your Travel, Your Way</h2>
        <p className="tw-mb-5">
          Embrace spontaneity or plan ahead — Coaster accommodates every style of travel. We've got your back whether
          you need help with last-minute decisions or want extra information so you can plan in advance. Enjoy the
          flexibility to book immediately and relish the freedom of free cancellations up to 24 hours beforehand, no
          strings attached. Didn't have a good time? Every trip is backed by our Coaster Guarantee— if you're not
          completely satisfied, we'll refund your entire trip.
        </p>
        <h2 className="tw-text-2xl tw-font-semibold tw-mb-4">Our Journey</h2>
        <p className="tw-mb-5">
          At Coaster, our goal is to open the world of outdoor travel to everyone. This mission was born from the
          personal journey of our founders, Nick and Cole. After reflecting on their first trips into the backcountry,
          they realized that having a professional guide made a huge difference in their experience. This same insight
          was reinforced when working with local guides to surf remote breaks outside of the US. Realizing that they
          could make adventure travel both safer and more accessible by helping people access the right resources,
          Coaster was born.
        </p>
      </div>
    </main>
  );
}
