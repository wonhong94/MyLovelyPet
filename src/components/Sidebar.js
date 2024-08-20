import React from 'react';
import SidebarItem from './SidebarItem';
import './Sidebar.css';

// Sidebar 컴포넌트는 사이드바 메뉴를 렌더링합니다.
const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-content">
        {/* SidebarItem 컴포넌트를 사용하여 각 메인 메뉴와 하위 메뉴를 정의합니다. */}
        <SidebarItem title="매출" subItems={[
          { title: '연매출보기', path: '/sales-page' },
          // { title: '연매출보기', path: '/yearly-sales' },
        ]} isOpen={isOpen} />
        <SidebarItem title="재고" subItems={[
          { title: '재고현황보기', path: '/stock' },
        ]} isOpen={isOpen} />
        <SidebarItem title="발주" subItems={[
          { title: '발주신청', path: '/orders' },
          { title: '발주내역', path: '/ordershistory' },
        ]} isOpen={isOpen} />
        <SidebarItem title="검수" subItems={[
          { title: '검수하기', path: '/inspection' },
          { title: '검수내역', path: '/inspectionhistory' },
        ]} isOpen={isOpen} />
        <SidebarItem title="상품관리" subItems={[
          { title: '상품관리', path: '/productmanagement' },
          
        ]} isOpen={isOpen} />
        <SidebarItem title="CCTV" subItems={[
          { title: 'CCTV보기', path: '/cctv' },
        ]} isOpen={isOpen} />
      </div>
    </div>
  );
};

export default Sidebar;