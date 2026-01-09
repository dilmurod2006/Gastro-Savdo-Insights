# 📊 Gastro-Savdo-Insights

Ma'lumotlarga asoslangan strategik tahlil platformasi. Ushbu loyiha **Pearson BTEC Higher Nationals in Digital Technologies (Unit 5: Katta Ma'lumotlar va Vizualizatsiya)** fani doirasida "Gastro-Savdo" kompaniyasi uchun ishlab chiqilgan.

## 🎯 Loyiha Maqsadi

Gastro-Savdo kompaniyasi uchun ma'lumotlarni tahlil qilish, vizualizatsiya qilish va strategik qarorlar qabul qilishga yordam beruvchi professional platforma yaratish.

## 🏗️ Loyiha Strukturasi

```
Gastro-Savdo-Insights/
│
├── app.py                  # Asosiy Streamlit ilovasi
├── db_config.py           # Ma'lumotlar bazasi konfiguratsiyasi
├── requirements.txt       # Python kutubxonalari ro'yxati
├── README.md             # Loyiha hujjati
├── .gitignore            # Git istisno fayllari
│
├── data/                 # Ma'lumotlar fayllari
│   └── README.md
│
├── notebooks/            # Jupyter Notebook'lar
│   └── README.md
│
└── utils/                # Yordamchi modullar
    ├── __init__.py
    ├── data_loader.py    # Ma'lumotlarni yuklash
    └── visualizations.py # Vizualizatsiya funksiyalari
```

## 🚀 O'rnatish va Ishga Tushirish

### 1. Repository'ni Klonlash

```bash
git clone https://github.com/dilmurod2006/Gastro-Savdo-Insights.git
cd Gastro-Savdo-Insights
```

### 2. Virtual Muhit Yaratish

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Kutubxonalarni O'rnatish

```bash
pip install -r requirements.txt
```

### 4. Ilovani Ishga Tushirish

```bash
streamlit run app.py
```

Brauzerda avtomatik ochiladi yoki qo'lda `http://localhost:8501` ga o'ting.

## 📦 Texnologiyalar

- **Python 3.8+** - Asosiy dasturlash tili
- **Streamlit** - Web interfeys yaratish
- **Pandas** - Ma'lumotlarni qayta ishlash
- **Plotly** - Interaktiv vizualizatsiya
- **SQLite/PostgreSQL** - Ma'lumotlar bazasi
- **Jupyter Notebook** - Ma'lumotlarni tahlil qilish

## 📚 BTEC Unit 5 Talablari

Ushbu loyiha quyidagi BTEC Unit 5 talablariga javob beradi:

- ✅ Katta ma'lumotlar bilan ishlash
- ✅ Ma'lumotlar vizualizatsiyasi
- ✅ Ma'lumotlar tahlili va interpretatsiyasi
- ✅ Professional kod strukturasi
- ✅ Ma'lumotlar xavfsizligi va maxfiyligi
- ✅ Hisobotlar va eksport funksiyalari

## 🔒 Ma'lumotlar Xavfsizligi

- Maxfiy ma'lumotlarni `.env` faylida saqlang
- `.gitignore` fayli orqali muhim fayllar GitHub'ga yuklanmaydi
- Ma'lumotlar bazasi parollari va API kalitlari xavfsiz saqlanadi

## 📖 Foydalanish

1. **Asosiy Panel** - Umumiy ko'rsatkichlar va metrikalar
2. **Ma'lumotlar Tahlili** - Batafsil tahlil va statistika
3. **Vizualizatsiya** - Grafik va diagrammalar
4. **Hisobotlar** - Natijalarni eksport qilish

## 🤝 Hissa Qo'shish

Loyihaga hissa qo'shmoqchi bo'lsangiz:

1. Repository'ni fork qiling
2. O'z branch'ingizni yarating (`git checkout -b feature/AmazingFeature`)
3. O'zgarishlarni commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Branch'ga push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## 📧 Aloqa

**Loyiha Muallifi:** Dilmurod  
**GitHub:** [@dilmurod2006](https://github.com/dilmurod2006)

## 📄 Litsenziya

Ushbu loyiha ta'lim maqsadlarida yaratilgan (BTEC Unit 5).

---

**⭐ Agar loyiha yoqsa, GitHub'da yulduzcha qoldiring!**
