import React, { useContext, useMemo, useState } from "react"
import '../styles/FilteredDiagram.scss'
import { ExpensesContext } from "../context/ExpensesContext"
import { FilterContext } from "../context/FilterContext"


const CategoriesPieChart = () => {

    const expensesProviderValues = useContext(ExpensesContext)
    const filterProviderValues = useContext(FilterContext)
    const [isExpanded, setIsExpanded] = useState(false)

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

    const total = useMemo(() => {
        return filterProviderValues.filteredRows.reduce((sum, row) => sum + (parseFloat(row.price) || 0), 0)
    }, [filterProviderValues.filteredRows])

    const categoriesArray = useMemo(() => {
        return Object.entries(grouped).map(([name, items]) => {
            const sum = items.reduce((sum, item) => sum + Number(item.price || 0), 0)
            const percent = total > 0 ? ((sum * 100) / total).toFixed(1) : 0
            return { name, sum, percent: parseFloat(percent) }
        }).sort((a, b) => b.percent - a.percent)
    }, [grouped, total])

    // Extended color palette
    const categoryColors = [
        '#9c4fff', '#51cf66', '#4dabf7', '#ffd43b', '#ff6b6b',
        '#74c0fc', '#ff8787', '#69db7c', '#ffa94d', '#da77f2',
        '#20c997', '#fab005', '#6c5ce7', '#fd7e14', '#a5d8ff',
        '#ff922b', '#94d82d', '#748ffc', '#ffc078', '#12b886',
        '#cc5de8', '#38d9a9', '#ffa8a8', '#87ceeb', '#ff69b4',
    ]

    const categoryColorMap = useMemo(() => {
        const sortedCategoryNames = [...new Set(categoriesArray.map(g => g.name))].sort()
        const colorMap = {}
        sortedCategoryNames.forEach((name, index) => {
            colorMap[name] = categoryColors[index % categoryColors.length]
        })
        return colorMap
    }, [categoriesArray])

    const getCategoryColor = (categoryName) => {
        return categoryColorMap[categoryName] || categoryColors[0]
    }

    // Calculate SVG pie chart segments
    const pieSegments = useMemo(() => {
        let currentAngle = -90 // Start from top (-90 degrees)
        return categoriesArray.map((category) => {
            const angle = (parseFloat(category.percent) / 100) * 360
            const startAngle = currentAngle
            const endAngle = currentAngle + angle
            currentAngle = endAngle

            // Special case for 100% (full circle)
            if (angle >= 359.9) {
                return {
                    ...category,
                    isFullCircle: true,
                    color: getCategoryColor(category.name)
                }
            }

            // Convert angles to radians and calculate coordinates
            const startRad = (startAngle * Math.PI) / 180
            const endRad = (endAngle * Math.PI) / 180

            const x1 = 50 + 45 * Math.cos(startRad)
            const y1 = 50 + 45 * Math.sin(startRad)
            const x2 = 50 + 45 * Math.cos(endRad)
            const y2 = 50 + 45 * Math.sin(endRad)

            const largeArcFlag = angle > 180 ? 1 : 0

            const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
            ].join(' ')

            return {
                ...category,
                pathData,
                color: getCategoryColor(category.name),
                isFullCircle: false
            }
        })
    }, [categoriesArray, categoryColorMap])

    if (filterProviderValues.filteredRows.length === 0) {
        return null
    }

    return (
        <div className={`filtered-diagram pie-chart-card collapsible-diagram ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="diagram-header" onClick={() => setIsExpanded(!isExpanded)}>
                <h3>📊 Categories Breakdown for {
                    filterProviderValues.selectedInterval === 'today' ? 'Today' :
                    filterProviderValues.selectedInterval === 'month' ? (filterProviderValues.customLabel || filterProviderValues.currentMonth) :
                    filterProviderValues.selectedInterval === 'year' ? (filterProviderValues.customLabel || filterProviderValues.currentYear) :
                    filterProviderValues.selectedInterval === 'all' ? 'All Time' :
                    filterProviderValues.selectedInterval === 'custom' && filterProviderValues.startDate && filterProviderValues.endDate 
                      ? `${filterProviderValues.startDate} - ${filterProviderValues.endDate}` :
                    'Period'
                }</h3>
                <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                    {isExpanded ? '▼' : <i className="material-icons">chevron_right</i>}
                </span>
            </div>
            
            {isExpanded && (
                <div className="diagram-content">
                    <div className="pie-chart-container">
                        <svg viewBox="0 0 100 100" className="pie-chart">
                            {pieSegments.map((segment, index) => (
                                <g key={index}>
                                    {segment.isFullCircle ? (
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill={segment.color}
                                            className="pie-segment"
                                        >
                                            <title>{segment.name}: €{segment.sum.toFixed(2)} ({segment.percent}%)</title>
                                        </circle>
                                    ) : (
                                        <path
                                            d={segment.pathData}
                                            fill={segment.color}
                                            className="pie-segment"
                                        >
                                            <title>{segment.name}: €{segment.sum.toFixed(2)} ({segment.percent}%)</title>
                                        </path>
                                    )}
                                </g>
                            ))}
                        </svg>
                    </div>
                    <div className="pie-legend">
                        {categoriesArray.map((category, index) => (
                            <div key={index} className="legend-item">
                                <span 
                                    className="legend-color" 
                                    style={{ backgroundColor: getCategoryColor(category.name) }}
                                ></span>
                                <span className="legend-name">{category.name}</span>
                                <span className="legend-sum">€ {category.sum.toFixed(2)}</span>
                                <span className="legend-percent">{category.percent}%</span>
                            </div>
                        ))}
                    </div>
                    <div className="total-section">
                        <strong>Total: € {total.toFixed(2)}</strong>
                    </div>
                </div>
            )}
        </div>
    )
}

export { CategoriesPieChart }
