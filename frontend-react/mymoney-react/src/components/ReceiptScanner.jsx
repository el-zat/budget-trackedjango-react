import React, { useState, useContext, useRef } from "react";
import ReactDOM from "react-dom";
import { ExpensesContext } from "../context/ExpensesContext";
import { AuthContext } from "../context/AuthContext";
import '../styles/ReceiptScanner.scss';
import { FiCamera, FiUpload, FiCheck, FiX, FiLoader } from "react-icons/fi";

const ReceiptScanner = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [storeConfirm, setStoreConfirm] = useState(null); // {store, categoryName, categoryId}
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [expenseName, setExpenseName] = useState('');
    const [expenseDate, setExpenseDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const expensesProviderValues = useContext(ExpensesContext);
    const authProviderValues = useContext(AuthContext);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setError(null);
        setScanResult(null);

        // Create image preview
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewUrl(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleScan = async () => {
        if (!selectedFile) {
            setError("Please select a receipt image");
            return;
        }

        setIsScanning(true);
        setError(null);

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch('/api/receipt-scan/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Error scanning receipt');
                return;
            }

            // If a known supermarket is detected, show confirmation first
            if (data.detected_store) {
                setStoreConfirm({
                    store: data.detected_store,
                    categoryName: data.suggested_category_name,
                    categoryId: data.suggested_category_id,
                });
            }

            setScanResult(data);
            setExpenseName(data.seller || '');
            setExpenseDate(data.date || new Date().toISOString().split('T')[0]);
        } catch (err) {
            setError('Network error. Check your connection and try again.');
        } finally {
            setIsScanning(false);
        }
    };

    const handleApplyResult = async () => {
        if (!scanResult) return;

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please log in to save expenses.');
            return;
        }

        if (!scanResult.suggested_category_id) {
            setError('Please select a category before saving.');
            return;
        }

        if (!expenseName.trim()) {
            setError('Please enter an expense name.');
            return;
        }

        setIsSaving(true);
        setError(null);

        // Create expense directly via API
        const expenseData = {
            category: scanResult.suggested_category_id,
            name: expenseName.trim(),
            price: scanResult.total || 0,
            payment_date: expenseDate || new Date().toISOString().split('T')[0],
            frequency: 'once',
        };

        try {
            const response = await fetch('/api/myexpenses/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expenseData),
            });

            if (!response.ok) {
                const data = await response.json();
                setError('Failed to save: ' + JSON.stringify(data));
                return;
            }

            // Refresh the page to show new expense in the list
            handleClose();
            window.location.reload();
        } catch (err) {
            setError('Network error while saving expense.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmStore = () => {
        // User confirmed the supermarket category — just dismiss the prompt
        setStoreConfirm(null);
    };

    const handleRejectStore = () => {
        // User doesn't want the auto-detected category — show category picker
        setStoreConfirm(null);
        setShowCategoryPicker(true);
    };

    const handleChangeCategoryFromResult = () => {
        // Allow user to change category from the results view
        setShowCategoryPicker(true);
    };

    const handleCategorySelect = (category) => {
        if (scanResult) {
            setScanResult(prev => ({
                ...prev,
                suggested_category_id: category.id,
                suggested_category_name: category.name,
                confidence: 'high',
            }));
        }
        setShowCategoryPicker(false);
    };

    const handleClose = () => {
        setIsOpen(false);
        setScanResult(null);
        setStoreConfirm(null);
        setShowCategoryPicker(false);
        setExpenseName('');
        setExpenseDate('');
        setIsSaving(false);
        setError(null);
        setPreviewUrl(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (cameraInputRef.current) {
            cameraInputRef.current.value = '';
        }
    };

    const handleApplyItem = (item) => {
        // Apply a single line item from the receipt as an expense
        if (scanResult?.suggested_category_id) {
            expensesProviderValues.setSelectedCategory(String(scanResult.suggested_category_id));
        }
        if (item.price) {
            expensesProviderValues.setPrice(String(item.price));
        }
        if (scanResult?.date) {
            expensesProviderValues.setPaymentDate(scanResult.date);
        }
        if (item.name) {
            expensesProviderValues.setMiscExpense(item.name);
        }

        handleClose();
    };

    // Only show for logged-in users
    if (!authProviderValues.isLoggedIn) return null;

    return (
        <div className="receipt-scanner">
            <button 
                className="receipt-scanner__trigger" 
                onClick={() => setIsOpen(true)}
                title="Scan receipt"
            >
                <FiCamera size={18} />
                <span>Scan receipt</span>
            </button>

            {isOpen && ReactDOM.createPortal(
                <div className="receipt-scanner__overlay" onClick={handleClose}>
                    <div className="receipt-scanner__modal" onClick={e => e.stopPropagation()}>
                        <div className="receipt-scanner__header">
                            <h3>Scan receipt</h3>
                            <button className="receipt-scanner__close" onClick={handleClose}>
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="receipt-scanner__body">
                            {/* Upload area */}
                            <div className="receipt-scanner__upload">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleFileSelect}
                                    className="receipt-scanner__file-input"
                                    id="receipt-file-input"
                                />
                                <input
                                    ref={cameraInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileSelect}
                                    className="receipt-scanner__file-input"
                                    id="receipt-camera-input"
                                />
                                <label htmlFor="receipt-file-input" className="receipt-scanner__upload-label">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Receipt preview" className="receipt-scanner__preview" />
                                    ) : (
                                        <div className="receipt-scanner__upload-placeholder">
                                            <FiUpload size={36} />
                                            <p>Click or drag receipt photo here</p>
                                            <span>JPEG, PNG, WebP — up to 10 MB</span>
                                        </div>
                                    )}
                                </label>
                                {/* Camera button for mobile/tablet */}
                                {!previewUrl && (
                                    <label htmlFor="receipt-camera-input" className="receipt-scanner__camera-btn">
                                        <FiCamera size={18} />
                                        <span>Take a photo</span>
                                    </label>
                                )}
                            </div>

                            {/* Scan button */}
                            {selectedFile && !scanResult && (
                                <button 
                                    className="receipt-scanner__scan-btn"
                                    onClick={handleScan}
                                    disabled={isScanning}
                                >
                                    {isScanning ? (
                                        <>
                                            <FiLoader className="spinner" size={18} />
                                            <span>Scanning...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiCamera size={18} />
                                            <span>Recognize</span>
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Error message */}
                            {error && (
                                <div className="receipt-scanner__error">
                                    {error}
                                </div>
                            )}

                            {/* Supermarket confirmation prompt */}
                            {storeConfirm && (
                                <div className="receipt-scanner__store-confirm">
                                    <p>
                                        Receipt from <strong>{storeConfirm.store}</strong> detected.
                                        <br />Apply category: <strong>{storeConfirm.categoryName}</strong>?
                                    </p>
                                    <div className="receipt-scanner__store-confirm-actions">
                                        <button
                                            className="receipt-scanner__confirm-btn"
                                            onClick={handleConfirmStore}
                                        >
                                            <FiCheck size={14} /> Yes, apply
                                        </button>
                                        <button
                                            className="receipt-scanner__reject-btn"
                                            onClick={handleRejectStore}
                                        >
                                            <FiX size={14} /> No, change
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Category picker after rejecting auto-detected category */}
                            {showCategoryPicker && expensesProviderValues.categories && (
                                <div className="receipt-scanner__category-picker">
                                    <p>Select a category:</p>
                                    <div className="receipt-scanner__category-list">
                                        {expensesProviderValues.categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                className={`receipt-scanner__category-option${
                                                    scanResult?.suggested_category_id === cat.id ? ' active' : ''
                                                }`}
                                                onClick={() => handleCategorySelect(cat)}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Scan results */}
                            {scanResult && (
                                <div className="receipt-scanner__results">
                                    <div className="receipt-scanner__result-header">
                                        <h4>Result</h4>
                                        <span className={`receipt-scanner__confidence receipt-scanner__confidence--${scanResult.confidence}`}>
                                            {scanResult.confidence === 'high' ? 'High confidence' : 
                                             scanResult.confidence === 'medium' ? 'Medium confidence' : 'Low confidence'}
                                        </span>
                                    </div>

                                    <div className="receipt-scanner__result-info">
                                        {scanResult.seller && (
                                            <div className="receipt-scanner__result-row">
                                                <span className="label">Seller:</span>
                                                <span className="value">{scanResult.seller}</span>
                                            </div>
                                        )}
                                        <div className="receipt-scanner__result-row">
                                            <span className="label">Date:</span>
                                            <input
                                                type="date"
                                                value={expenseDate}
                                                onChange={(e) => setExpenseDate(e.target.value)}
                                                className="receipt-scanner__date-input"
                                            />
                                        </div>
                                        {scanResult.total && (
                                            <div className="receipt-scanner__result-row">
                                                <span className="label">Total:</span>
                                                <span className="value">{scanResult.total} {scanResult.currency || ''}</span>
                                            </div>
                                        )}
                                        {scanResult.suggested_category_name && (
                                            <div className="receipt-scanner__result-row">
                                                <span className="label">Category:</span>
                                                <span className="value category-badge">
                                                    {scanResult.suggested_category_name}
                                                </span>
                                                <button
                                                    className="receipt-scanner__change-btn"
                                                    onClick={handleChangeCategoryFromResult}
                                                    title="Change category"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Editable expense name */}
                                    <div className="receipt-scanner__expense-name-field">
                                        <label>Expense name:</label>
                                        <input
                                            type="text"
                                            value={expenseName}
                                            onChange={(e) => setExpenseName(e.target.value)}
                                            placeholder="e.g. Groceries, Pharmacy, Coffee..."
                                            className="receipt-scanner__name-input"
                                        />
                                    </div>

                                    {/* Line items */}
                                    {scanResult.items && scanResult.items.length > 0 && (
                                        <div className="receipt-scanner__items">
                                            <h5>Items ({scanResult.items.length})</h5>
                                            <div className="receipt-scanner__items-list">
                                                {scanResult.items.map((item, index) => (
                                                    <div key={index} className="receipt-scanner__item">
                                                        <div className="receipt-scanner__item-info">
                                                            <span className="item-name">{item.name}</span>
                                                            <span className="item-price">
                                                                {item.price} {scanResult.currency || ''} 
                                                                {item.quantity > 1 && ` × ${item.quantity}`}
                                                            </span>
                                                        </div>
                                                        <button
                                                            className="receipt-scanner__item-apply"
                                                            onClick={() => handleApplyItem(item)}
                                                            title="Add as expense"
                                                        >
                                                            <FiCheck size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action buttons */}
                                    <div className="receipt-scanner__actions">
                                        <button 
                                            className="receipt-scanner__apply-btn"
                                            onClick={handleApplyResult}
                                            disabled={isSaving || !scanResult.suggested_category_id || !expenseName.trim()}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <FiLoader className="spinner" size={16} />
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiCheck size={16} />
                                                    <span>Save expense</span>
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            className="receipt-scanner__cancel-btn"
                                            onClick={handleClose}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ReceiptScanner;
