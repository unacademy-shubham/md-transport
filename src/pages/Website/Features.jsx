import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";

/* =========================================================
   FEATURE DATA (QR Tracking #11 removed, 17 modules left)
========================================================= */

const features = [
  {
    id: 1,
    title: "Smart Dashboard & Reports",
    shortTitle: "Dashboard & Reports",
    description:
      "Get a complete real-time view of your fleet, trips, revenue, expenses, vehicles, drivers and operational performance from one intelligent dashboard.",
    category: "Analytics",
    icon: "📊",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=85",
    accent: "cyan",
  },
  {
    id: 2,
    title: "Expense & Earning Monitoring",
    shortTitle: "Expenses & Earnings",
    description:
      "Track every operational expense and earning to understand where your money is going and how your fleet is performing.",
    category: "Finance",
    icon: "💰",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=85",
    accent: "purple",
  },
  {
    id: 3,
    title: "Automated Toll Tracking",
    shortTitle: "Toll Tracking",
    description:
      "Keep toll expenses organized by vehicle, route and trip while maintaining a clear picture of transportation costs.",
    category: "Operations",
    icon: "🛣️",
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=85",
    accent: "blue",
  },
  {
    id: 4,
    title: "Unit Economics",
    shortTitle: "Unit Economics",
    description:
      "Measure vehicle-level profitability, cost per kilometre, trip economics and operating margins to make smarter decisions.",
    category: "Analytics",
    icon: "📈",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=85",
    accent: "violet",
  },
  {
    id: 5,
    title: "Driver Payments",
    shortTitle: "Driver Payments",
    description:
      "Manage driver advances, trip payments, deductions, balances and settlements with a transparent payment workflow.",
    category: "Finance",
    icon: "👨‍✈️",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=85",
    accent: "purple",
  },
  {
    id: 6,
    title: "LR / Builty / Consignment Notes",
    shortTitle: "LR & Consignments",
    description:
      "Create and manage digital LR, Builty and consignment records while keeping shipment information accessible in one place.",
    category: "Documentation",
    icon: "📄",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=85",
    accent: "blue",
  },
  {
    id: 7,
    title: "ePOD — Electronic Proof of Delivery",
    shortTitle: "ePOD",
    description:
      "Capture digital proof of delivery and keep delivery confirmation connected with the corresponding trip and consignment.",
    category: "Delivery",
    icon: "✓",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=85",
    accent: "cyan",
  },
  {
    id: 8,
    title: "Duty & Dispatch Allocation",
    shortTitle: "Dispatch Allocation",
    description:
      "Assign vehicles and drivers to trips with a structured dispatch workflow that helps reduce operational confusion.",
    category: "Operations",
    icon: "🚚",
    image:
      "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1600&q=85",
    accent: "violet",
  },
  {
    id: 9,
    title: "Document & Maintenance Alerts",
    shortTitle: "Alerts & Compliance",
    description:
      "Stay ahead of expiry dates, service schedules, permits, insurance and other important vehicle documents.",
    category: "Compliance",
    icon: "🔔",
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=85",
    accent: "purple",
  },
  {
    id: 10,
    title: "Real-Time Vehicle Tracking",
    shortTitle: "Live Tracking",
    description:
      "Monitor vehicle movement and fleet activity with a modern tracking experience designed for transportation operations.",
    category: "Tracking",
    icon: "📍",
    image:
      "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1600&q=85",
    accent: "blue",
  },
  {
    id: 12,
    title: "Vehicle & Driver Records",
    shortTitle: "Fleet Records",
    description:
      "Maintain structured records for vehicles and drivers including ownership, documents, assignments and operational history.",
    category: "Fleet",
    icon: "🚛",
    image:
      "https://images.unsplash.com/photo-1586191582151-f73872dfd183?auto=format&fit=crop&w=1600&q=85",
    accent: "violet",
  },
  {
    id: 13,
    title: "Tyre Management",
    shortTitle: "Tyre Management",
    description:
      "Track tyre inventory, fitment, rotation, replacement and lifecycle information for better fleet maintenance.",
    category: "Maintenance",
    icon: "⭕",
    image:
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1600&q=85",
    accent: "purple",
  },
  {
    id: 14,
    title: "Driver Salary Management",
    shortTitle: "Driver Salary",
    description:
      "Manage salary structures, advances, deductions, trip-based earnings and settlement information for drivers.",
    category: "Payroll",
    icon: "💳",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=85",
    accent: "blue",
  },
  {
    id: 15,
    title: "Spare Part Management",
    shortTitle: "Spare Parts",
    description:
      "Monitor spare part inventory, usage, purchases and workshop consumption to maintain better stock control.",
    category: "Workshop",
    icon: "🔧",
    image:
      "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1600&q=85",
    accent: "cyan",
  },
  {
    id: 16,
    title: "Invoice & Settlements",
    shortTitle: "Invoices",
    description:
      "Organize customer invoices, transport settlements and financial records with a centralized workflow.",
    category: "Finance",
    icon: "🧾",
    image:
      "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1600&q=85",
    accent: "violet",
  },
  {
    id: 17,
    title: "Route Cost Planner",
    shortTitle: "Route Planner",
    description:
      "Estimate route-level costs using distance, fuel, tolls and other operational factors before assigning a trip.",
    category: "Planning",
    icon: "🗺️",
    image:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=85",
    accent: "blue",
  },
  {
    id: 18,
    title: "Challan Tracker",
    shortTitle: "Challan Tracker",
    description:
      "Maintain traffic challan records, penalties, payment status and vehicle-wise compliance history.",
    category: "Compliance",
    icon: "⚠️",
    image:
      "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1600&q=85",
    accent: "purple",
  },
];

