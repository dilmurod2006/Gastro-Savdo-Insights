"""
Visualizations Module
Ma'lumotlar vizualizatsiyasi uchun funksiyalar
"""

import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from typing import Optional


def create_line_chart(df: pd.DataFrame, x: str, y: str, title: str = "Line Chart") -> go.Figure:
    """
    Create a line chart
    
    Args:
        df: Input DataFrame
        x: Column name for x-axis
        y: Column name for y-axis
        title: Chart title
        
    Returns:
        Plotly figure object
    """
    fig = px.line(df, x=x, y=y, title=title)
    fig.update_layout(
        xaxis_title=x,
        yaxis_title=y,
        hovermode='x unified'
    )
    return fig


def create_bar_chart(df: pd.DataFrame, x: str, y: str, title: str = "Bar Chart") -> go.Figure:
    """
    Create a bar chart
    
    Args:
        df: Input DataFrame
        x: Column name for x-axis
        y: Column name for y-axis
        title: Chart title
        
    Returns:
        Plotly figure object
    """
    fig = px.bar(df, x=x, y=y, title=title)
    fig.update_layout(
        xaxis_title=x,
        yaxis_title=y,
        hovermode='x unified'
    )
    return fig


def create_pie_chart(df: pd.DataFrame, names: str, values: str, title: str = "Pie Chart") -> go.Figure:
    """
    Create a pie chart
    
    Args:
        df: Input DataFrame
        names: Column name for pie slice names
        values: Column name for pie slice values
        title: Chart title
        
    Returns:
        Plotly figure object
    """
    fig = px.pie(df, names=names, values=values, title=title)
    return fig


def create_scatter_plot(df: pd.DataFrame, x: str, y: str, 
                       color: Optional[str] = None, 
                       title: str = "Scatter Plot") -> go.Figure:
    """
    Create a scatter plot
    
    Args:
        df: Input DataFrame
        x: Column name for x-axis
        y: Column name for y-axis
        color: Column name for color grouping (optional)
        title: Chart title
        
    Returns:
        Plotly figure object
    """
    fig = px.scatter(df, x=x, y=y, color=color, title=title)
    fig.update_layout(
        xaxis_title=x,
        yaxis_title=y,
        hovermode='closest'
    )
    return fig


def create_charts(df: pd.DataFrame, chart_type: str, **kwargs) -> Optional[go.Figure]:
    """
    Create chart based on type
    
    Args:
        df: Input DataFrame
        chart_type: Type of chart ('line', 'bar', 'pie', 'scatter')
        **kwargs: Additional arguments for specific chart type
        
    Returns:
        Plotly figure object or None
    """
    if df is None or df.empty:
        return None
    
    chart_type = chart_type.lower()
    
    if chart_type == 'line':
        return create_line_chart(df, **kwargs)
    elif chart_type == 'bar':
        return create_bar_chart(df, **kwargs)
    elif chart_type == 'pie':
        return create_pie_chart(df, **kwargs)
    elif chart_type == 'scatter':
        return create_scatter_plot(df, **kwargs)
    else:
        print(f"Noma'lum grafik turi: {chart_type}")
        return None
