# URL Shortener Frontend

A modern, responsive URL shortener frontend built with Next.js 15, React 19, TypeScript, and Tailwind CSS.
<img width="1918" height="907" alt="image" src="https://github.com/user-attachments/assets/7cb77e91-8c19-4959-a497-93d1ac41632c" />

## Features

✅ **Core Functionality**
- URL shortening with custom slugs
- Instant URL redirection
- 404 error handling for invalid slugs
- Copy to clipboard functionality

✅ **User Authentication**
- User registration and login
- JWT-based authentication
- Protected routes for dashboard

✅ **Dashboard & Analytics**
- Personal dashboard with statistics
- URL management interface
- Visit tracking and analytics
- Top performing URLs

✅ **Modern UI/UX**
- Responsive design following the mockup
- Clean, professional interface
- Loading states and error handling
- Accessibility considerations

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + Custom hooks
- **Authentication**: JWT tokens with localStorage

## Getting Started

### Prerequisites
- Node.js 18+ 
- Backend API running on port 3000

### Installation

1. **Clone and install dependencies**
```bash
npm install
```

2. **Environment setup**
```bash
cp .env.sample .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_DOMAIN=localhost:3001
```

3. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:3001`

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [slug]/            # Dynamic route for redirects
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── authWrapper.tsx    # Auth state wrapper
│   ├── dashboard.tsx      # Analytics dashboard
│   ├── loginForm.tsx      # Login form
│   ├── navbar.tsx         # Navigation bar
│   ├── registerForm.tsx   # Registration form
│   ├── urlList.tsx        # URL listing component
│   ├── urlShortenerForm.tsx # Main URL creation form
│   └── urlSuccessCard.tsx # Success state component
└── common/                # Shared utilities
    ├── context/           # React contexts
    ├── hooks/             # Custom hooks
    ├── models/            # TypeScript interfaces
    ├── provider/          # Context providers
    ├── schemas/           # Zod validation schemas
    └── utils/             # Utility functions
```

## Key Features Implementation

### URL Shortening Form
- Validates URLs using Zod schemas
- Supports custom slugs
- Real-time validation feedback
- Optimistic UI updates

### Authentication System
- JWT token management
- Persistent login state
- Protected route handling
- User profile management

### Dashboard Analytics
- Total URLs and visits count
- Top performing URLs ranking
- Visual statistics cards
- Responsive design

### URL Management
- List all user URLs
- Copy short URLs to clipboard
- Visit original URLs
- Real-time visit tracking

## API Integration

The frontend integrates with the backend API through:

- **Authentication**: `/auth/login`, `/auth/register`, `/auth/profile`
- **URL Management**: `/urls`, `/urls/dashboard`, `/urls/all`
- **Redirects**: `/:slug` for URL redirection

## Design System

Following the mockup specifications:
- **Primary Color**: Purple (#7C3AED)
- **Typography**: Clean, modern font stack
- **Layout**: Card-based design with proper spacing
- **States**: Loading, success, error states
- **Responsive**: Mobile-first approach

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000      # Backend API URL
NEXT_PUBLIC_APP_DOMAIN=localhost:3001          # Frontend domain for short URLs
```

## Deployment

1. **Build the application**
```bash
npm run build
```

2. **Start production server**
```bash
npm run start
```

For deployment platforms like Vercel, Netlify, or Railway, make sure to configure the environment variables in your deployment settings.

## Contributing

1. Follow TypeScript strict mode
2. Use Tailwind CSS for styling
3. Implement proper error handling
4. Add loading states for async operations
5. Follow the established file structure

## License

This project is for educational/challenge purposes.