/* =========================================================
   DARK BLUE + PURPLE THEME ACCENT CONFIG
========================================================= */

const accentStyles = {
  cyan: {
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    hoverBorder: "hover:border-cyan-400/60",
    glow: "bg-cyan-500",
    gradient: "from-cyan-500/20 via-purple-500/10 to-transparent",
  },
  blue: {
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    hoverBorder: "hover:border-blue-400/60",
    glow: "bg-blue-500",
    gradient: "from-blue-500/20 via-purple-500/10 to-transparent",
  },
  purple: {
    text: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    hoverBorder: "hover:border-purple-400/60",
    glow: "bg-purple-500",
    gradient: "from-purple-500/20 via-blue-500/10 to-transparent",
  },
  violet: {
    text: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    hoverBorder: "hover:border-violet-400/60",
    glow: "bg-violet-500",
    gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
  },
};

/* =========================================================
   FLOATING ORB
========================================================= */

function FloatingOrb({ className = "", delay = 0 }) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full blur-3xl opacity-25 ${className}`}
      animate={{
        x: [0, 35, -20, 0],
        y: [0, -30, 25, 0],
        scale: [1, 1.15, 0.9, 1],
      }}
      transition={{
        duration: 12,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* =========================================================
   TILT CARD
========================================================= */

function TiltCard({ children, className = "" }) {
  const cardRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [7, -7]),
    {
      stiffness: 180,
      damping: 20,
    }
  );

  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-7, 7]),
    {
      stiffness: 180,
      damping: 20,
    }
  );

  const handleMouseMove = (event) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={className}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

/* =========================================================
   FEATURE CARD (Explore module text removed)
========================================================= */

function FeatureCard({ feature, index }) {
  const colors = accentStyles[feature.accent] || accentStyles.purple;

  return (
    <TiltCard className="h-full">
      <motion.div
        initial={{
          opacity: 0,
          y: 60,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.15,
        }}
        transition={{
          duration: 0.65,
          delay: (index % 3) * 0.08,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`
          group relative h-full min-h-[400px]
          overflow-hidden rounded-[28px]
          border ${colors.border}
          ${colors.hoverBorder}
          bg-slate-900/60
          backdrop-blur-xl
          transition-all duration-500
        `}
      >
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.img
            src={feature.image}
            alt={feature.title}
            loading="lazy"
            className="h-full w-full object-cover opacity-[0.16] transition-all duration-700 group-hover:scale-110 group-hover:opacity-[0.28]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-[#0a0f1d]/90 to-[#0a0f1d]/30" />
        </div>

        {/* Glow */}
        <div
          className={`absolute -right-20 -top-20 h-48 w-48 rounded-full ${colors.glow} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-25`}
        />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col p-7">
          <div className="flex items-start justify-between">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors.bg} border ${colors.border} text-2xl shadow-lg`}
            >
              {feature.icon}
            </div>

            <span
              className={`rounded-full border ${colors.border} ${colors.bg} px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${colors.text}`}
            >
              {feature.category}
            </span>
          </div>

          <div className="mt-auto pt-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-xs font-mono text-white/30">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="h-px flex-1 bg-white/10" />
            </div>

            <h3 className="max-w-[340px] text-2xl font-bold leading-tight text-white md:text-[26px]">
              {feature.title}
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-300/80">
              {feature.description}
            </p>
          </div>
        </div>
      </motion.div>
    </TiltCard>
  );
}

