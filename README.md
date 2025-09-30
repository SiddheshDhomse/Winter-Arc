# Winter Arc Pulse

A comprehensive accountability and tracking platform for campus placements, combining fitness tracking, DSA problem-solving, and CS fundamentals study management.

## Features

- **Authentication**: Secure email/password authentication with Supabase
- **Dashboard**: Centralized view of daily tasks and progress across all areas
- **Workout Tracker**: Push/Pull/Legs split with progressive overload tracking
- **DSA Tracker**: 50+ curated problems from popular coding platforms with difficulty levels
- **Study Tracker**: Complete syllabus for OS, DBMS, OOP, and CN with progress tracking
- **Progress Analytics**: Visual charts showing your progress across all domains
- **Activity Logs**: Complete history of all workouts, problems solved, and topics studied

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great)
- Git for version control

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd winter-arc-pulse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned (takes ~2 minutes)
3. Once ready, go to **Settings > API** in your Supabase dashboard
4. Copy your **Project URL** and **anon/public key**

### 4. Configure Environment Variables

The `.env` file should already exist with the following structure:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your actual Supabase credentials.

### 5. Set Up the Database

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the `supabase-setup.sql` file in this project
5. Copy the entire contents
6. Paste it into the SQL Editor
7. Click **Run** to execute the script

This will create:
- All necessary tables (users, workouts, DSA problems, study topics, etc.)
- Row Level Security (RLS) policies for data protection
- Indexes for optimal performance
- Seed data including:
  - 18 workout exercises (Push/Pull/Legs split)
  - 50 DSA problems from popular platforms
  - 48 study topics across OS, DBMS, OOP, and CN

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
winter-arc-pulse/
├── app/                      # Next.js app directory
│   ├── dashboard/           # Main dashboard page
│   ├── workout/             # Workout tracking page
│   ├── dsa/                 # DSA problem tracking page
│   ├── study/               # Study progress page
│   ├── progress/            # Analytics and charts page
│   ├── logs/                # Activity history page
│   ├── login/               # Login page
│   ├── signup/              # Sign up page
│   └── page.tsx             # Root page (redirects)
├── components/              # Reusable components
│   ├── ui/                  # shadcn/ui components
│   └── DashboardLayout.tsx  # Main layout wrapper
├── contexts/                # React contexts
│   └── AuthContext.tsx      # Authentication state management
├── lib/                     # Utilities and configurations
│   ├── supabase.ts          # Supabase client and types
│   └── utils.ts             # Helper functions
├── hooks/                   # Custom React hooks
│   └── use-toast.ts         # Toast notifications
└── supabase-setup.sql       # Database setup script
```

## Usage

### First Time Setup

1. **Sign Up**: Create a new account with your email and password
2. **Complete Profile**: Add your name (college, weight, and goals are optional)
3. **Explore**: Navigate through different sections to familiarize yourself

### Daily Workflow

1. **Check Dashboard**: Start your day by reviewing your daily tasks
2. **Log Workouts**: Track your exercises with sets and reps
3. **Solve DSA Problems**: Mark problems as solved as you complete them
4. **Study Topics**: Check off topics as you complete them
5. **Review Progress**: Check your progress charts to stay motivated

### Tips for Success

- **Consistency**: Log in daily to maintain accountability
- **Set Goals**: Use the dashboard to track completion percentages
- **Progressive Overload**: Gradually increase weights or reps in workouts
- **Mix Difficulties**: Balance Easy, Medium, and Hard DSA problems
- **Complete Subjects**: Try to maintain balanced progress across all CS subjects

## Database Schema Overview

### Core Tables

- **users_profile**: User information and preferences
- **daily_tasks**: Task list for quick daily tracking
- **workout_exercises**: Reference data for workout routines
- **workout_logs**: User workout history
- **dsa_problems**: Curated DSA problem set
- **dsa_logs**: User's DSA problem completion
- **study_topics**: CS subject syllabi
- **study_logs**: User's study progress

### Security

- All tables use Row Level Security (RLS)
- Users can only access their own data
- Reference tables (problems, exercises, topics) are publicly readable
- All authenticated operations verified at database level

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **New Project**
4. Import your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**

Your app will be live in minutes!

## Customization

### Adding More DSA Problems

```sql
INSERT INTO dsa_problems (title, topic, link, difficulty, position) VALUES
('Your Problem', 'Topic', 'https://leetcode.com/...', 'Medium', 51);
```

### Adding Study Topics

```sql
INSERT INTO study_topics (subject, topic, position) VALUES
('OS', 'Your Topic', 13);
```

### Modifying Workout Exercises

```sql
INSERT INTO workout_exercises (workout_type, exercise_name, default_sets, default_reps, position) VALUES
('Push', 'Your Exercise', 3, 10, 7);
```

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Database Connection Issues

1. Verify your Supabase URL and key in `.env`
2. Check that you've run the `supabase-setup.sql` script
3. Ensure RLS policies are enabled (they're in the setup script)

### Authentication Not Working

1. Go to Supabase Dashboard > Authentication > Settings
2. Ensure **Enable Email Confirmations** is OFF (we don't use email verification)
3. Check Site URL is set correctly

## Contributing

Feel free to fork this project and customize it for your needs!

## License

MIT License - feel free to use this for your placement preparation journey!

## Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the Supabase documentation
3. Open an issue on GitHub

---

Built with focus and determination for your placement success. Keep pushing! 💪📚🖥️