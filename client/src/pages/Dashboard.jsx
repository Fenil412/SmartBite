import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HomePage from "./HomePage";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("meal");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          closeSidebar={closeSidebar}
        />
        <HomePage activeTab={activeTab} />
      </div>
      
      <Footer />
    </div>
  );
}