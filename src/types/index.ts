// Database Types
// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   avatar_url?: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface StudyGroup {
//   id: string;
//   name: string;
//   description?: string;
//   subject: string;
//   is_private: boolean;
//   created_by: string;
//   created_at: string;
//   updated_at: string;
//   member_count?: number;
//   last_activity?: string;
// }

// export interface GroupMember {
//   id: string;
//   group_id: string;
//   user_id: string;
//   role: 'admin' | 'member';
//   joined_at: string;
// }

export interface NewNote{
  title: string;
  content: string;
  tags?: string[];
  is_private?: boolean;
  group_id?: string;
  pinned?: boolean;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: JSON;
  group_id: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  tags?: string[];
  pinned?: boolean;
  author?: {
    id: string;
    name: string;
    username?: string;
    avatar_url?: string;
  };
}

// export interface StudySession {
//   id: string;
//   title: string;
//   description?: string;
//   group_id: string;
//   scheduled_for: string;
//   duration: number; // in minutes
//   created_by: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface Message {
//   id: string;
//   content: string;
//   group_id: string;
//   user_id: string;
//   created_at: string;
//   user?: User;
// }

// export interface ProgressTracking {
//   id: string;
//   user_id: string;
//   group_id?: string;
//   goal_title: string;
//   goal_description?: string;
//   target_date?: string;
//   is_completed: boolean;
//   created_at: string;
//   updated_at: string;
// }

// // Component Props Types
// export interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   signIn: (email: string, password: string) => Promise<void>;
//   signUp: (email: string, password: string, name: string) => Promise<void>;
//   signOut: () => Promise<void>;
// }

// export interface NotificationContextType {
//   notifications: Notification[];
//   addNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => void;
//   markAsRead: (id: string) => void;
//   clearAll: () => void;
// }

// export interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   type: 'info' | 'success' | 'warning' | 'error';
//   is_read: boolean;
//   created_at: string;
// }