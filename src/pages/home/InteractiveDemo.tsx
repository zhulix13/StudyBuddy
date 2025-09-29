import React, { useState, useEffect, useRef } from 'react';
import { Users, MessageCircle, Edit3, Eye, Bell, Clock, CheckCircle } from 'lucide-react';

const InteractiveDemoSection = () => {
  // Note Editor State
  const [noteContent, setNoteContent] = useState("# Chemistry Study Guide\n\n## Atomic Structure\n");
  type Cursor = {
    id: string;
    user: string;
    color: string;
    position: number;
    visible: boolean;
  };
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Chat State
  const [messages, setMessages] = useState([
    { id: 1, user: "Sarah", message: "Let's work on the chemistry notes together!", time: "2:34 PM", avatar: "S" }
  ]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Notifications State
  type Notification = {
    id: number;
    type: string;
    user: string;
    action: string;
    icon: React.ElementType;
  };
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Refs
  const noteRef = useRef(null);

  // Simulated users data
  const users = [
    { name: "Sarah", color: "bg-blue-500", avatar: "S" },
    { name: "Mike", color: "bg-emerald-500", avatar: "M" },
    { name: "Lisa", color: "bg-purple-500", avatar: "L" }
  ];

  const fullNoteContent = `# Chemistry Study Guide

## Atomic Structure
- Protons: Positively charged particles in nucleus
- Electrons: Negatively charged particles in orbitals
- Neutrons: Neutral particles in nucleus

## Chemical Bonds
- Ionic bonds: Transfer of electrons
- Covalent bonds: Sharing of electrons
- Metallic bonds: Sea of electrons

## Periodic Trends
- Atomic radius decreases across period
- Ionization energy increases across period
- Electronegativity increases across period`;

  // Note typing animation
  useEffect(() => {
    let typingInterval;
    let currentIndex = noteContent.length;

    const startTyping = () => {
      if (currentIndex < fullNoteContent.length) {
        setIsTyping(true);
        typingInterval = setInterval(() => {
          if (currentIndex < fullNoteContent.length) {
            setNoteContent(fullNoteContent.substring(0, currentIndex + 1));
            currentIndex++;
          } else {
            setIsTyping(false);
            clearInterval(typingInterval);
            setTimeout(startTyping, 3000); // Restart after 3 seconds
          }
        }, 50);
      } else {
        // Reset and start over
        setTimeout(() => {
          currentIndex = noteContent.split('\n\n')[0].length + 2; // Keep header
          setNoteContent(noteContent.split('\n\n')[0] + '\n\n');
          startTyping();
        }, 2000);
      }
    };

    const initialTimeout = setTimeout(startTyping, 1000);

    return () => {
      clearInterval(typingInterval);
      clearTimeout(initialTimeout);
    };
  }, []);

  // Chat animation
  useEffect(() => {
    const chatMessages = [
      { user: "Mike", message: "Added the ionic bonds section!", time: "2:35 PM", avatar: "M" },
      { user: "Lisa", message: "Great! I'll work on periodic trends", time: "2:36 PM", avatar: "L" },
      { user: "Sarah", message: "Perfect teamwork! 🎉", time: "2:37 PM", avatar: "S" },
      { user: "Mike", message: "Should we add practice problems?", time: "2:38 PM", avatar: "M" }
    ];

    let messageIndex = 0;

    const addMessage = () => {
      if (messageIndex < chatMessages.length) {
        // Show typing indicator
        const currentUser = chatMessages[messageIndex].user;
        setTypingUsers([currentUser]);

        setTimeout(() => {
          setMessages(prev => [...prev, { 
            ...chatMessages[messageIndex], 
            id: prev.length + 1 
          }]);
          setTypingUsers([]);
          messageIndex++;

          // Schedule next message
          setTimeout(addMessage, Math.random() * 3000 + 2000);
        }, 1500);
      } else {
        // Reset and start over
        setTimeout(() => {
          setMessages([messages[0]]);
          messageIndex = 0;
          setTimeout(addMessage, 2000);
        }, 3000);
      }
    };

    const chatTimeout = setTimeout(addMessage, 2000);

    return () => clearTimeout(chatTimeout);
  }, []);

  // Cursor animation
  useEffect(() => {
    const updateCursors = () => {
      const newCursors = users.slice(1).map((user, index) => ({
        id: user.name,
        user: user.name,
        color: user.color,
        position: Math.random() * 80 + 10,
        visible: Math.random() > 0.3
      }));
      setCursors(newCursors);
    };

    updateCursors();
    const cursorInterval = setInterval(updateCursors, 2000);

    return () => clearInterval(cursorInterval);
  }, []);

  // Notifications
  useEffect(() => {
    const notificationMessages = [
      { type: "edit", user: "Mike", action: "edited line 5", icon: Edit3 },
      { type: "view", user: "Lisa", action: "is viewing the document", icon: Eye },
      { type: "comment", user: "Sarah", action: "added a comment", icon: MessageCircle },
    ];

    let notifIndex = 0;

    const showNotification = () => {
      const notif = {
        id: Date.now(),
        ...notificationMessages[notifIndex % notificationMessages.length]
      };

      setNotifications(prev => [...prev, notif]);

      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notif.id));
      }, 3000);

      notifIndex++;
    };

    const notifInterval = setInterval(showNotification, 4000);
    return () => clearInterval(notifInterval);
  }, []);

  return (
    <section className="relative py-14 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            See StudyBuddy in 
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent"> Action</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Watch how students collaborate in real-time, share ideas, and learn together seamlessly.
          </p>
        </div>

        {/* Demo Container */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Note Editor Demo */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Editor Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">chemistry-notes.md</span>
              </div>
              
              <div className="flex items-center gap-2">
                {users.map((user) => (
                  <div key={user.name} className="flex items-center gap-1">
                    <div className={`w-6 h-6 ${user.color} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                      {user.avatar}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editor Content */}
            <div className="relative p-6 h-96 overflow-hidden">
              <div className="relative">
                <pre className="font-mono text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {noteContent}
                </pre>
                
                {/* Typing Cursor */}
                {isTyping && (
                  <div className="inline-block w-0.5 h-5 bg-blue-500 animate-pulse ml-1" />
                )}

                {/* Other User Cursors */}
                {cursors.map((cursor) => cursor.visible && (
                  <div 
                    key={cursor.id}
                    className="absolute flex items-center gap-2 animate-pulse"
                    style={{ top: `${cursor.position}%`, left: '20px' }}
                  >
                    <div className={`w-0.5 h-5 ${cursor.color.replace('bg-', 'bg-')}`} />
                    <div className={`px-2 py-1 ${cursor.color} text-white text-xs rounded-md`}>
                      {cursor.user}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Demo */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Study Group Chat</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-500">3 online</span>
                </div>
              </div>
              
              <Users className="w-5 h-5 text-gray-500" />
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start gap-3 animate-slide-up">
                  <div className={`w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                    {message.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{message.user}</span>
                      <span className="text-xs text-gray-500">{message.time}</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2 text-sm text-gray-800 dark:text-gray-200">
                      {message.message}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicators */}
              {typingUsers.map((user) => (
                <div key={`typing-${user}`} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user[0]}
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <span className="text-xs text-gray-500">{user} is typing...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Notifications */}
        <div className="fixed bottom-8 right-8 z-50 space-y-3">
          {notifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <div 
                key={notif.id}
                className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-xl animate-slide-in-right max-w-sm"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {notif.user} {notif.action}
                  </p>
                  <p className="text-xs text-gray-500">Just now</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-4">
          {[
            { icon: Edit3, text: "Real-time editing" },
            { icon: MessageCircle, text: "Live chat" },
            { icon: Users, text: "Multi-user collaboration" },
            { icon: Bell, text: "Instant notifications" },
            { icon: CheckCircle, text: "Auto-sync" }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-lg"
              >
                <Icon className="w-4 h-4 text-blue-500" />
                <span>{feature.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
      `}</style>
    </section>
  );
};

export default InteractiveDemoSection;