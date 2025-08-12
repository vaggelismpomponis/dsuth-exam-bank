# DS UTH Exam Bank

A comprehensive web application for managing and accessing exam materials for the Department of Computer Science at the University of Thessaly.

## 🚀 Features

- **File Management**: Upload, download, and organize exam files by course and semester
- **Course Organization**: Structured by academic years and semesters
- **Admin Panel**: Comprehensive content management system
- **File Requests**: Users can request missing exam materials
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Search & Filtering**: Advanced filtering by year, semester, and exam period

## 🏗️ Project Structure

```
/
├── src/                    # React application source code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Application pages
│   ├── utils/             # Utility functions and helpers
│   └── assets/            # Static assets
├── supabase/               # Supabase Edge Functions
│   └── functions/          # Backend functions
├── scripts/                # Utility scripts
│   └── bulk_upload.py     # Bulk file upload script
├── docs/                   # Project documentation
├── public/                 # Public static assets
└── config files            # Configuration files
```

## 🛠️ Technology Stack

- **Frontend**: React 18, Material-UI (MUI), React Router
- **Backend**: Supabase (PostgreSQL, Storage, Auth)
- **Testing**: Vitest, React Testing Library
- **Deployment**: Vercel
- **Build Tool**: Vite

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/vaggelismpomponis/dsuth-exam-bank.git
cd dsuth-exam-bank
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. Start development server:
```bash
npm run dev
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 🚀 Deployment

The application is automatically deployed to Vercel on push to the main branch.

## 📚 Documentation

See the `/docs` folder for detailed documentation:
- [Deploy Turnstile Guide](docs/deploy-turnstile.md)
- [Scripts Documentation](scripts/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
