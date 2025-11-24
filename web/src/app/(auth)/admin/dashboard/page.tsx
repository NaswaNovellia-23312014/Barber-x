'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminData {
  id: string;
  username: string;
}

interface BookingStats {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0
  });
  const [revenue, setRevenue] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Cek apakah user sudah login
    const token = localStorage.getItem('barberx_admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Fetch admin data dan stats
    const fetchDashboardData = async () => {
      try {
        // Simulasi data admin
        const adminData: AdminData = {
          id: '1',
          username: 'admin'
        };
        
        // Simulasi stats (nanti bisa dari API)
        const statsData: BookingStats = {
          total: 24,
          pending: 8,
          completed: 14,
          cancelled: 2
        };

        setAdmin(adminData);
        setStats(statsData);
        setRevenue(2400000); // Rp 2.4 juta
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Handle untuk manage bookings
  const handleManageBookings = () => {
    console.log('Navigating to bookings management...');
    router.push('/admin/bookings');
  };

  // Handle untuk view services
  const handleViewServices = () => {
    console.log('Navigating to services management...');
    router.push('/admin/services');
  };

  // Handle untuk customer data
  const handleCustomerData = () => {
    console.log('Navigating to customer data...');
    // router.push('/admin/customers');
    alert('Customer data feature coming soon!');
  };

  // Handle untuk reports
  const handleReports = () => {
    console.log('Generating reports...');
    // Simulasi generate report
    alert('Report generation feature coming soon!');
  };

  // Handle untuk quick stats filter
  const handleStatsFilter = (filter: string) => {
    console.log(`Filtering by: ${filter}`);
    // Implement filter logic here
    alert(`Filtering bookings by: ${filter}`);
  };

  // Handle untuk refresh data
  const handleRefreshData = async () => {
    setLoading(true);
    try {
      // Simulasi refresh data
      console.log('Refreshing dashboard data...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update stats dengan data baru (simulasi)
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + 1
      }));
      
      alert('Dashboard data refreshed!');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      alert('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('barberx_admin_token');
      router.push('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                BARBER<span className="text-red-600">X</span> Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {admin?.username}</span>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefreshData}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Dashboard Admin
            </h2>
            
            {/* Stats Cards dengan Filter */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Bookings</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-sm text-gray-500 mt-2">+5 from last week</p>
                <button
                  onClick={() => handleStatsFilter('all')}
                  className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
                >
                  View All
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-gray-500 mt-2">Need confirmation</p>
                <button
                  onClick={() => handleStatsFilter('pending')}
                  className="mt-2 text-yellow-500 hover:text-yellow-700 text-sm"
                >
                  View Pending
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Completed</h3>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-sm text-gray-500 mt-2">This month</p>
                <button
                  onClick={() => handleStatsFilter('completed')}
                  className="mt-2 text-green-500 hover:text-green-700 text-sm"
                >
                  View Completed
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Revenue</h3>
                <p className="text-3xl font-bold text-purple-600">
                  Rp {revenue.toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-gray-500 mt-2">This month</p>
                <button
                  onClick={handleReports}
                  className="mt-2 text-purple-500 hover:text-purple-700 text-sm"
                >
                  View Report
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={handleManageBookings}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition duration-200 flex flex-col items-center justify-center"
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Manage Bookings
                </button>
                
                <button 
                  onClick={handleViewServices}
                  className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition duration-200 flex flex-col items-center justify-center"
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  View Services
                </button>
                
                <button 
                  onClick={handleCustomerData}
                  className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg transition duration-200 flex flex-col items-center justify-center"
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Customer Data
                </button>
                
                <button 
                  onClick={handleReports}
                  className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg transition duration-200 flex flex-col items-center justify-center"
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Reports
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>New booking from John Doe</span>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>Service &quot;Haircut&quot; updated</span>
                  <span className="text-sm text-gray-500">5 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>New customer registered</span>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}