/* =========================================================
   MINI FEATURE
========================================================= */

function MiniFeature({ feature, index }) {
  const colors = accentStyles[feature.accent] || accentStyles.purple;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.04,
      }}
      whileHover={{
        y: -5,
      }}
      className={`group flex items-center gap-4 rounded-2xl border ${colors.border} bg-slate-900/50 p-4 backdrop-blur-md transition-all duration-300 hover:bg-slate-900/80 hover:border-purple-500/50`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors.bg} text-xl`}
      >
        {feature.icon}
      </div>

      <div className="min-w-0">
        <h4 className="truncate text-sm font-semibold text-white">
          {feature.shortTitle}
        </h4>

        <p className={`mt-1 text-[11px] ${colors.text}`}>
          {feature.category}
        </p>
      </div>

      <span className="ml-auto text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/60">
        →
      </span>
    </motion.div>
  );
}

/* =========================================================
   HERO STATS
========================================================= */

const stats = [
  {
    value: "17+",
    label: "Fleet Modules",
  },
  {
    value: "360°",
    label: "Fleet Visibility",
  },
  {
    value: "24/7",
    label: "Operational Access",
  },
  {
    value: "1",
    label: "Unified Platform",
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Features() {
  const heroRef = useRef(null);

  const [activeFeature, setActiveFeature] = useState(features[0]);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#0a0f1d] text-white">
      {/* =====================================================
          GLOBAL BACKGROUND & AMBIENT GLOWS
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0f1d]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />

        <FloatingOrb
          className="left-[5%] top-[15%] h-96 w-96 bg-blue-600/30 blur-[180px]"
          delay={0}
        />

        <FloatingOrb
          className="right-[5%] top-[25%] h-96 w-96 bg-purple-600/30 blur-[180px]"
          delay={2}
        />

        <FloatingOrb
          className="bottom-[10%] left-[35%] h-80 w-80 bg-indigo-600/30 blur-[160px]"
          delay={4}
        />
      </div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center overflow-hidden px-5 py-24 sm:px-8 lg:px-12"
      >
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/20 blur-[160px]" />

        <motion.div
          style={{
            y: heroY,
            opacity: heroOpacity,
          }}
          className="relative mx-auto w-full max-w-7xl"
        >
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="mb-7 inline-flex items-center gap-3 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 backdrop-blur-md"
              >
                <motion.span
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [0.9, 1.15, 0.9],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-purple-400"
                />

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
                  Buddy Fleets Intelligence
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.1 }}
                className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-8xl"
              >
                Your fleet.
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(147,51,234,0.5)]">
                  Completely connected.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-8 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
              >
                Buddy Fleets brings vehicles, drivers, trips, finance,
                maintenance, compliance and analytics together in one
                intelligent transport management platform.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="mt-9 flex flex-col gap-4 sm:flex-row"
              >
                <Link
                  to="/signup"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-purple-600/40 transition-all duration-300 hover:-translate-y-1 hover:from-blue-500 hover:to-purple-500"
                >
                  Start with Buddy Fleets
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <a
                  href="#modules"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/80 px-7 py-4 text-sm font-semibold text-slate-200 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/50 hover:bg-slate-800"
                >
                  Explore Modules
                </a>
              </motion.div>
            </div>

            {/* Right visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotateY: 12 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative mx-auto w-full max-w-[560px]"
            >
              <div className="absolute -inset-10 rounded-full bg-purple-600/20 blur-[90px]" />

              <div className="relative overflow-hidden rounded-[34px] border border-slate-700/80 bg-slate-950/80 p-3 shadow-2xl shadow-purple-950/60 backdrop-blur-xl">
                <div className="relative overflow-hidden rounded-[26px]">
                  <img
                    src={features[9].image}
                    alt="Buddy Fleets vehicle tracking"
                    className="h-[470px] w-full object-cover brightness-90 filter contrast-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-[#0a0f1d]/30 to-transparent" />

                  {/* Radar */}
                  <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-400/30">
                    <motion.div
                      animate={{ scale: [0.7, 1.3], opacity: [0.5, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full border border-purple-400/50"
                    />
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0"
                    >
                      <div className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom bg-gradient-to-t from-purple-400 to-transparent" />
                    </motion.div>
                  </div>

                  {/* Vehicle marker */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-[48%] top-[48%] flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-400/40 bg-purple-600/30 shadow-lg shadow-purple-600/50 backdrop-blur-xl"
                  >
                    🚚
                  </motion.div>

                  {/* Bottom card */}
                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-slate-800 bg-slate-950/90 p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          Fleet Intelligence
                        </p>
                        <p className="mt-1 text-lg font-bold text-white">
                          Live Operations
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-emerald-400">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                        Online
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 + index * 0.08 }}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-lg"
              >
                <div className="text-3xl font-black text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.5)]">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-slate-400 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="relative px-5 py-28 sm:px-8 lg:px-12 border-t border-slate-800/80">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">
                Built for transport businesses
              </span>

              <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl text-white">
                Everything your fleet needs.
                <br />
                <span className="text-slate-500">Nothing scattered.</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="flex items-end"
            >
              <p className="max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                From dispatch and documentation to finance, maintenance and
                compliance, Buddy Fleets gives your team one connected
                operating layer for the entire transportation business.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURE GRID (Heading updated to "Powerful modules")
      ===================================================== */}

      <section
        id="modules"
        className="relative px-5 pb-32 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                The ecosystem
              </p>

              <h2 className="mt-4 text-4xl font-black sm:text-5xl text-white">
                Powerful modules
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-slate-400">
              Designed to work together, so every part of your fleet operation
              stays connected.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                onMouseEnter={() => setActiveFeature(feature)}
              >
                <FeatureCard
                  feature={feature}
                  index={index}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          STICKY SHOWCASE
      ===================================================== */}

      <section className="relative px-5 py-32 sm:px-8 lg:px-12 border-t border-slate-800/80">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400"
            >
              One connected experience
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-4xl font-black sm:text-6xl text-white"
            >
              See your operation differently.
            </motion.h2>
          </div>

          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            {/* Left list */}
            <div className="space-y-3">
              {features.slice(0, 9).map((feature, index) => {
                const colors = accentStyles[feature.accent] || accentStyles.purple;
                const isActive = activeFeature.id === feature.id;

                return (
                  <motion.button
                    key={feature.id}
                    type="button"
                    onClick={() => setActiveFeature(feature)}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.04 }}
                    className={`w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
                      isActive
                        ? `${colors.border} bg-slate-900/90 shadow-lg shadow-purple-950/30`
                        : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          isActive ? colors.bg : "bg-slate-800/50"
                        }`}
                      >
                        {feature.icon}
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold ${
                            isActive ? "text-white" : "text-slate-300"
                          }`}
                        >
                          {feature.title}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          {feature.category}
                        </p>
                      </div>

                      <span
                        className={`ml-auto transition-all duration-300 ${
                          isActive ? colors.text : "text-slate-600"
                        }`}
                      >
                        →
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Right sticky visual */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <motion.div
                layout
                className="relative overflow-hidden rounded-[32px] border border-slate-700/80 bg-slate-950/90 p-3 shadow-2xl shadow-purple-950/50 backdrop-blur-xl"
              >
                <div className="relative overflow-hidden rounded-[25px]">
                  <motion.img
                    key={activeFeature.id}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7 }}
                    src={activeFeature.image}
                    alt={activeFeature.title}
                    className="h-[520px] w-full object-cover brightness-90 filter contrast-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-[#0a0f1d]/40 to-transparent" />

                  {/* Feature information */}
                  <motion.div
                    key={`content-${activeFeature.id}`}
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="absolute bottom-0 left-0 right-0 p-7 sm:p-10"
                  >
                    <div
                      className={`mb-5 inline-flex rounded-full border ${
                        (accentStyles[activeFeature.accent] || accentStyles.purple).border
                      } ${
                        (accentStyles[activeFeature.accent] || accentStyles.purple).bg
                      } px-4 py-2 backdrop-blur-md`}
                    >
                      <span
                        className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                          (accentStyles[activeFeature.accent] || accentStyles.purple).text
                        }`}
                      >
                        {activeFeature.category}
                      </span>
                    </div>

                    <h3 className="max-w-2xl text-3xl font-black leading-tight sm:text-5xl text-white">
                      {activeFeature.title}
                    </h3>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                      {activeFeature.description}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MINI MODULE GRID
      ===================================================== */}

      <section className="relative px-5 py-32 sm:px-8 lg:px-12 border-t border-slate-800/80">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">
              More control
            </p>

            <h2 className="mt-4 text-4xl font-black sm:text-5xl text-white">
              Every detail has a place.
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              From driver salaries to challans and spare parts, keep every
              operational detail organized inside the same platform.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.slice(9).map((feature, index) => (
              <MiniFeature
                key={feature.id}
                feature={feature}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          VISUAL BREAK
      ===================================================== */}

      <section className="relative px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-[36px] border border-slate-700 bg-slate-950"
          >
            <img
              src="https://images.unsplash.com/photo-1565610222536-ef125c59da2e?auto=format&fit=crop&w=2200&q=85"
              alt="Fleet operations"
              loading="lazy"
              className="h-[420px] w-full object-cover opacity-25 filter brightness-75"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1d] via-[#0a0f1d]/80 to-[#0a0f1d]/40" />

            <div className="absolute inset-0 flex items-center p-8 sm:p-14 lg:p-20">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                  Built around your fleet
                </p>

                <h2 className="mt-5 text-4xl font-black leading-tight sm:text-6xl text-white">
                  Less paperwork.
                  <br />
                  <span className="text-slate-500">More control.</span>
                </h2>

                <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                  Replace disconnected spreadsheets and scattered records with
                  a single operational system designed for modern transport
                  businesses.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="relative px-5 py-32 sm:px-8 lg:px-12">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[38px] border border-purple-500/40 bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-purple-950/60 p-10 text-center sm:p-16 lg:p-20 shadow-2xl backdrop-blur-2xl">
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/30 blur-[100px]" />

          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-400">
              Ready for the next level?
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-6xl text-white">
              Turn your fleet into a
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {" "}
                smarter operation.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Bring your vehicles, drivers, trips, finance and maintenance
              together with Buddy Fleets.
            </p>

            <div className="mt-9">
              <Link
                to="/signup"
                className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-purple-600/40 transition-all duration-300 hover:-translate-y-1 hover:from-blue-500 hover:to-purple-500"
              >
                Get Started with Buddy Fleets
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="h-10" />
    </main>
  );
}