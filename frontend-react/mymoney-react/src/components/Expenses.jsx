import React, { useState, useContext, useEffect, useRef, useCallback } from "react";
import "../styles/Expenses.scss";
import CurrencyInput from "react-currency-input-field";
import { ExpensesContext } from "../context/ExpensesContext";
import { FilterContext } from "../context/FilterContext";
import { AuthContext } from "../context/AuthContext";
import { ModalContext } from "../context/ModalContext";
import { SortContext } from "../context/SortContext";
import { DescriptionContext } from "../context/DescriptionContext";
import { Sort } from "./Sort";
import ReceiptScanner from "./ReceiptScanner";

const InlineDescription = ({ id }) => {
    const [description, setDescription] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);
    const expensesProviderValues = useContext(ExpensesContext);
    const authProviderValues = useContext(AuthContext);

    useEffect(() => {
        if (!id) return;

        fetch(`/api/myexpenses/${id}/`)
            .then(res => res.json())
            .then(data => {
                setDescription(data.description || "");
                setIsLoaded(true);
            })
            .catch(() => setIsLoaded(true));
    }, [id]);

    const handleSave = async () => {
        if (!id) return;

        await fetch(`/api/myexpenses/${id}/`, {
            method: "PATCH",
            credentials: "include",
            headers: authProviderValues.getAuthHeaders(),
            body: JSON.stringify({ description }),
        });

        expensesProviderValues.setHasDescription(id, true);
        expensesProviderValues.closeDescription();
    };

    if (!isLoaded) {
        return <div className="inline-description-loading">Loading...</div>;
    }

    return (
        <div className="inline-description">
            <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add description..."
                rows={3}
                autoFocus
                onKeyDown={e => {
                    if (e.key === "Escape") expensesProviderValues.closeDescription();
                    if (e.key === "Enter" && e.ctrlKey) handleSave();
                }}
            />
            <div className="inline-description-actions">
                <button type="button" className="inline-save-btn" onClick={handleSave}>
                    Save
                </button>
                <button
                    type="button"
                    className="inline-cancel-btn"
                    onClick={expensesProviderValues.closeDescription}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

const Expenses = () => {
    const expensesProviderValues = useContext(ExpensesContext);
    const filterProviderValues = useContext(FilterContext);
    const authProviderValues = useContext(AuthContext);
    const modalProviderValues = useContext(ModalContext);
    const descriptionProviderValues = useContext(DescriptionContext);

    const [selectedSort, setSelectedSort] = useState([]);
    const [isRecurringCollapsed, setIsRecurringCollapsed] = useState(false);
    const [isRegularCollapsed, setIsRegularCollapsed] = useState(false);

    const inputRef = useRef(null);
    const addExpenseRowRef = useRef(null);

    const formatDate = dateString => {
        if (!dateString) return "";

        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    const getDisplayDate = expense => {
        const isRecurring =
            (expense.frequency && expense.frequency !== "once") || expense.is_recurring;

        if (isRecurring && filterProviderValues.startDate) {
            const startDate = new Date(filterProviderValues.startDate);
            const paymentDate = new Date(expense.payment_date);
            const displayDate = new Date(
                startDate.getFullYear(),
                startDate.getMonth(),
                paymentDate.getDate()
            );

            return formatDate(displayDate.toISOString());
        }

        return formatDate(expense.payment_date);
    };

    const getEffectivePrice = expense => {
        if (!expense.price_changes || expense.price_changes.length === 0) {
            return expense.price;
        }

        const referenceDate = filterProviderValues.startDate
            ? new Date(filterProviderValues.startDate)
            : new Date();

        const applicableChange = expense.price_changes
            .filter(change => new Date(change.effective_date) <= referenceDate)
            .sort((a, b) => new Date(b.effective_date) - new Date(a.effective_date))[0];

        return applicableChange ? applicableChange.new_price : expense.price;
    };

    const sortCategoriesAlphabetically = () => {
        const sorted = expensesProviderValues.rows.slice().sort((a, b) => {
            const aKey = expensesProviderValues.categoriesMap[a.category]?.name.toLowerCase() || "";
            const bKey = expensesProviderValues.categoriesMap[b.category]?.name.toLowerCase() || "";

            return aKey.localeCompare(bKey, "en", {
                sensitivity: "base",
                numeric: true,
            });
        });

        filterProviderValues.setFilteredRows(sorted);
    };

    const handleSort = value => {
        const rows = filterProviderValues.filteredRows.slice();

        switch (value) {
            case "date-dec":
                filterProviderValues.setFilteredRows(
                    rows.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
                );
                break;
            case "date-inc":
                filterProviderValues.setFilteredRows(
                    rows.sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date))
                );
                break;
            case "category":
                sortCategoriesAlphabetically();
                break;
            case "price-inc":
                filterProviderValues.setFilteredRows(rows.sort((a, b) => a.price - b.price));
                break;
            case "price-dec":
                filterProviderValues.setFilteredRows(rows.sort((a, b) => b.price - a.price));
                break;
            default:
                filterProviderValues.setFilteredRows(
                    rows.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
                );
                break;
        }

        setSelectedSort(value);
    };

    const onSortChange = value => {
        setSelectedSort(value);
        handleSort(value);
    };

    // One behavior on every screen size: scroll to the single common add form and focus it.
    const handleAddExpenseClick = () => {
        const addExpenseRow = addExpenseRowRef.current;

        if (!addExpenseRow) return;

        addExpenseRow.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });

        window.setTimeout(() => {
            const firstField = addExpenseRow.querySelector("select, input");
            firstField?.focus();
        }, 300);
    };

    const allRecurringRows = filterProviderValues.filteredRows
        .filter(row => (row.frequency && row.frequency !== "once") || row.is_recurring)
        .sort((a, b) => {
            const priceA = parseFloat(String(a.price).replace(",", ".")) || 0;
            const priceB = parseFloat(String(b.price).replace(",", ".")) || 0;
            return priceB - priceA;
        });

    const allRegularRows = filterProviderValues.filteredRows.filter(
        row => !(row.frequency && row.frequency !== "once") && !row.is_recurring
    );

    const recurringRows = allRecurringRows;
    const regularRows = allRegularRows;

    useEffect(() => {
        return () => setSelectedSort([]);
    }, [filterProviderValues.selectedInterval]);

    const { selectedInterval, setCheckedCategories } = filterProviderValues;

    useEffect(() => {
        return () => setCheckedCategories([]);
    }, [selectedInterval, setCheckedCategories]);

    const { setCurrentPage } = expensesProviderValues;
    const { filteredRows } = filterProviderValues;

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredRows, setCurrentPage]);

    const closeEditing = useCallback(() => {
        expensesProviderValues.setEditingField({ id: null, field: null });
    }, [expensesProviderValues]);

    useEffect(() => {
        const handleClickOutside = event => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                closeEditing();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [closeEditing]);

    const sortProviderValues = {
        selectedSort,
        onSortChange,
    };

    const ExpenseRow = ({ row }) => {
        const isRecurring = (row.frequency && row.frequency !== "once") || row.is_recurring;
        const displayFrequency =
            row.is_recurring && (!row.frequency || row.frequency === "once")
                ? "monthly"
                : row.frequency;

        const frequencyLabel =
            displayFrequency === "monthly"
                ? "Monthly"
                : displayFrequency === "quarterly"
                    ? "Quarterly"
                    : displayFrequency === "yearly"
                        ? "Yearly"
                        : "One-time";

        return (
            <tr>
                <td>
                    {expensesProviderValues.categories.find(
                        cat => String(cat.id) === String(row.category)
                    )?.name || "Unknown"}
                </td>

                <td>
                    {expensesProviderValues.editingField.id === row.id &&
                    expensesProviderValues.editingField.field === "name" ? (
                        <input
                            id={`edit-name-${row.id}`}
                            type="text"
                            name="name"
                            placeholder="Fill out expense name"
                            ref={inputRef}
                            value={expensesProviderValues.editName || ""}
                            onChange={e => expensesProviderValues.setEditName(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    expensesProviderValues.applyChanges(row.id, "name");
                                }
                            }}
                        />
                    ) : (
                        <div
                            className="tooltip-icon-container"
                            onClick={() => {
                                expensesProviderValues.setEditingField({ id: row.id, field: "name" });
                                expensesProviderValues.setEditName(row.name);
                            }}
                            data-tooltip="Edit expense"
                        >
                            {row.name}
                            {isRecurring && (
                                <span className="recurring-badge">
                                    <i className="material-icons">repeat</i>
                                </span>
                            )}
                        </div>
                    )}

                    {descriptionProviderValues.isDescriptionShown &&
                        descriptionProviderValues.currentDescriptionId === row.id && (
                            <InlineDescription id={row.id} />
                        )}
                </td>

                <td>
                    {expensesProviderValues.editingField.id === row.id &&
                    expensesProviderValues.editingField.field === "date" ? (
                        <input
                            id={`edit-date-${row.id}`}
                            type="date"
                            ref={inputRef}
                            value={expensesProviderValues.editDate || ""}
                            onChange={e => {
                                const newDate = e.target.value;
                                expensesProviderValues.setEditDate(newDate);

                                if (newDate && newDate !== row.payment_date) {
                                    window.setTimeout(() => {
                                        expensesProviderValues.applyChanges(row.id, "date", newDate);
                                    }, 300);
                                }
                            }}
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    expensesProviderValues.applyChanges(row.id, "date");
                                }
                            }}
                        />
                    ) : (
                        <div
                            className="tooltip-icon-container"
                            onClick={() => {
                                expensesProviderValues.setEditingField({ id: row.id, field: "date" });
                                expensesProviderValues.setEditDate(row.payment_date);
                            }}
                            data-tooltip="Edit date"
                        >
                            {getDisplayDate(row)}
                        </div>
                    )}
                </td>

                <td>
                    {expensesProviderValues.editingField.id === row.id &&
                    expensesProviderValues.editingField.field === "frequency" ? (
                        <select
                            className="frequency-select"
                            ref={inputRef}
                            value={expensesProviderValues.editFrequency || displayFrequency || "once"}
                            onChange={e => {
                                const newFrequency = e.target.value;
                                expensesProviderValues.setEditFrequency(newFrequency);
                                expensesProviderValues.applyChanges(row.id, "frequency", newFrequency);
                            }}
                            onKeyDown={e => {
                                if (e.key === "Enter" || e.key === "Escape") {
                                    expensesProviderValues.setEditingField({ id: null, field: null });
                                }
                            }}
                        >
                            <option value="once">One-time</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    ) : (
                        <div
                            className="tooltip-icon-container"
                            onClick={() => {
                                expensesProviderValues.setEditingField({
                                    id: row.id,
                                    field: "frequency",
                                });
                                expensesProviderValues.setEditFrequency(displayFrequency || "once");
                            }}
                            data-tooltip="Edit frequency"
                        >
                            {frequencyLabel}
                        </div>
                    )}
                </td>

                <td>
                    {expensesProviderValues.editingField.id === row.id &&
                    expensesProviderValues.editingField.field === "price" ? (
                        <CurrencyInput
                            id={`edit-price-${row.id}`}
                            prefix="€ "
                            decimalsLimit={2}
                            decimalSeparator=","
                            groupSeparator="."
                            placeholder="0,00"
                            ref={inputRef}
                            value={expensesProviderValues.editPrice}
                            onBlur={() =>
                                expensesProviderValues.setEditingField({ id: null, field: null })
                            }
                            onValueChange={value => expensesProviderValues.setEditPrice(value || "")}
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    expensesProviderValues.applyChanges(row.id, "price");
                                }
                            }}
                        />
                    ) : (
                        <div
                            className="tooltip-icon-container"
                            onClick={() => {
                                if (isRecurring) {
                                    modalProviderValues.setSelectedExpenseForPriceChange(row);
                                    modalProviderValues.setPriceChangeType("expense");
                                    modalProviderValues.setIsModalPriceChangeOpen(true);
                                    return;
                                }

                                expensesProviderValues.setEditingField({ id: row.id, field: "price" });
                                expensesProviderValues.setEditPrice(
                                    String(row.price).replace(",", ".")
                                );
                            }}
                            data-tooltip="Edit price"
                        >
                            € {isRecurring ? getEffectivePrice(row) : row.price}
                        </div>
                    )}
                </td>

                <td>
                    <div className="action-buttons">
                        <button
                            type="button"
                            className="edit-btn"
                            onClick={() => {
                                expensesProviderValues.setIsDescriptionShown(true);
                                expensesProviderValues.setCurrentDescriptionId(row.id);
                            }}
                            data-tooltip="Add description"
                        >
                            <i className="material-icons">edit</i>
                        </button>

                        <button
                            type="button"
                            className={`recurring-btn ${isRecurring ? "active" : ""}`}
                            onClick={() => {
                                if (!isRecurring) {
                                    modalProviderValues.setSelectedExpenseForRecurring(row.id);
                                    modalProviderValues.setIsModalRecurringOpen(true);
                                }
                            }}
                            data-tooltip={isRecurring ? "Already recurring" : "Make recurring"}
                            disabled={isRecurring}
                        >
                            <i className="material-icons">repeat</i>
                        </button>

                        <button
                            type="button"
                            className="copy-btn"
                            onClick={() => expensesProviderValues.copyExpense(row.id)}
                            data-tooltip="Copy expense"
                        >
                            <i className="material-icons">content_copy</i>
                        </button>

                        <button
                            type="button"
                            className="delete-btn"
                            onClick={() => expensesProviderValues.deleteExpense(row.id)}
                            data-tooltip="Delete expense"
                        >
                            <i className="material-icons">delete</i>
                        </button>

                        <div className="receipt-actions">
                            <input
                                type="file"
                                id={`receipt-input-${row.id}`}
                                accept="image/*,.pdf"
                                style={{ display: "none" }}
                                onChange={e => {
                                    const file = e.target.files[0];
                                    if (file) expensesProviderValues.attachReceipt(row.id, file);
                                }}
                            />

                            <button
                                type="button"
                                className={`attach-btn ${
                                    expensesProviderValues.receipts[row.id] ? "has-receipt" : ""
                                }`}
                                onClick={() => {
                                    document.getElementById(`receipt-input-${row.id}`)?.click();
                                }}
                                data-tooltip={
                                    expensesProviderValues.receipts[row.id]
                                        ? "Receipt attached"
                                        : "Attach receipt"
                                }
                            >
                                <i className="material-icons">
                                    {expensesProviderValues.receipts[row.id]
                                        ? "check_circle"
                                        : "attach_file"}
                                </i>
                            </button>

                            {expensesProviderValues.receipts[row.id] && (
                                <button
                                    type="button"
                                    className="remove-receipt-btn"
                                    onClick={e => {
                                        e.stopPropagation();
                                        expensesProviderValues.removeReceipt(row.id);
                                    }}
                                    title="Remove receipt"
                                >
                                    <i className="material-icons">close</i>
                                </button>
                            )}
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <React.Fragment>
            <SortContext.Provider value={sortProviderValues}>
                <div className="expenses-wrapper">
                    <div className="expenses-table-container">
                        <div className="expenses-header">
                            <h2 className="expenses-title">Expenses</h2>

                            <div className="header-actions">
                                {!modalProviderValues.isModalSortOpen && authProviderValues.isLoggedIn && (
                                    <button
                                        type="button"
                                        className="sort-btn"
                                        onClick={() => modalProviderValues.setIsModalSortOpen(true)}
                                    >
                                        <i className="material-icons">swap_vert</i>
                                    </button>
                                )}

                                <SortContext.Provider value={sortProviderValues}>
                                    <Sort />
                                </SortContext.Provider>

                                {!filterProviderValues.isFilterOpen && authProviderValues.isLoggedIn && (
                                    <button
                                        type="button"
                                        className="filter-btn"
                                        onClick={() => filterProviderValues.setIsFilterOpen(true)}
                                    >
                                        <i className="material-icons">filter_list</i>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="table-scroll-wrapper recurring">
                            <table className="expenses-table">
                                <thead>
                                    {authProviderValues.isLoggedIn && recurringRows.length > 0 && (
                                        <tr className="section-header">
                                            <th colSpan={6}>
                                                <div
                                                    className="section-title"
                                                    onClick={() =>
                                                        setIsRecurringCollapsed(!isRecurringCollapsed)
                                                    }
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <i className="material-icons">repeat</i>
                                                    Recurring Expenses
                                                    <i
                                                        className="material-icons toggle-icon"
                                                        style={{ marginLeft: "auto" }}
                                                    >
                                                        {isRecurringCollapsed
                                                            ? "expand_more"
                                                            : "expand_less"}
                                                    </i>
                                                </div>
                                            </th>
                                        </tr>
                                    )}

                                    {authProviderValues.isLoggedIn && (
                                        <tr>
                                            <th>CATEGORY</th>
                                            <th>EXPENSE</th>
                                            <th>DATE</th>
                                            <th>FREQUENCY</th>
                                            <th>PRICE €</th>
                                            <th>ACTIONS</th>
                                        </tr>
                                    )}
                                </thead>

                                <tbody>
                                    {authProviderValues.isLoggedIn ? (
                                        recurringRows.length > 0 || regularRows.length > 0 ? (
                                            !isRecurringCollapsed &&
                                            recurringRows.map(row => (
                                                <ExpenseRow key={row.id} row={row} />
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    style={{ textAlign: "center", color: "#888" }}
                                                >
                                                    {expensesProviderValues.rows.length > 0
                                                        ? "No data for specified filter"
                                                        : "No data. Please enter expenses"}
                                                </td>
                                            </tr>
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                style={{ textAlign: "center", color: "#888" }}
                                            >
                                                No data. Please log in
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {authProviderValues.isLoggedIn && (
                            <div
                                className={`table-scroll-wrapper onetime${
                                    regularRows.length === 0 ? " no-regular" : ""
                                }`}
                            >
                                <table className="expenses-table">
                                    <thead>
                                        {regularRows.length > 0 && (
                                            <tr className="section-header">
                                                <th colSpan={6}>
                                                    <div
                                                        className="section-title"
                                                        onClick={() =>
                                                            setIsRegularCollapsed(!isRegularCollapsed)
                                                        }
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        <i className="material-icons">receipt</i>
                                                        One-time Expenses
                                                        <i
                                                            className="material-icons toggle-icon"
                                                            style={{ marginLeft: "auto" }}
                                                        >
                                                            {isRegularCollapsed
                                                                ? "expand_more"
                                                                : "expand_less"}
                                                        </i>
                                                    </div>
                                                </th>
                                            </tr>
                                        )}
                                        <tr>
                                            <th>CATEGORY</th>
                                            <th>EXPENSE</th>
                                            <th>DATE</th>
                                            <th>FREQUENCY</th>
                                            <th>PRICE €</th>
                                            <th>ACTIONS</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {regularRows.length > 0 &&
                                            !isRegularCollapsed &&
                                            regularRows.map(row => (
                                                <ExpenseRow key={row.id} row={row} />
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* This must be the only add-expense form in all responsive layouts. */}
                        {authProviderValues.isLoggedIn && (
                            <div className="add-expense-row" ref={addExpenseRowRef}>
                                <div className="add-expense-field">
                                    <label htmlFor="add-category">Category</label>
                                    <select
                                        id="add-category"
                                        value={expensesProviderValues.selectedCategory}
                                        onChange={e =>
                                            expensesProviderValues.setSelectedCategory(e.target.value)
                                        }
                                    >
                                        <option value="all">Select Category</option>
                                        {(Array.isArray(expensesProviderValues.categories)
                                            ? expensesProviderValues.categories
                                            : []
                                        )
                                            .slice()
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="add-expense-field">
                                    <label htmlFor="add-expense">Expense</label>
                                    {expensesProviderValues.selectedCategoryObj?.name ===
                                    "Miscellaneous" ? (
                                        <input
                                            id="add-expense"
                                            type="text"
                                            placeholder="Enter expense name"
                                            value={expensesProviderValues.miscExpense}
                                            onChange={e =>
                                                expensesProviderValues.setMiscExpense(e.target.value)
                                            }
                                        />
                                    ) : (
                                        <>
                                            <select
                                                id="add-expense"
                                                value={expensesProviderValues.selectedExpense}
                                                onChange={e => {
                                                    expensesProviderValues.setSelectedExpense(e.target.value);
                                                    expensesProviderValues.setCustomExpenseName(
                                                        e.target.value === "all" ? "" : e.target.value
                                                    );
                                                }}
                                            >
                                                <option value="all">Select Expense</option>
                                                {(Array.isArray(expensesProviderValues.expenses)
                                                    ? expensesProviderValues.expenses
                                                    : []
                                                )
                                                    .filter(
                                                        expense =>
                                                            expensesProviderValues.selectedCategory === "all" ||
                                                            String(expense.category) ===
                                                                String(
                                                                    expensesProviderValues.selectedCategory
                                                                )
                                                    )
                                                    .slice()
                                                    .sort((a, b) => a.name.localeCompare(b.name))
                                                    .map(expense => (
                                                        <option key={expense.id} value={expense.name}>
                                                            {expense.name}
                                                        </option>
                                                    ))}
                                            </select>

                                            {expensesProviderValues.selectedExpense !== "all" && (
                                                <input
                                                    type="text"
                                                    placeholder="Edit expense name..."
                                                    value={expensesProviderValues.customExpenseName}
                                                    onChange={e =>
                                                        expensesProviderValues.setCustomExpenseName(e.target.value)
                                                    }
                                                />
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="add-expense-field">
                                    <label htmlFor="add-date">Date</label>
                                    <input
                                        id="add-date"
                                        type="date"
                                        value={expensesProviderValues.paymentDate}
                                        onChange={e =>
                                            expensesProviderValues.setPaymentDate(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="add-expense-field">
                                    <label htmlFor="add-frequency">Frequency</label>
                                    <select
                                        id="add-frequency"
                                        value={expensesProviderValues.expenseFrequency || "once"}
                                        onChange={e => {
                                            expensesProviderValues.setExpenseFrequency(e.target.value);
                                            expensesProviderValues.setIsExpenseRecurring(
                                                e.target.value !== "once"
                                            );
                                        }}
                                    >
                                        <option value="once">One-time</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>

                                <div className="add-expense-field">
                                    <label htmlFor="add-price">Price</label>
                                    <CurrencyInput
                                        id="add-price"
                                        placeholder="0,00"
                                        decimalsLimit={2}
                                        decimalSeparator=","
                                        groupSeparator="."
                                        prefix="€ "
                                        allowDecimals
                                        inputMode="decimal"
                                        value={expensesProviderValues.price}
                                        onValueChange={value =>
                                            expensesProviderValues.setPrice(value || "")
                                        }
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="add-expense-save-btn"
                                    onClick={expensesProviderValues.handleSave}
                                >
                                    <i className="material-icons">add</i>
                                    Add Expense
                                </button>
                            </div>
                        )}

                        {authProviderValues.isLoggedIn && (
                            <div className="primary-actions">
                                <ReceiptScanner />

                                <button
                                    type="button"
                                    className="header-add-expense-btn"
                                    onClick={handleAddExpenseClick}
                                >
                                    <i className="material-icons">add_circle</i>
                                    <span>Add New Expense</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </SortContext.Provider>
        </React.Fragment>
    );
};

export { Expenses };
