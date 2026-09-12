import React, { useEffect, useState } from 'react';
import { IoSettingsOutline, IoShieldCheckmarkOutline, IoCalendarOutline, IoCardOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { BranchApi } from '../services/api/Branch.api';
import { useSelector } from 'react-redux';

const SettingsGlobal = () => {
    const { currentUser } = useSelector((state) => state.store);
    const isAdmin = currentUser?.email === "balajiaadi2000@gmail.com" ||
        currentUser?.userRole?.name?.toLowerCase() === "admin" ||
        currentUser?.role === "admin";

    const [subscription, setSubscription] = useState('free');
    const [subLoading, setSubLoading] = useState(false);

    useEffect(() => {
        if (isAdmin) fetchSubscription();
    }, [isAdmin]);

    const fetchSubscription = async () => {
        try {
            const res = await BranchApi.getGlobalSettings();
            setSubscription(res.data?.data?.subscriptionType || 'free');
        } catch (error) {
            console.error("Failed to fetch subscription settings", error);
        }
    };

    const handleSubscriptionChange = async (type) => {
        setSubLoading(true);
        try {
            await BranchApi.updateGlobalSettings({ subscriptionType: type });
            setSubscription(type);
            toast.success(`Subscription updated to ${type}`);
        } catch (error) {
            toast.error("Failed to update subscription");
        } finally {
            setSubLoading(false);
        }
    };

    return (
        <div className="min-h-full bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Page Title Header */}
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                            <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <IoSettingsOutline size={20} />
                            </span>
                            Settings
                        </h1>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Platform administration and global subscription configuration.</p>
                    </div>
                </div>

                {/* Content Panel */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 md:p-8 transition-colors">
                    {isAdmin ? (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-base font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                                    <IoShieldCheckmarkOutline className="text-primary" size={18} />
                                    <span>Subscription & Access Control</span>
                                </h2>
                                <p className="text-xs font-medium text-slate-400 dark:text-slate-400 mt-0.5">Set the global access tier for learners across all tracks.</p>
                            </div>

                            <div className="space-y-3">
                                <button 
                                    type="button"
                                    disabled={subLoading}
                                    onClick={() => handleSubscriptionChange('free')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${subscription === 'free' ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/20 shadow-xs' : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/50'}`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${subscription === 'free' ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                                            <IoShieldCheckmarkOutline size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xs font-bold text-slate-800 dark:text-white">Free Access</h3>
                                                {subscription === 'free' && (
                                                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">Active</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Open access for all registered learners across all DSA and LLD learning modules.</p>
                                        </div>
                                    </div>
                                </button>

                                <button 
                                    type="button"
                                    disabled={subLoading}
                                    onClick={() => handleSubscriptionChange('1-year')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${subscription === '1-year' ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/20 shadow-xs' : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/50'}`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${subscription === '1-year' ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                                            <IoCalendarOutline size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xs font-bold text-slate-800 dark:text-white">1 Year Validity</h3>
                                                {subscription === '1-year' && (
                                                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">Active</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Learners retain active curriculum access for exactly 365 days from their registration date.</p>
                                        </div>
                                    </div>
                                </button>

                                <button 
                                    type="button"
                                    disabled={subLoading}
                                    onClick={() => handleSubscriptionChange('paid')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${subscription === 'paid' ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/20 shadow-xs' : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/50'}`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${subscription === 'paid' ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                                            <IoCardOutline size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xs font-bold text-slate-800 dark:text-white">Paid Model</h3>
                                                {subscription === 'paid' && (
                                                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">Active</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Enforces subscription checks on curriculum entries and directs non-subscribed users to pricing.</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Account Preferences</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Your account is managed under the Sarathi learning platform. Contact an administrator to update organizational privileges.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsGlobal;
