# 📊 Vizualizatsiya va Grafiklar (Frontend Charts)

Ushbu hujjat frontend qismida ishlatiladigan barcha grafik komponentlar va ularning qaysi holatlarda ishlatilishi haqida ma'lumot beradi. Barcha grafiklar **[Recharts](https://recharts.org/)** kutubxonasi asosida yaratilgan va loyiha dizayn tizimiga (Dark/Light mode) moslashtirilgan.

## 📁 Joylashuv

Barcha grafik komponentlar quyidagi manzilda joylashgan:
`frontend/src/components/charts/`

---

## 1. Bar Chart (Ustunli Diagramma)

**Fayl:** `BarChart.tsx`

Eng ko'p ishlatiladigan grafik turi. Kategoriyalar bo'yicha miqdorlarni solishtirish uchun ishlatiladi.

### Xususiyatlari:

- **Responsive:** Har qanday ekran o'lchamiga moslashadi.
- **Horizontal & Vertical:** Ustunlar tik yoki yotiq bo'lishi mumkin (`horizontal` prop).
- **Stacked:** Ustunlarni ustma-ust yig'ish imkoniyati (`stacked` prop).
- **Auto-Formatting:** Sonlarni qisqartirilgan formatda (1.2K, $5M) ko'rsatadi.

### Qachon ishlatiladi?

- **Top Revenue Products:** Mahsulotlarni daromad bo'yicha reytingini ko'rsatishda.
- **Category Performance:** Kategoriyalar kesimida sotuvlarni solishtirishda.
- **Year-over-Year Growth:** Yillik o'sish sur'atlarini ko'rsatishda.

---

## 2. Line Chart (Chiziqli Grafik)

**Fayl:** `LineChart.tsx` (yoki `AreaChart.tsx`)

Vaqt o'tishi bilan o'zgaruvchi trendlarni (dinamika) ko'rsatish uchun ideal.

### Xususiyatlari:

- **Smooth Curves:** Egri chiziqlar (`monotone` interpolatsiya) yordamida oson o'qiluvchi grafika.
- **Multiple Lines:** Bir vaqtning o'zida bir nechta parametrlarni (masalan, Daromad va Buyurtmalar soni) solishtirish.
- **Interactive Tooltip:** Sichqoncha borganda aniq qiymatlarni ko'rsatadi.

### Qachon ishlatiladi?

- **Sales Trends:** Oylik yoki yillik daromad dinamikasini kuzatishda.
- **Customer Retention:** Mijozlarning qaytish darajasini vaqt kesimida ko'rishda.
- **Inventory Levels:** Ombordagi zaxira o'zgarishini tahlil qilishda.

---

## 3. Pie Chart (Doiraviy Diagramma)

**Fayl:** `PieChart.tsx`

Umumiy hajmdagi ulushlarni (foiz) ko'rsatish uchun ishlatiladi.

### Xususiyatlari:

- **Donut Style:** O'rtasi ochiq "Donut" ko'rinishi (`donut` prop).
- **Active Shape:** Tanlangan segmentni kattalashtirib ko'rsatish.
- **Labels:** Foizlar va nomlarni diagrammaning o'zida ko'rsatish.

### Qachon ishlatiladi?

- **Revenue by Region:** Daromadning qaysi mintaqalardan kelayotganini ko'rsatishda.
- **RFM Segments:** Mijozlar bazasining segmentlar (VIP, Yangi, Yo'qolgan) bo'yicha taqsimoti.
- **Order Status:** Buyurtmalar holati (Yetkazilgan, Bekor qilingan).

---

## 4. Radar Chart (O'rgimchak To'ri)

**Fayl:** `RadarChart.tsx`

Bir nechta o'zgaruvchilarni (dimension) bitta obyekt uchun solishtirishda ishlatiladi.

### Xususiyatlari:

- **Polar Grid:** Markazdan tarqalgan to'r chiziqlari.
- **Comparison:** Bir nechta obyektni ustma-ust qo'yib solishtirish (Layering).

### Qachon ishlatiladi?

- **Hafta Kunlari Tahlili:** Qaysi kunlarda savdo va buyurtmalar ko'pligini siklik ko'rsatishda (Dushanba-Yakshanba).
- **Employee Skills:** Xodimlarning turli yo'nalishlardagi (Sotuv, Muzokara, Texnik bilim) ko'rsatkichlarini baholashda.

---

## 5. Composed Chart (Aralash Grafik)

**Fayl:** `ComposedChart.tsx`

Har xil turdagi grafiklarni (Bar, Line, Area) bitta koordinata tizimida birlashtirish.

### Qachon ishlatiladi?

- **Pareto Tahlili:** Ustunlarda (Bar) daromadni, chiziqda (Line) esa kummulyativ foizni ko'rsatishda.
- **Budget vs Actual:** Rejadagi (Line) va haqiqiy (Bar) ko'rsatkichlarni solishtirishda.

---

## 6. Treemap (Daraxtsimon Xarita)

**Fayl:** `Treemap.tsx`

Ierarxik ma'lumotlarni to'rtburchaklar shaklida ko'rsatish. Kattalik maydon yuzasiga qarab belgilanadi.

### Qachon ishlatiladi?

- **Category & Products:** Kategoriyalar va ularning ichidagi mahsulotlar ulushini bitta ekran da ko'rishda.
- **Market Share:** Bozordagi kompaniyalar yoki brendlar ulushini vizualizatsiya qilishda.

---

## Nima uchun aynan shu kutubxona va uslub?

1.  **Recharts**: React ekotizimidagi eng mashhur va barqaror kutubxona. U to'g'ridan-to'g'ri SVG elementlaridan foydalanadi, bu esa yuqori sifat va moslashuvchanlikni ta'minlaydi.
2.  **Abstraction (Abstraksiya)**: Biz `Recharts` komponentlarini to'g'ridan-to'g'ri sahifalarda ishlatmadik. Buning o'rniga ularni `components/charts` papkasida o'zimizning wrapper komponentlarimizga o'radik.
    - **Faoyda:** Agar dizayn o'zgarsa (masalan, ranglar yoki shriftlar), biz faqat shu bitta faylni o'zgartiramiz va butun loyihada grafiklar o'zgaradi.
    - **Theme Integration:** Dark/Light rejim o'zgarganda grafiklar avtomatik rangini o'zgartiradi (`useTheme` hook orqali).
3.  **Performance**: Katta hajmdagi ma'lumotlar bilan ishlashda SVG grafikalari Canvas-ga qaraganda osonroq tahrirlanadi va CSS orqali animatsiya qilish mumkin.

## Xulosa

Bu grafiklar tizimi loyihaning "Dashboard" va "Analytics" bo'limlarining yuragi hisoblanadi. Ular murakkab SQL so'rovlar natijasini oddiy va tushunarli vizual ko'rinishga olib keladi.
