import React, { useState, useEffect, useRef } from 'react';
import { UserX, Users, FileText, BookOpen, TrendingDown, TrendingUp, MessageSquareX, MessageCircle, Clock, CheckCircle, ArrowRight } from 'lucide-react';

const ProblemSolutionSection = () => {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const sectionRef = useRef(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardIndex = parseInt((entry.target as HTMLElement).dataset.cardIndex || '0');
            setVisibleCards(prev => [...new Set([...prev, cardIndex])]);
          }
        });
      },
      { threshold: 0.3 }
    );

    const cards = document.querySelectorAll('[data-card-index]');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const problemSolutions = [
    {
      problem: {
        icon: UserX,
        title: "Studying Alone",
        description: "Isolated learning with no accountability or peer support",
        color: "from-red-500 to-orange-500",
        bgColor: "bg-red-50 dark:bg-red-900/10",
        borderColor: "border-red-200 dark:border-red-800/30"
      },
      solution: {
        icon: Users,
        title: "Collaborative Groups", 
        description: "Connect with peers who share your academic goals and schedule",
        color: "from-blue-500 to-emerald-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/10",
        borderColor: "border-blue-200 dark:border-blue-800/30"
      }
    },
    {
      problem: {
        icon: FileText,
        title: "Scattered Notes",
        description: "Fragmented information across multiple apps and formats",
        color: "from-orange-500 to-red-500",
        bgColor: "bg-orange-50 dark:bg-orange-900/10", 
        borderColor: "border-orange-200 dark:border-orange-800/30"
      },
      solution: {
        icon: BookOpen,
        title: "Unified Workspace",
        description: "All study materials organized and accessible in one place",
        color: "from-emerald-500 to-blue-500",
        bgColor: "bg-emerald-50 dark:bg-emerald-900/10",
        borderColor: "border-emerald-200 dark:border-emerald-800/30"
      }
    },
   //  {
   //    problem: {
   //      icon: TrendingDown,
   //      title: "No Accountability",
   //      description: "Easy to procrastinate without peer pressure or tracking",
   //      color: "from-gray-500 to-slate-500",
   //      bgColor: "bg-gray-50 dark:bg-gray-900/10",
   //      borderColor: "border-gray-200 dark:border-gray-800/30"
   //    },
   //    solution: {
   //      icon: TrendingUp,
   //      title: "Progress Tracking",
   //      description: "Stay motivated with goals, streaks, and group achievements",
   //      color: "from-purple-500 to-blue-500",
   //      bgColor: "bg-purple-50 dark:bg-purple-900/10",
   //      borderColor: "border-purple-200 dark:border-purple-800/30"
   //    }
   //  },
   //  {
   //    problem: {
   //      icon: MessageSquareX,
   //      title: "Poor Communication",
   //      description: "Difficult coordination through scattered text messages",
   //      color: "from-red-500 to-pink-500",
   //      bgColor: "bg-pink-50 dark:bg-pink-900/10",
   //      borderColor: "border-pink-200 dark:border-pink-800/30"
   //    },
   //    solution: {
   //      icon: MessageCircle,
   //      title: "Real-time Chat",
   //      description: "Instant communication with context-aware study discussions",
   //      color: "from-blue-500 to-purple-500",
   //      bgColor: "bg-indigo-50 dark:bg-indigo-900/10",
   //      borderColor: "border-indigo-200 dark:border-indigo-800/30"
   //    }
   //  }
  ];

  const FlipCard = ({ problemSolution, index, isVisible }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
      <div 
        data-card-index={index}
        className={`relative h-80 w-full transform-gpu transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: `${index * 200}ms` }}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <div className={`relative h-full w-full transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}>
          {/* Problem Side (Front) */}
          <div className={`absolute inset-0 w-full h-full backface-hidden rounded-3xl border ${problemSolution.problem.borderColor} ${problemSolution.problem.bgColor} p-6 flex flex-col justify-center items-center text-center shadow-lg hover:shadow-xl transition-shadow duration-300`}>
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${problemSolution.problem.color} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
              <problemSolution.problem.icon className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {problemSolution.problem.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              {problemSolution.problem.description}
            </p>

            <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              <span>Hover to see solution</span>
              <ArrowRight className="w-4 h-4 ml-1 animate-pulse" />
            </div>
          </div>

          {/* Solution Side (Back) */}
          <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl border ${problemSolution.solution.borderColor} ${problemSolution.solution.bgColor} p-6 flex flex-col justify-center items-center text-center shadow-lg`}>
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${problemSolution.solution.color} flex items-center justify-center mb-6 transform scale-110 transition-transform duration-300`}>
              <problemSolution.solution.icon className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {problemSolution.solution.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              {problemSolution.solution.description}
            </p>

            <div className="flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Problem Solved
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section ref={sectionRef} className="relative py-24 bg-slate-50/50 dark:bg-gray-900/50 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-slate-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-100 to-emerald-100 dark:from-red-950/50 dark:to-emerald-950/50 border border-red-200/50 dark:border-red-800/50 rounded-full px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 backdrop-blur-sm mb-6">
            <Clock className="w-4 h-4" />
            <span>Traditional studying problems solved</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            From 
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"> Frustration </span>
            to 
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent"> Success</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            StudyBuddy transforms common study challenges into collaborative opportunities. 
            See how we turn your biggest academic frustrations into your greatest strengths.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
          {problemSolutions.map((problemSolution, index) => (
            <FlipCard 
              key={index}
              problemSolution={problemSolution} 
              index={index}
              isVisible={visibleCards.includes(index)}
            />
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">73%</div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">Students struggle with motivation when studying alone</div>
          </div>

          <div className="text-center p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">89%</div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">Improvement in retention with collaborative learning</div>
          </div>

          <div className="text-center p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">2.3x</div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">Faster learning progress in study groups</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1"
          >
            Transform Your Study Experience
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>

      <style >{`
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </section>
  );
};

export default ProblemSolutionSection;