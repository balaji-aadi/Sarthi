import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import * as THREE from 'three';
import {
    IoArrowForwardOutline,
    IoCodeSlashOutline,
    IoCheckmarkCircle,
    IoFlameOutline,
    IoTerminalOutline,
    IoLayersOutline,
    IoSearchOutline,
    IoSyncOutline,
    IoHardwareChipOutline,
    IoShareSocialOutline,
    IoCompassOutline,
    IoCubeOutline,
    IoDocumentTextOutline,
    IoVideocamOutline,
    IoStatsChartOutline,
    IoShieldCheckmarkOutline,
    IoBulbOutline,
    IoPlayOutline,
    IoTimeOutline,
    IoTrophyOutline,
    IoGitNetworkOutline,
    IoLaptopOutline,
    IoReturnDownBackOutline,
    IoCloseCircleOutline,
    IoInfiniteOutline,
    IoPulseOutline,
    IoRadioButtonOnOutline,
    IoRibbonOutline,
    IoShieldOutline
} from 'react-icons/io5';
import {
    SiGoogle,
    SiAmazon,
    SiMeta,
    SiUber,
    SiApple,
    SiNetflix,
    SiStripe,
    SiAtlassian,
    SiTiktok,
    SiSalesforce,
    SiOracle,
    SiLinkedin,
    SiAdobe,
    SiAirbnb,
    SiPaypal
} from 'react-icons/si';
import { AnimatePresence, motion } from 'framer-motion';
import { setActiveBranch, setBranches } from '../../store/slices/storeSlice';
import { isDsaBranch, isLldBranch } from '../../utils/curriculumHelper';
import { BranchApi } from '../../services/api/Branch.api';

// --- THREE.JS MOVING RADHA & KRISHNA IN CHARIOT (RATH / SARATHI) ---
const ThreeParallaxCanvas = () => {
    const canvasContainerRef = useRef(null);

    useEffect(() => {
        const container = canvasContainerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 8.5;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const rathGroup = new THREE.Group();
        scene.add(rathGroup);

        // 1. Procedural Divine Radha & Krishna Silhouette on Chariot
        const artCanvas = document.createElement('canvas');
        artCanvas.width = 1024;
        artCanvas.height = 1024;
        const ctx = artCanvas.getContext('2d');

        // Radiant Divine Aura
        const radGrad = ctx.createRadialGradient(512, 512, 50, 512, 512, 480);
        radGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        radGrad.addColorStop(0.35, 'rgba(249, 115, 22, 0.25)');
        radGrad.addColorStop(0.7, 'rgba(234, 179, 8, 0.12)');
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, 1024, 1024);

        // Golden Line Art for Krishna (Holding Chariot Reins & Flute) and Radha
        ctx.strokeStyle = 'rgba(255, 241, 215, 0.95)';
        ctx.lineWidth = 4.5;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 18;

        ctx.beginPath();
        // Krishna Mukut & Peacock Feather (Morpankh)
        ctx.arc(470, 310, 85, Math.PI * 0.9, Math.PI * 1.8);
        ctx.moveTo(430, 230);
        ctx.bezierCurveTo(410, 150, 490, 130, 460, 230);

        // Divine Flute & Chariot Reins
        ctx.moveTo(340, 440);
        ctx.lineTo(630, 385);
        ctx.arc(450, 415, 20, 0, Math.PI * 2);
        ctx.arc(500, 405, 18, 0, Math.PI * 2);

        // Radha's gentle presence & veil curve
        ctx.moveTo(560, 330);
        ctx.bezierCurveTo(630, 370, 610, 470, 545, 510);
        ctx.moveTo(580, 420);
        ctx.bezierCurveTo(660, 490, 670, 610, 590, 710);
        ctx.stroke();

        const artTexture = new THREE.CanvasTexture(artCanvas);
        artTexture.needsUpdate = true;

        const artPlaneGeo = new THREE.PlaneGeometry(6.2, 6.2);
        const artPlaneMat = new THREE.MeshBasicMaterial({
            map: artTexture,
            transparent: true,
            opacity: 0.88,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        const artMesh = new THREE.Mesh(artPlaneGeo, artPlaneMat);
        artMesh.position.set(0, 0.3, 0);
        rathGroup.add(artMesh);

        // 2. Chariot (Rath) 3D Geometric Wheels
        const wheelGeo = new THREE.TorusGeometry(1.6, 0.05, 16, 48);
        const wheelMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.5 });

        // Left Rath Wheel
        const leftWheel = new THREE.Mesh(wheelGeo, wheelMat);
        leftWheel.position.set(-2.5, -1.8, 0.5);
        leftWheel.rotation.y = Math.PI / 4;
        rathGroup.add(leftWheel);

        // Right Rath Wheel
        const rightWheel = new THREE.Mesh(wheelGeo, wheelMat);
        rightWheel.position.set(2.5, -1.8, -0.5);
        rightWheel.rotation.y = -Math.PI / 4;
        rathGroup.add(rightWheel);

        // Spokes for Wheels
        const spokeMat = new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.4 });
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const spokeGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(Math.cos(angle) * 1.6, Math.sin(angle) * 1.6, 0)
            ]);
            const spokeLeft = new THREE.Line(spokeGeo, spokeMat);
            leftWheel.add(spokeLeft);
            const spokeRight = new THREE.Line(spokeGeo, spokeMat);
            rightWheel.add(spokeRight);
        }

        // 3. Floating Ethereal Golden Particles
        const particleCount = 320;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 20;
            positions[i + 1] = (Math.random() - 0.5) * 20;
            positions[i + 2] = (Math.random() - 0.5) * 12;

            colors[i] = 0.98;
            colors[i + 1] = Math.random() * 0.45 + 0.35;
            colors[i + 2] = 0.2;
        }

        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMat = new THREE.PointsMaterial({
            size: 0.07,
            vertexColors: true,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // 4. Ambient & Point Lighting
        const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambLight);

        const pointLight = new THREE.PointLight(0xef4444, 3, 25);
        pointLight.position.set(0, 1, 5);
        scene.add(pointLight);

        // Movement & Scroll Parallax Listeners
        let scrollY = window.scrollY;
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 1.5;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 1.5;
        };

        const handleScroll = () => {
            scrollY = window.scrollY;
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Animation Loop
        let frameId;
        const clock = new THREE.Clock();

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            // Chariot and Radha Krishna gentle floating sway
            rathGroup.position.y = 0.2 + Math.sin(elapsedTime * 1.1) * 0.2;
            rathGroup.position.x = Math.cos(elapsedTime * 0.8) * 0.12;

            // Chariot wheels rotating forward gracefully
            leftWheel.rotation.z = -elapsedTime * 0.9;
            rightWheel.rotation.z = -elapsedTime * 0.9;

            // Scroll Parallax reaction
            const scrollShift = scrollY * 0.0014;
            rathGroup.position.y += -scrollShift * 1.2;
            particles.position.y = -scrollShift * 0.8;
            particles.rotation.y = elapsedTime * 0.035;

            // Camera movement
            camera.position.x += (mouseX - camera.position.x) * 0.035;
            camera.position.y += (-mouseY - camera.position.y) * 0.035;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            if (renderer.domElement && renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={canvasContainerRef}
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
            style={{ opacity: 0.92 }}
        />
    );
};

