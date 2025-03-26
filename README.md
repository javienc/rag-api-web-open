# GenAPI - Dynamic AI-Powered Content Generation Platform

GenAPI is a powerful platform that allows you to build and access dynamic AI-powered content through scalable APIs. Here's what makes it special:

## Key Features:

1. **Easy Content Generation**
   - Create custom API endpoints for various content types
   - Specify detailed parameters to get precisely what you need
   - Get instant access to AI-generated content through RESTful APIs

2. **Flexible Usage**
   - Generate content for multiple categories (recipes, movies, travel, books, and more)
   - Customize endpoints with your preferred naming convention
   - Test and preview content directly in the interface

3. **Built-in Rate Limiting**
   - 20 requests per hour to ensure fair usage
   - Real-time usage tracking
   - Clear visibility of remaining requests and reset time

4. **User-Friendly Interface**
   - Simple three-field form for content generation
   - "I'm Feeling Lucky" feature for inspiration
   - Instant preview of generated content
   - One-click copy functionality for API endpoints

## How to Use:

1. Sign in with your Google account
2. Specify your content type, details, and desired endpoint
3. Click "Generate" to create your custom API endpoint
4. Use the generated URL to access your content programmatically

Perfect for developers, content creators, and businesses looking for:
- Dynamic content generation
- API-first content solutions
- Rapid prototyping
- Content automation

The platform provides a seamless way to integrate AI-generated content into your applications, websites, or services through simple REST API calls.

---

## Technical Setup

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### System Requirements

- Node.js >= 22.12.0
- npm (comes with Node.js)

### Key Dependencies
- Next.js 15.1.0
- React 19.0.0
- NextAuth 4.24.x
- OpenAI API 4.76.x

### Environment Setup

1. Create a `.env.local` file in the root directory
2. Add the following environment variables:
```env
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Development Server

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Rate Limit Reset Key
Currently hardcoded as:
```env
GenAPI2024Reset
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.