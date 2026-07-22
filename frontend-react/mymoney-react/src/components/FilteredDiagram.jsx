import React, { useContext, useMemo } from "react"
import '../styles/FilteredDiagram.scss'
import { ExpensesContext } from "../context/ExpensesContext"
import { FilterContext } from "../context/FilterContext"


const FilteredDiagram = () => {

    const expensesProviderValues = useContext(ExpensesContext)
    const filterProviderValues = useContext(FilterContext)

    // Group filtered expenses by categories
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

    const groupArray = useMemo(() => {
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
        const sortedCategoryNames = [...new Set(groupArray.map(g => g.name))].sort()
        const colorMap = {}
        sortedCategoryNames.forEach((name, index) => {
            colorMap[name] = categoryColors[index % categoryColors.length]
        })
        return colorMap
    }, [groupArray])

    const getCategoryColor = (categoryName) => {
        return categoryColorMap[categoryName] || categoryColors[0]
    }

    if (filterProviderValues.filteredRows.length === 0) {
        return (
            <div className="filtered-diagram bar-diagram">
                <h3>Filtered Summary</h3>
                <div className="no-data-message">No filtered data to display</div>
            </div>
        )
    }

    return (
        <div className="filtered-diagram bar-diagram compact">
            <h3>Categories Breakdown</h3>
            <div className="bars-container">
                {groupArray.map((group, index) => (
                    <div key={index} className="bar-item">
                        <div className="bar-header">
                            <div className="bar-info">
                                <span 
                                    className="category-dot" 
                                    style={{ backgroundColor: getCategoryColor(group.name) }}
                                ></span>
                                <span className="category-name">{group.name}</span>
                            </div>
                            <div className="bar-stats">
                                <span className="category-sum">€{group.sum.toFixed(2)}</span>
                                <span className="category-percent">{group.percent}%</span>
                            </div>
                        </div>
                        <div className="bar-track">
                            <div 
                                className="bar-fill" 
                                style={{ 
                                    width: `${group.percent}%`,
                                    backgroundColor: getCategoryColor(group.name)
                                }}
                            >
                                <div className="bar-shine"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export { FilteredDiagram }