// --- DUAL-SIDED 3D CAPABILITY CARD (WAITS 2s ON HOVER, FLIPS SLOWLY, NO CORNER NOISE) ---
const CapabilityCard = ({ item }) => {
    const [isHovered, setIsHovered] = useState(false);
    const hoverTimerRef = useRef(null);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        // Wait 2 seconds before flipping slowly
        hoverTimerRef.current = setTimeout(() => {
            setIsFlipped(true);
        }, 1000);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
        }
        setIsFlipped(false);
    };

    return (
        <div
            className="w-full h-[390px] cursor-pointer select-none relative font-sans"
            style={{ perspective: 1200 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className="relative w-full h-full rounded-3xl"
                style={{
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
            >
                {/* FRONT: WHAT IT DOES */}
                <div
                    className="absolute inset-0 bg-[#14141f]/90 backdrop-blur-md border border-neutral-700/80 rounded-3xl p-8 flex flex-col justify-between shadow-xl hover:border-primary/50 transition-colors"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
                                {item.icon}
                            </div>
                            <span className="font-mono text-sm font-bold text-neutral-300 bg-neutral-900 px-3 py-1 rounded-md border border-neutral-700">
                                #{item.num}
                            </span>
                        </div>
                        <h4 className="text-2xl font-bold text-white tracking-tight leading-snug">{item.title}</h4>
                        <p className="text-base text-neutral-200 leading-relaxed font-normal">{item.what}</p>
                    </div>

                    <div className="pt-4 border-t border-neutral-700/80 flex items-center justify-between text-sm font-semibold">
                        <span className="text-neutral-400 font-mono text-xs">
                            {/* {isHovered && !isFlipped ? "Hold 2s to flip..." : "Active Engine"} */}
                        </span>
                        <span className="text-primary flex items-center gap-1.5 font-bold">
                            <span>Inspect Value</span>
                            <IoArrowForwardOutline size={15} />
                        </span>
                    </div>
                </div>

                {/* BACK: INTERVIEW IMPACT */}
                <div
                    className="absolute inset-0 bg-[#181824]/95 backdrop-blur-xl border border-primary/60 rounded-3xl p-8 flex flex-col justify-between shadow-2xl"
                    style={{
                        transform: 'rotateY(180deg)',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                    }}
                >
                    <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold uppercase text-primary tracking-wider flex items-center gap-1.5">
                                <IoRadioButtonOnOutline className="animate-spin" /> Interview Value
                            </span>
                            <span className="text-sm text-neutral-300 font-mono">#{item.num}</span>
                        </div>
                        <h5 className="font-bold text-lg text-white">{item.helpHeadline}</h5>
                        <p className="text-base text-neutral-200 leading-relaxed font-normal">{item.howItHelps}</p>
                        <div className="p-3.5 bg-black/60 rounded-xl border border-neutral-700 text-xs font-mono text-neutral-200 shadow-inner">
                            {item.metric}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-neutral-300">
                        <IoReturnDownBackOutline size={16} className="text-primary" />
                        <span>Hover off to return</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PublicLandingPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, branches } = useSelector((state) => state.store);

    const [openFaq, setOpenFaq] = useState(0);
    const [isProfileFlipped, setIsProfileFlipped] = useState(false);
    const profileTimerRef = useRef(null);
    const [activeTab, setActiveTab] = useState('editor');
    const [consoleOutput, setConsoleOutput] = useState('tests');

    // UNLOCK NATIVE WINDOW SCROLL
    useEffect(() => {
        const root = document.getElementById('root');
        const prevDocOverflow = document.documentElement.style.overflow;
        const prevBodyOverflow = document.body.style.overflow;

        document.documentElement.style.overflowY = 'auto';
        document.documentElement.style.height = 'auto';
        document.body.style.overflowY = 'auto';
        document.body.style.height = 'auto';
        if (root) {
            root.style.overflow = 'visible';
            root.style.height = 'auto';
            root.style.minHeight = '100vh';
        }

        return () => {
            document.documentElement.style.overflow = prevDocOverflow;
            document.body.style.overflow = prevBodyOverflow;
            if (root) {
                root.style.overflow = '';
                root.style.height = '';
                root.style.minHeight = '';
            }
        };
    }, []);

    // Fetch branches if not loaded in store
    useEffect(() => {
        if (!branches || branches.length === 0) {
            BranchApi.getAllBranches().then((res) => {
                if (res.data?.data) {
                    dispatch(setBranches(res.data.data));
                }
            }).catch((err) => {
                console.error("Failed to load branches on landing page:", err);
            });
        }
    }, [branches, dispatch]);

    const handleScrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleEnterModule = (trackType) => {
        if (isAuthenticated && branches && branches.length > 0) {
            let targetBranch = null;
            if (trackType === 'dsa') targetBranch = branches.find(b => isDsaBranch(b));
            else if (trackType === 'lld') targetBranch = branches.find(b => isLldBranch(b));
            else targetBranch = branches.find(b => !isDsaBranch(b) && !isLldBranch(b)) || branches[0];

            if (targetBranch) {
                dispatch(setActiveBranch(targetBranch));
                navigate('/');
                return;
            }
        }
        navigate(`/login?target=${trackType}`);
    };

    const dynamicTracks = useMemo(() => {
        const branchList = (branches && branches.length > 0) ? branches : [
            { name: 'DSA', slug: 'dsa' },
            { name: 'LLD', slug: 'lld' },
            { name: 'Development', slug: 'development' }
        ];

        return branchList.map((branch) => {
            if (isDsaBranch(branch)) {
                return {
                    id: 'dsa',
                    branch,
                    icon: <IoCodeSlashOutline size={28} />,
                    title: 'DSA Pattern Taxonomies',
                    desc: "31 Systematic pattern families: Sliding Window, Monotonic Stacks, Two Pointers, Kahn's BFS, and Tree Dynamic Programming.",
                    tags: ['31 Pattern Families', 'Edge Test Suites'],
                    btnText: 'Enter DSA Curriculum →',
                    onClick: () => handleEnterModule('dsa')
                };
            }
            if (isLldBranch(branch)) {
                return {
                    id: 'lld',
                    branch,
                    icon: <IoHardwareChipOutline size={28} />,
                    title: 'Low-Level Design (LLD)',
                    desc: '5 Phased milestones: OOP foundations, SOLID principles, classical GoF patterns, and 90-minute real-world machine coding drills.',
                    tags: ['SOLID In Practice', 'Machine Coding Drills'],
                    btnText: 'Enter LLD Curriculum →',
                    onClick: () => handleEnterModule('lld')
                };
            }
            return {
                id: branch._id || branch.name || 'systems',
                branch,
                icon: <IoCubeOutline size={28} />,
                title: branch.name || 'Development & Systems',
                desc: branch.description || 'Master architectural trade-offs: Caching, database sharding, message broker topologies, and OS concurrency fundamentals.',
                tags: ['OS & Indexing', 'Distributed Systems'],
                btnText: `Enter ${branch.name ? branch.name.split(' ')[0] : 'Systems'} Curriculum →`,
                onClick: () => {
                    if (isAuthenticated) {
                        dispatch(setActiveBranch(branch));
                        navigate('/');
                    } else {
                        navigate('/register');
                    }
                }
            };
        });
    }, [branches, isAuthenticated, dispatch, navigate]);

    const handleAuthAction = () => {
        if (isAuthenticated) navigate('/');
        else navigate('/login');
    };

    // Delayed Profile Flip Handler
    const handleProfileMouseEnter = () => {
        profileTimerRef.current = setTimeout(() => {
            setIsProfileFlipped(true);
        }, 2000);
    };

    const handleProfileMouseLeave = () => {
        if (profileTimerRef.current) {
            clearTimeout(profileTimerRef.current);
        }
        setIsProfileFlipped(false);
    };

    const companyCatalog = [
        { name: 'Google', icon: <SiGoogle className="text-red-400" /> },
        { name: 'Amazon', icon: <SiAmazon className="text-amber-400" /> },
        { name: 'Meta', icon: <SiMeta className="text-blue-500" /> },
        { name: 'Uber', icon: <SiUber className="text-white" /> },
        { name: 'Apple', icon: <SiApple className="text-neutral-200" /> },
        { name: 'Netflix', icon: <SiNetflix className="text-red-500" /> },
        { name: 'Stripe', icon: <SiStripe className="text-indigo-400" /> },
        { name: 'Atlassian', icon: <SiAtlassian className="text-sky-400" /> },
        {
            name: 'Bloomberg',
            icon: (
                <svg className="w-5 h-5 fill-orange-400" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
                </svg>
            )
        },
        { name: 'ByteDance', icon: <SiTiktok className="text-pink-400" /> },
        { name: 'Salesforce', icon: <SiSalesforce className="text-sky-400" /> },
        { name: 'Oracle', icon: <SiOracle className="text-red-500" /> },
        { name: 'LinkedIn', icon: <SiLinkedin className="text-blue-400" /> },
        { name: 'Adobe', icon: <SiAdobe className="text-red-500" /> },
        { name: 'Airbnb', icon: <SiAirbnb className="text-rose-400" /> },
        { name: 'PayPal', icon: <SiPaypal className="text-blue-300" /> }
    ];

    const continuousLoopSteps = [
        { step: "01", name: "Learn", detail: "Understand algorithmic pattern invariants and class boundaries first." },
        { step: "02", name: "Practice", detail: "Work through sequenced challenges without searching for random problems." },
        { step: "03", name: "Focus", detail: "Eliminate context-switching in dedicated, distraction-free sessions." },
        { step: "04", name: "Solve", detail: "Execute and verify solutions against edge tests in the in-house judge." },
        { step: "05", name: "Reflect", detail: "Log your true mastery: Independent, With Hints, or With Solution." },
        { step: "06", name: "Detect Weakness", detail: "Identify patterns where you consistently freeze or require hints." },
        { step: "07", name: "Revise", detail: "Surfaces problems dynamically right before long-term memory fades." },
        { step: "08", name: "Re-Solve", detail: "Prove retention through time-bound re-implementation drills." },
        { step: "09", name: "Assess", detail: "Validate readiness under realistic interview constraints in timed Arenas." },
        { step: "10", name: "Improve", detail: "Eliminate conceptual leaks using real, recorded historical data." },
        { step: "11", name: "Target Companies", detail: "Map pattern proficiency to historically verified company kits." },
        { step: "12", name: "Mock Interviews", detail: "Simulate high-pressure multi-round technical evaluations." }
    ];

    const coreCapabilities = [
        {
            num: "01",
            title: "Structured Learning Roadmap",
            what: "Organizes engineering preparation into topic hierarchies and 31 algorithmic pattern families instead of an endless problem list.",
            helpHeadline: "Eliminates Uncertainty in Daily Practice",
            howItHelps: "You always know what to study next, what is in progress, and the exact conceptual dependencies required before advancing.",
            metric: "Result: Zero wasted hours searching for what to solve.",
            icon: <IoCompassOutline size={26} />
        },
        {
            num: "02",
            title: "Deep Problem Practice",
            what: "Every question includes verified constraints, original source references, multi-language execution, and persistent historical records.",
            helpHeadline: "Focuses on Understanding Over Question Counts",
            howItHelps: "Ensures you internalize the underlying technique rather than rushing through questions to increment a vanity counter.",
            metric: "Result: High-quality attempts with lasting retention.",
            icon: <IoCodeSlashOutline size={26} />
        },
        {
            num: "03",
            title: "In-House Code Judge",
            what: "Self-contained coding sandbox supporting Python, C++, Java, Go, and TypeScript with hidden edge test suites.",
            helpHeadline: "Complete Independence from Third Parties",
            howItHelps: "Practice, test edge cases, benchmark memory, and evaluate execution speed in one integrated environment.",
            metric: "Result: Direct verification of edge-case correctness.",
            icon: <IoTerminalOutline size={26} />
        },
        {
            num: "04",
            title: "Focused Solving Sessions",
            what: "Dedicated distraction-free timer that tracks active solving duration and pause/resume states for every problem attempt.",
            helpHeadline: "Builds Real Interview Discipline",
            howItHelps: "Stops the bad habit of glancing at solutions after 5 minutes. Trains your brain to sit with complexity under time constraints.",
            metric: "Result: Accurate records of actual focus time.",
            icon: <IoTimeOutline size={26} />
        },
        {
            num: "05",
            title: "Multi-State Reflection System",
            what: "Prompts you after each submission: Solved Independently, Solved with Hints, Solved with Solution, or Unsolved, plus Confidence level.",
            helpHeadline: "Stops False Confidence in Its Tracks",
            howItHelps: "Most engineers solve a problem with a hint and pretend they mastered it. Sarthi records the truth and uses it to calibrate your prep.",
            metric: "Result: Accurate audit of your true mastery.",
            icon: <IoBulbOutline size={26} />
        },
        {
            num: "06",
            title: "Ebbinghaus Spaced Revision",
            what: "Automated queue that schedules problems for active recall on calculated intervals (Day 1, 3, 7, 14, 30) based on past reflection.",
            helpHeadline: "Eliminates the Forgetting Trap",
            howItHelps: "You never have to wonder what to revise. Questions you struggled with return quickly; questions you aced return later.",
            metric: "Result: Long-term retention without manual tracking.",
            icon: <IoSyncOutline size={26} />
        },
        {
            num: "07",
            title: "Pattern Weakness Detection",
            what: "Identifies systemic patterns where you repeatedly need hints across related questions (e.g., Sliding Window or Kahn's BFS).",
            helpHeadline: "Treats Root Causes, Not Symptoms",
            howItHelps: "Surfaces evidence-based alerts: 'You struggle with dynamic sliding windows.' Recommends targeted practice to fix the underlying skill.",
            metric: "Result: Factual diagnostics backed by your data.",
            icon: <IoShieldCheckmarkOutline size={26} />
        },
        {
            num: "08",
            title: "Historical Company Signals",
            what: "Curated kits linking problems to companies where underlying algorithmic concepts have historically been tested.",
            helpHeadline: "Realistic Preparation Without False Promises",
            howItHelps: "Companies change question story lines but keep the core pattern. Sarthi trains you on the concepts they actually care about.",
            metric: "Result: Pattern alignment over brittle question prediction.",
            icon: <IoGitNetworkOutline size={26} />
        },
        {
            num: "09",
            title: "Dual Perspective: Roadmap & Company",
            what: "Seamlessly switch between fundamental topic roadmaps and company-oriented sheets while maintaining continuous progress.",
            helpHeadline: "One Progress State Across Every View",
            howItHelps: "Solving a question in a target company kit immediately updates your master pattern roadmap, streak heatmap, and revision queue.",
            metric: "Result: Unified tracking across all learning modes.",
            icon: <IoLayersOutline size={26} />
        },
        {
            num: "10",
            title: "Low-Level Design (LLD)",
            what: "Curriculum structured across 5 phases: OOP foundations, SOLID principles, GoF design patterns, and machine coding.",
            helpHeadline: "Prepares You for Senior Engineering Rounds",
            howItHelps: "Moves past memorized UML diagrams into writing extensible, maintainable code with clean class boundaries and concurrency controls.",
            metric: "Result: Architectural confidence in senior loops.",
            icon: <IoHardwareChipOutline size={26} />
        },
        {
            num: "11",
            title: "High-Level Design (HLD)",
            what: "Covers distributed system principles: scalability, caching topologies, database replication, sharding, and CAP theorem trade-offs.",
            helpHeadline: "Learn to Reason Through Architectural Trade-offs",
            howItHelps: "Trains you to answer 'How would you design this system and why?' rather than reciting static architecture templates.",
            metric: "Result: First-principles system design fluency.",
            icon: <IoCubeOutline size={26} />
        },
        {
            num: "12",
            title: "Machine Coding Drills",
            what: "Realistic 90-minute design challenges: In-Memory Cache, Rate Limiter, Splitwise Ledger, and Pub/Sub Event Broker.",
            helpHeadline: "Bridges Theory and Real Engineering",
            howItHelps: "Demonstrates your ability to write production-quality, modular, and thread-safe code under real interview time constraints.",
            metric: "Result: Concrete implementation skill under pressure.",
            icon: <IoLaptopOutline size={26} />
        },
        {
            num: "13",
            title: "Core Computer Science Fundamentals",
            what: "Structured preparation modules covering Operating Systems, DBMS Indexing, Computer Networks, and Concurrency primitives.",
            helpHeadline: "Never Get Caught Off-Guard on Fundamentals",
            howItHelps: "Top-tier companies probe beyond DSA. Sarthi ensures your understanding of OS scheduling, indexing, and TCP/UDP is sound.",
            metric: "Result: Strong foundations for technical deep-dives.",
            icon: <IoDocumentTextOutline size={26} />
        },
        {
            num: "14",
            title: "Curated Challenge Arenas",
            what: "Focused preparation sprints and curated milestone environments designed to simulate high-pressure interview loops.",
            helpHeadline: "Practice Under Authentic Interview Stress",
            howItHelps: "Replaces casual untimed problem-solving with milestone challenges that evaluate both speed and code quality.",
            metric: "Result: Mental composure under tight time limits.",
            icon: <IoTrophyOutline size={26} />
        },
        {
            num: "15",
            title: "Consistency & Discipline Matrix",
            what: "Tracks daily solving consistency, focus time, active streaks, and spaced recall completions over time.",
            helpHeadline: "Encourages Sustainable Habits Over Panic Cramming",
            howItHelps: "Visualizes whether you are putting in the daily work. Emphasizes steady preparation over frantic, short-lived cramming bursts.",
            metric: "Result: Visible, verifiable preparation momentum.",
            icon: <IoFlameOutline size={26} />
        },
        {
            num: "16",
            title: "Verified Progress Profile",
            what: "Comprehensive developer preparation record showing pattern competencies, difficulty split, and retention metrics.",
            helpHeadline: "A Factual Portfolio of Technical Readiness",
            howItHelps: "Share your verified #SarthiCard with mentors and recruiters as proof of structured problem-solving and design discipline.",
            metric: "Result: Transparent record of your preparation journey.",
            icon: <IoStatsChartOutline size={26} />
        },
        {
            num: "17",
            title: "Integrated Notes & Video Companion",
            what: "Attach rich dry-run diagrams, markdown notes, and video walkthroughs directly to each problem for immediate review.",
            helpHeadline: "Everything in One Place, Zero Context Switching",
            howItHelps: "No more searching through lost Notion pages or YouTube bookmarks. Your notes and insights stay attached to the problem.",
            metric: "Result: A personalized, permanent knowledge base.",
            icon: <IoVideocamOutline size={26} />
        }
    ];

    const faqs = [
        {
            q: "How does Sarthi differ from generic problem-grinding platforms?",
            a: "Generic sites give you an unorganized collection of thousands of questions without guidance or retention. Sarthi is a structured preparation system: it provides an ordered pattern roadmap, tracks your honest reflection, schedules automated spaced revision before you forget concepts, detects recurring pattern weaknesses, and spans DSA, LLD, HLD, and Core CS."
        },
        {
            q: "How does the Spaced Revision engine decide what I need to review?",
            a: "Revision is scheduled deterministically using your reflection outcomes and confidence. A problem solved independently with high confidence returns on an extended interval (Day 1, 3, 7, 14, 30). If you needed hints or saw the solution, Sarthi schedules it much sooner for an active re-solve."
        },
        {
            q: "What makes Sarthi's company preparation different from question predictions?",
            a: "Sarthi does not claim 'A specific company will ask this exact question.' Companies routinely alter problem stories while testing the same underlying pattern. Sarthi curates problems historically associated with companies so you master the underlying algorithmic and design techniques they evaluate."
        },
        {
            q: "Can I run code and verify test cases directly in the browser?",
            a: "Yes. Sarthi integrates an in-browser code editor with multi-language execution support across C++, Java, Python, Go, and TypeScript. Solutions are evaluated against sample inputs and hidden edge test suites with runtime and memory metrics."
        }
    ];

    return (
        <div className="w-full min-h-screen bg-[#0e0e14] text-neutral-100 font-sans selection:bg-primary/25 selection:text-primary relative overflow-x-hidden">

            {/* THREE.JS RADHA & KRISHNA MOVING CHARIOT CANVAS */}
            <ThreeParallaxCanvas />

            {/* CSS Marquee Keyframes */}
            <style>{`
                @keyframes marquee-forward {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes marquee-reverse {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0%); }
                }
                .marquee-left {
                    display: flex;
                    width: 200%;
                    animation: marquee-forward 34s linear infinite;
                }
                .marquee-right {
                    display: flex;
                    width: 200%;
                    animation: marquee-reverse 34s linear infinite;
                }
                .marquee-holder:hover .marquee-left,
                .marquee-holder:hover .marquee-right {
                    animation-play-state: paused;
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
            `}</style>

            {/* STICKY NAVBAR (FIXED OVERFLOW & BALANCED LAYOUT) */}
            <header className="sticky top-0 z-50 bg-[#111118]/90 backdrop-blur-xl border-b border-neutral-800">
                <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12 h-20 flex items-center justify-between">
                    {/* Brand */}
                    <div
                        className="flex items-center gap-3.5 cursor-pointer select-none group"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                            S
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tight text-white leading-tight">Sarthi</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Technical Workspace</span>
                        </div>
                    </div>

                    {/* Concise Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-7 text-base font-semibold text-neutral-300">
                        <button onClick={() => handleScrollTo('curricula')} className="hover:text-primary transition-colors cursor-pointer">Curricula</button>
                        <button onClick={() => handleScrollTo('companies')} className="hover:text-primary transition-colors cursor-pointer">Companies</button>
                        <button onClick={() => handleScrollTo('capabilities')} className="hover:text-primary transition-colors cursor-pointer">Capabilities</button>
                        <button onClick={() => handleScrollTo('workspace')} className="hover:text-primary transition-colors cursor-pointer">Code Judge</button>
                        <button onClick={() => handleScrollTo('philosophy')} className="hover:text-primary transition-colors cursor-pointer">Philosophy</button>
                        <button onClick={() => handleScrollTo('faq')} className="hover:text-primary transition-colors cursor-pointer">FAQ</button>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3.5">
                        <button
                            onClick={handleAuthAction}
                            className="px-4 py-2 text-base font-bold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                        >
                            {isAuthenticated ? "Dashboard" : "Sign In"}
                        </button>
                        <button
                            onClick={() => navigate(isAuthenticated ? '/' : '/register')}
                            className="px-5 py-2.5 bg-primary hover:bg-primaryHover text-white text-base font-bold rounded-xl transition-all shadow-md shadow-primary/25 cursor-pointer active:scale-95"
                        >
                            {isAuthenticated ? "My Workspace" : "Get Started"}
                        </button>
                    </div>
                </div>
            </header>

            {/* 1. HERO SECTION */}
            <section className="pt-22 pb-16 px-6 sm:px-10 lg:px-12 text-center relative z-10">
                <div className="max-w-5xl mx-auto space-y-6 mt-10">
                    {/* <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-primary/40 bg-primary/10 text-primary text-sm font-black uppercase tracking-wider mb-2 backdrop-blur-md shadow-lg shadow-primary/10">
                        <IoPulseOutline size={18} />
                        <span>The Guided Software Engineering Companion</span>
                    </div> */}

                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.12]">
                        Random problem grinding stops here. <br />
                        Sarthi engineers your <span className="text-primary">readiness.</span>
                    </h1>

                    <p className="text-neutral-200 text-lg sm:text-2xl max-w-3xl mx-auto leading-relaxed font-normal mt-3">
                        From structured pattern taxonomies and machine coding to automated spaced recall—one unbroken operating system designed for lasting technical competence.
                    </p>

                    <div className="pt-6 flex items-center justify-center gap-5 flex-wrap">
                        <button
                            onClick={() => handleEnterModule('dsa')}
                            className="px-9 py-4 rounded-xl bg-primary hover:bg-primaryHover text-white text-base font-bold flex items-center gap-2.5 transition-all shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
                        >
                            <span>Start Structured Journey</span>
                            <IoArrowForwardOutline size={18} />
                        </button>
                        <button
                            onClick={() => handleEnterModule('lld')}
                            className="px-9 py-4 rounded-xl border border-neutral-700 bg-[#14141d]/90 backdrop-blur-md hover:bg-[#1a1a26] text-neutral-100 hover:text-white text-base font-bold transition-all cursor-pointer"
                        >
                            Explore Machine Coding
                        </button>
                    </div>
                </div>
            </section>

            {/* 2. TOP SECTION: CURRICULA TRACKS (DSA, LLD, DEVELOPMENT) */}
            <section id="curricula" className="py-16 max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <span className="text-sm font-black uppercase tracking-widest text-primary">Core Roadmaps</span>
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-2">
                        Mastery Across the Engineering Spectrum
                    </h2>
                    <p className="text-neutral-300 text-base sm:text-xl mt-3 font-normal">
                        Sarthi expands seamlessly from algorithmic problem solving into practical object-oriented design and distributed systems architecture.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {dynamicTracks.map((track) => (
                        <div
                            key={track.id}
                            className="p-8 sm:p-10 rounded-3xl bg-[#14141f]/90 backdrop-blur-md border border-neutral-700/80 flex flex-col justify-between h-full hover:border-primary/50 transition-colors shadow-xl"
                        >
                            <div className="space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center font-bold">
                                    {track.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">{track.title}</h3>
                                <p className="text-neutral-200 text-base leading-relaxed font-normal">
                                    {track.desc}
                                </p>
                                <div className="pt-2 flex flex-wrap gap-2 text-sm font-mono">
                                    {track.tags.map((tag, tIdx) => (
                                        <span key={tIdx} className="px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-200">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={track.onClick}
                                className="mt-8 w-full py-4 bg-primary hover:bg-primaryHover text-white text-base font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-primary/25"
                            >
                                {track.btnText}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. TOP SECTION: MOVING COMPANY SIGNALS */}
            <section id="companies" className="py-14 border-y border-neutral-800 bg-[#111118]/90 backdrop-blur-md overflow-hidden marquee-holder relative z-10">
                <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12 mb-6 flex items-center justify-between">
                    <div>
                        <span className="text-xs font-black uppercase tracking-widest text-primary">Pattern-Based Historical Associations</span>
                        <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">Target Company Curricula Signals</h3>
                    </div>
                    <span className="text-sm text-neutral-400 hidden sm:inline">Hover over marquee to pause</span>
                </div>

                <div className="relative w-full overflow-hidden mb-3">
                    <div className="marquee-left flex gap-4">
                        {[...companyCatalog, ...companyCatalog].map((company, i) => (
                            <div
                                key={i}
                                onClick={() => handleEnterModule('dsa')}
                                className="px-7 py-3.5 rounded-2xl bg-[#161622] border border-neutral-700 hover:border-primary/50 text-neutral-100 hover:text-white text-base font-bold shrink-0 cursor-pointer transition-colors flex items-center gap-3.5 shadow-md"
                            >
                                <span className="text-xl">{company.icon}</span>
                                <span>{company.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative w-full overflow-hidden">
                    <div className="marquee-right flex gap-4">
                        {[...companyCatalog.slice().reverse(), ...companyCatalog.slice().reverse()].map((company, i) => (
                            <div
                                key={i}
                                onClick={() => handleEnterModule('dsa')}
                                className="px-7 py-3.5 rounded-2xl bg-[#161622] border border-neutral-700 hover:border-primary/50 text-neutral-100 hover:text-white text-base font-bold shrink-0 cursor-pointer transition-colors flex items-center gap-3.5 shadow-md"
                            >
                                <span className="text-xl">{company.icon}</span>
                                <span>{company.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. LIVE COCKPIT (WAITS 2s ON HOVER BEFORE FLIPPING) */}
            <div id="cockpit" className="max-w-[1360px] mx-auto my-16 px-6 sm:px-10 lg:px-12 relative z-10">
                <div className="rounded-3xl border border-neutral-700/80 bg-[#12121c]/90 backdrop-blur-xl p-8 sm:p-10 text-left shadow-2xl relative overflow-hidden">

                    {/* HUD Status Bar */}
                    <div className="flex items-center justify-between pb-5 mb-8 border-b border-neutral-700/80 text-sm font-mono text-neutral-300">
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-neutral-100 font-bold">SYS_OPERATIONAL: ACTIVE_ENGINE_CLUSTER</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-6 text-neutral-300">
                            <span>REVISION_PIPELINE: EBBINGHAUS_ONLINE</span>
                            <span>RENDER_REFRESH: NATIVE_60FPS</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                        {/* SMALL PROFILE CARD: WAITS 2s BEFORE FLIPPING SLOWLY */}
                        <div className="lg:col-span-4" style={{ perspective: 1200 }}>
                            <div
                                onMouseEnter={handleProfileMouseEnter}
                                onMouseLeave={handleProfileMouseLeave}
                                className="relative w-full h-full min-h-[440px] cursor-pointer rounded-3xl"
                                style={{
                                    transform: isProfileFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                    transformStyle: 'preserve-3d',
                                    transition: 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
                                }}
                            >
                                {/* Front Side */}
                                <div
                                    className="absolute inset-0 bg-[#161622]/95 backdrop-blur-md rounded-3xl p-7 border border-neutral-700 flex flex-col justify-between shadow-xl"
                                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                                                #SarthiCard • Flip
                                            </span>
                                            <IoShareSocialOutline className="text-neutral-300" size={20} />
                                        </div>

                                        <div className="flex items-center gap-4 mt-6">
                                            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-black text-xl shadow-inner">
                                                BA
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-xl text-white">Balaji Aadesh</h4>
                                                    <IoCheckmarkCircle className="text-primary" size={19} />
                                                </div>
                                                <p className="text-sm text-neutral-300 font-mono">Software Engineer & Architect</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3.5 mt-6">
                                            <div className="bg-[#1f1f2e]/90 p-4 rounded-2xl border border-neutral-700">
                                                <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Mastered</span>
                                                <div className="text-3xl font-black text-white mt-1">1,010</div>
                                            </div>
                                            <div className="bg-[#1f1f2e]/90 p-4 rounded-2xl border border-neutral-700">
                                                <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Active Days</span>
                                                <div className="text-3xl font-black text-white mt-1">348</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-5 border-t border-neutral-700 space-y-3">
                                        <div className="flex justify-between items-center text-base">
                                            <span className="text-neutral-200 font-medium">Readiness Verification</span>
                                            <span className="text-primary font-mono font-bold">96% Retained</span>
                                        </div>
                                        <div className="w-full bg-neutral-800 h-3 rounded-full overflow-hidden flex">
                                            <div className="bg-primary h-full w-[65%]" />
                                            <div className="bg-emerald-500 h-full w-[35%]" />
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-neutral-300 font-semibold">
                                            <span>31 Pattern Families</span>
                                            <span>5 LLD Milestones</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Back Side */}
                                <div
                                    className="absolute inset-0 bg-[#161622]/95 backdrop-blur-md rounded-3xl p-7 border border-primary/50 flex flex-col justify-between shadow-2xl"
                                    style={{
                                        transform: 'rotateY(180deg)',
                                        backfaceVisibility: 'hidden',
                                        WebkitBackfaceVisibility: 'hidden'
                                    }}
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black uppercase tracking-widest text-primary">Active Precision</span>
                                            <span className="text-xs text-neutral-300 font-mono">Verified Record</span>
                                        </div>
                                        <h5 className="font-bold text-lg text-white">Pattern Retention Stats</h5>
                                        <div className="space-y-3 pt-1 text-sm">
                                            <div className="flex justify-between py-1.5 border-b border-neutral-700">
                                                <span className="text-neutral-200">Sliding Window</span>
                                                <span className="text-emerald-400 font-mono font-bold">100% (Day 30 Verified)</span>
                                            </div>
                                            <div className="flex justify-between py-1.5 border-b border-neutral-700">
                                                <span className="text-neutral-200">Kahn's Topo Sort</span>
                                                <span className="text-amber-400 font-mono font-bold">82% (Review Due)</span>
                                            </div>
                                            <div className="flex justify-between py-1.5 border-b border-neutral-700">
                                                <span className="text-neutral-200">Token Bucket (LLD)</span>
                                                <span className="text-emerald-400 font-mono font-bold">94% (Thread-Safe Pass)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-primary/15 border border-primary/30 text-center">
                                        <span className="text-sm font-bold text-primary">Hover off to return</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: HABIT MATRIX & ACTIVE QUEUE */}
                        <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
                            <div className="bg-[#161622]/85 backdrop-blur-md rounded-3xl p-6 border border-neutral-700">
                                <div className="flex items-center justify-between mb-4 text-base">
                                    <span className="text-neutral-200 font-medium">754 active recalls completed across 8 months</span>
                                    <span className="text-primary font-bold flex items-center gap-2">
                                        <IoFlameOutline size={20} /> 30-Day Active Streak
                                    </span>
                                </div>
                                <div className="grid grid-flow-col grid-rows-5 gap-2.5 overflow-hidden">
                                    {[...Array(60)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-3.5 h-3.5 rounded-sm transition-colors ${i % 6 === 0 ? 'bg-primary shadow-[0_0_10px_rgba(239,68,68,0.6)]' :
                                                i % 4 === 0 ? 'bg-primary/60' :
                                                    i % 3 === 0 ? 'bg-primary/25' : 'bg-neutral-800'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#161622]/85 backdrop-blur-md rounded-3xl p-6 border border-neutral-700">
                                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-neutral-700 text-base">
                                    <div className="flex items-center gap-2 text-neutral-200">
                                        <IoSearchOutline size={18} />
                                        <span className="font-bold">Ebbinghaus Retrieval Queue</span>
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Scheduled Today</span>
                                </div>

                                <div className="space-y-3.5 text-sm">
                                    {[
                                        { title: "Dynamic Sliding Window (Longest Substring)", pattern: "Hashmap Last-Seen Index • O(N) Time", diff: "Medium", color: "text-amber-400" },
                                        { title: "Distributed Rate Limiter (Token Bucket)", pattern: "LLD • Atomic Concurrency & Mutex Locks", diff: "Hard", color: "text-primary" },
                                        { title: "Kahn's Topological Sort (Course Schedule II)", pattern: "Indegree BFS Array Queue Traversal", diff: "Medium", color: "text-amber-400" }
                                    ].map((item, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl bg-[#0e0e14] border border-neutral-700 flex items-center justify-between hover:border-neutral-600 transition-colors">
                                            <div>
                                                <p className="font-semibold text-white text-base sm:text-lg">{item.title}</p>
                                                <p className="text-sm text-neutral-400 mt-0.5">{item.pattern}</p>
                                            </div>
                                            <span className={`text-sm font-bold font-mono ${item.color}`}>{item.diff}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* 5. THE PROBLEM */}
            <section id="problem" className="py-24 max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12 border-t border-neutral-800 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-sm font-black uppercase tracking-widest text-primary">The Preparation Dilemma</span>
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-2">
                        Why Traditional Preparation Breaks Down
                    </h2>
                    <p className="text-neutral-300 text-base sm:text-xl mt-4 leading-relaxed font-normal">
                        Engineers struggle because practice is fragmented across disconnected tools: a problem site, YouTube tabs, scattered Notion pages, and an untracked spreadsheet.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* The Fragmented Grind */}
                    <div className="p-8 sm:p-10 rounded-3xl bg-[#14141f]/90 backdrop-blur-md border border-red-500/30 space-y-6 shadow-xl">
                        <div className="flex items-center gap-3 text-red-400 font-bold text-xl">
                            <IoCloseCircleOutline size={26} />
                            <span>The Fragmented Grind</span>
                        </div>
                        <ul className="space-y-5 text-base text-neutral-200 font-normal">
                            <li className="flex items-start gap-3">
                                <span className="text-red-400 mt-1 font-bold">•</span>
                                <span><strong>Random Grinding:</strong> Solving 400+ problems without understanding the 31 core algorithmic pattern families that actually govern interviews.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-400 mt-1 font-bold">•</span>
                                <span><strong>The Forgetting Curve:</strong> Solving a problem once and forgetting the core invariant 14 days later under real interview pressure.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-400 mt-1 font-bold">•</span>
                                <span><strong>False Confidence:</strong> Marking a problem "completed" after glancing at hints, masking conceptual weaknesses until interview day.</span>
                            </li>
                        </ul>
                    </div>

                    {/* The Sarthi Operating System */}
                    <div className="p-8 sm:p-10 rounded-3xl bg-[#14141f]/90 backdrop-blur-md border border-primary/40 space-y-6 shadow-xl">
                        <div className="flex items-center gap-3 text-primary font-bold text-xl">
                            <IoCheckmarkCircle size={26} />
                            <span>The Sarthi Operating System</span>
                        </div>
                        <ul className="space-y-5 text-base text-neutral-200 font-normal">
                            <li className="flex items-start gap-3">
                                <span className="text-primary mt-1 font-bold">•</span>
                                <span><strong>Structured Roadmaps:</strong> Ordered pattern taxonomies that show what to learn, why it matters, and what to practice next.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="text-primary mt-1 font-bold">•</span>
                                <span><strong>Automated Recall:</strong> Ebbinghaus spaced revision dynamically reschedules problems right before concepts fade from memory.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="text-primary mt-1 font-bold">•</span>
                                <span><strong>Evidence-Based Diagnostics:</strong> Surfaces systemic pattern weaknesses based on your real solving data, not generic advice.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* 6. THE COMPLETE SARTHI LOOP */}
            <section id="loop" className="py-24 bg-[#111118]/85 backdrop-blur-md border-y border-neutral-800 relative z-10">
                <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-sm font-black uppercase tracking-widest text-primary">Continuous Engineering Feedback</span>
                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-2">
                            The 12-Step Continuous Preparation Loop
                        </h2>
                        <p className="text-neutral-300 text-base sm:text-lg mt-3">
                            Sarthi connects every action into an unbroken loop designed to build permanent technical competence.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {continuousLoopSteps.map((item, idx) => (
                            <div key={idx} className="p-6 rounded-3xl bg-[#161622]/90 border border-neutral-700 space-y-3 shadow-md hover:border-primary/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-base font-black text-primary">{item.step}</span>
                                    <IoInfiniteOutline className="text-neutral-400" size={18} />
                                </div>
                                <h4 className="text-lg font-bold text-white">{item.name}</h4>
                                <p className="text-sm text-neutral-300 leading-relaxed font-normal">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. ALL 17 CAPABILITIES (WAIT 2s ON HOVER BEFORE FLIPPING) */}
            <section id="capabilities" className="py-24 max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-sm font-black uppercase tracking-widest text-primary">Full Platform Architecture</span>
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-2">
                        17 Core Capabilities. One Cohesive System.
                    </h2>
                    <p className="text-neutral-300 text-base sm:text-lg mt-3 leading-relaxed">
                        Hover over any capability  to inspect its underlying engine and interview impact.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                    {coreCapabilities.map((item, idx) => (
                        <CapabilityCard key={idx} item={item} />
                    ))}
                </div>
            </section>

            {/* 8. CODE JUDGE & TELEMETRY */}
            <section id="workspace" className="py-24 bg-[#111118]/90 backdrop-blur-md border-y border-neutral-800 relative z-10">
                <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

                    <div className="lg:col-span-5 space-y-6">
                        <span className="text-sm font-black uppercase tracking-widest text-primary">In-House Coding Studio</span>
                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                            Built for Engineering Work, <br />Not Scattered Tabs.
                        </h2>
                        <p className="text-neutral-200 text-base sm:text-lg leading-relaxed font-normal">
                            Every problem integrates your custom dry-run notes, pattern walkthrough videos, and an in-browser code execution judge with hidden edge test suites.
                        </p>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={() => setActiveTab('editor')}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'editor' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-[#1b1b28] text-neutral-300 hover:text-white'}`}
                            >
                                Code Judge
                            </button>
                            <button
                                onClick={() => setActiveTab('notes')}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'notes' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-[#1b1b28] text-neutral-300 hover:text-white'}`}
                            >
                                Architecture Notes
                            </button>
                            <button
                                onClick={() => setActiveTab('video')}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'video' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-[#1b1b28] text-neutral-300 hover:text-white'}`}
                            >
                                Video Walkthrough
                            </button>
                        </div>
                    </div>

                    {/* Complex Code Studio Window */}
                    <div className="lg:col-span-7">
                        <div className="rounded-3xl bg-[#14141f] border border-neutral-700 shadow-2xl overflow-hidden font-mono text-sm">
                            <div className="px-6 py-4 bg-[#1a1a28] border-b border-neutral-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-full bg-rose-500" />
                                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                                    </div>
                                    <span className="ml-2 font-sans font-bold text-neutral-200">
                                        {activeTab === 'editor' && "solution.py — Python 3"}
                                        {activeTab === 'notes' && "dry_run_notes.md — Architecture"}
                                        {activeTab === 'video' && "pattern_walkthrough.mp4 — Sarthi Studio"}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700 px-3 py-1 rounded-md font-sans">
                                    Passed 48/48 Test Cases
                                </span>
                            </div>

                            {activeTab === 'editor' && (
                                <div className="p-6 bg-[#0c0c12] flex gap-6 text-sm sm:text-base overflow-x-auto leading-relaxed">
                                    <div className="text-neutral-500 select-none text-right pr-3 border-r border-neutral-700 font-mono">
                                        1<br />2<br />3<br />4<br />5<br />6<br />7<br />8<br />9<br />10<br />11<br />12<br />13
                                    </div>
                                    <div className="text-neutral-100 font-mono space-y-1">
                                        <span className="text-neutral-400"># Pattern: Dynamic Sliding Window (Hashmap Indexing)</span><br />
                                        <span className="text-purple-400 font-bold">class</span> <span className="text-amber-300">Solution</span>:<br />
                                        &nbsp;&nbsp;<span className="text-purple-400 font-bold">def</span> <span className="text-emerald-400">lengthOfLongestSubstring</span>(self, s: <span className="text-sky-400">str</span>) -&gt; <span className="text-sky-400">int</span>:<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;last_seen = &#123;&#125;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;max_len = left = <span className="text-primary font-bold">0</span><br /><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400 font-bold">for</span> right, char <span className="text-purple-400 font-bold">in</span> <span className="text-blue-400">enumerate</span>(s):<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400 font-bold">if</span> char <span className="text-purple-400 font-bold">in</span> last_seen <span className="text-purple-400 font-bold">and</span> last_seen[char] &gt;= left:<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;left = last_seen[char] + <span className="text-primary font-bold">1</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;last_seen[char] = right<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;max_len = <span className="text-blue-400">max</span>(max_len, right - left + <span className="text-primary font-bold">1</span>)<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400 font-bold">return</span> max_len
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notes' && (
                                <div className="p-7 bg-[#0c0c12] font-sans text-neutral-200 space-y-4 leading-relaxed">
                                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                        <IoDocumentTextOutline className="text-primary" />
                                        Personal Architecture & Dry-Run Notes
                                    </h4>
                                    <p className="text-base text-neutral-300">
                                        Contracting left pointer via single increments is O(2N). Using a dictionary of last observed indices allows an immediate jump to <code className="text-primary font-mono font-bold">last_seen[char] + 1</code> for strictly O(N) linear runtime complexity.
                                    </p>
                                    <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-700 text-sm text-neutral-300">
                                        <strong>Edge case alert:</strong> Ensure the updated character index is strictly within the active window boundary (<code className="text-primary font-mono">&gt;= left</code>).
                                    </div>
                                </div>
                            )}

                            {activeTab === 'video' && (
                                <div className="p-12 bg-[#0c0c12] font-sans flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                                        <IoPlayOutline size={30} className="ml-0.5" />
                                    </div>
                                    <h4 className="font-bold text-lg text-white">Pattern Walkthrough & Invariant Proofs</h4>
                                    <p className="text-sm sm:text-base text-neutral-300 max-w-md">
                                        Watch step-by-step memory dry runs and invariant proofs directly inside your solving environment without leaving Sarthi.
                                    </p>
                                </div>
                            )}

                            {/* Complex Diagnostic Output Drawer */}
                            <div className="border-t border-neutral-700 bg-[#0a0a0f] p-4 text-xs font-mono">
                                <div className="flex items-center gap-5 mb-2.5 border-b border-neutral-700 pb-2.5 text-neutral-300">
                                    <button
                                        onClick={() => setConsoleOutput('tests')}
                                        className={`hover:text-white cursor-pointer ${consoleOutput === 'tests' ? 'text-primary font-bold' : ''}`}
                                    >
                                        [TESTS: 48/48 PASSED]
                                    </button>
                                    <button
                                        onClick={() => setConsoleOutput('mem')}
                                        className={`hover:text-white cursor-pointer ${consoleOutput === 'mem' ? 'text-primary font-bold' : ''}`}
                                    >
                                        [MEMORY: 16.4 MB (TOP 95%)]
                                    </button>
                                    <button
                                        onClick={() => setConsoleOutput('asm')}
                                        className={`hover:text-white cursor-pointer ${consoleOutput === 'asm' ? 'text-primary font-bold' : ''}`}
                                    >
                                        [BYTECODE TRACE]
                                    </button>
                                </div>

                                {consoleOutput === 'tests' && (
                                    <div className="text-emerald-400">
                                        ✓ Case 1: s = "abcabcbb" → 3 [PASSED, 0.4ms]<br />
                                        ✓ Case 2: s = "bbbbb"    → 1 [PASSED, 0.2ms]<br />
                                        ✓ Case 48 (Hidden Edge): s = " " * 100000 → 1 [PASSED, 2.1ms]
                                    </div>
                                )}
                                {consoleOutput === 'mem' && (
                                    <div className="text-neutral-200">
                                        Stack Allocation: 4.2 MB • Heap Allocation: 12.2 MB • Peak Overhead: 0.8 MB
                                    </div>
                                )}
                                {consoleOutput === 'asm' && (
                                    <div className="text-neutral-300">
                                        LOAD_FAST 0 (self) | LOAD_FAST 1 (s) | GET_ITER | FOR_ITER 28
                                    </div>
                                )}
                            </div>

                            {/* Clean Telemetry Bar */}
                            <div className="px-6 py-4 bg-[#14141f] border-t border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans text-sm text-neutral-300">
                                <div className="flex items-center gap-2.5 shrink-0">
                                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-neutral-200 font-medium">Execution Verified Against Edge Cases</span>
                                </div>
                                <div className="flex items-center gap-4 font-mono text-neutral-100">
                                    <span>Runtime: <strong className="text-white">12ms</strong></span>
                                    <span className="text-neutral-500">•</span>
                                    <span>Memory: <strong className="text-white">16.4MB</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* 9. REPOLISHED PHILOSOPHY & FOUNDER SECTION */}
            <section id="philosophy" className="py-28 bg-[#111118]/90 backdrop-blur-md border-y border-neutral-800 relative z-10">
                <div className="max-w-[1140px] mx-auto px-6 sm:px-10 lg:px-12">

                    {/* Header Pill */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider mb-3">
                            <IoRibbonOutline size={15} />
                            <span>Origins & Guiding Conviction</span>
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                            The Meaning of "Sarathi"
                        </h2>
                        <p className="text-neutral-400 text-base sm:text-lg mt-2">
                            A philosophical anchor for disciplined, long-term technical preparation.
                        </p>
                    </div>

                    {/* Master Card */}
                    <div className="rounded-3xl border border-neutral-700/80 bg-[#14141f]/95 backdrop-blur-xl p-8 sm:p-12 shadow-2xl space-y-10">

                        {/* Profile & Identity Banner */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-neutral-700/80">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-3xl bg-primary/20 border border-primary/40 text-primary flex items-center justify-center text-2xl font-black shadow-inner">
                                    BA
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Balaji Aadesh</h3>
                                        <IoCheckmarkCircle className="text-primary" size={20} />
                                    </div>
                                    <p className="text-base text-neutral-300 font-mono mt-0.5">Creator & Systems Architect, Sarthi</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 font-mono text-xs text-neutral-300">
                                <IoShieldOutline className="text-primary" size={16} />
                                <span>AUTHENTIC_ENGINEERING_PHILOSOPHY</span>
                            </div>
                        </div>

                        {/* Three Pillars of Sarthi */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-2xl bg-[#181824] border border-neutral-700/80 space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                                    <IoCompassOutline size={22} />
                                </div>
                                <h4 className="text-lg font-bold text-white">The Charioteer's Role</h4>
                                <p className="text-sm text-neutral-300 leading-relaxed font-normal">
                                    In Sanskrit, <em>Sarathi</em> is the charioteer—the one who holds the reins, steadies the traveler, and navigates through the storm. Sarthi steers you away from blind guessing toward disciplined, pattern-first clarity.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-[#181824] border border-neutral-700/80 space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                                    <IoFlameOutline size={22} />
                                </div>
                                <h4 className="text-lg font-bold text-white">Discipline Over Chaos</h4>
                                <p className="text-sm text-neutral-300 leading-relaxed font-normal">
                                    Engineering preparation shouldn't mean drowning in 3,000 disconnected questions. It requires direction over randomness, understanding over grinding, and consistency over frantic bursts.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-[#181824] border border-neutral-700/80 space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                                    <IoSyncOutline size={22} />
                                </div>
                                <h4 className="text-lg font-bold text-white">Permanent Retention</h4>
                                <p className="text-sm text-neutral-300 leading-relaxed font-normal">
                                    A problem solved once is easily forgotten 14 days later. Sarthi turns scattered attempts into an active recall pipeline so your conceptual mastery stays permanent when it counts.
                                </p>
                            </div>
                        </div>

                        {/* Founder Quote */}
                        <div className="p-6 rounded-2xl bg-[#181824] border-l-4 border-primary border-t border-r border-b border-neutral-700/80">
                            <p className="text-base sm:text-lg text-neutral-200 leading-relaxed italic font-normal">
                                "We did not build Sarthi to be another random problem bank. Sarthi exists to be the charioteer for engineers who value craftsmanship, deep algorithmic reasoning, and the quiet confidence of genuine preparation."
                            </p>
                            <span className="block mt-3 text-xs font-mono font-bold uppercase tracking-widest text-primary">
                                — Balaji Aadesh
                            </span>
                        </div>

                    </div>
                </div>
            </section>

            {/* 10. FREQUENTLY ASKED QUESTIONS */}
            <section id="faq" className="py-24 max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 relative z-10">
                <div className="text-center mb-16">
                    <span className="text-sm font-black uppercase tracking-widest text-primary">Got Questions?</span>
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-2">
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="divide-y divide-neutral-800 border-y border-neutral-800">
                    {faqs.map((faq, idx) => {
                        const isOpen = openFaq === idx;
                        return (
                            <div key={idx} className="py-7">
                                <button
                                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                                    className="w-full flex items-center justify-between text-left cursor-pointer group"
                                >
                                    <span className="text-lg sm:text-xl font-bold text-neutral-100 group-hover:text-primary transition-colors pr-6">
                                        {faq.q}
                                    </span>
                                    <span className="text-primary font-bold text-2xl">
                                        {isOpen ? '−' : '+'}
                                    </span>
                                </button>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="pt-5 text-base sm:text-lg text-neutral-300 leading-relaxed font-normal">
                                                {faq.a}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 11. FINAL CALL TO ACTION */}
            <section className="py-24 text-center border-t border-neutral-800 relative z-10">
                <div className="max-w-2xl mx-auto px-6 sm:px-10 lg:px-12 space-y-6">
                    <h2 className="text-3xl sm:text-5xl font-black text-white">
                        Build your preparation with <span className="text-primary">direction.</span>
                    </h2>
                    <p className="text-neutral-200 text-base sm:text-lg font-normal">
                        Master algorithmic patterns, machine coding drills, and long-term retention starting today.
                    </p>
                    <div className="pt-4">
                        <button
                            onClick={() => navigate(isAuthenticated ? '/' : '/register')}
                            className="px-9 py-4 bg-primary hover:bg-primaryHover text-white text-base font-bold rounded-xl transition-all shadow-lg shadow-primary/25 cursor-pointer active:scale-95"
                        >
                            {isAuthenticated ? "Enter My Workspace →" : "Start Preparing with Sarthi →"}
                        </button>
                    </div>
                </div>
            </section>

            {/* 12. FOOTER */}
            <footer className="py-16 bg-[#0a0a10]/95 backdrop-blur-md border-t border-neutral-800 text-neutral-300 text-sm relative z-10">
                <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-black text-base">
                                S
                            </div>
                            <span className="text-xl font-black text-white">Sarthi</span>
                        </div>
                        <p className="text-sm text-neutral-300 leading-relaxed font-normal">
                            A structured technical workspace designed for long-term algorithmic and low-level system design retention.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>ALL_SYSTEMS_OPERATIONAL</span>
                        </div>
                    </div>

                    <div>
                        <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Curricula</h5>
                        <ul className="space-y-2.5 text-sm text-neutral-300">
                            <li><button onClick={() => handleEnterModule('dsa')} className="hover:text-white cursor-pointer">Data Structures & Algorithms</button></li>
                            <li><button onClick={() => handleEnterModule('lld')} className="hover:text-white cursor-pointer">Low-Level Design (LLD)</button></li>
                            <li><button onClick={() => navigate('/register')} className="hover:text-white cursor-pointer">Machine Coding Drills</button></li>
                            <li><button onClick={() => navigate('/register')} className="hover:text-white cursor-pointer">Core Computer Science</button></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Architecture</h5>
                        <ul className="space-y-2.5 text-sm text-neutral-300">
                            <li><button onClick={() => handleScrollTo('capabilities')} className="hover:text-white cursor-pointer">Ebbinghaus Spaced Recall</button></li>
                            <li><button onClick={() => handleScrollTo('capabilities')} className="hover:text-white cursor-pointer">Weakness Detection Engine</button></li>
                            <li><button onClick={() => handleScrollTo('workspace')} className="hover:text-white cursor-pointer">In-House Code Judge</button></li>
                            <li><button onClick={() => handleScrollTo('companies')} className="hover:text-white cursor-pointer">Company Target Signals</button></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Creator</h5>
                        <p className="text-sm text-neutral-300 leading-relaxed">
                            Architected by <strong className="text-white">Balaji Aadesh</strong> for engineers seeking disciplined technical mastery.
                        </p>
                        <p className="text-xs text-neutral-400 mt-4 font-mono">
                            © {new Date().getFullYear()} Sarthi. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLandingPage;