"""
Gastro-Savdo Insights - Ma'lumotlarga asoslangan strategik tahlil platformasi
BTEC Unit 5: Katta Ma'lumotlar va Vizualizatsiya
"""

import streamlit as st
import pandas as pd
from utils.data_loader import load_data
from utils.visualizations import create_charts
from db_config import get_database_connection


def main():
    """Main application function"""
    
    # Page configuration
    st.set_page_config(
        page_title="Gastro-Savdo Insights",
        page_icon="📊",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    # Header
    st.title("📊 Gastro-Savdo Insights")
    st.markdown("### Ma'lumotlarga asoslangan strategik tahlil platformasi")
    st.markdown("---")
    
    # Sidebar
    with st.sidebar:
        st.header("Navigatsiya")
        page = st.radio(
            "Sahifani tanlang:",
            ["Asosiy Panel", "Ma'lumotlar Tahlili", "Vizualizatsiya", "Hisobotlar"]
        )
        
        st.markdown("---")
        st.info("""
        **BTEC Unit 5**  
        Katta Ma'lumotlar va Vizualizatsiya
        """)
    
    # Main content based on selected page
    if page == "Asosiy Panel":
        show_dashboard()
    elif page == "Ma'lumotlar Tahlili":
        show_data_analysis()
    elif page == "Vizualizatsiya":
        show_visualizations()
    elif page == "Hisobotlar":
        show_reports()


def show_dashboard():
    """Display main dashboard"""
    st.header("📈 Asosiy Panel")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(label="Jami Savdo", value="0", delta="0%")
    
    with col2:
        st.metric(label="Mahsulotlar", value="0", delta="0")
    
    with col3:
        st.metric(label="Mijozlar", value="0", delta="0%")
    
    with col4:
        st.metric(label="Daromad", value="0 so'm", delta="0%")
    
    st.markdown("---")
    st.info("💡 Ma'lumotlarni yuklash uchun data/ papkasiga fayllaringizni joylashtiring.")


def show_data_analysis():
    """Display data analysis page"""
    st.header("🔍 Ma'lumotlar Tahlili")
    st.write("Ma'lumotlar tahlili bo'limi")
    
    # Placeholder for data analysis
    st.info("Ma'lumotlar tahlili funksiyalari qo'shiladi.")


def show_visualizations():
    """Display visualizations page"""
    st.header("📊 Vizualizatsiya")
    st.write("Ma'lumotlar vizualizatsiyasi bo'limi")
    
    # Placeholder for visualizations
    st.info("Grafik va diagrammalar qo'shiladi.")


def show_reports():
    """Display reports page"""
    st.header("📄 Hisobotlar")
    st.write("Hisobotlar bo'limi")
    
    # Placeholder for reports
    st.info("Hisobotlar va eksport funksiyalari qo'shiladi.")


if __name__ == "__main__":
    main()
