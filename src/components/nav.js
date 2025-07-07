import React, { useEffect, useState, useRef } from "react";
import logo from "../../logo.svg";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { FaUser, FaChevronDown, FaUserCircle, FaQuestionCircle, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';

const menuItemStyle = { padding: '12px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: '#222', fontWeight: 500, transition: 'background 0.15s', borderRadius: 8 };
const iconStyle = { fontSize: 18, color: '#1e90ff' };

export default function NavBar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  const toggleDropdown = () => {
    setOpen(!open);
  };

  return (
    <div className="navbar">
      <div className="logo" onClick={() => navigate("/")}>
        <img src={logo} alt="Logo" />
      </div>
      <div className="menu-items">
        <div style={menuItemStyle} onClick={() => navigate("/profile")}>
          <FaUser style={iconStyle} />
          Profile
        </div>
        <div style={menuItemStyle} onClick={() => navigate("/help")}>
          <FaQuestionCircle style={iconStyle} />
          Help
        </div>
        <div style={menuItemStyle} onClick={toggleDropdown}>
          <FaChevronDown style={iconStyle} />
          More
        </div>
        {open && (
          <div className="dropdown-menu" ref={dropdownRef}>
            <div style={menuItemStyle} onClick={() => navigate("/settings")}>
              <FaUserCircle style={iconStyle} />
              Settings
            </div>
            <div style={menuItemStyle} onClick={handleSignOut}>
              <FaSignOutAlt style={iconStyle} />
              Sign Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
}