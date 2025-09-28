import React from 'react';
import { BookOpen, Mail, Github, Twitter, Linkedin, Facebook, Instagram, ArrowRight, MessageCircle, Users, TrendingUp, Shield, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/features" },
        { name: "Study Groups", href: "/groups" },
        { name: "Pricing", href: "/pricing" },
        { name: "Mobile App", href: "/mobile" },
        { name: "Desktop App", href: "/desktop" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Getting Started", href: "/getting-started" },
        { name: "Study Tips", href: "/blog/study-tips" },
        { name: "Success Stories", href: "/success-stories" },
        { name: "API Docs", href: "/docs" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact" },
        { name: "Press Kit", href: "/press" },
        { name: "Partners", href: "/partners" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "GDPR", href: "/gdpr" },
        { name: "Student Privacy", href: "/student-privacy" }
      ]
    }
  ];

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/studybuddy", color: "hover:text-blue-400" },
    { name: "GitHub", icon: Github, href: "https://github.com/studybuddy", color: "hover:text-gray-300" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/studybuddy", color: "hover:text-blue-500" },
    { name: "Facebook", icon: Facebook, href: "https://facebook.com/studybuddy", color: "hover:text-blue-600" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/studybuddy", color: "hover:text-pink-400" }
  ];

  const quickFeatures = [
    { icon: MessageCircle, text: "Real-time Chat" },
    { icon: Users, text: "Study Groups" },
    { icon: TrendingUp, text: "Progress Tracking" },
    { icon: Shield, text: "Secure & Private" }
  ];

  return (
    <footer className="relative bg-gray-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  StudyBuddy
                </span>
              </div>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Empowering students worldwide to learn together, achieve more, and build lasting connections through collaborative study experiences.
              </p>

              {/* Quick Features */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {quickFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                      <Icon className="w-4 h-4 text-blue-400" />
                      <span>{feature.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Newsletter Signup */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                <h4 className="font-semibold text-white mb-2">Stay Updated</h4>
                <p className="text-gray-400 text-sm mb-4">Get study tips and product updates</p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg hover:from-blue-700 hover:to-emerald-700 transition-all duration-200 flex items-center">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-8">
              <div className="grid md:grid-cols-4 gap-8">
                {footerSections.map((section, index) => (
                  <div key={index}>
                    <h4 className="font-semibold text-white mb-4 text-lg">
                      {section.title}
                    </h4>
                    <ul className="space-y-3">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <a
                            href={link.href}
                            className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Copyright & Attribution */}
              <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-400">
                <span>© {currentYear} StudyBuddy. All rights reserved.</span>
                <div className="flex items-center gap-4">
                  <span className="hidden md:inline">•</span>
                  <div className="flex items-center gap-1">
                    <span>Built with</span>
                    <Heart className="w-4 h-4 text-red-500 mx-1" />
                    <span>by</span>
                    <a
                      href="https://donatusdev.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
                    >
                      Donatus
                    </a>
                  </div>
                  <span>•</span>
                  <a
                    href="https://github.com/zhulix13"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 hidden sm:inline">Follow us:</span>
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-gray-400 ${social.color} transition-colors duration-200 p-2 hover:bg-gray-800 rounded-lg`}
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-gray-800/50 border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>All systems operational</span>
                </div>
                <span>•</span>
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <span>99.9% uptime</span>
                <span>•</span>
                <span>Response time: &lt;100ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;