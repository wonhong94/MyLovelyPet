import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SidebarItem.css';

const SidebarItem = ({ title, subItems, isOpen }) => {
  const [isSubmenuOpen, setSubmenuOpen] = useState(false);

  const handleMouseEnter = () => {
    setSubmenuOpen(true);
  };

  const handleMouseLeave = () => {
    setSubmenuOpen(false);
  };

  return (
    <div 
      className="sidebar-item" 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-title">
        {title}
      </div>
      {isOpen && isSubmenuOpen && (
        <ul className="sidebar-submenu">
          {subItems.map((subItem, index) => (
            <li key={index}>
              <Link to={subItem.path}>{subItem.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SidebarItem;
