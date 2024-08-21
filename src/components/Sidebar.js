import React, { useState } from 'react';
import SidebarItem from './SidebarItem';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const [selectedItem, setSelectedItem] = useState(null); // 선택된 항목 상태

  const handleItemClick = (item) => {
    // 이미 선택된 항목을 클릭하면 선택 해제
    setSelectedItem(selectedItem === item ? null : item);
  };

  return (
    <div>
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-content">
          <SidebarItem 
            title="매출" 
            subItems={[{ title: '연매출보기', path: '/salespage' }]} 
            isOpen={selectedItem === '매출'} // 선택된 항목일 때만 하위 메뉴 열기
            onClick={() => handleItemClick('매출')} 
            isSelected={selectedItem === '매출'} 
          /> 
          <SidebarItem 
            title="재고" 
            subItems={[{ title: '재고현황보기', path: '/stock' }]} 
            isOpen={selectedItem === '재고'} 
            onClick={() => handleItemClick('재고')} 
            isSelected={selectedItem === '재고'} 
          />
          <SidebarItem 
            title="발주" 
            subItems={[
              { title: '발주신청', path: '/orders' },
              { title: '발주내역', path: '/ordershistory' },
            ]} 
            isOpen={selectedItem === '발주'} 
            onClick={() => handleItemClick('발주')} 
            isSelected={selectedItem === '발주'} 
          />
          <SidebarItem 
            title="검수" 
            subItems={[
              { title: '검수하기', path: '/inspection' },
              { title: '검수내역', path: '/inspectionhistory' },
            ]} 
            isOpen={selectedItem === '검수'} 
            onClick={() => handleItemClick('검수')} 
            isSelected={selectedItem === '검수'} 
          />
          <SidebarItem 
            title="상품관리" 
            subItems={[{ title: '상품관리', path: '/productmanagement' }]} 
            isOpen={selectedItem === '상품관리'} 
            onClick={() => handleItemClick('상품관리')} 
            isSelected={selectedItem === '상품관리'} 
          />
          <SidebarItem 
            title="CCTV" 
            subItems={[{ title: 'CCTV보기', path: '/cctv' }]} 
            isOpen={selectedItem === 'CCTV'} 
            onClick={() => handleItemClick('CCTV')} 
            isSelected={selectedItem === 'CCTV'} 
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
