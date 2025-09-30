# Quick Setup Guide - Winter Arc Pulse

Follow these steps to get your app running in under 10 minutes!

## Step 1: Supabase Setup (3 minutes)

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **New Project**
3. Fill in:
   - Name: `winter-arc-pulse` (or your choice)
   - Database Password: (save this somewhere safe)
   - Region: Choose closest to you
4. Click **Create new project**
5. Wait ~2 minutes for setup to complete

## Step 2: Get Your Credentials (1 minute)

1. In your Supabase project, go to **Settings** (gear icon) > **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 3: Configure Your App (1 minute)

1. Open the `.env` file in your project
2. Replace the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Set Up Database (2 minutes)

1. In Supabase, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open `supabase-setup.sql` from your project folder
4. Copy ALL the content (Ctrl+A, Ctrl+C)
5. Paste into the SQL Editor
6. Click **RUN** (or press Ctrl+Enter)
7. Wait for "Success. No rows returned" message

✅ **Your database is ready!** It now has:
- All tables created
- Security policies enabled
- 50 DSA problems loaded
- 48 study topics loaded
- 18 workout exercises loaded

## Step 5: Install & Run (2 minutes)

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 6: Create Your Account (1 minute)

1. Click **Sign up**
2. Enter your:
   - Full name
   - Email
   - Password (min 6 characters)
3. Click **Sign Up**

You're now logged in and ready to go!

## What to Do First

1. **Explore the Dashboard** - See all your tracking areas
2. **Check DSA Problems** - Browse 50 curated problems
3. **View Study Topics** - See all CS fundamentals topics
4. **Plan Your Workout** - Check out the Push/Pull/Legs split
5. **Set Daily Goals** - Start tracking your progress!

## Quick Tour of Features

### 📊 Dashboard
- See daily tasks across DSA, Workout, and Study
- Track completion percentage
- Get motivated with daily quotes

### 💪 Workout Tracker
- Push/Pull/Legs split (6 exercises each)
- Log sets and reps
- Track workout history

### 📘 DSA Tracker
- 50 problems from popular platforms
- Filter by difficulty and topic
- Mark problems as solved
- Direct links to problems

### 🖥️ Study Tracker
- OS, DBMS, OOP, CN syllabi
- Check off topics as you learn
- Track progress per subject

### 📈 Progress
- Visual charts of your performance
- DSA solve percentage
- Workout streak counter
- Study completion by subject

### 📝 Logs
- Complete activity history
- See what you did each day
- Track your consistency

## Pro Tips

1. **Daily Habit**: Visit the dashboard every morning
2. **Consistency > Intensity**: Small daily progress beats sporadic effort
3. **Track Everything**: Even small wins count
4. **Review Weekly**: Check Progress page every Sunday
5. **Adjust Goals**: Update your profile goals as you progress

## Common Issues

### Can't Sign Up
- Check your internet connection
- Verify `.env` has correct Supabase credentials
- Make sure you ran the SQL setup script

### No Data Showing
- Refresh the page
- Check browser console for errors (F12)
- Verify the SQL script completed successfully

### Build Errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

## Need Help?

1. Check the main `README.md` for detailed documentation
2. Review Supabase dashboard for database issues
3. Check browser console (F12) for error messages

---

You're all set! Start your placement preparation journey now! 🚀