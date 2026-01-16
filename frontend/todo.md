# 🤖 GASTRO ANALYTICS FRONTEND - AI DEVELOPMENT PROMPT

## 📋 PROJECT OVERVIEW

You are building a **professional analytics dashboard** for "Gastro-Savdo-Insights" - a food distribution company's business intelligence platform. The frontend must connect to an existing REST API and display comprehensive sales, customer, product, and logistics analytics.



### Design Principles

- **Professional & Clean**: Corporate dashboard aesthetic
- **Fully Responsive**: Mobile-first approach
- **Accessible**: WCAG 2.1 AA compliant
- **Performance**: Lazy loading, code splitting
- **Dark/Light Mode**: Theme toggle support

---

## 🏗️ PROJECT STRUCTURE

```
gastro-analytics/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── logo.svg
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── ui/
│   │   │   ├── Card.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── KPICard.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── charts/
│   │   │   ├── BarChart.tsx
│   │   │   ├── LineChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   ├── AreaChart.tsx
│   │   │   ├── RadarChart.tsx
│   │   │   └── Treemap.tsx
│   │   └── analytics/
│   │       ├── dashboard/
│   │       │   ├── KPISection.tsx
│   │       │   ├── SalesOverview.tsx
│   │       │   ├── TopProducts.tsx
│   │       │   └── RecentActivity.tsx
│   │       ├── products/
│   │       │   ├── TopRevenueProducts.tsx
│   │       │   ├── ABCAnalysis.tsx
│   │       │   ├── MarketBasket.tsx
│   │       │   └── DiscontinuedProducts.tsx
│   │       ├── customers/
│   │       │   ├── TopByCountry.tsx
│   │       │   ├── RFMSegmentation.tsx
│   │       │   ├── RetentionAnalysis.tsx
│   │       │   └── DiscountBehavior.tsx
│   │       ├── employees/
│   │       │   ├── MonthlySales.tsx
│   │       │   └── Hierarchy.tsx
│   │       ├── sales/
│   │       │   ├── YoYGrowth.tsx
│   │       │   ├── DayOfWeekPatterns.tsx
│   │       │   ├── DiscountImpact.tsx
│   │       │   └── TerritoryPerformance.tsx
│   │       ├── categories/
│   │       │   ├── MonthlyGrowth.tsx
│   │       │   └── CountryBreakdown.tsx
│   │       ├── suppliers/
│   │       │   ├── Performance.tsx
│   │       │   └── RiskAnalysis.tsx
│   │       └── shipping/
│   │           └── Efficiency.tsx
│   ├── hooks/
│   │   ├── useApi.ts
│   │   ├── useAnalytics.ts
│   │   ├── useTheme.ts
│   │   ├── useSidebar.ts
│   │   └── useDebounce.ts
│   ├── services/
│   │   ├── api.ts
│   │   └── analytics.service.ts
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── analytics.types.ts
│   │   └── common.types.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── context/
│   │   ├── ThemeContext.tsx
│   │   └── SidebarContext.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── products/
│   │   │   ├── TopRevenue.tsx
│   │   │   ├── ABCAnalysis.tsx
│   │   │   ├── MarketBasket.tsx
│   │   │   └── Discontinued.tsx
│   │   ├── customers/
│   │   │   ├── TopByCountry.tsx
│   │   │   ├── RFMSegmentation.tsx
│   │   │   ├── Retention.tsx
│   │   │   └── DiscountBehavior.tsx
│   │   ├── employees/
│   │   │   ├── MonthlySales.tsx
│   │   │   └── Hierarchy.tsx
│   │   ├── sales/
│   │   │   ├── YoYGrowth.tsx
│   │   │   ├── DayOfWeek.tsx
│   │   │   ├── DiscountImpact.tsx
│   │   │   └── Territory.tsx
│   │   ├── categories/
│   │   │   ├── MonthlyGrowth.tsx
│   │   │   └── CountryBreakdown.tsx
│   │   ├── suppliers/
│   │   │   ├── Performance.tsx
│   │   │   └── RiskAnalysis.tsx
│   │   └── shipping/
│   │       └── Efficiency.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔌 API ENDPOINTS REFERENCE

### Base URL

```
Production: https://api.gastro-analytics.com
Development: http://localhost:8000
```

### All Endpoints

```typescript
// Products
GET /api/v1/analytics/products/top-revenue?limit={1-100}
GET /api/v1/analytics/products/market-basket?min_occurrences={1+}&limit={1-100}
GET /api/v1/analytics/products/abc-analysis
GET /api/v1/analytics/products/discontinued-analysis

