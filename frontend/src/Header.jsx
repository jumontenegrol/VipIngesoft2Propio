import { Link, useNavigate } from "react-router-dom";
import { rolePermissions } from "./context/role_management";
import PropTypes from "prop-types";

const Header = ({ rol ,view }) => {

    const navigate = useNavigate();
    const handleSignOut = () => {
    navigate("/");
    };

    const permissions = rolePermissions[rol]?.canAcces || [];

    return (
        <header className="report-header go-front">
            <div className="header-buttons">
                { permissions.includes("statitics") && (
                    <Link to="/statistics">
                        <button className="header-btn"
                        disabled={view === "statistics"}
                        >See the statistics</button>
                    </Link>
                )}   
                { permissions.includes("report") && (    
                    <Link to="/report">
                        <button className="header-btn"
                        disabled={view === "report"}
                        >Make a report</button>
                    </Link>
                )}
                { permissions.includes("map") && (
                    <Link to = "/map">
                        <button className="header-btn"
                        disabled={view === "map"}
                        >See the map</button>
                    </Link>
                )}
                <button className="header-btn" onClick={handleSignOut} disabled = {false}>
                    Sign Out
                </button>

            </div>
            <div className="logo-wrapper">
                <span className="logo">CACVi-UN</span>
            </div>
        </header>
    );
}

Header.propTypes = {
    rol: PropTypes.string.isRequired,
    view: PropTypes.string.isRequired,
};

export default Header;