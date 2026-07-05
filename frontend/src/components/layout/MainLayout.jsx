import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import GlobalConsistencyModal from '../analytics/GlobalConsistencyModal';
import SarathiBot from '../sarathi/SarathiBot';
import { useSelector, useDispatch } from 'react-redux';
import { useLoading } from '../loader/LoaderContext';
import React, { useEffect, useState, useRef } from 'react';
import { BranchApi } from '../../services/api/Branch.api';
import { SubscriptionApi } from '../../services/api/Subscription.api';
import { setActiveBranch, updateCurrentUser } from '../../store/slices/storeSlice';
import { IoTimerOutline } from 'react-icons/io5';

const MainLayout = () => {
    const { activeBranch, currentUser, globalSettings } = useSelector((state) => state.store);
    const { handleLoading } = useLoading();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const [timeRemaining, setTimeRemaining] = useState(currentUser?.invitationTimeRemaining || 0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const timerRef = useRef(null);
    const syncRef = useRef(null);

    // Auto-clear loader and close sidebar on page transitions to prevent "stuck" states
    useEffect(() => {
        handleLoading(false);
        setSidebarOpen(false);
    }, [location.pathname]);

    // Subscription Gate & Redirect Logic
    useEffect(() => {
        if (!currentUser) return;

        const isPricingPage = location.pathname === '/pricing';
        const isPaid = currentUser.subscriptionType === 'paid';
        const hasTime = (currentUser.invitationTimeRemaining || 0) > 0;
        const isAdmin = currentUser.email === "balajiaadi2000@gmail.com";

        if (!isPaid && !hasTime && !isPricingPage && !isAdmin) {
            navigate('/pricing', { replace: true });
        }
    }, [currentUser, location.pathname, navigate]);

    // Invitation Timer Logic
    useEffect(() => {
        if (currentUser?.subscriptionType !== 'paid' && (currentUser?.invitationTimeRemaining || 0) > 0) {
            setTimeRemaining(currentUser.invitationTimeRemaining);
            
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        navigate('/pricing', { replace: true });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Periodically sync time with server (every 30s)
            syncRef.current = setInterval(async () => {
                try {
                    // Get latest time from state
                    setTimeRemaining(current => {
                        SubscriptionApi.syncTime(current);
                        return current;
                    });
                } catch (e) { console.error("Sync failed", e); }
            }, 30000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (syncRef.current) clearInterval(syncRef.current);
        };
    }, [currentUser?.subscriptionType, currentUser?.invitationTimeRemaining, navigate]);

    useEffect(() => {
        const handleDefaultBranch = async () => {
            // Only attempt if authenticated but no branch selected
            if (currentUser && !activeBranch) {
                try {
                    const res = await BranchApi.getAllBranches();
                    const branches = res.data?.data || [];
                    
                    if (branches.length > 0) {
                        // Look for "Software Development"
                        const defaultBranch = branches.find(b => b.name?.toLowerCase() === "software development");
                        if (defaultBranch) {
                            dispatch(setActiveBranch(defaultBranch));
                            return; // Success
                        }
                    }
                } catch (error) {
                    console.error("Auto-branch selection failed", error);
                }
            }
            
            // Final fallback: redirect if still no branch
            if (!activeBranch && !['/branch', '/pricing'].includes(location.pathname)) {
                navigate('/branch', { replace: true });
            }
        };

        handleDefaultBranch();
    }, [activeBranch, currentUser, location.pathname, navigate, dispatch]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex h-full w-full bg-bgLight font-sans text-textMain overflow-hidden">
            {activeBranch && <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}
            
            {/* Backdrop overlay for mobile */}
            {activeBranch && sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[140] lg:hidden transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            <div className={`flex-1 ${activeBranch ? 'lg:ml-72' : ''} flex flex-col h-full overflow-hidden relative transition-all duration-300`}>
                {activeBranch && <Header toggleSidebar={() => setSidebarOpen(prev => !prev)} />}
                
                <main className={`flex-1 ${location.pathname === '/notes' ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 sm:p-8'}`}>
                    <Outlet />
                </main>

                {/* Invitation Timer Sticky UI */}
                {globalSettings?.subscriptionType === 'paid' && currentUser?.subscriptionType !== 'paid' && timeRemaining > 0 && location.pathname !== '/pricing' && currentUser?.email !== "balajiaadi2000@gmail.com" && (
                    <div className="fixed bottom-8 right-8 z-[90] flex items-center gap-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${timeRemaining < 60 ? 'bg-rose-500 animate-pulse' : 'bg-primary'} text-white`}>
                            <IoTimerOutline size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invitation Access</p>
                            <p className={`text-xl font-black italic tracking-tight ${timeRemaining < 60 ? 'text-rose-500' : 'text-white'}`}>
                                {formatTime(timeRemaining)}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Global Modals */}
            <GlobalConsistencyModal />
            <SarathiBot />
        </div>
    );
};

export default MainLayout;
