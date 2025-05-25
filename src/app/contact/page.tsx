import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact/contact";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Get in Touch with Our Team',
  description: 'Have questions or need assistance? Reach out to our team through our contact page. We\'re here to help you with any inquiries.',
  keywords: ['contact us', 'customer support', 'help center', 'get in touch', 'inquiries'],
  openGraph: {
    title: 'Contact Us | Get in Touch with Our Team',
    description: 'Reach out to our team for any questions or support needs',
    url: 'https://yourwebsite.com/contact',
    images: [{
      url: 'https://yourwebsite.com/images/contact-og.jpg',
      width: 1200,
      height: 630,
      alt: 'Contact Our Team',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Get in Touch',
    description: 'Reach out to our team for any questions or support needs',
    images: ['https://yourwebsite.com/images/contact-twitter.jpg'],
  },
  alternates: {
    canonical: 'https://yourwebsite.com/contact',
  },
};

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