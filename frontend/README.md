# Gastro Analytics Frontend

Admin panel for Gastro Analytics - built with React, TypeScript and Tailwind CSS 4.

## Features

- ✅ Login with username/password
- ✅ Two-factor authentication (2FA) via Telegram
- ✅ Protected routes
- ✅ Token-based authentication with auto-refresh
- ✅ Responsive design

## Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Vite** - Build tool
- **React Router 6** - Routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # Base UI components (Button, Input, Card)
│   │   └── auth/         # Auth-related components
│   ├── config/           # Configuration files
│   ├── contexts/         # React Context providers
│   ├── pages/            # Page components
│   │   ├── auth/         # Login, 2FA pages
│   │   └── dashboard/    # Dashboard page
│   ├── routes/           # Router configuration
│   ├── services/         # API services
│   │   └── api/          # Axios client and service modules
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Install dependencies

```bash
cd frontend
npm install
```

### Start development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## API Configuration

The API base URL is configured in `src/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: "https://api.gastro-analytics.uz",
  API_VERSION: "/api/v1",
  // ...
};
```

## Authentication Flow

1. User enters username and password
2. If 2FA is enabled, API returns `requires_2fa: true` with `temp_token`
3. User is redirected to 2FA verification page
4. User enters 6-digit OTP from Telegram
5. On success, tokens are stored and user is redirected to dashboard

## SOLID Principles Applied

- **Single Responsibility**: Each component/service has one specific purpose
- **Open/Closed**: Components are extensible via props without modification
- **Liskov Substitution**: UI components can be substituted where their interfaces match
- **Interface Segregation**: Types are specific to their use cases
- **Dependency Inversion**: Services depend on abstractions (API config), not concrete implementations
