import React, { useContext, useState, useEffect } from "react"
import '../styles/CustomDateModal.scss'
import { FilterContext } from "../context/FilterContext"
import { ModalContext } from "../context/ModalContext"
import Modal from './Modal'


const CustomDateModal = () => {

    const filterProviderValues = useContext(FilterContext)
    const modalProviderValues = useContext(ModalContext)
    const [errorMessage, setErrorMessage] = useState('')

    // Clear error message when modal opens/closes or when dates change
    useEffect(() => {
        if (!modalProviderValues.isModalCustomDateOpen) {
            setErrorMessage('')
        }
    }, [modalProviderValues.isModalCustomDateOpen])

    useEffect(() => {
        if (errorMessage && (filterProviderValues.dateFrom || filterProviderValues.dateTo)) {
            setErrorMessage('')
        }
    }, [filterProviderValues.dateFrom, filterProviderValues.dateTo])

    const handleApply = () => {
        if (!filterProviderValues.dateFrom || !filterProviderValues.dateTo) {
            setErrorMessage('Please enter both dates')
            return
        }
        setErrorMessage('')
        modalProviderValues.setIsModalCustomDateOpen(false)
    }

    const handleClose = () => {
        setErrorMessage('')
        modalProviderValues.setIsModalCustomDateOpen(false)
    }

    return (
        <React.Fragment>
            <Modal 
                isOpen={modalProviderValues.isModalCustomDateOpen} 
                onClose={handleClose}
            >
                <div className="custom-date-modal-container">
                    <h2>Select Custom Date Range</h2>
                    <div className="custom-date-modal-content">
                        <div className="date-input-group">
                            <label>From:</label>
                            <input
                                type="date"
                                value={filterProviderValues.dateFrom}
                                onChange={e => filterProviderValues.setDateFrom(e.target.value)}
                            />
                        </div>
                        <div className="date-input-group">
                            <label>To:</label>
                            <input
                                type="date"
                                value={filterProviderValues.dateTo}
                                onChange={e => filterProviderValues.setDateTo(e.target.value)}
                            />
                        </div>
                    </div>
                    {errorMessage && (
                        <div className="error-message">
                            <i className="material-icons">error_outline</i>
                            {errorMessage}
                        </div>
                    )}
                    <button 
                        className="apply-dates-btn" 
                        onClick={handleApply}
                    >
                        <i className="material-icons">check</i>
                        Apply
                    </button>
                </div>
            </Modal>
        </React.Fragment>
    )
}

export { CustomDateModal }
