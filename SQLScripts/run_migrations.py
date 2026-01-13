#!/usr/bin/env python3
"""
SQLScripts/run_migrations.py

Barcha SQL migratsiyalarni ketma-ket ishga tushiruvchi skript.
Bu skript database yaratadi va barcha jadvallarni to'ldiradi.

Foydalanish:
    python run_migrations.py
    
Muhit o'zgaruvchilari (.env faylidan):
    - DB_HOST: MySQL server host
    - DB_PORT: MySQL server port
    - DB_USER: MySQL foydalanuvchi
    - DB_PASSWORD: MySQL parol
    - DB_NAME: Database nomi
"""

import os
import sys
from pathlib import Path

# Root papkani Python path ga qo'shish
ROOT_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT_DIR))

import mysql.connector
from mysql.connector import Error as MySQLError
from dotenv import load_dotenv

# .env faylini yuklash
load_dotenv(ROOT_DIR / ".env")


class MigrationRunner:
    """
    SQL migratsiyalarni ishga tushiruvchi klass.
    Barcha SQL fayllarni ketma-ket bajaradi.
    """

    def __init__(self):
        """MigrationRunner ni ishga tushirish."""
        self.host = os.getenv("DB_HOST", "localhost")
        self.port = int(os.getenv("DB_PORT", 3306))
        self.user = os.getenv("DB_USER", "root")
        self.password = os.getenv("DB_PASSWORD", "")
        self.database = os.getenv("DB_NAME", "northwind")
        self.scripts_dir = Path(__file__).parent
        
        self._connection = None

    def _print_header(self, text: str) -> None:
        """Sarlavha chiqarish."""
        print("\n" + "=" * 60)
        print(f"  {text}")
        print("=" * 60)

    def _print_success(self, text: str) -> None:
        """Muvaffaqiyat xabarini chiqarish."""
        print(f"✅ {text}")

    def _print_error(self, text: str) -> None:
        """Xatolik xabarini chiqarish."""
        print(f"❌ {text}")

    def _print_info(self, text: str) -> None:
        """Ma'lumot xabarini chiqarish."""
        print(f"ℹ️  {text}")

    def _print_warning(self, text: str) -> None:
        """Ogohlantirish xabarini chiqarish."""
        print(f"⚠️  {text}")

    def connect(self, with_database: bool = False) -> bool:
        """
        MySQL serverga ulanish.
        
        Args:
            with_database: Database tanlashmi
            
        Returns:
            bool: Ulanish muvaffaqiyatli bo'lsa True
        """
        try:
            config = {
                "host": self.host,
                "port": self.port,
                "user": self.user,
                "password": self.password,
                "charset": "utf8mb4",
                "autocommit": True,
                "allow_local_infile": True,
            }
            
            if with_database:
                config["database"] = self.database
            
            self._connection = mysql.connector.connect(**config)
            return True
            
        except MySQLError as e:
            self._print_error(f"MySQL ulanish xatosi: {e}")
            return False

    def disconnect(self) -> None:
        """MySQL ulanishini yopish."""
        if self._connection and self._connection.is_connected():
            self._connection.close()
            self._connection = None

    def execute_sql_file(self, filepath: Path) -> bool:
        """
        SQL faylni bajarish.
        
        Args:
            filepath: SQL fayl yo'li
            
        Returns:
            bool: Bajarish muvaffaqiyatli bo'lsa True
        """
        self._print_info(f"Fayl bajarilmoqda: {filepath.name}")
        
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                sql_content = f.read()
            
            cursor = self._connection.cursor()
            
            # SQL ni alohida statement'larga ajratish
            statements = self._split_sql_statements(sql_content)
            
            executed = 0
            for statement in statements:
                statement = statement.strip()
                if statement and not statement.startswith("--"):
                    try:
                        cursor.execute(statement)
                        executed += 1
                        # SELECT natijalarini o'qib tashlash
                        if cursor.with_rows:
                            cursor.fetchall()
                    except MySQLError as e:
                        # Ba'zi xatolarni e'tiborsiz qoldirish
                        error_msg = str(e).lower()
                        if "duplicate" in error_msg or "already exists" in error_msg:
                            continue
                        self._print_warning(f"Statement xatosi: {e}")
            
            cursor.close()
            self._print_success(f"{filepath.name} - {executed} ta statement bajarildi")
            return True
            
        except FileNotFoundError:
            self._print_error(f"Fayl topilmadi: {filepath}")
            return False
        except Exception as e:
            self._print_error(f"Fayl bajarishda xatolik: {e}")
            return False

    def _split_sql_statements(self, sql_content: str) -> list:
        """
        SQL contentni alohida statementlarga ajratish.
        
        Args:
            sql_content: To'liq SQL content
            
        Returns:
            list: Alohida SQL statementlar
        """
        # Oddiy ; bo'yicha ajratish
        # Note: Bu stored procedure va trigger uchun ishlamasligi mumkin
        statements = []
        current_statement = []
        
        for line in sql_content.split("\n"):
            stripped = line.strip()
            
            # Bo'sh qator yoki kommentni o'tkazib yuborish
            if not stripped or stripped.startswith("--"):
                continue
            
            current_statement.append(line)
            
            # Statement tugaganmi tekshirish
            if stripped.endswith(";"):
                full_statement = "\n".join(current_statement)
                statements.append(full_statement)
                current_statement = []
        
        # Oxirgi statement (agar ; bilan tugamasa)
        if current_statement:
            statements.append("\n".join(current_statement))
        
        return statements

    def get_migration_files(self) -> list:
        """
        Migratsiya fayllarni tartib bilan olish.
        
        Returns:
            list: SQL fayl yo'llari (tartib bo'yicha)
        """
        sql_files = list(self.scripts_dir.glob("*.sql"))
        # Fayl nomining boshidagi raqam bo'yicha tartiblash
        sql_files.sort(key=lambda f: f.name)
        return sql_files

    def generate_password_hashes(self) -> dict:
        """
        Default parollar uchun bcrypt hash generatsiya qilish.
        
        Returns:
            dict: Username -> hash mapping
        """
        try:
            import bcrypt
            
            passwords = {
                "superadmin": "SuperAdmin123!",
                "manager": "Manager123!",
            }
            
            hashes = {}
            for username, password in passwords.items():
                hash_bytes = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(12))
                hashes[username] = hash_bytes.decode("utf-8")
                self._print_info(f"{username} uchun hash: {hashes[username][:30]}...")
            
            return hashes
            
        except ImportError:
            self._print_warning("bcrypt o'rnatilmagan. Default hash'lar ishlatiladi.")
            return {}

    def run(self) -> bool:
        """
        Barcha migratsiyalarni ishga tushirish.
        
        Returns:
            bool: Barcha migratsiyalar muvaffaqiyatli bo'lsa True
        """
        self._print_header("GASTRO-SAVDO-INSIGHTS DATABASE MIGRATSIYASI")
        
        print(f"\n📍 Skriptlar papkasi: {self.scripts_dir}")
        print(f"🔌 MySQL server: {self.host}:{self.port}")
        print(f"📦 Database: {self.database}")
        print(f"👤 Foydalanuvchi: {self.user}")
        
        # 1. MySQL serverga ulanish (database'siz)
        self._print_header("1. MySQL SERVERGA ULANISH")
        
        if not self.connect(with_database=False):
            return False
        
        self._print_success(f"MySQL serverga ulandi: {self.host}:{self.port}")
        
        # 2. Migratsiya fayllarni topish
        self._print_header("2. MIGRATSIYA FAYLLARINI TOPISH")
        
        migration_files = self.get_migration_files()
        
        if not migration_files:
            self._print_error("SQL fayllar topilmadi!")
            self.disconnect()
            return False
        
        print(f"\n📁 Topilgan fayllar ({len(migration_files)} ta):")
        for f in migration_files:
            print(f"   - {f.name}")
        
        # 3. Parol hash'larini generatsiya qilish
        self._print_header("3. PAROL HASH'LARINI GENERATSIYA QILISH")
        
        hashes = self.generate_password_hashes()
        
        # 4. SQL fayllarni bajarish
        self._print_header("4. SQL FAYLLARNI BAJARISH")
        
        success_count = 0
        error_count = 0
        
        for sql_file in migration_files:
            if self.execute_sql_file(sql_file):
                success_count += 1
            else:
                error_count += 1
        
        # Database'ga ulanish va natijalarni tekshirish
        self._print_header("5. NATIJALARNI TEKSHIRISH")
        
        self.disconnect()
        
        if self.connect(with_database=True):
            try:
                cursor = self._connection.cursor(dictionary=True)
                
                # Jadvallar sonini tekshirish
                cursor.execute("SHOW TABLES")
                tables = cursor.fetchall()
                self._print_success(f"Jami jadvallar: {len(tables)} ta")
                
                # Adminlar sonini tekshirish
                cursor.execute("SELECT COUNT(*) as count FROM admins")
                admin_count = cursor.fetchone()["count"]
                self._print_success(f"Adminlar soni: {admin_count} ta")
                
                # Adminlarni ko'rsatish
                cursor.execute("""
                    SELECT adminId, username, first_name, last_name,
                           CASE WHEN telegram_id IS NOT NULL THEN 'Yoqilgan' ELSE 'O\\'chirilgan' END as tfa_status
                    FROM admins
                """)
                admins = cursor.fetchall()
                
                print("\n👥 Mavjud adminlar:")
                for admin in admins:
                    print(f"   - {admin['username']} ({admin['first_name']} {admin['last_name']}) - 2FA: {admin['tfa_status']}")
                
                cursor.close()
                
            except MySQLError as e:
                self._print_error(f"Tekshirish xatosi: {e}")
        
        self.disconnect()
        
        # Natija
        self._print_header("YAKUNIY NATIJA")
        
        print(f"\n✅ Muvaffaqiyatli: {success_count} ta fayl")
        print(f"❌ Xatolik: {error_count} ta fayl")
        
        if error_count == 0:
            self._print_success("Barcha migratsiyalar muvaffaqiyatli yakunlandi! 🎉")
            print("\n📝 Keyingi qadamlar:")
            print("   1. Backend'ni ishga tushiring: uvicorn src.main:app --reload")
            print("   2. API docs: http://localhost:8000/docs")
            print("   3. Login: superadmin / SuperAdmin123!")
            return True
        else:
            self._print_error("Ba'zi migratsiyalarda xatolik yuz berdi.")
            return False


def main():
    """Asosiy funksiya."""
    runner = MigrationRunner()
    success = runner.run()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