// Employees
GET /api/v1/analytics/employees/monthly-sales
GET /api/v1/analytics/employees/hierarchy

// Customers
GET /api/v1/analytics/customers/top-by-country
GET /api/v1/analytics/customers/rfm-segmentation?reference_date={YYYY-MM-DD}
GET /api/v1/analytics/customers/retention-analysis
GET /api/v1/analytics/customers/discount-behavior?limit={1-100}

// Categories
GET /api/v1/analytics/categories/monthly-growth
GET /api/v1/analytics/categories/country-breakdown

// Suppliers
GET /api/v1/analytics/suppliers/performance?min_orders={1+}
GET /api/v1/analytics/suppliers/risk-analysis

// Shipping
GET /api/v1/analytics/shipping/efficiency

// Sales
GET /api/v1/analytics/sales/yoy-growth
GET /api/v1/analytics/sales/day-of-week-patterns
GET /api/v1/analytics/sales/discount-impact?limit={1-100}
GET /api/v1/analytics/sales/territory-performance

// Dashboard
GET /api/v1/analytics/dashboard/business-kpis

// Health
GET /api/v1/analytics/health
GET /health
```

### API Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  count: number;
}
```

---

## 🎨 DESIGN SPECIFICATIONS

### Color Palette

```css
:root {
  /* Primary Colors */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;

  /* Semantic Colors */
  --success: #10b981;
  --success-light: #d1fae5;
  --warning: #f59e0b;
  --warning-light: #fef3c7;
  --danger: #ef4444;
  --danger-light: #fee2e2;
  --info: #6366f1;
  --info-light: #e0e7ff;

  /* Neutral Colors */
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;

  /* Dark Mode */
  --dark-bg: #0f172a;
  --dark-card: #1e293b;
  --dark-border: #334155;
}
```

### Typography

```css
/* Font Family */
font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */
```

### Spacing System

```css
/* Spacing Scale (Tailwind) */
spacing: 4px base unit
p-1: 4px   | p-2: 8px   | p-3: 12px  | p-4: 16px
p-5: 20px  | p-6: 24px  | p-8: 32px  | p-10: 40px
p-12: 48px | p-16: 64px | p-20: 80px | p-24: 96px
```

### Border Radius

```css
--radius-sm: 0.25rem; /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem; /* 8px */
--radius-xl: 0.75rem; /* 12px */
--radius-2xl: 1rem; /* 16px */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

### Responsive Breakpoints

```css
/* Mobile First */
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

---

## 📱 SIDEBAR SPECIFICATIONS

### Structure

```
┌─────────────────────────────────┐
│  🍽️ GASTRO ANALYTICS           │
│      Business Intelligence      │
├─────────────────────────────────┤
│                                 │
│  🏠 Dashboard                   │
│                                 │
│  📦 Mahsulotlar            ▼   │
│     ├── TOP Daromadli          │
│     ├── ABC Tahlili            │
│     ├── Market Basket          │
│     └── To'xtatilgan           │
│                                 │
│  👥 Mijozlar               ▼   │
│     ├── TOP by Country         │
│     ├── RFM Segmentatsiya      │
│     ├── Retention              │
│     └── Chegirma Xulq-atvori   │
│                                 │
│  👨‍💼 Xodimlar              ▼   │
│     ├── Oylik Sotuvlar         │
│     └── Ierarxiya              │
│                                 │
│  📈 Sotuvlar               ▼   │
│     ├── YoY O'sish             │
│     ├── Hafta Kunlari          │
│     ├── Chegirma Ta'siri       │
│     └── Territoriya            │
│                                 │
│  📂 Kategoriyalar          ▼   │
│     ├── Oylik O'sish           │
│     └── Mamlakat Breakdown     │
│                                 │
│  🏭 Yetkazib Beruvchilar   ▼   │
│     ├── Samaradorlik           │
│     └── Xatar Tahlili          │
│                                 │
│  🚚 Yuk Tashuvchilar       ▼   │
│     └── Efficiency             │
│                                 │
├─────────────────────────────────┤
│  ⚙️ Settings                    │
│  🌙 Dark Mode Toggle            │
└─────────────────────────────────┘
```

### Sidebar Behavior

| Screen Size         | State                      | Width |
| ------------------- | -------------------------- | ----- |
| Mobile (<768px)     | Hidden (overlay on toggle) | 280px |
| Tablet (768-1024px) | Collapsed (icons only)     | 72px  |
| Desktop (>1024px)   | Expanded                   | 280px |

