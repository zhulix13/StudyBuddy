import React, { useState, useEffect, useRef } from "react";
import {
  UserPlus,
  Users,
  MessageCircle,
  CheckCircle,
  ArrowRight,
  Play,
  User,
  BookOpen,
  Target,
} from "lucide-react";

const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const sectionRef = useRef(null);

  const steps = [
    {
      id: 1,
      title: "Create Your Profile",
      subtitle: "Personalize your learning experience",
      description:
        "Set up your account with study preferences, subjects, and learning goals. Tell us about your schedule and what you want to achieve.",
      icon: UserPlus,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      features: [
        "Academic interests & subjects",
        "Study schedule preferences",
        "Learning style assessment",
        "Goal setting tools",
      ],
      demo: {
        title: "Quick Setup",
        content: "Complete your profile in under 2 minutes",
      },
    },
    {
      id: 2,
      title: "Find Your Study Groups",
      subtitle: "Connect with like-minded students",
      description:
        "Browse existing study groups or create your own. Our smart matching algorithm connects you with students who share your academic goals and schedule.",
      icon: Users,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      features: [
        "Subject-based group discovery",
        "Smart peer matching",
        "Schedule compatibility",
        "Group creation tools",
      ],
      demo: {
        title: "Join Groups",
        content: "Find your perfect study partners instantly",
      },
    },
    {
      id: 3,
      title: "Start Collaborating",
      subtitle: "Learn together in real-time",
      description:
        "Share notes, chat during study sessions, and track progress together. Everything syncs in real-time so everyone stays on the same page.",
      icon: MessageCircle,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      features: [
        "Real-time collaborative notes",
        "Live group chat & video calls",
        "Progress tracking & goals",
        "File sharing & resources",
      ],
      demo: {
        title: "Collaborate",
        content: "Study together from anywhere",
      },
    },
  ];

  // Intersection Observer for step animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = parseInt(
              (entry.target as HTMLElement).dataset.stepIndex || "0"
            );
            setVisibleSteps((prev) => [...new Set([...prev, stepIndex])]);

            // Auto-advance active step when in view
            setTimeout(() => {
              setActiveStep(stepIndex);
            }, stepIndex * 500);
          }
        });
      },
      { threshold: 0.2 }
    );

    const stepElements = document.querySelectorAll("[data-step-index]");
    stepElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [steps.length]);

  // Auto-cycle through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [steps.length]);

  const ProcessStep = ({
    step,
    index,
    isActive,
    isVisible,
  }: {
    step: any;
    index: number;
    isActive: boolean;
    isVisible: boolean;
  }) => {
    const Icon = step.icon;

    return (
      <div
        data-step-index={index}
        className={`relative transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-100 translate-y-4"
        }`}
        style={{ transitionDelay: `${index * 200}ms` }}
      >
        {/* Connecting Line (mobile only) */}
        {index < steps.length - 1 && (
          <div className="absolute left-8 top-20 w-0.5 h-32 bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-700 md:hidden" />
        )}

        <div
          className={`relative bg-white dark:bg-gray-800 rounded-3xl border-2 transition-all duration-500 cursor-pointer ${
            isActive
              ? `${step.borderColor} shadow-xl scale-105`
              : "border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl"
          }`}
          onClick={() => setActiveStep(index)}
        >
          <div className="p-8">
            {/* Step Number & Icon */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center transform transition-transform duration-300 ${
                  isActive ? "scale-110" : "hover:scale-105"
                }`}
              >
                <Icon className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-sm font-bold text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600">
                  {step.id}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {step.subtitle}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Features List */}
            <div className="space-y-3 mb-6">
              {step.features.map((feature: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Demo Preview */}
            <div
              className={`${step.bgColor} rounded-2xl p-4 border ${step.borderColor}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    {step.demo.title}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    {step.demo.content}
                  </div>
                </div>
                <Play className="w-6 h-6 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Active Indicator */}
          {isActive && (
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 to-emerald-500/10 pointer-events-none" />
          )}
        </div>
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-20 bg-white dark:bg-gray-900 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-emerald-100 dark:from-blue-950/50 dark:to-emerald-950/50 border border-blue-200/50 dark:border-blue-800/50 rounded-full px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 backdrop-blur-sm mb-6">
            <Target className="w-4 h-4" />
            <span>Simple 3-step process</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            How
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              {" "}
              StudyBuddy{" "}
            </span>
            Works
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Getting started with collaborative learning is simple. Follow these
            three steps to transform your study experience and connect with
            motivated peers.
          </p>
        </div>

        {/* Desktop Timeline Layout */}
        <div className="hidden md:block mb-16">
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-purple-200 dark:from-blue-800 dark:via-emerald-800 dark:to-purple-800" />

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <ProcessStep
                  key={step.id}
                  step={step}
                  index={index}
                  isActive={activeStep === index}
                  isVisible={visibleSteps.includes(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-8 mb-16">
          {steps.map((step, index) => (
            <ProcessStep
              key={step.id}
              step={step}
              index={index}
              isActive={activeStep === index}
              isVisible={visibleSteps.includes(index)}
            />
          ))}
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-3 mb-12">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeStep === index
                  ? "bg-blue-500 scale-125"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30 rounded-3xl p-8 border border-blue-200/50 dark:border-blue-800/50">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to get started?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Join thousands of students who are already studying smarter with
            StudyBuddy. Create your account and find your study group today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>

            <a
              href="/discover"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Browse Groups
              <BookOpen className="ml-2 h-5 w-5" />
            </a>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Join in 2 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
