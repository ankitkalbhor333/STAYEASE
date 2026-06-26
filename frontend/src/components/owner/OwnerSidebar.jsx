import React from "react";

export default function OwnerSidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "active-listings", label: "Active Listings", icon: "🟢" },
    { id: "inactive-listings", label: "Inactive Listings", icon: "🔴" },
    { id: "draft-rooms", label: "Draft Rooms", icon: "📝" },
    { id: "pending-rooms", label: "Pending Rooms", icon: "⏳" },
    { id: "create-listing", label: "Create Listing", icon: "➕" },
    { id: "bookings", label: "Bookings", icon: "📅" },
    { id: "earnings", label: "Earnings", icon: "💰" },
    { id: "analytics", label: "Analytics", icon: "📈" },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 md:min-h-[calc(100vh-65px)] flex flex-col">
      <div className="p-4 border-b border-slate-100 hidden md:block">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hosting Menu</p>
      </div>
      
      {/* Scrollable menu items */}
      <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible md:overflow-y-auto p-2 gap-1 scrollbar-none">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 whitespace-nowrap md:w-full ${
                isActive
                  ? "bg-[#B40032] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
