# InheritX HRMS - Human Resource Management System

A modern, fully responsive HRMS web application inspired by Keka HRMS. Built with Next.js 14+, TypeScript, and Tailwind CSS with beautiful UI/UX and dark mode support.

![InheritX HRMS](https://img.shields.io/badge/Next.js-14+-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0+-38BDF8?style=flat&logo=tailwind-css)

## ✨ Features

### 📊 Dashboard
- Real-time statistics and KPIs
- Interactive charts (Attendance trends, Salary distribution, Department breakdown)
- Upcoming holidays and birthday reminders
- Quick action shortcuts
- Responsive grid layout

### 👥 Employee Management
- Complete employee directory with search and filters
- Detailed employee profiles with modal view
- Add/Edit employee functionality
- Department and status-based filtering
- Employee stats and quick insights

### 🕒 Attendance Tracking
- Monthly calendar view with attendance status
- Daily attendance logs with check-in/check-out times
- Department-wise attendance analysis
- Real-time activity feed
- Status indicators (Present, Absent, Late, Half Day)

### 📅 Leave Management
- Visual leave balance cards for different leave types
- Interactive leave calendar
- Leave request management with approval workflow
- Leave history and tracking
- Status-based filtering (Approved, Pending, Rejected)

### 💰 Payroll
- Comprehensive payroll dashboard
- Salary breakdown (Basic, Allowances, Deductions)
- Detailed payslip viewer with modal
- Month-wise payroll reports
- Export and email functionality

### 📈 Performance
- Goal tracking and progress visualization
- Performance review management
- Employee ratings with star system
- Top performers leaderboard
- Achievement tracking and feedback

### 📑 Reports
- Multiple report types (Attendance, Payroll, Leave, Performance, Headcount)
- Interactive charts and visualizations
- Report generation with custom filters
- Export functionality
- Recent reports history

### ⚙️ Settings
- Company information management
- Appearance customization (Theme, Colors, Fonts)
- Notification preferences
- Security settings (Password policy, 2FA, Session management)
- Integration management (Google, Slack, QuickBooks, Zoom)
- Audit logs

## 🎨 Design Features

- **Modern UI**: Clean, professional interface inspired by Keka HRMS
- **Dark Mode**: Seamless light/dark theme toggle with localStorage persistence
- **Responsive**: 100% responsive design for desktop, tablet, and mobile
- **Animations**: Smooth transitions and micro-interactions using Framer Motion
- **Accessibility**: WCAG-compliant with proper ARIA labels
- **Color Scheme**: Primary color #00BED4 with carefully chosen accent colors

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Utilities**: clsx, tailwind-merge

## 📁 Project Structure

```
inheritx-hrms/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Dashboard page
│   ├── employees/           # Employee management
│   ├── attendance/          # Attendance tracking
│   ├── leave/               # Leave management
│   ├── payroll/             # Payroll processing
│   ├── performance/         # Performance reviews
│   ├── reports/             # Reports and analytics
│   └── settings/            # Settings and configuration
├── components/
│   ├── layout/              # Layout components (Header, Sidebar)
│   └── ui/                  # Reusable UI components
├── contexts/                # React contexts (Theme)
├── lib/                     # Utilities and mock data
│   ├── utils.ts            # Helper functions
│   └── mockData.ts         # Static mock data
└── public/                  # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd inheritx-hrms
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🎨 Theming

The application uses CSS variables for theming, making it easy to customize:

```css
:root {
  --primary: #00BED4;
  --background: #F8FAFB;
  --foreground: #0B0A14;
  /* ... other variables */
}

[data-theme="dark"] {
  --background: #0D1117;
  --foreground: #E5E7EB;
  /* ... other variables */
}
```

## 🧩 Key Components

### UI Components
- `Card` - Container component with variants
- `Button` - Button with multiple variants and sizes
- `Badge` - Status indicators
- `Modal` - Animated modal dialogs
- `Avatar` - User avatars with initials fallback
- `Input` - Form input with label support
- `Select` - Dropdown select component

### Layout Components
- `Header` - Top navigation with search, notifications, and profile
- `Sidebar` - Collapsible navigation sidebar
- `MainLayout` - Main application layout wrapper

## 📊 Mock Data

All data in the application is static/mock data defined in `lib/mockData.ts`:
- Employee records
- Attendance logs
- Leave requests
- Payroll information
- Performance reviews
- Departments and leave types

## 🎯 Features Implemented

✅ Fully responsive design  
✅ Dark/Light theme toggle  
✅ Animated transitions  
✅ Interactive charts  
✅ Modal dialogs  
✅ Search and filtering  
✅ Collapsible sidebar  
✅ Notification system  
✅ Profile menu  
✅ Calendar views  
✅ Data tables  
✅ Form handling  
✅ Status badges  
✅ Progress indicators  

## 🔮 Future Enhancements (Not Implemented - Static UI Only)

- Backend API integration
- Database connectivity
- User authentication
- Real-time updates
- File uploads
- Email notifications
- Export to PDF/Excel
- Advanced analytics
- Role-based access control
- Multi-tenancy

## 📝 Notes

- This is a **static UI implementation** - no backend, database, or APIs
- All data is hardcoded or mock data
- Forms don't submit (UI only)
- Buttons trigger UI changes only
- Perfect for demos, prototypes, and UI reference

## 🤝 Contributing

This is a demo project. Feel free to fork and customize for your needs.

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 👨‍💻 Author

Built with ❤️ for InheritX Technologies

## 🙏 Credits

- Design inspiration: [Keka HRMS](https://www.keka.com/)
- UI Components: Custom built with Tailwind CSS
- Icons: Lucide React
- Charts: Recharts

---

**Note**: This is a static UI demonstration project. For production use, you would need to implement backend services, authentication, database integration, and proper security measures.
