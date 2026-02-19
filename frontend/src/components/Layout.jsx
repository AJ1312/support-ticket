import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import '../App.css';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    const isLoggedIn = !!localStorage.getItem('access_token');

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/admin/login');
    };

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="nav-brand">
                    <h1>TicketSystem</h1>
                </div>
                <div className="nav-links">
                    {!isAdmin && (
                        <>
                            <Link to="/" className="nav-link">Home</Link>
                            <Link to="/admin" className="nav-link">Admin Panel</Link>
                        </>
                    )}
                    {isAdmin && (
                        <>
                            <Link to="/" className="nav-link">Public Site</Link>
                            {isLoggedIn && (
                                <button onClick={handleLogout} className="nav-btn logout-btn">
                                    Logout
                                </button>
                            )}
                        </>
                    )}
                </div>
            </nav>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
