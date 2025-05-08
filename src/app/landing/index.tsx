// import Navbar from "./navbar";
import Hero from "./hero";
import Stats from "./stats";
import { LandingTabs } from "./tabs";
import { Pit } from "./pit";
import Pricing from "./pricing";
import FAQ from "./faq";
import CTA from "./cta";
import Footer from "./footer";
import { LandingNavbar } from "./navbar";

export default function Landing() {
  return (
    <div>
      <LandingNavbar />
      <Hero />
      <LandingTabs />
      <Pit />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
