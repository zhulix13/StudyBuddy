import Hero from "../../components/constant/hero/page";
import StudyBuddyFeaturesCarousel from "./StuddyBuddyCarousel";
import InteractiveDemoSection from "./InteractiveDemo"; 
import ProblemSolutionSection from "./ProblemSolution";
import HowItWorksSection from "./HowitWorks";
import FinalCta from "./FinalCta";
import Footer from "./Footer";


const Home = () => {
  return (
    <div>
      <Hero />
      <StudyBuddyFeaturesCarousel />
      <InteractiveDemoSection />
      <ProblemSolutionSection />
      <HowItWorksSection />
      {/* <FinalCta /> */}
      <Footer />
    </div>
  )
}

export default Home