### Animations

```css
/* Sidebar transition */
transition: width 0.3s ease, transform 0.3s ease;

/* Menu item hover */
transition: background-color 0.2s ease, color 0.2s ease;

/* Submenu expand */
transition: max-height 0.3s ease-out;
```

---

## 📊 PAGE SPECIFICATIONS

### 1. Dashboard Page (`/`)

**Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ Header: "Business Dashboard" + Date Range Picker          │
├──────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ │ Total    │ │ Revenue  │ │ Active   │ │ Avg Order│     │
│ │ Orders   │ │ $1.2M    │ │ Customers│ │ Value    │     │
│ │ 830      │ │ ↑ 12%    │ │ 89       │ │ $1,445   │     │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
├──────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────────────┐ │
│ │ Revenue Trend (Line)    │ │ Top Products (Bar)      │ │
│ │                         │ │                         │ │
│ │                         │ │                         │ │
│ └─────────────────────────┘ └─────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────────────┐ │
│ │ Category Distribution   │ │ Employee Performance    │ │
│ │ (Pie Chart)             │ │ (Table)                 │ │
│ └─────────────────────────┘ └─────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

**KPI Cards:**

- Jami Buyurtmalar (with trend arrow)
- Jami Daromad (with trend arrow)
- Faol Mijozlar
- O'rtacha Buyurtma Qiymati
- Vaqtida Yetkazish %
- Jami Mahsulotlar
- Yuk Xarajati
- O'rtacha Yetkazish Kunlari

### 2. Products - TOP Revenue (`/products/top-revenue`)

**Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ Header: "TOP Daromadli Mahsulotlar"                      │
│ Filters: [Limit Dropdown: 5/10/20/50/100]                │
├──────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Horizontal Bar Chart - Top Products by Revenue      │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Table: Rank | Product | Category | Supplier |       │ │
│ │        Quantity | Revenue | Orders | Revenue %      │ │
│ │ ────────────────────────────────────────────────────│ │
│ │ 1. Côte de Blaye | Beverages | Aux joyeux... |     │ │
│ │    623 | $141,396.74 | 24 | 11.23%                 │ │
│ └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 3. Customers - RFM Segmentation (`/customers/rfm-segmentation`)

**Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ Header: "RFM Mijoz Segmentatsiyasi"                      │
│ Filters: [Reference Date Picker]                         │
├──────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────┐│
│ │Champions│ │ Loyal   │ │   New   │ │ At Risk │ │Lost ││
│ │   12    │ │   23    │ │    8    │ │   15    │ │ 31  ││
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────┘│
├──────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────────────┐ │
│ │ Segment Distribution    │ │ RFM Scatter Plot        │ │
│ │ (Donut Chart)           │ │ (Bubble Chart)          │ │
│ └─────────────────────────┘ └─────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Table: Company | Country | Recency | Frequency |    │ │
│ │        Monetary | R | F | M | Segment              │ │
│ └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 4. Sales - YoY Growth (`/sales/yoy-growth`)

**Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ Header: "Yillik O'sish Tendensiyasi"                     │
├──────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Dual Axis Line Chart:                               │ │
│ │ - Revenue (bars)                                    │ │
│ │ - YoY Growth % (line)                               │ │
│ │ - 3-Month Moving Average (dashed line)             │ │
│ └─────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Table: Month | Revenue | Prev Year | YoY % |        │ │
│ │        Moving Avg | YTD Revenue                     │ │
│ └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 5. Suppliers - Risk Analysis (`/suppliers/risk-analysis`)

**Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ Header: "Yetkazib Beruvchi Xatarlari"                    │
├──────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                     │
│ │🔴 HIGH  │ │🟡 MEDIUM│ │🟢 LOW   │                     │
│ │ RISK: 3 │ │ RISK: 8 │ │ RISK: 12│                     │
│ └─────────┘ └─────────┘ └─────────┘                     │
├──────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────────────┐ │
│ │ Treemap: Category >     │ │ Risk by Category        │ │
│ │ Supplier Revenue Share  │ │ (Stacked Bar)           │ │
│ └─────────────────────────┘ └─────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Table: Category | Supplier | Country | Products |   │ │
│ │        Revenue | Share % | Risk Level              │ │
│ └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ DEVELOPMENT TODO LIST

### Phase 1: Project Setup (Priority: HIGH)

