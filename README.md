# 🎮 FUN ZONE — Interactive Games Platform

**FUN ZONE** is an interactive web platform designed for events, group activities, and team-based competitions. It provides a collection of engaging games that allow teams to participate using a QR code or event access code, compete for points, and track their performance through a live leaderboard.

The platform features a responsive Arabic user interface and a team-based participation system, making it suitable for educational activities, workshops, events, and entertainment.

## ✨ Key Features

- **Team-Based Registration:** Teams join using their team names without requiring individual player accounts.
- **Event Management:** Create and manage events with unique access codes.
- **QR Code Access:** Allow participants to join events quickly by scanning a QR code.
- **Interactive Games:** Multiple game formats designed to encourage engagement and friendly competition.
- **Live Leaderboard:** Track team rankings and performance as new results are submitted.
- **Score Tracking:** Automatically save game attempts and team scores.
- **Admin Dashboard:** A protected administration area for managing events.
- **Responsive Design:** Optimized for desktop, tablet, and mobile devices.
- **Arabic Interface:** A user-friendly Arabic interface with RTL layout support.

## 🎯 Available Games

The platform includes eight initial game types:

- Memory Game
- Arrange the Steps
- Quiz Challenge
- Crossword Puzzle
- Logic Challenge
- Debug the Code
- Word Scramble
- Spot the Difference

### 🆕 New Interactive Game Modes

Additional interactive experiences include:

**🎡 Wheel of Fortune**
- Randomized question selection.
- Multiple difficulty levels.
- Timed rounds and scoring.

**🧩 Drag & Drop Challenge**
- Interactive drag-and-drop gameplay.
- Touch and mouse support.
- Multiple difficulty levels.
- Instant answer feedback.

Both game modes include 10 rounds, independent content for three difficulty levels, timers, scoring, and automatic result saving.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend & Database:** Supabase
- **Authentication:** Supabase Auth
- **Database Security:** PostgreSQL Row Level Security (RLS)
- **Styling:** CSS
- **Deployment:** GitHub Pages / GitHub Actions

## 📋 Prerequisites

Before getting started, make sure you have:

- Node.js 20 or later
- npm
- A free Supabase account
- A GitHub account (for deployment)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/engr-SouadRoumani/FUN-ZONE.git
cd FUN-ZONE
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Add your Supabase credentials to `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 4. Set Up Supabase

1. Create a new project at [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Create a new query.
4. Copy the complete contents of `supabase.sql`.
5. Run the SQL script.
6. Navigate to **Project Settings → API** and copy your Project URL and publishable/anon key.
7. Add these values to your `.env` file.

### 5. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

> If Supabase is not configured, the application will display a message indicating that the database connection is missing.

## 👤 Admin Account Setup

To create an administrator account:

1. Open **Supabase → Authentication → Users**.
2. Create a new user using an email address and password.
3. Copy the user's UUID.
4. Open the SQL Editor and execute:

```sql
INSERT INTO public.admins (user_id)
VALUES ('YOUR_AUTH_USER_UUID');
```

5. Navigate to `/admin` in your application.
6. Sign in using the administrator credentials.
7. Create and manage your events.

Once an event is created, its unique access code and QR code will be available in the events dashboard.

## 🎡 Enabling Wheel & Drag-and-Drop Games

To enable the additional interactive games:

1. Open the Supabase SQL Editor.
2. Run the `supabase-add-wheel-dragdrop.sql` script once.
3. The new games will become available for existing events. Newly created events will include them automatically.

### Game Configuration

| Component | Location |
|---|---|
| Scoring System | `src/games/kit/scoring.ts` |
| Wheel Questions | `src/games/wheel/data.ts` |
| Drag & Drop Content | `src/games/dragdrop/data.ts` |
| Game Registry | `src/games/registry.ts` |
| Shared Game Components | `src/games/kit/` |

The scoring system uses a base score of 50 points, difficulty multipliers, speed bonuses, and streak bonuses.

## 🌐 Deployment

The project supports deployment through GitHub Pages using GitHub Actions.

### GitHub Pages Deployment

1. Push your project to GitHub.
2. Open your repository's **Settings → Pages**.
3. Set the deployment source to **GitHub Actions**.
4. Ensure your Vite configuration contains the correct repository base path:

```typescript
base: '/FUN-ZONE/',
```

5. Push your changes to the `main` branch.

GitHub Actions will automatically:

- Install project dependencies.
- Build the application.
- Generate the production files in `dist/`.
- Deploy the application to GitHub Pages.

## 📁 Project Structure

```text
FUN-ZONE/
│
├── public/
├── src/
│   ├── games/
│   │   ├── kit/
│   │   ├── wheel/
│   │   ├── dragdrop/
│   │   └── registry.ts
│   │
│   ├── App.tsx
│   └── style.css
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── .env.example
├── supabase.sql
├── supabase-add-wheel-dragdrop.sql
├── package.json
└── README.md
```

## 🔒 Security & Limitations

FUN ZONE is currently an **MVP (Minimum Viable Product)** intended for prototyping, testing, and initial event usage.

Some security improvements are recommended before using the platform for high-stakes competitions or prize-based events.

Current limitations include:

- Game scores are calculated on the client side before being submitted to the database.
- Client-side score calculations can potentially be manipulated.
- Additional restrictions on database access and game attempts are recommended.

### Recommended Future Improvements

- Move score validation and calculation to Supabase Edge Functions or secure database RPC functions.
- Strengthen Row Level Security (RLS) policies.
- Implement server-side answer validation.
- Add configurable attempt limits.
- Expand event and game content management tools.
- Improve event lifecycle and administration controls.

## 🗺️ Future Development

Potential future enhancements include:

- More interactive game formats.
- Expanded question banks and difficulty levels.
- Advanced team statistics and performance reports.
- Improved real-time leaderboard updates.
- Customizable event settings.
- Enhanced administration and content management.

## 🤝 Contributing

Contributions, suggestions, and ideas are welcome!

If you would like to improve FUN ZONE, feel free to fork the repository and submit a pull request.

## 📄 License

This project is currently provided for development and educational purposes. A formal license can be added when the distribution terms are defined.

---

**FUN ZONE — Learn, Play, Compete, and Have Fun! 🎉**
