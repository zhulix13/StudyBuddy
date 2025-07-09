# StudyBuddy 📚

A collaborative study group platform that connects students, enables real-time collaboration, and helps track learning progress together.

## ✨ Features

### 🔐 Authentication & User Management
- Secure email/password authentication
- Social login with Google and GitHub
- Personalized user profiles with study preferences
- Role-based access control (Admin, Member)

### 👥 Study Groups
- Create and join study groups by subject
- Public and private group options
- Group discovery and search functionality
- Member management with role assignments

### 📝 Collaborative Notes
- Real-time collaborative note editing
- Markdown support for rich formatting
- Shared and personal note organization
- Version history and change tracking

### 💬 Real-time Communication
- Live group chat during study sessions
- Instant messaging with typing indicators
- Real-time notifications for group activities
- Online member status indicators

### 📊 Progress Tracking
- Individual study goal setting
- Progress visualization and analytics
- Study session scheduling and reminders
- Achievement badges and milestones

### 📁 File Management
- Upload and share study materials (PDFs, images)
- Organized file storage per group
- Profile picture and group banner uploads
- Secure file access with permissions

## 🛠️ Tech Stack

### Frontend
- **React** - User interface library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Router** - Client-side routing

### Backend & Database
- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL database with real-time subscriptions
  - Authentication and authorization
  - File storage and CDN
  - Row Level Security (RLS)
  - Real-time websocket connections

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/studybuddy.git
   cd studybuddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the database migrations (see Database Setup below)

4. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase credentials:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:5173) in your browser.

## 🗄️ Database Setup

### Schema Overview
```sql
-- Core tables
study_groups        -- Group information and settings
group_members       -- User membership and roles
notes              -- Collaborative study notes
study_sessions     -- Scheduled group sessions
messages           -- Group chat messages
progress_tracking  -- Individual study progress
```

### Running Migrations
1. Navigate to your Supabase project dashboard
2. Go to the SQL Editor
3. Run the migration files in order:
   ```
   migrations/
   ├── 001_initial_schema.sql
   ├── 002_rls_policies.sql
   ├── 003_realtime_setup.sql
   └── 004_storage_buckets.sql
   ```

### Row Level Security
All tables implement RLS policies to ensure:
- Users can only access groups they're members of
- Private groups remain private
- Personal notes stay personal
- Admins have appropriate management permissions

## 📱 Features in Detail

### Study Groups
- **Create Groups**: Set up groups for specific subjects or topics
- **Join Groups**: Discover and join public groups or use invite codes
- **Manage Members**: Add/remove members, assign roles
- **Group Settings**: Configure privacy, description, and study schedule

### Real-time Collaboration
- **Live Chat**: Instant messaging during study sessions
- **Collaborative Notes**: Multiple users can edit notes simultaneously
- **Activity Feed**: See what group members are working on
- **Notifications**: Get notified about important group activities

### Progress Tracking
- **Personal Goals**: Set and track individual study objectives
- **Group Progress**: Monitor collective group achievements
- **Study Statistics**: View detailed analytics and insights
- **Scheduling**: Plan and coordinate study sessions

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # Supabase service functions
├── utils/              # Utility functions
├── styles/             # Global styles
└── types/              # TypeScript type definitions
```

### Key Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Environment Variables
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚢 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `build` folder to your hosting provider
3. Ensure environment variables are set

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Lucide](https://lucide.dev) for the beautiful icons
- The open-source community for inspiration and tools

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the [documentation](docs/)
- Join our community discussions

---

**Happy Studying! 🎓**