```
[ ] 1.1 Initialize Vite + React + TypeScript project
[ ] 1.2 Configure Tailwind CSS with custom theme
[ ] 1.3 Install dependencies (recharts, lucide-react, axios, etc.)
[ ] 1.4 Setup folder structure
[ ] 1.5 Configure environment variables (.env)
[ ] 1.6 Setup ESLint + Prettier
[ ] 1.7 Configure path aliases (@/components, @/hooks, etc.)
```

### Phase 2: Core Infrastructure (Priority: HIGH)

```
[ ] 2.1 Create TypeScript types for all API responses
[ ] 2.2 Setup Axios instance with interceptors
[ ] 2.3 Create API service layer (analytics.service.ts)
[ ] 2.4 Create custom hooks (useApi, useAnalytics)
[ ] 2.5 Setup React Router with all routes
[ ] 2.6 Create ThemeContext (dark/light mode)
[ ] 2.7 Create SidebarContext (collapse state)
```

### Phase 3: Layout Components (Priority: HIGH)

```
[ ] 3.1 Create MainLayout component
[ ] 3.2 Create Sidebar component
      - Collapsible/expandable
      - Nested menu items
      - Active state highlighting
      - Mobile overlay mode
[ ] 3.3 Create Header component
      - Breadcrumbs
      - Theme toggle
      - Mobile menu button
[ ] 3.4 Create MobileNav component
[ ] 3.5 Add responsive behavior
[ ] 3.6 Add smooth animations/transitions
```

### Phase 4: UI Components (Priority: HIGH)

```
[ ] 4.1 Card component (with variants)
[ ] 4.2 Button component (variants, sizes, loading)
[ ] 4.3 Badge component (status colors)
[ ] 4.4 Table component (sortable, pagination)
[ ] 4.5 Loading component (skeleton, spinner)
[ ] 4.6 ErrorState component
[ ] 4.7 EmptyState component
[ ] 4.8 KPICard component (with trend indicator)
[ ] 4.9 Select/Dropdown component
[ ] 4.10 DatePicker component
[ ] 4.11 Tooltip component
[ ] 4.12 Modal component
```

### Phase 5: Chart Components (Priority: MEDIUM)

```
[ ] 5.1 BarChart (horizontal, vertical, stacked)
[ ] 5.2 LineChart (single, multi-line, area fill)
[ ] 5.3 PieChart / DonutChart
[ ] 5.4 AreaChart (gradient fill)
[ ] 5.5 RadarChart
[ ] 5.6 Treemap
[ ] 5.7 Custom tooltip for all charts
[ ] 5.8 Responsive chart containers
```

### Phase 6: Dashboard Page (Priority: HIGH)

```
[ ] 6.1 Fetch business KPIs from API
[ ] 6.2 Create KPI cards grid (8 cards)
[ ] 6.3 Revenue trend line chart
[ ] 6.4 Top products bar chart
[ ] 6.5 Category distribution pie chart
[ ] 6.6 Employee performance mini table
[ ] 6.7 Add loading states
[ ] 6.8 Add error handling
[ ] 6.9 Responsive layout
```

### Phase 7: Products Pages (Priority: MEDIUM)

```
[ ] 7.1 TOP Revenue Products page
      - Limit filter
      - Horizontal bar chart
      - Detailed table
[ ] 7.2 ABC Analysis page
      - Category summary cards
      - Pareto chart
      - Detailed table with badges
[ ] 7.3 Market Basket page
      - Product pair cards
      - Support percentage visualization
      - Filters (min_occurrences, limit)
[ ] 7.4 Discontinued Products page
      - Status comparison cards
      - Comparison charts
```

### Phase 8: Customers Pages (Priority: MEDIUM)

```
[ ] 8.1 Top by Country page
      - Country cards/map
      - Revenue by country chart
      - Detailed table
[ ] 8.2 RFM Segmentation page
      - Segment summary cards
      - Segment distribution donut
      - Scatter/bubble plot
      - Date picker filter
      - Detailed table with segment badges
[ ] 8.3 Retention Analysis page
      - Buyer type distribution
      - Lifespan analysis
      - Detailed table
[ ] 8.4 Discount Behavior page
      - Behavior segment cards
      - Impact visualization
      - Limit filter
```

### Phase 9: Employees Pages (Priority: MEDIUM)

```
[ ] 9.1 Monthly Sales page
      - Employee selector
      - Monthly trend chart
      - Year/month heatmap
      - Performance table
[ ] 9.2 Hierarchy page
      - Organization tree visualization
      - Level-wise performance
      - Expandable tree table
```

