import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact/contact";




const ContactPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Contact Page"
        description="Contact Us for any Questions."
      />

      <Contact />
    </>
  );
};

export default ContactPage;
