# LexiFlow - Modern Vocabulary Learning Application

LexiFlow is a comprehensive full-stack vocabulary learning web application built with modern technologies. It provides powerful word management, persistent data storage, learning progress tracking, and comprehensive CRUD operations for vocabulary building.

## 🚀 Features

### Core Functionality
- **Word Management**: Create, read, update, and delete vocabulary entries
- **Advanced Search**: Real-time search across words, meanings, and translations
- **Categorization**: Organize words by categories (Business, Technology, Academic, etc.)
- **Learning Progress**: Track daily activities and learning streaks
- **Statistics Dashboard**: Visualize learning progress with comprehensive analytics
- **Responsive Design**: Mobile-first design that works on all devices

### Word Features
- **Rich Word Data**: Word, meaning, translation, category, part of speech, examples
- **Validation**: Comprehensive data validation on both frontend and backend
- **Filtering**: Filter words by category, search terms, and more
- **Pagination**: Efficient pagination for large vocabulary collections

### Analytics & Tracking
- **Learning Statistics**: Total words, category distribution, learning streaks
- **Daily Activities**: Track and record learning sessions
- **Progress Visualization**: Charts and metrics for learning insights
- **Recent Activity**: View recently added words and activities

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3+ with Shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling

### Backend
- **Language**: Rust
- **Framework**: Axum 0.7+ for web server
- **Database**: PostgreSQL 15+ with Diesel ORM
- **Deployment**: Shuttle.rs platform
- **Authentication**: JWT tokens (ready for future implementation)
- **Validation**: Validator crate for data validation

### Database
- **PostgreSQL**: Primary database with full ACID compliance
- **Diesel ORM**: Type-safe database operations
- **Migrations**: Automated database schema management
- **Indexing**: Optimized queries with proper indexing

## 📁 Project Structure

```
LexiFlow/
├── frontend/                    # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                # App Router pages and layouts
│   │   │   ├── page.tsx        # Home page
│   │   │   ├── layout.tsx      # Root layout
│   │   │   ├── words/          # Word management pages
│   │   │   │   ├── page.tsx    # Words list
│   │   │   │   ├── new/        # Add new word
│   │   │   │   └── [id]/       # Individual word pages
│   │   │   └── dashboard/      # Analytics dashboard
│   │   ├── components/         # React components
│   │   │   ├── ui/             # Shadcn/ui components
│   │   │   └── layout/         # Layout components
│   │   ├── lib/                # Utilities and API client
│   │   │   ├── api.ts          # API client functions
│   │   │   ├── utils.ts        # Utility functions
│   │   │   ├── validations.ts  # Zod schemas
│   │   │   └── providers.tsx   # React Query provider
│   │   └── types/              # TypeScript definitions
│   ├── package.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── tsconfig.json
├── backend/                     # Rust API Server
│   ├── src/
│   │   ├── main.rs             # Application entry point
│   │   ├── lib.rs              # Library root
│   │   ├── models/             # Data models (Diesel)
│   │   │   ├── word.rs         # Word model and schemas
│   │   │   └── activity.rs     # Learning activity model
│   │   ├── handlers/           # API route handlers
│   │   │   ├── words.rs        # Word CRUD operations
│   │   │   └── statistics.rs   # Statistics and analytics
│   │   ├── database/           # Database configuration
│   │   │   ├── connection.rs   # Connection pool setup
│   │   │   └── schema.rs       # Generated Diesel schema
│   │   ├── errors/             # Error handling
│   │   ├── config/             # Configuration management
│   │   └── utils/              # Utility functions
│   ├── migrations/             # Database migrations
│   │   ├── 2024-01-01-000001_create_words/
│   │   ├── 2024-01-01-000002_create_categories/
│   │   └── 2024-01-01-000003_create_learning_activities/
│   ├── Cargo.toml
│   ├── Shuttle.toml
│   └── diesel.toml
├── CLAUDE.md                   # Project documentation and guidelines
└── README.md                   # This file
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Rust** 1.70+ with Cargo
- **PostgreSQL** 15+
- **Git** for version control

### Database Setup

1. Install PostgreSQL and create a database:
```bash
createdb lexiflow
```

2. Set up the database URL in your environment:
```bash
export DATABASE_URL="postgresql://username:password@localhost/lexiflow"
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Diesel CLI:
```bash
cargo install diesel_cli --no-default-features --features postgres
```

3. Run database migrations:
```bash
diesel migration run
```

4. Install dependencies and run the server:
```bash
cargo run
```

The API server will start on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The web application will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=LexiFlow
```

**Backend (.env):**
```bash
DATABASE_URL=postgresql://postgres:password@localhost/lexiflow
RUST_LOG=debug
JWT_SECRET=your-secure-jwt-secret-key
CORS_ORIGIN=http://localhost:3000
```

## 📡 API Endpoints

### Words Management
```
GET    /api/words               # List words with pagination and filtering
POST   /api/words               # Create new word
GET    /api/words/:id           # Get specific word
PUT    /api/words/:id           # Update word
DELETE /api/words/:id           # Delete word
GET    /api/categories          # List all categories
```

### Statistics & Analytics
```
GET    /api/statistics          # Get learning statistics
POST   /api/statistics          # Record learning activity
```

### Health Check
```
GET    /health                  # Health check endpoint
```

## 🗄 Database Schema

### Tables

**words**
- `id` (UUID, Primary Key)
- `word` (VARCHAR, NOT NULL)
- `meaning` (TEXT, NOT NULL)
- `translation` (TEXT, NOT NULL)
- `category` (VARCHAR, NOT NULL)
- `part_of_speech` (VARCHAR, NOT NULL)
- `example` (TEXT, NULLABLE)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**categories**
- `id` (UUID, Primary Key)
- `name` (VARCHAR, UNIQUE, NOT NULL)
- `description` (TEXT, NULLABLE)
- `created_at` (TIMESTAMPTZ)

**learning_activities**
- `id` (UUID, Primary Key)
- `activity_type` (VARCHAR, NOT NULL)
- `date` (DATE, NOT NULL)
- `count` (INTEGER, NOT NULL)
- `created_at` (TIMESTAMPTZ)

## 🏗 Development

### Adding New Features

1. **Backend Changes**:
   - Add new models in `src/models/`
   - Create handlers in `src/handlers/`
   - Update routes in `src/main.rs`
   - Add migrations if needed

2. **Frontend Changes**:
   - Add new pages in `src/app/`
   - Create components in `src/components/`
   - Update API client in `src/lib/api.ts`
   - Add TypeScript types in `src/types/`

### Code Quality

- **Rust**: Use `cargo fmt` and `cargo clippy` for code formatting and linting
- **TypeScript**: Use `npm run lint` and `npm run type-check`
- **Database**: Always create migrations for schema changes

## 🚀 Deployment

### Backend (Shuttle.rs)
```bash
cd backend
cargo shuttle deploy
```

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by the need for effective vocabulary learning tools
- Uses the power of Rust for backend performance and safety
- Leverages Next.js for optimal frontend user experience

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**LexiFlow** - Empowering language learners with modern technology! 🌟