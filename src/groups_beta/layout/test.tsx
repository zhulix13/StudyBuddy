import React, { useState } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, MessageCircle, ChevronDown, ChevronUp, Edit3, Users, Crown, LogOut, Trash2, Camera, Save, X } from "lucide-react";

// Mock data for demonstration
const mockGroup = {
  id: "1",
  name: "MEE CLASS'25",
  subject: "Mechanical Engineering",
  description: "Who wants to be our new class rep pls?",
  avatar: null,
  memberCount: 45,
  notesCount: 127,
  adminCount: 3,
  isUserAdmin: true,
  createdDate: "10/28/2021 6:49 PM"
};

// Group Details Dropdown Component
const GroupDetailsDropdown = ({ group, isExpanded, onLeaveGroup }) => {
  if (!isExpanded) return null;

  return (
    <div className="bg-gray-50 border-t px-6 py-4 space-y-4">
      {/* Group Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-blue-500" />
          <span className="text-gray-600">Members:</span>
          <span className="font-medium">{group.memberCount}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FileText className="w-4 h-4 text-green-500" />
          <span className="text-gray-600">Notes:</span>
          <span className="font-medium">{group.notesCount}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Crown className="w-4 h-4 text-yellow-500" />
          <span className="text-gray-600">Admins:</span>
          <span className="font-medium">{group.adminCount}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-600">Created:</span>
          <div className="font-medium text-xs">{group.createdDate}</div>
        </div>
      </div>

      {/* Subject */}
      <div>
        <span className="text-sm text-gray-600">Subject: </span>
        <span className="font-medium text-sm">{group.subject}</span>
      </div>

      {/* Leave Group Button */}
      <div className="pt-2 border-t">
        <button
          onClick={onLeaveGroup}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Leave Group
        </button>
      </div>
    </div>
  );
};

// Edit Group Dropdown Component
const EditGroupDropdown = ({ group, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    name: group.name,
    subject: group.subject,
    description: group.description
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Edit Group</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar Upload */}
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              {formData.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
            <Camera className="w-4 h-4" />
            Change Avatar
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t">
          <button
            onClick={onDelete}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Group
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Group Header Component
const GroupHeader = ({ group }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLeaveGroup = () => {
    console.log("Leave group clicked");
    // Add leave group logic here
  };

  const handleSaveEdit = (formData) => {
    console.log("Save edit:", formData);
    // Add save edit logic here
  };

  const handleDeleteGroup = () => {
    console.log("Delete group clicked");
    // Add delete group logic here
  };

  return (
    <div className="hidden md:block border-b">
      {/* Main Header */}
      <div className="p-6 relative">
        <div className="flex items-center justify-between">
          {/* Left side - Group info */}
          <div 
            className="flex items-center gap-3 cursor-pointer flex-1"
            onClick={handleToggleExpanded}
          >
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {group.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{group.name}</h1>
              <p className="text-sm text-gray-500">{group.description}</p>
            </div>
            <div className="text-gray-400">
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>

          {/* Right side - Admin edit button */}
          {group.isUserAdmin && (
            <div className="relative">
              <button
                onClick={() => setIsEditOpen(!isEditOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors ml-4"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <EditGroupDropdown
                group={group}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSave={handleSaveEdit}
                onDelete={handleDeleteGroup}
              />
            </div>
          )}
        </div>
      </div>

      {/* Expandable Details */}
      <GroupDetailsDropdown
        group={group}
        isExpanded={isExpanded}
        onLeaveGroup={handleLeaveGroup}
      />
    </div>
  );
};

// Updated Group Content Component
const GroupContent = ({ group }) => {
  const [activeTab, setActiveTab] = useState("notes");

  return (
    <div className="flex-1 flex flex-col">
      <GroupHeader group={group || mockGroup} />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="flex-1 mt-4 p-4">
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
            Notes content will go here...
          </div>
        </TabsContent>

        <TabsContent value="chat" className="flex-1 mt-4 p-4">
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
            Chat content will go here...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Demo App
export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white shadow-lg">
        <GroupContent group={mockGroup} />
      </div>
    </div>
  );
}