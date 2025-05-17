import Image from "next/image";

const AboutSectionTwo = () => {
  return (
    <section
      className="py-16 md:py-20 lg:py-28 relative"
      style={{
        backgroundImage: "url(/images/video/shape.svg)", // Ensure this file exists
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="container">
        <div className="-mx-4 flex flex-wrap items-center">
          {/* Left Section */}
          <div className="w-full px-4 lg:w-1/2">
            <div
              className="relative mx-auto mb-12 aspect-25/24 max-w-[500px] text-center lg:m-0"
              data-wow-delay=".15s"
            >
              <Image
                src="/images/logo/logo.png"
                alt="logo"
                width={600}
                height={600}
                className="dark:hidden"
              />
              <Image
                src="/images/logo/logo.png"
                alt="logo"
                width={100}
                height={10}
                className="hidden dark:block"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="w-full px-4 lg:w-1/2">
            <div className="max-w-[470px]">
              <div className="mb-9">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Our Mission
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  At Prithvi Travels, our mission is to make travel accessible, enjoyable, and memorable for everyone. We aim to provide exceptional travel experiences that connect people with the beauty of the world.
                </p>
              </div>

              <div className="mb-9">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Why Choose Us?
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  With years of experience in the travel industry, we offer personalized itineraries, affordable packages, and 24/7 customer support to ensure your journey is seamless and stress-free.
                </p>
              </div>

              <div className="mb-1">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Our Values
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  We believe in sustainable and eco-friendly travel. Our team is dedicated to preserving the environment while creating unforgettable travel experiences for our customers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionTwo;