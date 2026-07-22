import React, { useContext, useMemo, useState } from "react"
import '../styles/FilteredDiagram.scss'
import { ExpensesContext } from "../context/ExpensesContext"
import { FilterContext } from "../context/FilterContext"


const CombinedPieCharts = () => {

    const expensesProviderValues = useContext(ExpensesContext)
    const filterProviderValues = useContext(FilterContext)
    const [isExpanded, setIsExpanded] = useState(false)

    // Calculate total
    const total = useMemo(() => {
        return filterProviderValues.filteredRows.reduce((sum, row) => sum + (parseFloat(row.price) || 0), 0)
    }, [filterProviderValues.filteredRows])

    // Group expenses by categories
    const grouped = useMemo(() => {
        return filterProviderValues.filteredRows.reduce((acc, expense) => {
            const cat = expensesProviderValues.categories.find(c => String(c.id) === String(expense.category))
            const catName = cat?.name || 'Unknown'
            if (!acc[catName]) acc[catName] = []
            acc[catName].push(expense)
            return acc
        }, {})
    }, [filterProviderValues.filteredRows, expensesProviderValues.categories])

    const categoriesArray = useMemo(() => {
        return Object.entries(grouped).map(([name, items]) => {
            const sum = items.reduce((sum, item) => sum + Number(item.price || 0), 0)
            const percent = total > 0 ? ((sum * 100) / total).toFixed(1) : 0
            return { name, sum, percent: parseFloat(percent) }
        }).sort((a, b) => b.percent - a.percent)
    }, [grouped, total])

    // Create array of individual expenses with percentages
    const expensesArray = useMemo(() => {
        return filterProviderValues.filteredRows
            .map((expense) => {
                const price = parseFloat(expense.price) || 0
                const percent = total > 0 ? ((price * 100) / total).toFixed(1) : 0
                return { 
                    id: expense.id,
                    name: expense.name || 'Unnamed Expense',
                    sum: price, 
                    percent: parseFloat(percent)
                }
            })
            .sort((a, b) => b.percent - a.percent)
    }, [filterProviderValues.filteredRows, total])

    // Extended color palette
    const chartColors = [
        '#9c4fff', '#51cf66', '#4dabf7', '#ffd43b', '#ff6b6b',
        '#74c0fc', '#ff8787', '#69db7c', '#ffa94d', '#da77f2',
        '#20c997', '#fab005', '#6c5ce7', '#fd7e14', '#a5d8ff',
        '#ff922b', '#94d82d', '#748ffc', '#ffc078', '#12b886',
        '#cc5de8', '#38d9a9', '#ffa8a8', '#87ceeb', '#ff69b4',
    ]

    // Category color mapping
    const categoryColorMap = useMemo(() => {
        const sortedCategoryNames = [...new Set(categoriesArray.map(g => g.name))].sort()
        const colorMap = {}
        sortedCategoryNames.forEach((name, index) => {
            colorMap[name] = chartColors[index % chartColors.length]
        })
        return colorMap
    }, [categoriesArray])

    const getCategoryColor = (categoryName) => {
        return categoryColorMap[categoryName] || chartColors[0]
    }

    const getExpenseColor = (index) => {
        return chartColors[index % chartColors.length]
    }

    if (filterProviderValues.filteredRows.length === 0) {
        return null
    }

    const getPeriodLabel = () => {
        if (filterProviderValues.selectedInterval === 'today') return 'Today';
        if (filterProviderValues.selectedInterval === 'month') return filterProviderValues.customLabel || filterProviderValues.currentMonth;
        if (filterProviderValues.selectedInterval === 'year') return filterProviderValues.customLabel || filterProviderValues.currentYear;
        if (filterProviderValues.selectedInterval === 'all') return 'All Time';
        if (filterProviderValues.selectedInterval === 'custom' && filterProviderValues.startDate && filterProviderValues.endDate) {
            return `${filterProviderValues.startDate} - ${filterProviderValues.endDate}`;
        }
        return 'Period';
    }

    return (
        <div className={`filtered-diagram pie-chart-card collapsible-diagram ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="diagram-header" onClick={() => setIsExpanded(!isExpanded)}>
                <h3>📊 <span className="breakdown-title-full">Expenses Breakdown for {getPeriodLabel()}</span><span className="breakdown-title-short">Expenses Breakdown</span></h3>
                <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                    {isExpanded ? '▼' : <i className="material-icons">chevron_right</i>}
                </span>
            </div>
            
            {isExpanded && (
                <div className="diagram-content">
                    <div className="combined-charts">
                        {/* Categories Bar Chart */}
                        <div className="chart-section bar-section">
                            <h4>By Categories</h4>
                            <div className="bars-container">
                                {categoriesArray.map((category, index) => (
                                    <div key={index} className="bar-item">
                                        <div className="bar-header">
                                            <div className="bar-info">
                                                <span 
                                                    className="category-dot" 
                                                    style={{ backgroundColor: getCategoryColor(category.name) }}
                                                ></span>
                                                <span className="category-name">{category.name}</span>
                                            </div>
                                            <div className="bar-stats">
                                                <span className="category-sum">€{category.sum.toFixed(2)}</span>
                                                <span className="category-percent">{category.percent}%</span>
                                            </div>
                                        </div>
                                        <div className="bar-track">
                                            <div 
                                                className="bar-fill" 
                                                style={{ 
                                                    width: `${category.percent}%`,
                                                    backgroundColor: getCategoryColor(category.name)
                                                }}
                                            >
                                                <div className="bar-shine"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Expenses Bar Chart */}
                        <div className="chart-section bar-section">
                            <h4>By Expenses</h4>
                            <div className="bars-container">
                                {expensesArray.map((expense, index) => (
                                    <div key={expense.id} className="bar-item">
                                        <div className="bar-header">
                                            <div className="bar-info">
                                                <span 
                                                    className="category-dot" 
                                                    style={{ backgroundColor: getExpenseColor(index) }}
                                                ></span>
                                                <span className="category-name">{expense.name}</span>
                                            </div>
                                            <div className="bar-stats">
                                                <span className="category-sum">€{expense.sum.toFixed(2)}</span>
                                                <span className="category-percent">{expense.percent}%</span>
                                            </div>
                                        </div>
                                        <div className="bar-track">
                                            <div 
                                                className="bar-fill" 
                                                style={{ 
                                                    width: `${expense.percent}%`,
                                                    backgroundColor: getExpenseColor(index)
                                                }}
                                            >
                                                <div className="bar-shine"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="total-section">
                        <strong>Total: € {total.toFixed(2)}</strong>
                    </div>
                </div>
            )}
        </div>
    )
}

export { CombinedPieCharts }
