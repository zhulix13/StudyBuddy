import Hero from "../../components/constant/hero/page";
import StudyBuddyFeaturesCarousel from "./StuddyBuddyCarousel";
import InteractiveDemoSection from "./InteractiveDemo"; 
import ProblemSolutionSection from "./ProblemSolution";
import HowItWorksSection from "./HowitWorks";


const Home = () => {
  return (
    <div>
      <Hero />
      <StudyBuddyFeaturesCarousel />
      <InteractiveDemoSection />
      <ProblemSolutionSection />
      <HowItWorksSection />
    </div>
  )
}

export default Home



