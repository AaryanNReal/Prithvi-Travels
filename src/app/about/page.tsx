import AboutSectionOne from "@/components/About/AboutSectionOne";
import Breadcrumb from "@/components/Common/Breadcrumb";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Prithvi Travels | Our Story & Mission',
  description: 'Discover the story behind Prithvi Travels - our passion for travel, commitment to excellence, and dedication to creating unforgettable journeys.',
  keywords: [
    'Prithvi Travels',
    'about us',
    'travel company',
    'our story',
    'travel agency',
    'tour operators'
  ],
  openGraph: {
    title: 'About Prithvi Travels | Our Story & Mission',
    description: 'Discover the story behind Prithvi Travels and our passion for creating unforgettable journeys',
    url: 'https://prithvitravels.com/about',
    images: [{
      url: 'https://prithvitravels.com/images/about-og.jpg',
      width: 1200,
      height: 630,
      alt: 'Prithvi Travels Team',
    }],
    siteName: 'Prithvi Travels',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Prithvi Travels | Our Story & Mission',
    description: 'Discover the story behind Prithvi Travels and our passion for travel',
    images: ['https://prithvitravels.com/images/about-twitter.jpg'],
  },
  alternates: {
    canonical: 'https://prithvitravels.com/about',
  },
  robots: {
    index: true,
    follow: true,
  },
};

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