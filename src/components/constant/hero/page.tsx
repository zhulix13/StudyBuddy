
import { Users, BookOpen, MessageCircle, TrendingUp, Star, ArrowRight, Zap, Globe, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-2 mb-8 border border-blue-200">
            <span className="text-blue-600 font-medium text-sm">✨ Welcome to the future of collaborative learning</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Study
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Together</span>
            <br />
            <span className="text-4xl md:text-6xl">Achieve More</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Connect with fellow students, collaborate in real-time, and track your progress together. 
            Transform your learning experience with StudyBuddy's powerful platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/dashboard" 
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1 flex items-center"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/discover" 
              className="group border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1 flex items-center"
            >
              Discover Groups
              <Globe className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {[
            {
              icon: <Users className="h-8 w-8" />,
              title: "Study Groups",
              description: "Join or create study groups for any subject",
              color: "from-blue-500 to-blue-600"
            },
            {
              icon: <BookOpen className="h-8 w-8" />,
              title: "Collaborative Notes",
              description: "Real-time note editing with your study partners",
              color: "from-purple-500 to-purple-600"
            },
            {
              icon: <MessageCircle className="h-8 w-8" />,
              title: "Live Chat",
              description: "Instant messaging during study sessions",
              color: "from-blue-500 to-purple-500"
            },
            {
              icon: <TrendingUp className="h-8 w-8" />,
              title: "Progress Tracking",
              description: "Monitor your learning journey and achievements",
              color: "from-purple-500 to-blue-500"
            }
          ].map((feature, index) => (
            <div key={index} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Join Thousands of Students
            </h2>
            <p className="text-xl text-gray-600">
              StudyBuddy is helping students worldwide achieve their academic goals
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: "50K+", label: "Active Students", icon: <Users className="h-8 w-8" /> },
              { number: "10K+", label: "Study Groups", icon: <BookOpen className="h-8 w-8" /> },
              { number: "1M+", label: "Study Sessions", icon: <Zap className="h-8 w-8" /> }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-blue-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How StudyBuddy Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes and transform your study experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                description: "Set up your account and personalize your study preferences",
                icon: <Shield className="h-8 w-8" />
              },
              {
                step: "02",
                title: "Join Study Groups",
                description: "Find groups for your subjects or create your own",
                icon: <Users className="h-8 w-8" />
              },
              {
                step: "03",
                title: "Start Collaborating",
                description: "Share notes, chat, and study together in real-time",
                icon: <MessageCircle className="h-8 w-8" />
              }
            ].map((step, index) => (
              <div key={index} className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-6xl font-bold text-blue-100 mb-4">{step.step}</div>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center text-white mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Students Say
            </h2>
            <p className="text-xl text-blue-100">
              Hear from our community of learners
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "StudyBuddy transformed how I approach group projects. The real-time collaboration features are incredible!",
                name: "Sarah Chen",
                role: "Computer Science Student",
                rating: 5
              },
              {
                quote: "I've improved my grades significantly since joining study groups on StudyBuddy. The progress tracking keeps me motivated.",
                name: "Marcus Johnson",
                role: "Pre-Med Student",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-blue-100">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already studying smarter, not harder.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/dashboard" 
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1 flex items-center"
            >
              Start Studying Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/groups" 
              className="group text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1 flex items-center"
            >
              Browse Groups
              <BookOpen className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;