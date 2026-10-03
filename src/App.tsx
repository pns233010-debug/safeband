import React, { useState } from 'react';
import { SafeBandProvider, useSafeBand } from './context/SafeBandContext';
import { AuthView } from './components/auth/AuthView';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { HealthMonitoringView } from './components/health/HealthMonitoringView';
import { FallDetectionView } from './components/fall/FallDetectionView';
import { EmergencyAlertView } from './components/emergency/EmergencyAlertView';
import { GpsTrackingView } from './components/gps/GpsTrackingView';
import { DeviceStatusView } from './components/device/DeviceStatusView';
import { SimulationPanel } from './components/simulation/SimulationPanel';
import { ActiveAlertOverlay } from './components/emergency/ActiveAlertOverlay';
import {
  Menu,
  X,
  Activity,
  HeartPulse,
  ShieldAlert,
  AlertOctagon,
  Navigation,
  Cpu,
  FlaskConical,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    currentUser,
    isAuthLoading,
    activeTab,
    setActiveTab,
    isSimulationOpen,
    setIsSimulationOpen,
    fallData,
    emergencyAlert,
  } = useSafeBand();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show loading indicator while Firebase checks initial authentication state
  if (isAuthLoading) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center font-sans text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-xs text-slate-400 font-mono tracking-wide">
            Verifying Firebase Authentication...
          </div>
        </div>
      </div>
    );
  }

  // If user is logged out, show the Login/Register screen
  if (!currentUser) {
    return <AuthView />;
  }

  const isEmergency = !!emergencyAlert?.active || fallData.state === 'countdown_active';

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OverviewDashboard />;
      case 'health':
        return <HealthMonitoringView />;
      case 'fall':
        return <FallDetectionView />;
      case 'emergency':
        return <EmergencyAlertView />;
      case 'gps':
        return <GpsTrackingView />;
      case 'device':
        return <DeviceStatusView />;
      case 'simulation':
        return <SimulationPanel />;
      default:
        return <OverviewDashboard />;
    }
  };

  const mobileNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'health', label: 'Vitals', icon: HeartPulse },
    { id: 'fall', label: 'Fall Guard', icon: ShieldAlert },
    { id: 'emergency', label: 'SOS', icon: AlertOctagon },
    { id: 'gps', label: 'GPS', icon: Navigation },
    { id: 'simulation', label: 'Test Sim', icon: FlaskConical },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Desktop & Tablet Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Drawer Navigation Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 h-full bg-slate-900 border-r border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <span className="font-bold text-sm text-white">SafeBand Menu</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Viewport Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header Bar */}
        <div className="md:hidden h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm text-white">SafeBand</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              PRO
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSimulationOpen(true)}
              className="px-2 py-1 rounded bg-cyan-950 border border-cyan-800 text-[11px] text-cyan-300 font-mono"
            >
              SIM
            </button>
          </div>
        </div>

        {/* Desktop Sticky Header */}
        <TopHeader onOpenSimulation={() => setIsSimulationOpen(true)} />

        {/* Scrollable Main Workspace */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-6 focus:outline-none">
          {renderActiveView()}
        </main>

        {/* Mobile Bottom Quick-Nav Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-slate-900/95 border-t border-slate-800 flex items-center justify-around px-2 z-30 backdrop-blur-md">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'simulation') {
                    setIsSimulationOpen(true);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`flex flex-col items-center justify-center p-1 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Global Fall Detection 30s Countdown & SOS Overlay */}
      <ActiveAlertOverlay />

      {/* Global Simulation Floating Modal (When opened from TopHeader/Mobile) */}
      {isSimulationOpen && activeTab !== 'simulation' && (
        <SimulationPanel isModal onClose={() => setIsSimulationOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <SafeBandProvider>
      <MainAppContent />
    </SafeBandProvider>
  );
}
