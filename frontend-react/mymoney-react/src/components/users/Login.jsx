import React, { useContext, useEffect, useRef, useState } from "react";
import "../../styles/Login.scss";
import Modal from "../Modal";
import { AuthContext } from "../../context/AuthContext";
import { ModalContext } from "../../context/ModalContext";
import { FilterContext } from "../../context/FilterContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [resendMessage, setResendMessage] = useState("");
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const accountMenuRef = useRef(null);

    const authProviderValues = useContext(AuthContext);
    const modalProviderValues = useContext(ModalContext);
    const filterProviderValues = useContext(FilterContext);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get("verified") === "true") {
            modalProviderValues.setIsModalLoginOpen(true);
            window.history.replaceState({}, "", "/");
        }
    }, [modalProviderValues]);

    useEffect(() => {
        const handleClickOutside = event => {
            if (
                accountMenuRef.current &&
                !accountMenuRef.current.contains(event.target)
            ) {
                setIsAccountMenuOpen(false);
            }
        };

        const handleEscape = event => {
            if (event.key === "Escape") {
                setIsAccountMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const emptyTable = () => {
        filterProviderValues.setFilteredRows([]);
    };

    const handleLogout = () => {
        setIsAccountMenuOpen(false);
        filterProviderValues.setIsFilterOpen(false);
        emptyTable();
        authProviderValues.setIsLoggedIn(false);
        localStorage.setItem("isLoggedIn", "false");
    };

    const handleThemeClick = () => {
        // Theme behavior will be added later.
        setIsAccountMenuOpen(false);
    };

    return (
        <React.Fragment>
            <Modal
                isOpen={modalProviderValues.isModalLoginOpen}
                onClose={() => modalProviderValues.setIsModalLoginOpen(false)}
            >
                <div className="login-container">
                    <h2>Sign in</h2>

                    <form onSubmit={authProviderValues.handleLogin}>
                        <div className="form-group">
                            <label htmlFor="username">Username/e-mail:</label>
                            <input
                                id="username"
                                type="text"
                                value={authProviderValues.loginValue}
                                onChange={e => authProviderValues.setLoginValue(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password:</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                value={authProviderValues.loginPassword}
                                id="password"
                                name="password"
                                placeholder="Input password"
                                required
                                onChange={e => authProviderValues.setLoginPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="show-password-btn"
                                onClick={() => setShowPassword(value => !value)}
                                tabIndex={-1}
                            >
                                {showPassword ? <FaEyeSlash color="#fff" /> : <FaEye color="#fff" />}
                            </button>
                        </div>

                        <div>
                            <button type="submit" className="submit-login">
                                Login
                            </button>
                        </div>
                    </form>

                    {authProviderValues.message && (
                        <div
                            className={`login-message ${
                                authProviderValues.loginSuccess ? "login-message--success" : ""
                            }`}
                        >
                            {authProviderValues.message}
                        </div>
                    )}

                    {authProviderValues.unverifiedEmail && (
                        <div className="resend-verification-block">
                            <button
                                type="button"
                                className="resend-verification-btn"
                                onClick={async () => {
                                    setResendMessage("");

                                    try {
                                        const response = await fetch("/api/resend-verification/", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                email: authProviderValues.unverifiedEmail,
                                            }),
                                        });
                                        const data = await response.json();

                                        setResendMessage(
                                            response.ok
                                                ? "Verification email sent! Check your inbox."
                                                : data.error || "Failed to resend."
                                        );
                                    } catch {
                                        setResendMessage("Server error.");
                                    }
                                }}
                            >
                                Resend verification email
                            </button>
                            {resendMessage && <p className="resend-msg">{resendMessage}</p>}
                        </div>
                    )}

                    <p className="forgot-password-link">
                        <a
                            href="#"
                            onClick={event => {
                                event.preventDefault();
                                modalProviderValues.setIsModalLoginOpen(false);
                                modalProviderValues.setIsModalForgotPasswordOpen(true);
                            }}
                        >
                            Forgot password?
                        </a>
                    </p>

                    <p className="mt-3 text-center">
                        No account?
                        <a
                            href="#"
                            style={{ color: "#5865f2", marginLeft: "10px" }}
                            onClick={event => {
                                event.preventDefault();
                                modalProviderValues.setIsModalLoginOpen(false);
                                modalProviderValues.setIsModalRegistrationOpen(true);
                            }}
                        >
                            Sign up
                        </a>
                    </p>
                </div>
            </Modal>

            {!authProviderValues.isLoggedIn && !authProviderValues.isLoginFormShow && (
                <div className="loggedout">
                    <button
                        type="button"
                        className="login-btn"
                        onClick={() => {
                            modalProviderValues.setIsModalLoginOpen(true);
                            authProviderValues.setIsSignupMessageShown(true);
                        }}
                    >
                        Login
                    </button>
                </div>
            )}

            {authProviderValues.isLoggedIn && (
                <div className="loggedin" ref={accountMenuRef}>
                    <button
                        type="button"
                        className="greeting account-menu-trigger"
                        onClick={() => setIsAccountMenuOpen(value => !value)}
                        aria-haspopup="menu"
                        aria-expanded={isAccountMenuOpen}
                        aria-controls="account-menu"
                    >
                        <i className="material-icons">perm_identity</i>
                        <span>{authProviderValues.loginUsername}</span>
                        <i className="material-icons account-menu-arrow">
                            {isAccountMenuOpen ? "expand_less" : "expand_more"}
                        </i>
                    </button>

                    {isAccountMenuOpen && (
                        <div id="account-menu" className="account-menu" role="menu">
                            <button
                                type="button"
                                className="account-menu-item"
                                role="menuitem"
                                onClick={handleThemeClick}
                            >
                                <i className="material-icons">brightness_6</i>
                                <span>Light / Dark theme</span>
                            </button>

                            <button
                                type="button"
                                className="account-menu-item logout-menu-item"
                                role="menuitem"
                                onClick={handleLogout}
                            >
                                <i className="material-icons">logout</i>
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </React.Fragment>
    );
}

export { Login };
