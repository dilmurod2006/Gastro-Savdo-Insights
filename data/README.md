# Data Directory

Bu papkada loyiha uchun kerakli ma'lumotlar fayllari saqlanadi.

## Fayl Formatlar

Quyidagi formatdagi fayllarni yuklashingiz mumkin:
- CSV (`.csv`)
- Excel (`.xlsx`, `.xls`)
- SQLite ma'lumotlar bazasi (`.db`, `.sqlite`)

## Ma'lumotlar Xavfsizligi

⚠️ **Muhim:** 
- Maxfiy ma'lumotlarni yuklashdan oldin `.gitignore` faylida to'g'ri sozlanganligini tekshiring
- `.env` faylida muhim ma'lumotlarni saqlang
- Haqiqiy ma'lumotlarni GitHub'ga yuklamaslik tavsiya etiladi

## Misol Ma'lumotlar

Namuna ma'lumotlarni test qilish uchun quyidagi strukturada yaratishingiz mumkin:

### sales.csv
```csv
date,product_name,quantity,price,total
2024-01-01,Mahsulot 1,10,5000,50000
2024-01-02,Mahsulot 2,5,10000,50000
```

### products.csv
```csv
id,name,category,price,stock
1,Mahsulot 1,Kategoriya 1,5000,100
2,Mahsulot 2,Kategoriya 2,10000,50
```
