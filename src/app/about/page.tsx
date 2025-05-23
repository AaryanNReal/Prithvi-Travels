import AboutSectionOne from "@/components/About/AboutSectionOne";

import Breadcrumb from "@/components/Common/Breadcrumb";



const AboutPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="About Page"
        description="About Prithvi Travels."
      />
      <AboutSectionOne />
 
    </>
  );
};

export default AboutPage;
