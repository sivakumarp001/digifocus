import { Outlet } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

function LayoutContent() {
    const { isOpen, closeSidebar } = useSidebar();

    return (
        <div className="app-layout">
            <Sidebar />
            {isOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
            <div className="main-content">
                <Navbar />
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default function Layout() {
    return (
        <SidebarProvider>
            <LayoutContent />
        </SidebarProvider>
    );
}
