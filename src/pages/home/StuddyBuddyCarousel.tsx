import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

// Carousel Context
const CarouselContext = createContext({
  onCardClose: (index) => {},
  currentIndex: 0,
});

// Main Carousel Component
const Carousel = ({ items, initialScroll = 0 }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleCardClose = (index) => {
    if (carouselRef.current) {
      const cardWidth = window.innerWidth < 768 ? 230 : 384;
      const gap = window.innerWidth < 768 ? 4 : 8;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  return (
    <CarouselContext.Provider value={{ onCardClose: handleCardClose, currentIndex }}>
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-20"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div className="flex flex-row justify-start gap-4 pl-4 mx-auto max-w-7xl">
            {items.map((item, index) => (
              <div
                key={`card-${index}`}
                className="rounded-3xl last:pr-[5%] md:last:pr-[33%]"
                style={{
                  opacity: 0,
                  transform: 'translateY(20px)',
                  animation: `fadeInUp 0.5s ease-out ${0.2 * index}s forwards`
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mr-10 flex justify-end gap-2">
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg disabled:opacity-50 hover:shadow-xl transition-all duration-200"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg disabled:opacity-50 hover:shadow-xl transition-all duration-200"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <ArrowRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

// Card Component
const Card = ({ card, index, layout = false }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const { onCardClose } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  const BlurImage = ({ src, alt, className }) => {
    const [isLoading, setLoading] = useState(true);
    return (
      <img
        className={`h-full w-full transition duration-300 ${isLoading ? "blur-sm" : "blur-0"} ${className}`}
        onLoad={() => setLoading(false)}
        src={src}
        loading="lazy"
        decoding="async"
        alt={alt || "Feature image"}
      />
    );
  };

  return (
    <>
      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 h-screen overflow-auto">
          <div className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg" />
          <div
            ref={containerRef}
            className="relative z-[60] mx-auto my-10 h-fit max-w-5xl rounded-3xl bg-white dark:bg-gray-900 p-4 font-sans md:p-10"
          >
            <button
              className="sticky top-4 right-0 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white"
              onClick={handleClose}
            >
              <X className="h-4 w-4 text-white dark:text-black" />
            </button>
            
            <p className="text-base font-medium text-blue-600 dark:text-blue-400">
              {card.category}
            </p>
            <p className="mt-4 text-2xl font-semibold text-gray-900 md:text-5xl dark:text-white">
              {card.title}
            </p>
            <div className="py-10">{card.content}</div>
          </div>
        </div>
      )}

      {/* Card */}
      <button
        onClick={handleOpen}
        className="relative z-10 flex h-80 w-56 flex-col items-start justify-start overflow-hidden rounded-3xl bg-gray-100 md:h-[40rem] md:w-96 dark:bg-gray-800 hover:scale-[1.02] transition-transform duration-300"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-full bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        <div className="relative z-40 p-6 md:p-8">
          <p className="text-left font-sans text-sm font-medium text-blue-200 md:text-base">
            {card.category}
          </p>
          <p className="mt-2 max-w-xs text-left font-sans text-xl font-semibold text-white md:text-3xl [text-wrap:balance]">
            {card.title}
          </p>
        </div>
        <BlurImage
          src={card.src}
          alt={card.title}
          className="absolute inset-0 z-10 object-cover"
        />
      </button>
    </>
  );
};

// Content Components
const CollaborationContent = () => (
  <div className="space-y-6">
    {[
      {
        title: "Real-time Editing",
        desc: "Multiple students can edit notes simultaneously with live cursor tracking and instant sync.",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
      },
      {
        title: "Smart Conflict Resolution", 
        desc: "AI-powered merge system handles editing conflicts automatically, keeping everyone in sync.",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"
      }
    ].map((item, i) => (
      <div key={i} className="bg-slate-50 dark:bg-gray-800 p-6 md:p-8 rounded-3xl">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <img src={item.image} alt={item.title} className="w-full md:w-1/2 h-48 object-cover rounded-2xl" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{item.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const StudyGroupsContent = () => (
  <div className="space-y-6">
    {[
      {
        title: "Smart Group Matching",
        desc: "AI matches you with study partners based on learning style, schedule, and academic goals.",
        image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop"
      },
      {
        title: "Structured Learning Paths",
        desc: "Organized study plans with milestone tracking and peer accountability features.",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop"
      }
    ].map((item, i) => (
      <div key={i} className="bg-slate-50 dark:bg-gray-800 p-6 md:p-8 rounded-3xl">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <img src={item.image} alt={item.title} className="w-full md:w-1/2 h-48 object-cover rounded-2xl" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{item.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ProgressContent = () => (
  <div className="space-y-6">
    {[
      {
        title: "Learning Analytics",
        desc: "Track your study habits, identify peak learning times, and optimize your schedule for better results.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
      },
      {
        title: "Achievement System",
        desc: "Earn badges, compete with friends, and celebrate milestones to stay motivated throughout your journey.",
        image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070&auto=format&fit=crop"
      }
    ].map((item, i) => (
      <div key={i} className="bg-slate-50 dark:bg-gray-800 p-6 md:p-8 rounded-3xl">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <img src={item.image} alt={item.title} className="w-full md:w-1/2 h-48 object-cover rounded-2xl" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{item.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Main Section Component
const StudyBuddyFeaturesCarousel = () => {
  const cards = [
    {
      category: "Collaboration",
      title: "Study together in real-time",
      src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3",
      content: <CollaborationContent />,
    },
    {
      category: "Study Groups", 
      title: "Find your perfect study partners",
      src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop&ixlib=rb-4.0.3",
      content: <StudyGroupsContent />,
    },
    {
      category: "Progress Tracking",
      title: "Monitor your learning journey", 
      src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      content: <ProgressContent />,
    },
    {
      category: "Smart Notes",
      title: "AI-powered study materials",
      src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      content: <CollaborationContent />,
    },
    {
      category: "Live Sessions",
      title: "Interactive group study sessions",
      src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      content: <StudyGroupsContent />,
    }
  ];

  const items = cards.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <section className="w-full py-8 md:py-12 bg-slate-50/50 dark:bg-gray-900/50">
      <style >{`
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to
            <span className="bg-gradient-to-r from-blue-600 to-slate-800 dark:from-blue-400 dark:to-slate-200 bg-clip-text text-transparent">
              {" "}study smarter
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover powerful features designed to transform how you learn and collaborate with fellow students.
          </p>
        </div>
        
        <Carousel items={items} />
      </div>
    </section>
  );
};

export default StudyBuddyFeaturesCarousel;