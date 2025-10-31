import React, { useState, useEffect } from "react";
import { BookOpen, Mail, Lock, Eye, EyeOff, Github, User, CheckCircle, AlertCircle, X, Users } from "lucide-react";
import {auth} from '@/services/supabase'
import { Link } from "react-router-dom";


// Hero Component
const SignUpHero = ({ pendingInvite }: { pendingInvite: string | null }) => (
  <div className="hidden lg:flex lg:w-1/2 sign-up-bg p-12 flex-col justify-center items-center text-white relative overflow-hidden">
    {/* Dark overlay for better text readability */}
    <div className="absolute inset-0 bg-black/50"></div>
    
    <div className="relative z-10 text-center space-y-8">
      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto">
        {pendingInvite ? <Users className="w-10 h-10 text-white" /> : <BookOpen className="w-10 h-10 text-white" />}
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl font-bold font-serif">
          {pendingInvite ? 'Join Your Study Group!' : 'Join StudyBuddy'}
        </h1>
        <p className="text-white/90 text-lg max-w-md font-light leading-relaxed">
          {pendingInvite 
            ? 'Create your account to accept the group invitation and start collaborating with your study partners.'
            : 'Connect with learners worldwide and make studying more effective together.'
          }
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-white/80 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
          <span>Free to join</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span>Real-time collaboration</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
          <span>Secure & private</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
          <span>24/7 support</span>
        </div>
      </div>
      
      {pendingInvite && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-8">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5" />
            <span className="font-medium">Group Invitation Waiting</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            Complete your signup to accept the study group invitation and start collaborating!
          </p>
        </div>
      )}
    </div>
  </div>
);
export default SignUpHero;