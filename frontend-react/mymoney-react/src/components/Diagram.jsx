import React, {useState, useEffect} from "react"
import  './Diagram.css'


const Diagram = () => {
        return <React.Fragment> 
            <div className="category-summary">
                <h2>Monthly Category Summary</h2>
                <div className="category-row">
                    <div className="cat-header">
                        <span><i className="fas fa-home icon housing"></i> Housing</span>
                        <span className="percent">60%</span>
                    </div>
                    <div className="bar-container">
                        <div className="bar" style={{ width: '60%', background: '#4e89ff' }}></div>
                    </div>
                </div>
                <div className="category-row">
                    <div className="cat-header">
                        <span><i className="fas fa-shopping-basket icon groceries"></i> Groceries</span>
                        <span className="percent">12.5%</span>
                    </div>
                    <div className="bar-container">
                        <div className="bar" style={{ width: '12.5%', background: '#43e97b' }}></div>
                    </div>
                </div>
                <div className="category-row">
                    <div className="cat-header">
                        <span><i className="fas fa-receipt icon taxes"></i> Taxes</span>
                        <span className="percent">15%</span>
                    </div>
                    <div className="bar-container">
                        <div className="bar" style={{ width: '15%', background: '#ffb347' }}></div>
                    </div>
                </div>
            </div>
        </React.Fragment> 
}

export {Diagram}