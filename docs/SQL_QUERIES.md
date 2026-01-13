# Gastro-Savdo-Insights - SQL So'rovlar Hujjati

---

## Mundarija

1. [TOP Daromadli Mahsulotlar](#1-top-daromadli-mahsulotlar)
2. [Xodimlarning Oylik Sotuv Ko'rsatkichlari](#2-xodimlarning-oylik-sotuv-korsatkichlari)
3. [Har Bir Mamlakat Bo'yicha Eng Yaxshi Mijoz](#3-har-bir-mamlakat-boyicha-eng-yaxshi-mijoz)
4. [Kategoriya Bo'yicha Oylik O'sish](#4-kategoriya-boyicha-oylik-osish)
5. [RFM Mijoz Segmentatsiyasi](#5-rfm-mijoz-segmentatsiyasi)
6. [Yetkazib Beruvchi Samaradorligi](#6-yetkazib-beruvchi-samaradorligi)
7. [Birga Sotilgan Mahsulotlar Tahlili](#7-birga-sotilgan-mahsulotlar-tahlili)
8. [Xodimlar Ierarxiyasi va Jamoaviy Sotuvlar](#8-xodimlar-ierarxiyasi-va-jamoaviy-sotuvlar)
9. [Yuk Tashuvchi Samaradorligi](#9-yuk-tashuvchi-samaradorligi)
10. [Mamlakat va Kategoriya Bo'yicha Pivot Jadval](#10-mamlakat-va-kategoriya-boyicha-pivot-jadval)
11. [Yillik O'sish va 3 Oylik Harakatlanuvchi O'rtacha](#11-yillik-osish-va-3-oylik-harakatlanuvchi-ortacha)
12. [To'xtatilgan Mahsulotlar Tahlili](#12-toxtatilgan-mahsulotlar-tahlili)
13. [Mijozlarni Saqlab Qolish Tahlili](#13-mijozlarni-saqlab-qolish-tahlili)
14. [Hudud va Mintaqa Sotuvlari Tahlili](#14-hudud-va-mintaqa-sotuvlari-tahlili)
15. [Chegirma Ta'siri Tahlili](#15-chegirma-tasiri-tahlili)
16. [ABC Mahsulotlar Tahlili](#16-abc-mahsulotlar-tahlili)
17. [Hafta Kunlari Bo'yicha Sotuvlar](#17-hafta-kunlari-boyicha-sotuvlar)
18. [Mijozlar Chegirma Xulq-atvori](#18-mijozlar-chegirma-xulq-atvori)
19. [Yetkazib Beruvchi Xatarlar Tahlili](#19-yetkazib-beruvchi-xatarlar-tahlili)
20. [Biznes KPI Dashboard](#20-biznes-kpi-dashboard)

---

## 1. TOP Daromadli Mahsulotlar

**Maqsad:** Eng ko'p daromad keltiradigan mahsulotlarni aniqlash.

**Qaytaradi:** Mahsulot nomi, kategoriyasi, yetkazib beruvchisi, jami sotilgan miqdor va daromad.

```sql
WITH ProductRevenue AS (
    SELECT
        p.productId,
        p.productName AS product_name,
        c.categoryName AS category_name,
        s.companyName AS supplier_name,
        SUM(od.quantity) AS total_quantity,
        SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS total_revenue,
        COUNT(DISTINCT od.orderId) AS order_count
    FROM Product p
    INNER JOIN Category c ON p.categoryId = c.categoryId
    INNER JOIN Supplier s ON p.supplierId = s.supplierId
    INNER JOIN OrderDetail od ON p.productId = od.productId
    GROUP BY p.productId, p.productName, c.categoryName, s.companyName
)
SELECT
    product_name,
    category_name,
    supplier_name,
    total_quantity,
    ROUND(total_revenue, 2) AS total_revenue,
    order_count,
    RANK() OVER (ORDER BY total_revenue DESC) AS revenue_rank,
    ROUND(total_revenue * 100.0 / SUM(total_revenue) OVER (), 2) AS revenue_percentage
FROM ProductRevenue
ORDER BY total_revenue DESC
LIMIT {limit}
```

**Ishlatiladigan texnikalar:**

- `WITH` (CTE) - umumiy jadval ifodasi
- `RANK() OVER()` - oyna funksiyasi orqali reyting
- `SUM() OVER()` - jami summaga nisbatan foizni hisoblash

---

## 2. Xodimlarning Oylik Sotuv Ko'rsatkichlari

**Maqsad:** Har bir xodimning oylik savdo ko'rsatkichlarini kuzatish.

**Qaytaradi:** Xodim ismi, lavozimi, yil, oy, buyurtmalar soni, oylik daromad va o'rtacha buyurtma qiymati.

```sql
SELECT
    e.employeeId as employee_id,
    CONCAT(e.firstname, ' ', e.lastname) AS employee_name,
    e.title,
    YEAR(so.orderDate) AS order_year,
    MONTH(so.orderDate) AS order_month,
    COUNT(DISTINCT so.orderId) AS total_orders,
    SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS monthly_revenue,
    AVG(od.unitPrice * od.quantity * (1 - od.discount)) AS avg_order_value
FROM Employee e
INNER JOIN SalesOrder so ON e.employeeId = so.employeeId
INNER JOIN OrderDetail od ON so.orderId = od.orderId
GROUP BY e.employeeId, e.firstname, e.lastname, e.title,
         YEAR(so.orderDate), MONTH(so.orderDate)
ORDER BY e.employeeId, order_year, order_month
```

**Ishlatiladigan texnikalar:**

- `CONCAT()` - ism va familiyani birlashtirish
- `YEAR()` va `MONTH()` - sanadan yil va oyni ajratib olish
- Bir nechta `GROUP BY` - ko'p o'lchovli guruhlash

---

## 3. Har Bir Mamlakat Bo'yicha Eng Yaxshi Mijoz

**Maqsad:** Har bir mamlakatdagi eng ko'p pul sarflagan mijozni topish.

**Qaytaradi:** Mamlakat, kompaniya nomi, jami xarid, buyurtmalar soni va mamlakatdagi ulushi.

```sql
WITH CustomerRevenue AS (
    SELECT
        c.custId as cust_id,
        c.companyName as company_name,
        c.country,
        SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS total_spent,
        COUNT(DISTINCT so.orderId) AS order_count
    FROM Customer c
    INNER JOIN SalesOrder so ON c.custId = so.custId
    INNER JOIN OrderDetail od ON so.orderId = od.orderId
    GROUP BY c.custId, c.companyName, c.country
),
RankedCustomers AS (
    SELECT
        *,
        RANK() OVER (PARTITION BY country ORDER BY total_spent DESC) AS country_rank,
        SUM(total_spent) OVER (PARTITION BY country ORDER BY total_spent DESC) AS running_total
    FROM CustomerRevenue
)
SELECT
    country,
    company_name,
    total_spent,
    order_count,
    running_total,
    ROUND(total_spent * 100.0 / SUM(total_spent) OVER (PARTITION BY country), 2) AS percent_of_country
FROM RankedCustomers
WHERE country_rank = 1
ORDER BY total_spent DESC
```

**Ishlatiladigan texnikalar:**

- `RANK() OVER (PARTITION BY...)` - har bir mamlakat ichida reyting
- `Running Total` - kumulyativ summa hisoblash
- Bir nechta CTE - murakkab mantiqni bosqichma-bosqich hal qilish

---

## 4. Kategoriya Bo'yicha Oylik O'sish

**Maqsad:** Har bir kategoriyaning oydan oyga o'sish foizini hisoblash.

**Qaytaradi:** Kategoriya nomi, oy, oylik daromad, oldingi oy daromadi va o'sish foizi.

```sql
WITH MonthlyCategorySales AS (
    SELECT
        c.categoryId,
        c.categoryName as category_name,
        DATE_FORMAT(so.orderDate, '%Y-%m') AS sales_month,
        SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS monthly_revenue
    FROM Category c
    INNER JOIN Product p ON c.categoryId = p.categoryId
    INNER JOIN OrderDetail od ON p.productId = od.productId
    INNER JOIN SalesOrder so ON od.orderId = so.orderId
    GROUP BY c.categoryId, c.categoryName, DATE_FORMAT(so.orderDate, '%Y-%m')
)
SELECT
    category_name,
    sales_month,
    monthly_revenue,
    LAG(monthly_revenue) OVER (PARTITION BY categoryId ORDER BY sales_month) AS prev_month_revenue,
    ROUND(
        (monthly_revenue - LAG(monthly_revenue) OVER (PARTITION BY categoryId ORDER BY sales_month))
        / NULLIF(LAG(monthly_revenue) OVER (PARTITION BY categoryId ORDER BY sales_month), 0) * 100, 2
    ) AS mom_growth_percent
FROM MonthlyCategorySales
ORDER BY category_name, sales_month
```

**Ishlatiladigan texnikalar:**

- `LAG()` - oldingi oy qiymatini olish
- `DATE_FORMAT()` - sanani yil-oy formatiga o'zgartirish
- `NULLIF()` - nolga bo'lishdan himoya

---

## 5. RFM Mijoz Segmentatsiyasi

**Maqsad:** Mijozlarni Recency (So'nggi xarid), Frequency (Xaridlar chastotasi) va Monetary (Sarflangan pul) bo'yicha segmentlarga ajratish.

**Qaytaradi:** Mijoz ma'lumotlari, RFM ballari va segment nomi (Champions, Loyal, At Risk, Lost va boshq.).

```sql
WITH CustomerMetrics AS (
    SELECT
        c.custId as cust_id,
        c.companyName as company_name,
        DATEDIFF('{reference_date}', MAX(so.orderDate)) AS recency,
        COUNT(DISTINCT so.orderId) AS frequency,
        SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS monetary
    FROM Customer c
    INNER JOIN SalesOrder so ON c.custId = so.custId
    INNER JOIN OrderDetail od ON so.orderId = od.orderId
    GROUP BY c.custId, c.companyName
),
RFMScores AS (
    SELECT
        *,
        NTILE(5) OVER (ORDER BY recency DESC) AS r_score,
        NTILE(5) OVER (ORDER BY frequency ASC) AS f_score,
        NTILE(5) OVER (ORDER BY monetary ASC) AS m_score
    FROM CustomerMetrics
)
SELECT
    cust_id,
    company_name,
    recency,
    frequency,
    monetary,
    r_score,
    f_score,
    m_score,
    CONCAT(r_score, f_score, m_score) AS rfm_segment,
    CASE
        WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'Champions'
        WHEN r_score >= 3 AND f_score >= 3 THEN 'Loyal Customers'
        WHEN r_score >= 4 AND f_score <= 2 THEN 'New Customers'
        WHEN r_score <= 2 AND f_score >= 3 THEN 'At Risk'
        WHEN r_score <= 2 AND f_score <= 2 THEN 'Lost'
        ELSE 'Regular'
    END AS customer_segment
FROM RFMScores
ORDER BY monetary DESC
```

**Ishlatiladigan texnikalar:**

- `NTILE(5)` - ma'lumotlarni 5 ta teng qismga (kvintil) ajratish
- `DATEDIFF()` - kunlar farqini hisoblash
- `CASE WHEN` - segmentlarga ajratish mantiqiy shartlar asosida

---

## 6. Yetkazib Beruvchi Samaradorligi

**Maqsad:** Har bir yetkazib beruvchining ishlash samaradorligini tahlil qilish.

**Qaytaradi:** Yetkazib beruvchi ma'lumotlari, buyurtmalar soni, o'rtacha yetkazish vaqti, kechikkan yetkazishlar foizi.

```sql
SELECT
    s.supplierId as supplier_id,
    s.companyName AS supplier_name,
    s.country,
    COUNT(DISTINCT so.orderId) AS total_orders,
    AVG(DATEDIFF(so.shippedDate, so.orderDate)) AS avg_lead_time_days,
    MIN(DATEDIFF(so.shippedDate, so.orderDate)) AS min_lead_time,
    MAX(DATEDIFF(so.shippedDate, so.orderDate)) AS max_lead_time,
    SUM(CASE WHEN so.shippedDate > so.requiredDate THEN 1 ELSE 0 END) AS late_shipments,
    ROUND(
        SUM(CASE WHEN so.shippedDate > so.requiredDate THEN 1 ELSE 0 END) * 100.0
        / COUNT(DISTINCT so.orderId), 2
    ) AS late_shipment_percent,
    SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS total_revenue
FROM Supplier s
INNER JOIN Product p ON s.supplierId = p.supplierId
INNER JOIN OrderDetail od ON p.productId = od.productId
INNER JOIN SalesOrder so ON od.orderId = so.orderId
WHERE so.shippedDate IS NOT NULL
GROUP BY s.supplierId, s.companyName, s.country
HAVING COUNT(DISTINCT so.orderId) >= {min_orders}
ORDER BY avg_lead_time_days ASC
```

**Ishlatiladigan texnikalar:**

- `HAVING` - guruhlangan ma'lumotlarni filtrlash
- Shartli `SUM(CASE WHEN...)` - kechikkan yetkazishlarni hisoblash
- `MIN/MAX/AVG` - statistik ko'rsatkichlar

---

## 7. Birga Sotilgan Mahsulotlar Tahlili (Market Basket)

**Maqsad:** Qaysi mahsulotlar tez-tez birga sotilishini aniqlash (o'zaro sotish taklifi uchun).

**Qaytaradi:** Mahsulot juftlari, birga sotilgan marta soni va ulushi.

```sql
WITH ProductPairs AS (
    SELECT
        od1.productId AS product1,
        od2.productId AS product2,
        COUNT(DISTINCT od1.orderId) AS times_bought_together
    FROM OrderDetail od1
    INNER JOIN OrderDetail od2
        ON od1.orderId = od2.orderId
        AND od1.productId < od2.productId
    GROUP BY od1.productId, od2.productId
    HAVING COUNT(DISTINCT od1.orderId) >= {min_support}
)
SELECT
    p1.productName AS product1_name,
    p2.productName AS product2_name,
    pp.times_bought_together,
    ROUND(pp.times_bought_together * 100.0 /
        (SELECT COUNT(DISTINCT orderId) FROM SalesOrder), 2) AS support_percent
FROM ProductPairs pp
INNER JOIN Product p1 ON pp.product1 = p1.productId
INNER JOIN Product p2 ON pp.product2 = p2.productId
ORDER BY times_bought_together DESC
LIMIT {limit}
```

**Ishlatiladigan texnikalar:**

- Self Join - jadvalini o'ziga qo'shish (mahsulot juftliklarini topish)
- `od1.productId < od2.productId` - takrorlanishlarni oldini olish
- Subquery - jami buyurtmalar sonini olish

---

## 8. Xodimlar Ierarxiyasi va Jamoaviy Sotuvlar

**Maqsad:** Xodimlar tuzilmasini ko'rsatish va har bir darajadagi sotuv ko'rsatkichlarini aniqlash.

**Qaytaradi:** Xodim, lavozim, ierarxiya darajasi, tashkiliy yo'l va daromad.

```sql
WITH RECURSIVE EmployeeHierarchy AS (
    -- Bosh menejer (root)
    SELECT
        employeeId as employee_id,
        CONCAT(firstname, ' ', lastname) AS employee_name,
        title,
        mgrId as mgr_id,
        1 AS level,
        CAST(CONCAT(firstname, ' ', lastname) AS CHAR(500)) AS hierarchy_path
    FROM Employee
    WHERE mgrId IS NULL

    UNION ALL

    -- Quyi xodimlar (recursive)
    SELECT
        e.employeeId,
        CONCAT(e.firstname, ' ', e.lastname),
        e.title,
        e.mgrId,
        eh.level + 1,
        CONCAT(eh.hierarchy_path, ' -> ', e.firstname, ' ', e.lastname)
    FROM Employee e
    INNER JOIN EmployeeHierarchy eh ON e.mgrId = eh.employee_id
)
SELECT
    eh.employee_id,
    eh.employee_name,
    eh.title,
    eh.level,
    eh.hierarchy_path,
    COUNT(DISTINCT so.orderId) AS total_orders,
    COALESCE(SUM(od.unitPrice * od.quantity * (1 - od.discount)), 0) AS total_revenue
FROM EmployeeHierarchy eh
LEFT JOIN SalesOrder so ON eh.employee_id = so.employeeId
LEFT JOIN OrderDetail od ON so.orderId = od.orderId
GROUP BY eh.employee_id, eh.employee_name, eh.title, eh.level, eh.hierarchy_path
ORDER BY eh.level, total_revenue DESC
```

**Ishlatiladigan texnikalar:**

- `WITH RECURSIVE` - rekursiv CTE (daraxt tuzilmasini qayta ishlash)
- `UNION ALL` - asosiy va rekursiv qismlarni birlashtirish
- `COALESCE()` - NULL qiymatlarni 0 bilan almashtirish

---

## 9. Yuk Tashuvchi Samaradorligi

**Maqsad:** Har bir yuk tashuvchining ishlash samaradorligini baholash.

**Qaytaradi:** Tashuvchi nomi, yetkazishlar soni, yuk xarajatlari, vaqtida yetkazish foizi.

```sql
SELECT
    sh.shipperId as shipper_id,
    sh.companyName AS shipper_name,
    COUNT(DISTINCT so.orderId) AS total_shipments,
    SUM(so.freight) AS total_freight_cost,
    AVG(so.freight) AS avg_freight_cost,
    STDDEV(so.freight) AS freight_std_dev,
    MIN(so.freight) AS min_freight,
    MAX(so.freight) AS max_freight,
    AVG(DATEDIFF(so.shippedDate, so.orderDate)) AS avg_shipping_days,
    SUM(CASE WHEN so.shippedDate <= so.requiredDate THEN 1 ELSE 0 END) AS on_time_deliveries,
    ROUND(
        SUM(CASE WHEN so.shippedDate <= so.requiredDate THEN 1 ELSE 0 END) * 100.0
        / COUNT(DISTINCT so.orderId), 2
    ) AS on_time_delivery_rate,
    SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS total_order_value,
    ROUND(SUM(so.freight) * 100.0 / SUM(od.unitPrice * od.quantity * (1 - od.discount)), 2) AS freight_to_value_ratio
FROM Shipper sh
INNER JOIN SalesOrder so ON sh.shipperId = so.shipperid
INNER JOIN OrderDetail od ON so.orderId = od.orderId
WHERE so.shippedDate IS NOT NULL
GROUP BY sh.shipperId, sh.companyName
ORDER BY total_shipments DESC
```

**Ishlatiladigan texnikalar:**

- `STDDEV()` - standart og'ish (narxlar o'zgaruvchanligi)
- `freight_to_value_ratio` - yuk xarajatining buyurtma qiymatiga nisbati
- Vaqtida yetkazish foizini hisoblash

---

## 10. Mamlakat va Kategoriya Bo'yicha Pivot Jadval

**Maqsad:** Har bir mamlakatdagi sotuvlarni kategoriyalar bo'yicha ko'rsatish.

**Qaytaradi:** Mamlakat va har bir kategoriya uchun alohida ustun.

```sql
SELECT
    c.country,
    ROUND(SUM(CASE WHEN cat.categoryName = 'Beverages' THEN od.unitPrice * od.quantity * (1 - od.discount) ELSE 0 END), 2) AS beverages,
    ROUND(SUM(CASE WHEN cat.categoryName = 'Condiments' THEN od.unitPrice * od.quantity * (1 - od.discount) ELSE 0 END), 2) AS condiments,
    ROUND(SUM(CASE WHEN cat.categoryName = 'Confections' THEN od.unitPrice * od.quantity * (1 - od.discount) ELSE 0 END), 2) AS confections,
    ROUND(SUM(CASE WHEN cat.categoryName = 'Dairy Products' THEN od.unitPrice * od.quantity * (1 - od.discount) ELSE 0 END), 2) AS dairy_products,
    ROUND(SUM(CASE WHEN cat.categoryName = 'Grains/Cereals' THEN od.unitPrice * od.quantity * (1 - od.discount) ELSE 0 END), 2) AS grains_cereals,
    ROUND(SUM(CASE WHEN cat.categoryName = 'Meat/Poultry' THEN od.unitPrice * od.quantity * (1 - od.discount) ELSE 0 END), 2) AS meat_poultry,
    ROUND(SUM(CASE WHEN cat.categoryName = 'Produce' THEN od.unitPrice * od.quantity * (1 - od.discount) ELSE 0 END), 2) AS produce,
    ROUND(SUM(CASE WHEN cat.categoryName = 'Seafood' THEN od.unitPrice * od.quantity * (1 - od.discount) ELSE 0 END), 2) AS seafood,
    ROUND(SUM(od.unitPrice * od.quantity * (1 - od.discount)), 2) AS total_revenue
FROM Customer c
INNER JOIN SalesOrder so ON c.custId = so.custId
INNER JOIN OrderDetail od ON so.orderId = od.orderId
INNER JOIN Product p ON od.productId = p.productId
INNER JOIN Category cat ON p.categoryId = cat.categoryId
GROUP BY c.country
ORDER BY total_revenue DESC
```

**Ishlatiladigan texnikalar:**

- `CASE WHEN` bilan Pivot - qatorlarni ustunlarga aylantirish
- Manual pivot - MySQL da `PIVOT` funksiyasi yo'qligi uchun

---

## 11. Yillik O'sish va 3 Oylik Harakatlanuvchi O'rtacha

**Maqsad:** Yillik o'sish tendensiyasini va 3 oylik harakatlanuvchi o'rtachani hisoblash.

**Qaytaradi:** Oy, daromad, o'tgan yil daromadi, YoY o'sish va 3 oylik o'rtacha.

```sql
WITH MonthlyRevenue AS (
    SELECT
        DATE_FORMAT(so.orderDate, '%Y-%m') AS sales_month,
        YEAR(so.orderDate) AS sales_year,
        MONTH(so.orderDate) AS month_num,
        SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS revenue
    FROM SalesOrder so
    INNER JOIN OrderDetail od ON so.orderId = od.orderId
    GROUP BY DATE_FORMAT(so.orderDate, '%Y-%m'), YEAR(so.orderDate), MONTH(so.orderDate)
)
SELECT
    sales_month,
    revenue,
    LAG(revenue, 12) OVER (ORDER BY sales_month) AS prev_year_revenue,
    ROUND(
        (revenue - LAG(revenue, 12) OVER (ORDER BY sales_month))
        / NULLIF(LAG(revenue, 12) OVER (ORDER BY sales_month), 0) * 100, 2
    ) AS yoy_growth_percent,
    ROUND(AVG(revenue) OVER (ORDER BY sales_month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg_3month,
    SUM(revenue) OVER (PARTITION BY sales_year ORDER BY month_num) AS ytd_revenue
FROM MonthlyRevenue
ORDER BY sales_month
```

**Ishlatiladigan texnikalar:**

- `LAG(revenue, 12)` - 12 oy oldingi qiymatni olish (yillik solishtirish)
- `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` - 3 oylik sliding window
- `YTD Revenue` - yil boshidan kumulyativ daromad

---

## 12. To'xtatilgan Mahsulotlar Tahlili

**Maqsad:** Ishlab chiqarish to'xtatilgan mahsulotlarni tahlil qilish.

**Qaytaradi:** Mahsulot holati, mahsulotlar soni, kategoriyalar, daromad va zaxira qiymati.

```sql
SELECT
    CASE
        WHEN p.discontinued = '1' THEN 'Discontinued'
        ELSE 'Active'
    END AS product_status,
    COUNT(DISTINCT p.productId) AS product_count,
    COUNT(DISTINCT p.categoryId) AS unique_categories,
    COALESCE(SUM(od.unitPrice * od.quantity * (1 - od.discount)), 0) AS total_revenue_generated,
    ROUND(AVG(p.unitPrice), 2) AS avg_unit_price,
    SUM(p.unitsInStock) AS total_units_in_stock,
    ROUND(SUM(p.unitsInStock * p.unitPrice), 2) AS inventory_value
FROM Product p
LEFT JOIN OrderDetail od ON p.productId = od.productId
GROUP BY
    CASE
        WHEN p.discontinued = '1' THEN 'Discontinued'
        ELSE 'Active'
    END
ORDER BY product_count DESC
```

**Ishlatiladigan texnikalar:**

- `CASE WHEN` - mahsulot holatini matn shakliga o'zgartirish
- `LEFT JOIN` - buyurtmasi yo'q mahsulotlarni ham qo'shish
- Zaxira qiymatini hisoblash

---

## 13. Mijozlarni Saqlab Qolish Tahlili

**Maqsad:** Mijozlarning qayta xarid xulq-atvorini o'rganish.

**Qaytaradi:** Mijoz ma'lumotlari, buyurtmalar soni, birinchi/oxirgi xarid sanalari, xaridlar orasidagi o'rtacha vaqt.

```sql
WITH CustomerOrders AS (
    SELECT
        c.custId as cust_id,
        c.companyName as company_name,
        c.country,
        so.orderId as order_id,
        so.orderDate as order_date,
        ROW_NUMBER() OVER (PARTITION BY c.custId ORDER BY so.orderDate) AS order_sequence,
        LAG(so.orderDate) OVER (PARTITION BY c.custId ORDER BY so.orderDate) AS prev_order_date
    FROM Customer c
    INNER JOIN SalesOrder so ON c.custId = so.custId
)
SELECT
    cust_id,
    company_name,
    country,
    COUNT(order_id) AS total_orders,
    MIN(order_date) AS first_order_date,
    MAX(order_date) AS last_order_date,
    DATEDIFF(MAX(order_date), MIN(order_date)) AS customer_lifespan_days,
    AVG(DATEDIFF(order_date, prev_order_date)) AS avg_days_between_orders,
    CASE
        WHEN COUNT(order_id) = 1 THEN 'One-Time Buyer'
        WHEN AVG(DATEDIFF(order_date, prev_order_date)) <= 30 THEN 'Frequent Buyer'
        WHEN AVG(DATEDIFF(order_date, prev_order_date)) <= 90 THEN 'Regular Buyer'
        ELSE 'Occasional Buyer'
    END AS buyer_type
FROM CustomerOrders
GROUP BY cust_id, company_name, country
HAVING COUNT(order_id) >= 1
ORDER BY total_orders DESC
```

**Ishlatiladigan texnikalar:**

- `ROW_NUMBER()` - buyurtmalar ketma-ketligini belgilash
- `LAG()` - oldingi buyurtma sanasini olish
- `customer_lifespan_days` - mijozning faol davri

---

## 14. Hudud va Mintaqa Sotuvlari Tahlili

**Maqsad:** Hududlar va mintaqalar bo'yicha sotuv ko'rsatkichlarini tahlil qilish.

**Qaytaradi:** Mintaqa, hudud, xodim ma'lumotlari va sotuv ko'rsatkichlari.

```sql
SELECT
    r.regionId as region_id,
    r.regiondescription AS region_name,
    t.territoryId as territory_id,
    t.territorydescription AS territory_name,
    e.employeeId as employee_id,
    CONCAT(e.firstname, ' ', e.lastname) AS employee_name,
    COUNT(DISTINCT so.orderId) AS total_orders,
    COUNT(DISTINCT so.custId) AS unique_customers,
    SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS total_revenue,
    AVG(od.unitPrice * od.quantity * (1 - od.discount)) AS avg_order_value,
    RANK() OVER (PARTITION BY r.regionId ORDER BY SUM(od.unitPrice * od.quantity * (1 - od.discount)) DESC) AS territory_rank_in_region
FROM Region r
INNER JOIN Territory t ON r.regionId = t.regionId
INNER JOIN EmployeeTerritory et ON t.territoryId = et.territoryId
INNER JOIN Employee e ON et.employeeId = e.employeeId
INNER JOIN SalesOrder so ON e.employeeId = so.employeeId
INNER JOIN OrderDetail od ON so.orderId = od.orderId
GROUP BY r.regionId, r.regiondescription, t.territoryId, t.territorydescription, e.employeeId, e.firstname, e.lastname
ORDER BY r.regionId, total_revenue DESC
```

**Ishlatiladigan texnikalar:**

- Ko'p jadvalli JOIN - 6 ta jadval bog'lanishi
- `RANK() OVER (PARTITION BY region)` - mintaqa ichida reyting
- Geografik ierarxiya tahlili

---

## 15. Chegirma Ta'siri Tahlili

**Maqsad:** Chegirmalarning buyurtmalar rentabelligiga ta'sirini baholash.

**Qaytaradi:** Buyurtma ma'lumotlari, yalpi summa, chegirma, sof summa va chegirma ta'siri.

```sql
WITH OrderDiscountAnalysis AS (
    SELECT
        so.orderId as order_id,
        so.orderDate as order_date,
        c.companyName AS customer_name,
        e.firstname AS employee_name,
        SUM(od.unitPrice * od.quantity) AS gross_amount,
        SUM(od.unitPrice * od.quantity * od.discount) AS total_discount,
        SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS net_amount,
        AVG(od.discount) * 100 AS avg_discount_percent,
        MAX(od.discount) * 100 AS max_discount_percent,
        COUNT(od.orderDetailId) AS line_items
    FROM SalesOrder so
    INNER JOIN OrderDetail od ON so.orderId = od.orderId
    INNER JOIN Customer c ON so.custId = c.custId
    INNER JOIN Employee e ON so.employeeId = e.employeeId
    GROUP BY so.orderId, so.orderDate, c.companyName, e.firstname
)
SELECT
    order_id,
    order_date,
    customer_name,
    employee_name,
    gross_amount,
    total_discount,
    net_amount,
    ROUND(avg_discount_percent, 2) AS avg_discount_percent,
    ROUND(max_discount_percent, 2) AS max_discount_percent,
    line_items,
    ROUND(total_discount * 100.0 / NULLIF(gross_amount, 0), 2) AS discount_impact_percent,
    CASE
        WHEN avg_discount_percent >= 15 THEN 'High Discount'
        WHEN avg_discount_percent >= 5 THEN 'Medium Discount'
        ELSE 'Low/No Discount'
    END AS discount_category
FROM OrderDiscountAnalysis
WHERE total_discount > 0
ORDER BY total_discount DESC
LIMIT {limit}
```

**Ishlatiladigan texnikalar:**

- Yalpi va sof summalarni hisoblash
- Chegirma kategoriyalashtirish
- `discount_impact_percent` - chegirmaning umumiy ta'siri

---

## 16. ABC Mahsulotlar Tahlili

**Maqsad:** Mahsulotlarni daromad bo'yicha A, B, C toifalariga ajratish (Pareto prinsipi).

**Qaytaradi:** Mahsulot ma'lumotlari, daromad, kumulyativ foiz va ABC toifasi.

```sql
WITH ProductSales AS (
    SELECT
        p.productId,
        p.productName as product_name,
        c.categoryName as category_name,
        s.companyName as supplier_name,
        SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS total_revenue,
        SUM(od.quantity) AS total_quantity
    FROM Product p
    INNER JOIN Category c ON p.categoryId = c.categoryId
    INNER JOIN Supplier s ON p.supplierId = s.supplierId
    INNER JOIN OrderDetail od ON p.productId = od.productId
    GROUP BY p.productId, p.productName, c.categoryName, s.companyName
),
RankedProducts AS (
    SELECT
        *,
        SUM(total_revenue) OVER (ORDER BY total_revenue DESC) AS cumulative_revenue,
        SUM(total_revenue) OVER () AS grand_total
    FROM ProductSales
)
SELECT
    product_name,
    category_name,
    supplier_name,
    ROUND(total_revenue, 2) AS total_revenue,
    total_quantity,
    ROUND(cumulative_revenue * 100.0 / grand_total, 2) AS cumulative_percentage,
    CASE
        WHEN cumulative_revenue * 100.0 / grand_total <= 70 THEN 'A (Top 70%)'
        WHEN cumulative_revenue * 100.0 / grand_total <= 90 THEN 'B (Next 20%)'
        ELSE 'C (Bottom 10%)'
    END AS abc_category
FROM RankedProducts
ORDER BY total_revenue DESC
```

**Ishlatiladigan texnikalar:**

- `SUM() OVER (ORDER BY...)` - kumulyativ summa
- ABC tahlili - Pareto 80/20 prinsipi asosida
- Mahsulotlarni muhimlik darajasi bo'yicha ajratish

---

## 17. Hafta Kunlari Bo'yicha Sotuvlar

**Maqsad:** Qaysi kunlarda ko'proq sotuv bo'lishini aniqlash.

**Qaytaradi:** Hafta kuni, buyurtmalar soni, noyob mijozlar, daromad va reyting.

```sql
SELECT
    DAYOFWEEK(so.orderDate) AS day_of_week,
    DAYNAME(so.orderDate) AS day_name,
    COUNT(DISTINCT so.orderId) AS total_orders,
    COUNT(DISTINCT so.custId) AS unique_customers,
    SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS total_revenue,
    AVG(od.unitPrice * od.quantity * (1 - od.discount)) AS avg_order_value,
    ROUND(
        COUNT(DISTINCT so.orderId) * 100.0 / (SELECT COUNT(DISTINCT orderId) FROM SalesOrder), 2
    ) AS order_percentage,
    RANK() OVER (ORDER BY SUM(od.unitPrice * od.quantity * (1 - od.discount)) DESC) AS revenue_rank
FROM SalesOrder so
INNER JOIN OrderDetail od ON so.orderId = od.orderId
GROUP BY DAYOFWEEK(so.orderDate), DAYNAME(so.orderDate)
ORDER BY day_of_week
```

**Ishlatiladigan texnikalar:**

- `DAYOFWEEK()` va `DAYNAME()` - hafta kuni funksiyalari
- Foizli ulushni hisoblash
- Marketing kampaniyalari uchun optimal kunlarni aniqlash

---

## 18. Mijozlar Chegirma Xulq-atvori

**Maqsad:** Mijozlarning chegirmalardan foydalanish xususiyatlarini tahlil qilish.

**Qaytaradi:** Mijoz ma'lumotlari, chegirma ko'rsatkichlari va xulq-atvor toifasi.

```sql
WITH CustomerDiscountBehavior AS (
    SELECT
        c.custId as cust_id,
        c.companyName as company_name,
        c.country,
        COUNT(DISTINCT so.orderId) AS total_orders,
        SUM(od.unitPrice * od.quantity) AS gross_purchases,
        SUM(od.unitPrice * od.quantity * od.discount) AS total_discount_received,
        AVG(od.discount) AS avg_discount_rate,
        SUM(CASE WHEN od.discount > 0 THEN 1 ELSE 0 END) AS discounted_line_items,
        COUNT(od.orderDetailId) AS total_line_items
    FROM Customer c
    INNER JOIN SalesOrder so ON c.custId = so.custId
    INNER JOIN OrderDetail od ON so.orderId = od.orderId
    GROUP BY c.custId, c.companyName, c.country
)
SELECT
    cust_id,
    company_name,
    country,
    total_orders,
    ROUND(gross_purchases, 2) AS gross_purchases,
    ROUND(total_discount_received, 2) AS total_discount_received,
    ROUND(avg_discount_rate * 100, 2) AS avg_discount_percent,
    discounted_line_items,
    total_line_items,
    ROUND(discounted_line_items * 100.0 / NULLIF(total_line_items, 0), 2) AS discounted_items_percent,
    ROUND(total_discount_received * 100.0 / NULLIF(gross_purchases, 0), 2) AS overall_discount_impact,
    CASE
        WHEN avg_discount_rate >= 0.15 THEN 'Discount Hunter'
        WHEN avg_discount_rate >= 0.05 THEN 'Discount Aware'
        ELSE 'Full Price Buyer'
    END AS discount_behavior
FROM CustomerDiscountBehavior
ORDER BY total_discount_received DESC
LIMIT {limit}
```

**Ishlatiladigan texnikalar:**

- Mijoz xulq-atvori segmentatsiyasi
- Chegirma strategiyasi uchun ma'lumot tayyorlash
- `Discount Hunter` va `Full Price Buyer` toifalarini aniqlash

---

## 19. Yetkazib Beruvchi Xatarlar Tahlili

**Maqsad:** Yetkazib beruvchilarga bog'liqlik xatarlarini baholash.

**Qaytaradi:** Kategoriya, yetkazib beruvchi, daromad ulushi va xatar darajasi.

```sql
WITH SupplierDependency AS (
    SELECT
        cat.categoryId,
        cat.categoryName as category_name,
        s.supplierId,
        s.companyName AS supplier_name,
        s.country AS supplier_country,
        COUNT(DISTINCT p.productId) AS product_count,
        SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS supplier_revenue
    FROM Category cat
    INNER JOIN Product p ON cat.categoryId = p.categoryId
    INNER JOIN Supplier s ON p.supplierId = s.supplierId
    INNER JOIN OrderDetail od ON p.productId = od.productId
    GROUP BY cat.categoryId, cat.categoryName, s.supplierId, s.companyName, s.country
),
CategoryTotals AS (
    SELECT
        categoryId,
        SUM(supplier_revenue) AS category_total_revenue,
        COUNT(DISTINCT supplierId) AS supplier_count
    FROM SupplierDependency
    GROUP BY categoryId
)
SELECT
    sd.category_name,
    sd.supplier_name,
    sd.supplier_country,
    sd.product_count,
    ROUND(sd.supplier_revenue, 2) AS supplier_revenue,
    ROUND(ct.category_total_revenue, 2) AS category_total_revenue,
    ROUND(sd.supplier_revenue * 100.0 / ct.category_total_revenue, 2) AS revenue_share_percent,
    ct.supplier_count AS total_suppliers_in_category,
    CASE
        WHEN sd.supplier_revenue * 100.0 / ct.category_total_revenue > 50 THEN 'HIGH RISK - Single Supplier Dependency'
        WHEN sd.supplier_revenue * 100.0 / ct.category_total_revenue > 25 THEN 'MEDIUM RISK - Significant Dependency'
        ELSE 'LOW RISK - Diversified'
    END AS risk_assessment
FROM SupplierDependency sd
INNER JOIN CategoryTotals ct ON sd.categoryId = ct.categoryId
ORDER BY sd.category_name, revenue_share_percent DESC
```

**Ishlatiladigan texnikalar:**

- Ta'minot zanjiri xatar tahlili
- Yetkazib beruvchilarga bog'liqlikni aniqlash
- Diversifikatsiya darajasini baholash

---

## 20. Biznes KPI Dashboard

**Maqsad:** Biznesning asosiy ko'rsatkichlarini bitta so'rovda olish.

**Qaytaradi:** Sotuv, mahsulot, xodim va yetkazish metrikalarining umumiy ko'rinishi.

```sql
WITH
SalesMetrics AS (
    SELECT
        COUNT(DISTINCT so.orderId) AS total_orders,
        COUNT(DISTINCT so.custId) AS unique_customers,
        SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS total_revenue,
        SUM(so.freight) AS total_freight,
        AVG(od.unitPrice * od.quantity * (1 - od.discount)) AS avg_order_value
    FROM SalesOrder so
    INNER JOIN OrderDetail od ON so.orderId = od.orderId
),
ProductMetrics AS (
    SELECT
        COUNT(DISTINCT productId) AS total_products,
        SUM(CASE WHEN discontinued = '1' THEN 1 ELSE 0 END) AS discontinued_products,
        COUNT(DISTINCT categoryId) AS total_categories,
        COUNT(DISTINCT supplierId) AS total_suppliers
    FROM Product
),
EmployeePerformance AS (
    SELECT
        AVG(order_count) AS avg_orders_per_employee,
        MAX(order_count) AS max_orders_per_employee,
        MIN(order_count) AS min_orders_per_employee
    FROM (
        SELECT employeeId, COUNT(orderId) AS order_count
        FROM SalesOrder
        GROUP BY employeeId
    ) emp
),
ShippingMetrics AS (
    SELECT
        AVG(DATEDIFF(shippedDate, orderDate)) AS avg_shipping_days,
        SUM(CASE WHEN shippedDate <= requiredDate THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS on_time_rate
    FROM SalesOrder
    WHERE shippedDate IS NOT NULL
),
MonthlyTrend AS (
    SELECT
        DATE_FORMAT(so.orderDate, '%Y-%m') AS month,
        SUM(od.unitPrice * od.quantity * (1 - od.discount)) AS revenue
    FROM SalesOrder so
    INNER JOIN OrderDetail od ON so.orderId = od.orderId
    GROUP BY DATE_FORMAT(so.orderDate, '%Y-%m')
    ORDER BY month DESC
    LIMIT 1
)
SELECT
    '=== SOTUV KO'RSATKICHLARI ===' AS section,
    sm.total_orders AS jami_buyurtmalar,
    sm.unique_customers AS faol_mijozlar,
    ROUND(sm.total_revenue, 2) AS jami_daromad,
    ROUND(sm.total_freight, 2) AS jami_yuk_xarajati,
    ROUND(sm.avg_order_value, 2) AS ortacha_buyurtma_qiymati,

    '=== MAHSULOT KO'RSATKICHLARI ===' AS section2,
    pm.total_products AS jami_mahsulotlar,
    pm.discontinued_products AS toxtatilgan_mahsulotlar,
    pm.total_categories AS kategoriyalar_soni,
    pm.total_suppliers AS yetkazib_beruvchilar_soni,

    '=== XODIM SAMARADORLIGI ===' AS section3,
    ROUND(ep.avg_orders_per_employee, 0) AS ortacha_buyurtma_per_xodim,
    ep.max_orders_per_employee AS eng_kop_buyurtma_xodim,
    ep.min_orders_per_employee AS eng_kam_buyurtma_xodim,

    '=== YETKAZIB BERISH ===' AS section4,
    ROUND(shm.avg_shipping_days, 1) AS ortacha_yetkazish_kunlari,
    ROUND(shm.on_time_rate, 2) AS vaqtida_yetkazish_foizi,

    '=== OXIRGI OY ===' AS section5,
    mt.month AS oxirgi_oy,
    ROUND(mt.revenue, 2) AS oxirgi_oy_daromadi

FROM SalesMetrics sm, ProductMetrics pm, EmployeePerformance ep, ShippingMetrics shm, MonthlyTrend mt
```

**Ishlatiladigan texnikalar:**

- Ko'p CTE - turli metrikalarni parallel hisoblash
- CROSS JOIN - barcha metrikalarni birlashtirish
- Dashboard uchun yagona so'rov

---

## 🔧 Ishlatiladigan SQL Texnikalar Xulosa

| Texnika            | Tavsif                   | Foydalaniladigan so'rovlar |
| ------------------ | ------------------------ | -------------------------- |
| `WITH (CTE)`       | Umumiy jadval ifodalari  | Barcha murakkab so'rovlar  |
| `RECURSIVE CTE`    | Rekursiv so'rovlar       | #8 - Ierarxiya             |
| `Window Functions` | Oyna funksiyalari        | #1, #3, #5, #11, #16       |
| `LAG/LEAD`         | Oldingi/keyingi qatorlar | #4, #11, #13               |
| `RANK/NTILE`       | Reyting va kvantillar    | #1, #3, #5, #14, #17       |
| `CASE WHEN`        | Shartli mantiq           | Barcha so'rovlar           |
| `Running Totals`   | Kumulyativ hisoblashlar  | #3, #11, #16               |
| `Self Join`        | O'z-o'ziga qo'shish      | #7                         |
| `Pivot Table`      | Qatorlarni ustunlarga    | #10                        |

---

## Foydalanish

Ushbu so'rovlar `analytics_repository.py` faylida joylashgan va FastAPI endpoint'lari orqali ishlatiladi:

```
GET /api/v1/analytics/products/top-revenue
GET /api/v1/analytics/employees/monthly-sales
GET /api/v1/analytics/customers/top-by-country
...
```

---
