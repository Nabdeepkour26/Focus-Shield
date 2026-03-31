# Focus Shield – Auto Discipline System

A React application built with Vite that enforces discipline through focus timers, score tracking, and distraction detection. A premium productivity suite designed to help students and professionals maintain deep focus and combat digital distractions.

## ✨ Features

### 1. Advanced Focus Mode
- **Full-screen distraction-free interface**: Immersive focus environment
- **Customizable countdown timer**: Select any duration up to 5 hours
- **Exit blocking with 5-second delay**: Personal motivational messages prevent impulsive exits
- **Live progress bar and motivational messages**: Real-time feedback and encouragement
- **Session tracking**: Tracks completed sessions and early exits

### 2. Discipline Score Engine
- **Score range**: 0–100
- **Dynamic updates**:
  - +10 for completed focus session
  - +5 for completed task
  - −15 for early exit
  - −5 for tab switching (distraction)
- **Status labels**: 
  - Highly Disciplined (80+)
  - Inconsistent (50-79)
  - Needs Control (<50)
- **Persistent storage**: Score automatically saved to localStorage

### 3. Distraction Detection System
- **Page Visibility API**: Detects when user switches tabs
- **Time tracking**: Measures time spent away
- **Alert modal**: Shows notification on return
- **Smart penalties**: Deducts score based on distraction time

### 4. Personalized Motivational Personas
- **Strict mode**: For demanding users who need harsh accountability
- **Friendly mode**: Supportive and encouraging (default)
- **Military mode**: Tactical and mission-focused

## 🛠️ Tech Stack
- **React 18**: Modern UI library with hooks
- **Vite**: Lightning-fast build tool
- **Framer Motion**: Smooth animations and transitions
- **CSS3**: Custom dark theme with modern styling
- **localStorage API**: Data persistence

## 🚀 Getting Started

### Installation & Running

1. **Navigate to the project folder**
   ```bash
   cd react-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`
   - App opens automatically in your default browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create optimized production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Check code quality with ESLint

## 📁 Folder Structure
```
react-app/
├── src/
│   ├── components/          # React components
│   │   ├── DisciplineScore.jsx       # Score display component
│   │   ├── DistractionAlert.jsx      # Distraction notification
│   │   ├── FocusMode.jsx             # Main focus timer interface
│   │   └── ErrorBoundary.jsx         # Error handling component
│   ├── hooks/               # Custom React hooks
│   │   ├── useDisciplineScore.js     # Score management logic
│   │   ├── useDistractionDetection.js # Distraction tracking
│   │   └── useFocusTimer.js          # Timer functionality
│   ├── utils/               # Utility functions
│   │   ├── constants.js     # App-wide constants
│   │   └── helpers.js       # Helper functions
│   ├── App.jsx              # Main App component
│   ├── main.jsx             # React DOM render
│   └── index.css            # Global styles
├── index.html               # HTML entry point
├── vite.config.js           # Vite configuration
├── package.json             # Dependencies and scripts
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## 🧠 How It Works

### Focus Session Flow
1. **User selects duration** and persona on home screen
2. **Clicks "Start Focus Mode"** to enter full-screen view
3. **Timer counts down** with real-time progress feedback
4. **On tab switch**: App detects distraction and shows alert
5. **Session completion**: 
   - +10 score if completed
   - -15 score if exited early
   - -5 score for each distraction

### Data Persistence
- **Discipline Score**: Saved to `localStorage` as `disciplineScore`
- **Session Stats**: Saved as `focusStats` containing:
  - `completed`: Number of completed sessions
  - `exits`: Number of early exits

## 🎨 Customization

### Change Personas
Edit `src/utils/constants.js` to add new personas:
```javascript
export const PERSONAS = {
  YourPersona: {
    exitMessage: "Your custom exit message",
    completeMessage: "Your completion message"
  }
};
```

### Modify Durations
Update `FOCUS_DURATIONS` in `src/utils/constants.js`:
```javascript
export const FOCUS_DURATIONS = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1500,    // 25 minutes
  LONG: 3600       // 60 minutes
};
```

### Update Score Changes
Adjust values in `SCORE_CHANGES` object in constants.

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- GitHub Pages
- Vercel (recommended)
- Netlify
- Regular Git push deployment

Quick deploy to Vercel:
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel auto-detects Vite and deploys

## 🐛 Troubleshooting

### App not saving score/stats
- Check browser console for localStorage errors
- Ensure localStorage is not disabled
- Try clearing browser cache

### Timer not working
- Check browser console for JavaScript errors
- Ensure JavaScript is enabled
- Try refreshing the page

### Focus mode not going fullscreen
- Some browsers may not support fullscreen API
- Try a different browser
- Check browser privacy settings

## 📝 Browser Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design (with limitations on fullscreen)

## 🔐 Privacy & Data
- **No data sent to servers**: All data stored locally in your browser
- **No tracking**: No analytics or tracking cookies
- **No third-party services**: Complete privacy
- **Data clearing**: Clear browser localStorage to reset all data

## 🤝 Contributing

To contribute improvements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available for personal and educational use.

## 🎯 Roadmap

Future enhancements:
- [ ] Sound notifications
- [ ] Export statistics
- [ ] Cloud synchronization
- [ ] Mobile app version
- [ ] Focus streak tracking
- [ ] Leaderboards
- [ ] Dark/Light theme toggle

## 📞 Support

For issues or feature requests, please create an issue on GitHub.

---

**Stay Focused. Boost Productivity. 🚀**

│   │   └── FocusMode.jsx
│   ├── hooks/
│   │   ├── useDisciplineScore.js
│   │   ├── useDistractionDetection.js
│   │   └── useFocusTimer.js
│   ├── utils/  (empty)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Logic Explanations

### Discipline Score Logic
The score starts at 50 and adjusts based on user behavior:
- Completing a focus session rewards discipline
- Early exits penalize heavily to discourage quitting
- Distractions reduce score to enforce focus
- Score is capped at 0-100 and persists across sessions

### Focus Timer Logic
- Timer counts down from set duration
- On completion, increments completed sessions and rewards score
- On early exit, increments early exits and penalizes score
- Progress bar shows completion percentage
- Motivational messages appear near end to encourage completion

### Distraction Detection Logic
- Monitors document.visibilityState
- When tab becomes hidden, records timestamp
- When visible again, calculates away time
- Shows alert and deducts score based on distraction duration

### Persona System
Three personas provide different psychological approaches:
- **Strict**: Harsh warnings to intimidate
- **Friendly**: Encouraging messages to motivate
- **Military**: Command-style language for discipline

This app creates psychological pressure to maintain focus, going beyond simple timers to actively enforce discipline.