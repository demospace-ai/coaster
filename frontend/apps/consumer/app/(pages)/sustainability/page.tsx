import SustainableHero from "@coaster/assets/sustainable-hero.jpg";
import SustainableLower from "@coaster/assets/sustainable-lower.jpg";
import Image from "next/image";

export default function Sustainability() {
  return (
    <main className="tw-flex tw-items-center tw-justify-center tw-w-full tw-px-5 sm:tw-px-20 tw-mt-6 sm:tw-mt-10 tw-pb-16 sm:tw-pb-32">
      <div className="tw-w-full tw-max-w-7xl tw-text-base">
        <h1 className="tw-font-bold tw-text-5xl tw-mb-6 sm:tw-mb-10">Sustainability</h1>
        <Image
          src={SustainableHero}
          alt={"Arch in Moab"}
          className="tw-rounded-xl tw-object-cover tw-mb-5 sm:tw-mb-10"
          sizes="60vw"
        />
        <div className="tw-mb-5">
          At Coaster, we passionately believe in the unparalleled power of experiential learning through connecting
          people with their environment. We understand that the most valuable kind of education is the one gained
          through firsthand experiences, where individuals immerse themselves in nature, create lasting memories, and
          forge a deep connection with their environment. Unlike reading about nature in a book, stepping outside and
          engaging with the world firsthand is a transformative journey.
        </div>
        <div>
          Coaster is not just about facilitating travel; it&apos;s about curating opportunities for individuals to
          embark on meaningful adventures, fostering a sense of wonder that inspires a commitment to climate action, and
          learning from guides who know their environment best. This commitment is rooted in the understanding that the
          more intimately people connect with their surroundings, the more passionately they will strive to protect and
          preserve our planet for generations to come.
        </div>
        <div>
          <h2 className="tw-mt-5 tw-mb-5 tw-font-semibold tw-text-2xl">What are we currently doing?</h2>
          <ul className="tw-flex tw-flex-col tw-list-disc tw-ml-5 tw-gap-2">
            <li>
              <span className="tw-font-semibold">Inspiring Responsibility</span>: Coaster recognizes that experiencing
              the beauty of nature fosters a sense of responsibility. We emphasize the importance of enjoying these
              landscapes with future generations in mind, giving our users a compelling reason to commit to climate
              action.
            </li>
            <li>
              <span className="tw-font-semibold">Educational Initiatives</span>: We integrate educational content into
              our platform, showcasing the environmental impact of travel and promoting sustainable practices. By
              providing users with insights into the ecosystems they explore, we empower them to make informed choices
              that benefit the planet and the people.
            </li>
            <li>
              <span className="tw-font-semibold">Prioritizing opportunities for local guides of color</span>: When
              curating our marketplace, we emphasize the importance of giving opportunities to guides who have been
              historically underrepresented in this industry. Informed by the fact that communities of color are three
              times more likely than white communities to live in a place that is nature deprived (
              <a href="https://www.americanprogress.org/press/release-new-report-shows-racial-economic-disparities-access-nature/">
                source
              </a>
              ), and how this impacts the access people of color have to outdoor adventure activities, Coaster addresses
              this disparity by prioritizing employment opportunities for guides of color.
            </li>
          </ul>
          <div>
            <h2 className="tw-mt-5 tw-mb-5 tw-font-semibold tw-text-2xl">What are we working on?</h2>
            <ul className="tw-flex tw-flex-col tw-list-disc tw-ml-5 tw-gap-2">
              <li>
                <span className="tw-font-semibold">Eco-Friendly Accommodations</span>: We prioritize partnerships with
                accommodations that adhere to sustainable practices. Coaster identifies and promotes eco-friendly
                hotels, lodges, and campsites, ensuring that our users have the option to make environmentally conscious
                choices.
              </li>
              <li>
                <span className="tw-font-semibold">Transportation Options</span>: Coaster encourages people to book
                adventures in locations close to home! If that is not an option, Coaster encourages low-carbon
                transportation options for reaching adventure destinations. Our platform provides information on public
                transportation, electric vehicle rentals, and other sustainable means of travel, making it easier for
                users to minimize their ecological impact.
              </li>
              <li>
                <span className="tw-font-semibold">Plastic-Free Adventures</span>: We advocate for and support guides
                and participants in adopting plastic-free practices during adventures. Coaster provides guidelines for
                minimizing single-use plastics and recognizes and rewards those who actively contribute to reducing
                environmental harm.
              </li>
              <li>
                <span className="tw-font-semibold">Green Certification</span>: Coaster is establishing a green
                certification system for guides and tour operators on our platform. This certification recognizes and
                promotes those who adhere to sustainable and eco-friendly practices, setting a standard for responsible
                adventure travel.
              </li>
            </ul>

            <div>
              <h2 className="tw-mt-5 tw-mb-5 tw-font-semibold tw-text-2xl">What&apos;s on our roadmap?</h2>
              <ul className="tw-flex tw-flex-col tw-list-disc tw-ml-5 tw-gap-2">
                <li>
                  <span className="tw-font-semibold">Carbon Offsetting</span>: Coaster is committed to offsetting the
                  carbon footprint of every adventure booked through our platform. We have partnered with reputable
                  organizations to invest in projects that contribute to carbon sequestration, renewable energy, and
                  sustainable development.
                </li>
                <li>
                  <span className="tw-font-semibold">Community Clean-Up Initiatives</span>: Coaster organizes and
                  sponsors community clean-up events in the areas where our adventures take place. By engaging our users
                  in hands-on environmental stewardship, we build a sense of community and shared responsibility for the
                  well-being of our planet. And an event for travelers to make new friends!
                </li>
              </ul>
            </div>
            <Image
              src={SustainableLower}
              alt={"Ski touring in winter"}
              className="tw-rounded-xl tw-object-cover tw-mt-5 tw-mb-5 sm:tw-mb-10"
              sizes="60vw"
            />
            <div className="tw-mt-5">
              We believe that adventure and environmental responsibility go hand in hand. Our commitment to connecting
              people with the outdoors is matched by our dedication to leading the climate movement within the travel
              industry. By taking these concrete steps and inspiring a sense of responsibility, we aim to make every
              adventure booked through Coaster a positive force for the planet. Together, we can explore, experience,
              and preserve the wonders of our world.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
