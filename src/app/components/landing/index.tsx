// import Navbar from "./navbar";
import Hero from "./hero";
import { LandingTabs } from "./tabs";
import { Pit } from "./pit";
import Pricing from "./pricing";
import Faq from "./faq";
import Cta from "./cta";
import Footer from "./footer";
import { LandingNavbar } from "./navbar";
import { AnimateOnScroll } from "../shared/animation/animate-on-scroll";

export default function Landing() {
  return (
    <div>
      <div className="flex flex-col gap-16 md:gap-24 pt-8">
        <LandingNavbar />
        <Hero />
        <AnimateOnScroll animation="slide-up" delay={0.1}>
          <LandingTabs />
        </AnimateOnScroll>

        <AnimateOnScroll animation="slide-up" delay={0.1}>
          <Pit />
        </AnimateOnScroll>

        <AnimateOnScroll animation="slide-up" delay={0.1}>
          <Pricing />
        </AnimateOnScroll>

        <AnimateOnScroll animation="slide-up" delay={0.1}>
          <Faq />
        </AnimateOnScroll>

        <AnimateOnScroll animation="slide-up" delay={0.1}>
          <Cta />
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade" delay={0.2}>
          <Footer />
        </AnimateOnScroll>
      </div>
    </div>
  );
}
