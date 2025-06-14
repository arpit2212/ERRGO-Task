// App.js
import { Outlet } from 'react-router-dom';
import TopNavbar from './components/TopNavbar';
import { useState } from 'react';
import Sidebar from './components/Sidebar';

export default function App() {
    const [sidebarVisible, setSidebarVisible] = useState(true);

    const toggleSidebar = (): void => {
        setSidebarVisible(prevState => !prevState);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <TopNavbar toggleSidebar={toggleSidebar} />
            
            <div className="flex flex-1 pt-16">
                {sidebarVisible && (
                    <div className="w-64 bg-white shadow-lg">
                        <Sidebar />
                    </div>
                )}
                
                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
