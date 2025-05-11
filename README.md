# ThreadSpire

A modern thread-based discussion platform built with Next.js and Supabase.

## Features

- User authentication with NextAuth.js
- Thread creation and management
- Real-time reactions and bookmarks
- User profiles and collections
- Rate limiting and security features

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Upstash Redis account (for rate limiting)
- SMTP server (for password reset)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/threadspire.git
cd threadspire
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the environment variables in `.env` with your credentials:
- Supabase project URL and keys
- NextAuth secret
- Redis URL and token
- SMTP server details

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `NEXTAUTH_URL`: Your application URL (e.g., http://localhost:3000)
- `NEXTAUTH_SECRET`: A random string for NextAuth.js
- `UPSTASH_REDIS_REST_URL`: Your Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN`: Your Upstash Redis token
- `SMTP_*`: Your SMTP server details for password reset emails

## Security Features

- Rate limiting on API routes
- Secure headers
- Password hashing
- Session management
- Protected routes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
