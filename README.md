# AI Chef Meal Planner

A comprehensive AI-powered meal planning application with smart pantry management, personalized meal planning, and AI-generated recipes.

## Features

### 🥘 Smart Pantry Management
- Track ingredients with automatic quantity updates
- Search from a comprehensive global database of pantry items
- Add custom ingredients
- Real-time pantry sync with Convex

### 🤖 AI-Powered Meal Planning
- Generate personalized meal plans using Groq AI (Llama 3.1)
- Customize by diet type, cuisine, family size, and duration
- Respect allergies, medical conditions, and food preferences
- Regenerate individual meals with "Surprise Me" or custom requests

### 📊 Nutrition Tracking
- Track daily calorie intake
- View detailed nutritional information (protein, carbs, fat, fiber, sodium)
- Monitor meal completion progress

### 👤 User Profile Management
- Manage allergies with severity levels
- Track medical conditions affecting diet
- Set favorite ingredients
- Secure authentication via Clerk

### 📱 Modern UI/UX
- Beautiful, responsive design with Tailwind CSS
- Smooth animations and transitions
- Intuitive meal planning wizard
- Real-time updates

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Database**: Convex (real-time database)
- **Authentication**: Clerk
- **AI**: Groq SDK with Llama 3.1
- **State Management**: Convex real-time queries
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Accounts and API keys for:
  - Clerk (https://clerk.com)
  - Convex (https://convex.dev)
  - Groq (https://groq.com)

### Installation

1. **Clone the repository**
   ```bash
   cd whyisit
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Convex Database
   NEXT_PUBLIC_CONVEX_URL=your_convex_url

   # Groq AI
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Set up Convex**
   ```bash
   npx convex dev
   ```
   
   This will:
   - Create a new Convex project (or link to existing)
   - Deploy your schema
   - Start the Convex dev server

5. **Seed the database**
   
   In the Convex dashboard or using the CLI, run:
   ```bash
   npx convex run seed:seedGlobalPantryItems
   ```
   
   This populates the global pantry items database with ~90 common ingredients.

6. **Run the development server**
   ```bash
   pnpm dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   └── dashboard/
│   │       ├── page.tsx      # Dashboard home
│   │       ├── pantry/       # Pantry management
│   │       ├── profile/      # User profile
│   │       └── meal-plans/   # Meal planning
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Landing page
├── components/
│   └── ui/                   # shadcn/ui components
├── convex/
│   ├── schema.ts             # Database schema
│   ├── users.ts              # User functions
│   ├── pantry.ts             # Pantry functions
│   ├── mealPlans.ts          # Meal plan functions
│   └── seed.ts               # Database seeding
├── lib/
│   ├── utils.ts              # Utility functions
│   └── groq.ts               # Groq AI integration
├── hooks/
│   └── use-toast.ts          # Toast notifications
└── middleware.ts             # Clerk middleware
```

## Usage Guide

### 1. Set Up Your Profile
- Navigate to **Profile** page
- Add your allergies with severity levels
- List any medical conditions
- Add your favorite ingredients

### 2. Stock Your Pantry
- Go to **Pantry** page
- Search for ingredients from the global database
- Add quantities and units
- Track what you have available

### 3. Create a Meal Plan
- Click **New Meal Plan**
- Set duration (days or weeks)
- Choose family size
- Select meals per day (breakfast, lunch, dinner, snacks, dessert)
- Pick diet type and cuisine preference
- Add ingredients to avoid
- Generate your personalized meal plan!

### 4. View and Track Meals
- Navigate to **Meal Plans**
- Select a date to view meals
- View detailed recipes with ingredients and instructions
- Mark meals as eaten (automatically updates pantry)
- Regenerate meals with "Surprise Me" or custom requests

## Features in Detail

### AI Meal Generation
The app uses Groq's Llama 3.1 model to generate personalized recipes based on:
- Your available pantry items
- Dietary preferences and restrictions
- Allergies and medical conditions
- Favorite ingredients
- Family size for proper portions

### Real-time Updates
Convex provides real-time database synchronization:
- Pantry updates instantly across all devices
- Meal plan changes reflect immediately
- No manual refresh needed

### Smart Pantry Deduction
When you mark a meal as eaten:
- Ingredients are automatically deducted from pantry
- Quantities are updated in real-time
- Items reaching zero are removed

## Development

### Adding New Features

1. **Database Changes**: Edit `convex/schema.ts` and deploy
2. **New API Functions**: Create in `convex/` directory
3. **UI Components**: Add to `components/ui/`
4. **Pages**: Create in `app/(dashboard)/dashboard/`

### Running Convex Functions

```bash
# Deploy schema changes
npx convex dev

# Run a mutation/query
npx convex run convex/seed:seedGlobalPantryItems
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Deploy Convex

```bash
npx convex deploy
```

Update your production environment variables with the production Convex URL.

## Troubleshooting

### Common Issues

1. **Convex connection errors**
   - Ensure `NEXT_PUBLIC_CONVEX_URL` is set correctly
   - Run `npx convex dev` in a separate terminal

2. **Clerk authentication issues**
   - Verify Clerk keys are correct
   - Check middleware configuration

3. **Groq API errors**
   - Ensure `GROQ_API_KEY` is valid
   - Check API rate limits

## Contributing

This is a complete, production-ready application. Feel free to:
- Add new features
- Improve existing functionality
- Fix bugs
- Enhance UI/UX

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Convex/Clerk/Groq documentation
3. Open an issue on GitHub

---

Built with ❤️ using Next.js, Convex, Clerk, and Groq AI