### Phase 10: Sales Pages (Priority: MEDIUM)

```
[ ] 10.1 YoY Growth page
       - Dual axis chart (revenue + growth %)
       - Moving average line
       - Monthly comparison table
[ ] 10.2 Day of Week Patterns page
       - Weekday bar chart
       - Radar chart
       - Best day highlights
[ ] 10.3 Discount Impact page
       - Category distribution
       - Impact percentage visualization
       - Limit filter
[ ] 10.4 Territory Performance page
       - Region/territory hierarchy
       - Geographic performance
       - Ranking table
```

### Phase 11: Categories Pages (Priority: LOW)

```
[ ] 11.1 Monthly Growth page
       - Category selector
       - MoM growth chart
       - Trend table
[ ] 11.2 Country Breakdown (Pivot) page
       - Heatmap visualization
       - Pivot table
```

### Phase 12: Suppliers Pages (Priority: LOW)

```
[ ] 12.1 Performance page
       - KPI cards
       - Lead time analysis
       - Late shipment visualization
       - min_orders filter
[ ] 12.2 Risk Analysis page
       - Risk level cards
       - Treemap by category/supplier
       - Risk assessment table
```

### Phase 13: Shipping Page (Priority: LOW)

```
[ ] 13.1 Efficiency page
       - Shipper comparison cards
       - Freight cost analysis
       - On-time delivery chart
       - Performance table
```

### Phase 14: Polish & Optimization (Priority: LOW)

```
[ ] 14.1 Add page transitions/animations
[ ] 14.2 Implement code splitting (lazy loading)
[ ] 14.3 Add error boundaries
[ ] 14.4 Performance optimization (memo, useMemo)
[ ] 14.5 Add export functionality (CSV, PDF)
[ ] 14.6 Add print styles
[ ] 14.7 Cross-browser testing
[ ] 14.8 Accessibility audit (a11y)
[ ] 14.9 SEO meta tags
[ ] 14.10 Final responsive testing
```

### Phase 15: Documentation & Deployment (Priority: LOW)

```
[ ] 15.1 Write README.md
[ ] 15.2 Add JSDoc comments
[ ] 15.3 Create component storybook (optional)
[ ] 15.4 Setup CI/CD pipeline
[ ] 15.5 Deploy to production
```

---

## 🔧 COMPONENT SPECIFICATIONS

### KPICard Component

```tsx
interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  format?: "number" | "currency" | "percent";
  color?: "blue" | "green" | "yellow" | "red" | "purple";
  loading?: boolean;
}
```

### Table Component

```tsx
interface TableColumn<T> {
  key: keyof T;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
  };
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}
```

### Badge Component

```tsx
interface BadgeProps {
  children: React.ReactNode;
  variant: "success" | "warning" | "danger" | "info" | "default";
  size?: "sm" | "md" | "lg";
}
```

---

## 🎯 QUALITY CHECKLIST

### Code Quality

- [ ] TypeScript strict mode enabled
- [ ] No `any` types (use proper typing)
- [ ] Consistent naming conventions
- [ ] Components are properly memoized
- [ ] Custom hooks follow React conventions
- [ ] Error boundaries implemented

### Performance

- [ ] Lazy loading for routes
- [ ] Images optimized
- [ ] Bundle size < 500KB (gzipped)
- [ ] First Contentful Paint < 2s
- [ ] No layout shifts

### Accessibility

- [ ] All interactive elements focusable
- [ ] Proper ARIA labels
- [ ] Color contrast ratio >= 4.5:1
- [ ] Keyboard navigation works
- [ ] Screen reader tested

### Responsiveness

- [ ] Works on 320px width
- [ ] No horizontal scroll
- [ ] Touch targets >= 44px
- [ ] Tables horizontally scrollable on mobile

---

## 📝 NOTES FOR AI

1. **Always use TypeScript** - No JavaScript files
2. **Follow Tailwind conventions** - No inline styles
3. **Use semantic HTML** - Proper heading hierarchy
4. **Handle all states** - Loading, error, empty, success
5. **Make everything responsive** - Mobile-first approach
6. **Use consistent spacing** - Follow the spacing scale
7. **Add proper comments** - Especially for complex logic
8. **Create reusable components** - DRY principle
9. **Use proper error messages** - User-friendly text
10. **Test edge cases** - Empty data, long text, etc.

---
