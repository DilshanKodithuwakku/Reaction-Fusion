# Facebook Web Application Mock

A lightweight, pixel-accurate, and fully interactive **Facebook Desktop** clone built with React, Vite, TypeScript, Tailwind CSS, and Zustand.

---

## Quick Start

```powershell
cd "mock facebook"
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Authentic Features

### 1. Facebook 3-Column Desktop Layout
- **Top Navigation Bar**:
  - Facebook brand logo linking to home
  - Search Facebook input bar
  - Center Navigation Tabs: Home, Video, Marketplace, Groups, Gaming
  - Right Controls: Create/Menu grid, Messenger (with badge), Notifications (with badge), and Profile Avatar with status indicator
  - **Account Dropdown**: Realistic profile menu with "See your profile", "Settings & privacy", "Help & support", "Display & accessibility" (Dark Mode toggle switch with live state transition), and "Log out".
- **Left Sidebar**:
  - User profile shortcut
  - Navigation shortcuts: Friends, Feeds (Most Recent), Groups, Marketplace, Video, Memories, Saved, Pages, Events, Fundraisers
  - "See more" / "See less" collapsible list
  - Realistic user shortcuts (hiking groups, audio clubs, photography collectives)
  - Meta footer with copyright and policy links
- **Center Feed**:
  - **Stories & Reels Tray**: Horizontally scrollable carousel with "Create story" card (user avatar + blue '+' button) and friend story cards with story avatars, rings, and smooth zoom on hover.
  - **Create Post Trigger**: Avatar + "What's on your mind, Alex?" launcher with Live video, Photo/video, and Feeling/activity buttons.
  - **Create Post Modal Dialog**: Authentic Facebook popup with privacy selector (Public, Friends, Only me), colored gradient status canvas picker (Facebook status gradients), photo upload, and feeling tags.
  - **Post Cards**: Author header with verified badge, relative timestamp, globe privacy icon, 3-dot options menu (Save post, Notifications, Hide post, Delete post), and 'X' close button.
  - **Reactions Flyout**: Hovering over the Like button reveals the animated 7 Facebook reactions (Like 👍, Love ❤️, Care 🥰, Haha 😆, Wow 😮, Sad 😢, Angry 😡). Clicking sets the reaction, updates the metrics counter, and styles the button.
  - **Inline Comments**: Expandable comments thread with user avatars, comment bubbles, like buttons on comments, and comment input with emoji, camera, and sticker icons.
- **Right Sidebar**:
  - **Sponsored Ads**: Clean mock sponsored cards with images, company URLs, and descriptions.
  - **Birthdays Widget**: Gift icon notifying upcoming friend birthdays.
  - **Contacts List**: Real-time friends list with green active status indicators.
- **Floating Messenger Chat Window**:
  - Clicking any friend in the contacts sidebar opens an authentic Facebook chat box docked at the bottom right.
  - Features minimize, close, voice/video call buttons, message bubble history, and interactive instant messaging with automated realistic replies.
