# 🏗️ Loyiha Arxitekturasi va Tuzilishi

## Umumiy Ko'rinish

**Gastro-Savdo Insights** loyihasi "Clean Architecture" va "Separation of Concerns" (Mas'uliyatni ajratish) tamoyillariga asoslangan. Backend va Frontend alohida repozitoriy yoki papkalarda (monorepo structure) bo'lib, RESTful API orqali muloqot qiladi.

## 📂 Papkalar Tuzilishi

### Backend (`/src`)

Backend qismi modulli tuzilishga ega bo'lib, har bir qatlam faqat o'z vazifasini bajaradi:

- **`routers/`**: HTTP so'rovlarini qabul qiladi va kerakli servisga yo'naltiradi (Controller Layer).
  - `analytics.py`: Barcha analitik API endpointlar.
  - `auth.py`: Autentifikatsiya va avtorizatsiya.
- **`services/`**: Biznes mantiq qatlami (Business Logic Layer).
  - `analytics_service.py`: Ma'lumotlarni qayta ishlash va formatlash.
  - `auth_service.py`: Foydalanuvchi tekshiruvi va token generatsiyasi.

- **`repositories/`**: Ma'lumotlar bazasi bilan to'g'ridan-to'g'ri ishlash qatlami (Data Access Layer). Bu yerda barcha **RAW SQL** so'rovlar yozilgan.
  - `analytics_repository.py`: Murakkab SQL so'rovlar jamlanmasi.

- **`models/`**: Ma'lumotlar modellari va Pydantic sxemalar.
- **`config/`**: Konfiguratsiya va bazaga ulanish sozlamalari.

### Frontend (`/frontend`)

Frontend qismi komponentlarga asoslangan (Component-Based) arxitekturada qurilgan:

- **`src/pages/`**: Har bir sahifa alohida papkada (masalan, `dashboard`, `sales`).
- **`src/components/`**: Qayta ishlatiluvchi UI elementlari.
  - `charts/`: Recharts ustiga qurilgan abstrakt grafik komponentlar.
  - `ui/`: Tugmalar, kartalar kabi mayda elementlar.
- **`src/hooks/`**: API bilan ishlash uchun React Hook'lar (Data Fetching).
- **`src/services/`**: Axios orqali backendga so'rov yuboruvchi funksiyalar.

## 🔄 Ma'lumotlar Oqimi (Data Flow)

1. **Frontend**: Foydalanuvchi "Yillik O'sish" sahifasini ochadi. `useYoYGrowth` hook ishga tushadi.
2. **API Call**: `GET /api/v1/analytics/sales/yoy-growth` so'rovi yuboriladi.
3. **Router**: FastAPI so'rovni qabul qiladi va `SalesAnalyticsService`ga uzatadi.
4. **Service**: Servis `SalesAnalyticsRepository`dan ma'lumot so'raydi.
5. **Repository**: SQL so'rovni (CTE va Window Function bilan) MySQL bazada ishlatadi.
6. **Database**: Natijani qaytaradi (Raw Data).
7. **Service**: Ma'lumotni Pydantic modeliga o'girib, Frontendga qaytaradi.
8. **Frontend**: `LineChart` komponenti ma'lumotni chizib beradi.

## 🔐 Xavfsizlik

- **JWT (JSON Web Token)**: Har bir so'rovda `Authorization` headeri orqali tekshiriladi.
- **Role Based Access**: Faqat ruxsat etilgan foydalanuvchilar (masalan, Admin) ma'lumotlarni ko'ra oladi.
- **SQL Injection Prevention**: Barcha SQL so'rovlar parametrlar orqali himoyalangan (`execute_query(query, params)`).

## 🛠️ Kengaytirish (Scalability)

Yangi tahlil qo'shish uchun:

1. `AnalyticsRepository`da yangi SQL metod yozish.
2. `AnalyticsService`da biznes mantiqni qo'shish.
3. `Router`da yangi endpoint ochish.
4. Frontendda yangi sahifa va `Chart` ulash kifoya.
