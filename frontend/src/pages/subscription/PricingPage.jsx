import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    IoCheckmarkCircle, 
    IoFlashOutline, 
    IoShieldCheckmarkOutline, 
    IoTimeOutline, 
    IoWalletOutline, 
    IoCloseOutline, 
    IoCardOutline, 
    IoLockClosedOutline,
    IoArrowForwardOutline,
    IoChevronBackOutline
} from 'react-icons/io5';
import { SubscriptionApi } from '../../services/api/Subscription.api';
import { useDispatch, useSelector } from 'react-redux';
import { updateCurrentUser } from '../../store/slices/storeSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PricingPage = () => {
    const { currentUser } = useSelector((state) => state.store);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [step, setStep] = useState('plans'); // plans, checkout, processing
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', name: '' });

    const plans = [
        {
            id: 'invitation',
            name: 'Trial Access',
            price: '0',
            duration: '5 Mins',
            description: 'Temporary access to explore all features.',
            features: ['Full Dashboard Access', 'Project Creation', 'Task Management', '5 Minutes Limit'],
            color: 'from-slate-400 to-slate-600',
            popular: false
        },
        {
            id: 'monthly',
            name: 'Sarathi Monthly',
            price: '199',
            duration: '1 Month',
            description: 'Perfect for individual focus sprints.',
            features: ['Unlimited Projects', 'Priority Support', 'Cloud Sync', 'No Time Limits'],
            color: 'from-vermilion-500 to-orange-600',
            popular: false
        },
        {
            id: 'half-yearly',
            name: 'Productivity Pro',
            price: '1199',
            duration: '6 Months',
            description: 'Sustain your focus over time.',
            features: ['All Monthly Features', 'Advanced Analytics', 'Performance Reports', 'Save 15%'],
            color: 'from-violet-500 to-purple-600',
            popular: true
        },
        {
            id: 'yearly',
            name: 'Elite Annual',
            price: '1999',
            duration: '1 Year',
            description: 'The ultimate productivity commitment.',
            features: ['All Pro Features', 'Beta Access', 'Lifetime Archive', 'Save 20%'],
            color: 'from-amber-400 to-orange-600',
            popular: false
        }
    ];

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        if (plan.id === 'invitation') {
            processPayment('completed');
        } else {
            setStep('checkout');
        }
    };

    const processPayment = async (status = 'completed') => {
        setLoading(true);
        setStep('processing');
        
        try {
            const orderRes = await SubscriptionApi.createOrder({ 
                plan: selectedPlan.id, 
                amount: parseInt(selectedPlan.price) 
            });
            
            await new Promise(resolve => setTimeout(resolve, 2500));

            const verifyRes = await SubscriptionApi.verifyPayment({ 
                transactionId: orderRes.data?.data?.transactionId, 
                status: status,
                gatewayToken: "SARATHI_SECURE_PAY_" + Math.random().toString(36).substring(7).toUpperCase()
            });
            
            dispatch(updateCurrentUser(verifyRes.data?.data));
            toast.success(selectedPlan.id === 'invitation' ? "Temporary access granted!" : "Subscription activated successfully!");
            navigate('/branch');
        } catch (error) {
            toast.error(error.response?.data?.message || "Payment failed at gateway");
            setStep('checkout');
        } finally {
            setLoading(false);
        }
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.slice(i, i + 4));
        }
        if (parts.length) return parts.join(' ');
        return value;
    };

    return (
        <div className="min-h-full bg-slate-50 text-slate-800 p-6 sm:p-12 overflow-y-auto custom-scrollbar relative font-sans">
            <style>{`
                .text-gradient {
                    background: linear-gradient(135deg, #E34234 0%, #FF7F50 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>

            <AnimatePresence mode="wait">
                {step === 'plans' && (
                    <motion.div 
                        key="plans"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-7xl mx-auto"
                    >
                        <header className="text-center mb-16 mt-4">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vermilion-50 border border-vermilion-100 mb-6"
                            >
                                <IoFlashOutline className="text-vermilion-600" size={14} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-vermilion-600">Sarathi Premium</span>
                            </motion.div>
                            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-slate-900 leading-[1.1]">
                                Choose your <span className="text-gradient">Power Level.</span>
                            </h1>
                            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                                Professional-grade task management and analytics for elite performers. 
                                Secure your focus with our dedicated isolation infrastructure.
                            </p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {plans.map((plan, idx) => (
                                <motion.div
                                    key={plan.id}
                                    whileHover={{ y: -8 }}
                                    className={`relative bg-white border ${plan.popular ? 'border-primary shadow-xl' : 'border-slate-100'} p-8 rounded-[2.5rem] flex flex-col group transition-all duration-300`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                            Most Popular
                                        </div>
                                    )}
                                    
                                    <div className="mb-6">
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight">{plan.name}</h3>
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{plan.description}</p>
                                    </div>

                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-slate-900">₹{plan.price}</span>
                                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">/ {plan.duration}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8 flex-grow">
                                        {plan.features.map((feature, fidx) => (
                                            <div key={fidx} className="flex items-start gap-2.5">
                                                <IoCheckmarkCircle className="text-primary mt-0.5 shrink-0" size={16} />
                                                <span className="text-slate-600 text-[13px] font-bold leading-tight">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handleSelectPlan(plan)}
                                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] ${
                                            plan.popular 
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primaryHover' 
                                            : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
                                        }`}
                                    >
                                        {plan.id === 'invitation' ? 'Get Started Free' : 'Choose Plan'}
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        {/* Social Proof */}
                        <div className="mt-20 py-12 border-t border-slate-100 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8">Secure Payments via Stripe</p>
                            <div className="flex flex-wrap justify-center items-center gap-10 opacity-40 grayscale">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5a/Stripe_Logo%2C_revised_2016.svg" className="h-5" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-5" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-7" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-5" />
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'checkout' && (
                    <motion.div 
                        key="checkout"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-5xl mx-auto"
                    >
                        <header className="flex items-center justify-between mb-12">
                            <button 
                                onClick={() => setStep('plans')}
                                className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-black uppercase tracking-widest text-[10px] group"
                            >
                                <IoChevronBackOutline size={16} className="group-hover:-translate-x-1 transition-transform" />
                                Back
                            </button>
                            <div className="flex items-center gap-2">
                                <IoShieldCheckmarkOutline className="text-primary" size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Checkout</span>
                            </div>
                        </header>

                        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-5">
                            {/* Left: Summary (Stripe style) */}
                            <div className="lg:col-span-2 bg-slate-50 p-10 sm:p-14 border-r border-slate-100">
                                <div className="mb-10">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">You're getting</p>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{selectedPlan?.name}</h2>
                                    <p className="text-slate-500 text-sm font-medium">{selectedPlan?.description}</p>
                                </div>

                                <div className="space-y-4 mb-10 pb-8 border-b border-slate-200">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-bold">{selectedPlan?.duration} Subscription</span>
                                        <span className="text-slate-900 font-black">₹{selectedPlan?.price}.00</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Tax (0%)</span>
                                        <span>₹0.00</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-baseline mb-12">
                                    <span className="text-slate-900 font-black uppercase tracking-widest text-xs">Total Due Today</span>
                                    <span className="text-4xl font-black text-primary">₹{selectedPlan?.price}</span>
                                </div>

                                <div className="space-y-3">
                                    {selectedPlan?.features.slice(0, 3).map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                                            <IoCheckmarkCircle className="text-emerald-500" size={14} />
                                            {f}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Card Inputs */}
                            <div className="lg:col-span-3 p-10 sm:p-14">
                                <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Payment Details</h3>
                                
                                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); processPayment(); }}>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cardholder Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={cardData.name}
                                            onChange={(e) => setCardData({...cardData, name: e.target.value.toUpperCase()})}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-300"
                                            placeholder="BALAJI AADI"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card Number</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                required
                                                maxLength="19"
                                                value={formatCardNumber(cardData.number)}
                                                onChange={(e) => setCardData({...cardData, number: e.target.value})}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-300 pr-12"
                                                placeholder="0000 0000 0000 0000"
                                            />
                                            <IoCardOutline className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiration</label>
                                            <input 
                                                type="text" 
                                                required
                                                maxLength="5"
                                                value={cardData.expiry}
                                                onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-center placeholder:text-slate-300"
                                                placeholder="MM / YY"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CVC</label>
                                            <div className="relative">
                                                <input 
                                                    type="password" 
                                                    required
                                                    maxLength="3"
                                                    value={cardData.cvc}
                                                    onChange={(e) => setCardData({...cardData, cvc: e.target.value})}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-center placeholder:text-slate-300"
                                                    placeholder="•••"
                                                />
                                                <IoLockClosedOutline className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 bg-primary text-white font-black rounded-xl shadow-xl shadow-primary/20 hover:bg-primaryHover transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-[11px] disabled:opacity-50"
                                        >
                                            {loading ? 'Processing...' : `Pay ₹${selectedPlan?.price}`}
                                            {!loading && <IoArrowForwardOutline size={18} />}
                                        </button>
                                        <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-6 flex items-center justify-center gap-2">
                                            <IoShieldCheckmarkOutline className="text-primary" size={12} />
                                            Encrypted & Secure Payment
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'processing' && (
                    <motion.div 
                        key="processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md"
                    >
                        <div className="relative w-20 h-20 mb-8">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-4 border-vermilion-50 border-t-primary rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-primary">
                                <IoLockClosedOutline size={32} className="animate-pulse" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Processing Payment</h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest animate-pulse">Contacting Bank Servers...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PricingPage;
