import SectionTitle from "../Common/SectionTitle";
import SingleFeature from "./SingleFeature";
import featuresData from "./featuresData";

const Features = () => {
  return (
    <>
      <section id="features" className="py-16 md:py-20 lg:py-28 relative overflow-hidden">
        {/* Spotlight Effect - Top Right */}
        <div className="absolute top-0 right-0 -z-10 pointer-events-none">
          <svg
            width="238"
            height="531"
            viewBox="0 0 238 531"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              opacity="0.3"
              x="422.819"
              y="-70.8145"
              width="196"
              height="541.607"
              rx="2"
              transform="rotate(51.2997 422.819 -70.8145)"
              fill="url(#paint0_linear_83:2)"
            />
            <rect
              opacity="0.3"
              x="426.568"
              y="144.886"
              width="59.7544"
              height="541.607"
              rx="2"
              transform="rotate(51.2997 426.568 144.886)"
              fill="url(#paint1_linear_83:2)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_83:2"
                x1="517.152"
                y1="-251.373"
                x2="517.152"
                y2="459.865"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_83:2"
                x1="455.327"
                y1="-35.673"
                x2="455.327"
                y2="675.565"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Spotlight Effect - Bottom Left */}
        <div className="absolute bottom-0 left-0 -z-10 pointer-events-none">
          <svg
            width="238"
            height="531"
            viewBox="0 0 238 531"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              opacity="0.3"
              x="422.819"
              y="-70.8145"
              width="196"
              height="541.607"
              rx="2"
              transform="rotate(51.2997 422.819 -70.8145)"
              fill="url(#paint0_linear_83:2)"
            />
            <rect
              opacity="0.3"
              x="426.568"
              y="144.886"
              width="59.7544"
              height="541.607"
              rx="2"
              transform="rotate(51.2997 426.568 144.886)"
              fill="url(#paint1_linear_83:2)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_83:2"
                x1="517.152"
                y1="-251.373"
                x2="517.152"
                y2="459.865"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_83:2"
                x1="455.327"
                y1="-35.673"
                x2="455.327"
                y2="675.565"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="container">
          <SectionTitle
            title="Main Features"
            paragraph="There are many variations of passages of Lorem Ipsum available but the majority have suffered alteration in some form."
            center
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map((feature) => (
              <SingleFeature key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;