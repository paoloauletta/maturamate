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
import { AnimateOnScroll } from "../components/animation/animate-on-scroll";

export default function Landing() {
  return (
    <div>
      <LandingNavbar />

      <AnimateOnScroll animation="fade" duration={0.7}>
        <Hero />
      </AnimateOnScroll>

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
        <FAQ />
      </AnimateOnScroll>

      <AnimateOnScroll animation="slide-up" delay={0.1}>
        <CTA />
      </AnimateOnScroll>

      <AnimateOnScroll animation="fade" delay={0.2}>
        <Footer />
      </AnimateOnScroll>
    </div>
  );
}
