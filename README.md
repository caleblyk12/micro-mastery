# Micro-Mastery

[**Try Micro-Mastery Now →**](https://micro-mastery.vercel.app/)

---

## What is Micro-Mastery?

**Micro-Mastery** is your daily companion for lifelong learning. Master new skills in just five minutes a day, track your progress, and explore a world of knowledge across various categories. Whether you want to pick up a new hobby, sharpen your mind, or just have fun, Micro-Mastery makes skill-building simple, social, and rewarding.

---

## How It Works

1. **Sign Up or Log In**  
   Create your free account to start your learning journey.

2. **Choose a Category**  
   Browse a wide range of skill categories—there’s something for everyone.

3. **Start a 5-Minute Session**  
   Each day, complete a bite-sized lesson or quiz designed for quick progress.

4. **Track Your Progress**  
   Earn achievements, keep up your streak, gain XP and levels, and see your skills grow.

5. **Connect with Friends**  
   Add friends, view their progress, and motivate each other.

6. **Discover Mystery Skills**  
   Try something new with our surprise “Mystery” challenges!

---

## Key Features
- **Email Authenticated Logins**
- **Daily 5-Minute Skill Sessions**
- **Videos, Quizzes for Learning**
- **Progress Tracking & Achievements**
- **Social Learning with Friends**
- **Wide Range of Categories**
- **Daily Mystery Challenges for Discovery**
- **XP, Levels, Streaks**
- **Customizable Profile Pictures**

---

## Get Started

1. Go to [Micro-Mastery](https://micro-mastery.vercel.app/)
2. Sign up or log in
3. Pick a skill and start learning—just five minutes a day!

---

## Need Help?

If you have questions or feedback, please [open an issue](https://github.com/clyk12/micro-mastery/issues) or contact us at [caleblyk12@gmail.com].

---

---

## Developer & Technical Information

### File Structure

```
src/
  assets/           # Images and static assets
  components/       # Reusable UI components
    tests/          # Component unit tests (Jest)
  helpers/          # Utility functions and app-wide helpers
  pages/            # Page-level components (routes)
  index.css         # Global styles
  main.tsx          # App entry point
  setupTests.ts     # Test setup
  vite-env.d.ts     # Vite/TypeScript environment types
```

### Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Backend & Auth:** Supabase
- **Testing:** Jest, React Testing Library
- **Deployment, CI/CD:** Vercel

### Design Principles & Architecture

- **Component-Based UI:** All UI elements are modular React components for reusability and maintainability.
- **Separation of Concerns:** Logic, UI, and data access are separated into helpers, components, and pages.
- **Single Responsibility Principle:** Each component and helper does one thing well.
- **Routing:** Page-level, client-side routing is handled via React Router.
- **Testing:** Unit tests for core components ensure reliability.
- **Row Level Security:** Ensure only authenticated and relevant users can access data.
- **Scalability:** Folder structure supports easy feature expansion and codebase growth.

---