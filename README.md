# 🍽️ Gastro-Savdo Insights

**Gastro-Savdo Insights** - bu Northwind ma'lumotlar bazasi asosida yaratilgan zamonaviy, to'liq funksional savdo tahlili va boshqaruv tizimi. Loyiha biznes egalariga savdo, mijozlar, mahsulotlar va xodimlar faoliyatini chuqur tahlil qilish imkonini beradi.

![Dashboard Preview](https://via.placeholder.com/1200x600?text=Gastro-Savdo+Analytics+Dashboard)

## 🚀 Asosiy Imkoniyatlar

### 📊 Tahliliy Dashboardlar

- **KPI Monitoring**: Asosiy biznes ko'rsatkichlarini real vaqtda kuzatish.
- **Sales Analytics**: Yillik o'sish (YoY), daromad trendlari va hududiy tahlillar.
- **Customer Insights**: RFM segmentatsiya, mijozlarni saqlab qolish (Retention) va sodiqlik tahlili.
- **Product Intelligence**: ABC tahlili (Pareto), bozorgan kirish (Market Basket) va rentabellik.

### 🛠️ Texnik Xususiyatlar

- **Advanced SQL**: CTE, Window Functions, Recursive Queries va murakkab Joinlar yordamida optimallashtirilgan so'rovlar.
- **Modern Frontend**: React, TypeScript va TailwindCSS yordamida yaratilgan tezkor va chiroyli interfeys.
- **Interactive Charts**: Recharts kutubxonasi yordamida dinamik va tushunarli grafiklar.
- **Secure Backend**: FastAPI va JWT autentifikatsiya bilan himoyalangan API.

---

## 🏗️ Texnologiyalar Steki

### Backend (Python)

- **FastAPI**: Yuqori tezlikdagi web framework.
- **MySQL Connector**: Ma'lumotlar bazasi bilan ishlash.
- **Pydantic**: Ma'lumotlar validatsiyasi.
- **JWT**: Xavfsiz autentifikatsiya.

### Frontend (TypeScript)

- **React + Vite**: Zamonaviy va tezkor frontend.
- **TailwindCSS**: Chiroyli va moslashuvchan dizayn.
- **Recharts**: Ma'lumotlarni vizualizatsiya qilish.
- **Lucide React**: Zamonaviy ikonlar to'plami.

### Database

- **MySQL (Northwind)**: Klassik lekin boyitilgan ma'lumotlar strukturasi.

---

## 🚦 Ishga Tushirish Qo'llanmasi

Loyihani mahalliy kompyuteringizda ishga tushirish uchun quyidagi qadamlarni bajaring.

### 1. Talablar

- Python 3.12+
- Node.js 22+
- MySQL Server

### 2. Repozitoriyni ko'chirib olish

```bash
git clone https://github.com/dilmurod2006/Gastro-Savdo-Insights.git
cd Gastro-Savdo-Insights
```

### 3. Backend Sozlash

```bash
# Virtual muhit yaratish
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Kutubxonalarni o'rnatish
pip install -r requirements.txt

# Ma'lumotlar bazasini sozlash (.env fayl yarating)
cp .env.example .env
# .env faylini o'zgartiring va DB ma'lumotlarini kiriting

# Migratsiyalarni ishga tushirish (agar kerak bo'lsa)
python SQLScripts/run_migrations.py
```

### 4. Frontend Sozlash

```bash
cd frontend

# Kutubxonalarni o'rnatish
npm install

# Loyihani ishga tushirish
npm run dev
```

### 5. Tizimga kirish

Brauzerda `http://localhost:5173` manzilini oching.

**Test Foydalanuvchi:**

- Login: `admin`
- Parol: `admin123` (yoki bazangizdagi sozlangan foydalanuvchi)

---

## 📚 Dokumentatsiya

Loyihaning to'liq texnik xujjatlari `/docs` papkasida joylashgan:

- [📄 SQL Queries & Visualizations](docs/SQL_QUERIES.md) - Barcha analitik so'rovlar va ular frontendda qanday aks ettirilgani haqida batafsil ma'lumot.
- [🏗️ Project Architecture](docs/PROJECT_DOCS.md) - Loyiha arxitekturasi va tuzilishi.
- [🗄️ Database Schema & ERD](docs/DATABASE_SCHEMA.md) - Ma'lumotlar bazasi tuzilishi, ERD va to'liq jadvallar tavsifi.
- [📊 Frontend Charts](docs/FRONTEND_CHARTS.md) - Frontend qismida ishlatilgan grafiklar (Charts) va ularning vazifalari.

---

## 🤝 Muallif

**[Amonov Dilmurod]** - Software Engineer

> "Ma'lumotlar - bu yangi neft, lekin uni qayta ishlash kerak."
