import React, { useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

/* =========================================================
   DATA
========================================================= */

const stats = [
  {
    value: "18+",
    label: "Fleet Modules",
  },
  {
    value: "360°",
    label: "Fleet Visibility",
  },
  {
    value: "24/7",
    label: "Cloud Access",
  },
  {
    value: "1",
    label: "Unified Platform",
  },
];

const coreFeatures = [
  {
    number: "01",
    icon: "🚚",
    title: "FTL & PTL Operations",
    description:
      "Manage full truckload and part truckload operations, bookings, loading, unloading, trip allocation and delivery workflows from one platform.",
    image:
      "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=85",
    accent: "cyan",
  },
  {
    number: "02",
    icon: "🔧",
    title: "Workshop, Tyre & Spares",
    description:
      "Control preventive maintenance, workshop jobs, spare parts, tyre lifecycle and vehicle service history to reduce unnecessary downtime.",
    image:
      "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=85",
    accent: "violet",
  },
  {
    number: "03",
    icon: "₹",
    title: "Transport Finance & Ledgers",
    description:
      "Connect trip expenses, diesel, driver advances, party ledgers, invoices and settlements in one centralized financial workflow.",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=85",
    accent: "emerald",
  },
];

const workflow = [
  {
    step: "01",
    title: "Booking",
    text: "Create LR, Builty & consignment details.",
    icon: "📄",
  },
  {
    step: "02",
    title: "Dispatch",
    text: "Assign vehicle, driver and trip.",
    icon: "🚛",
  },
  {
    step: "03",
    title: "Tracking",
    text: "Monitor vehicle and trip progress.",
    icon: "📍",
  },
  {
    step: "04",
    title: "Delivery",
    text: "Capture ePOD and delivery status.",
    icon: "✓",
  },
  {
    step: "05",
    title: "Settlement",
    text: "Close trip and update financials.",
    icon: "₹",
  },
];

const benefits = [
  {
    icon: "🛡️",
    title: "Secure Fleet Data",
    text: "Keep your vehicle, driver, party and financial records inside one controlled system.",
    accent: "cyan",
  },
  {
    icon: "⚡",
    title: "Fast Operations",
    text: "Designed to reduce repetitive data entry and help transport teams work faster.",
    accent: "blue",
  },
  {
    icon: "👥",
    title: "Role-Based Access",
    text: "Give owners, managers, accountants and operators the access they actually need.",
    accent: "violet",
  },
];

/* =========================================================
   AMBIENT ORB
========================================================= */

function AmbientOrb({
  className = "",
  duration = 12,
  delay = 0,
}) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full blur-[100px] opacity-20 ${className}`}
      animate={{
        x: [0, 35, -25, 0],
        y: [0, -25, 30, 0],
        scale: [1, 1.15, 0.92, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* =========================================================
   FLOATING DATA CARD
========================================================= */

function FloatingDataCard({
  className,
  title,
  value,
  subtitle,
  icon,
  accent = "cyan",
}) {
  const accents = {
    cyan: {
      border: "border-cyan-400/20",
      iconBg: "bg-cyan-400/10",
      iconText: "text-cyan-300",
      value: "text-cyan-300",
    },
    blue: {
      border: "border-blue-400/20",
      iconBg: "bg-blue-400/10",
      iconText: "text-blue-300",
      value: "text-blue-300",
    },
    violet: {
      border: "border-violet-400/20",
      iconBg: "bg-violet-400/10",
      iconText: "text-violet-300",
      value: "text-violet-300",
    },
  };

  const color = accents[accent];

  return (
    <motion.div
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute hidden rounded-2xl border ${color.border} bg-[#0c1422]/90 p-4 shadow-2xl backdrop-blur-xl sm:block ${className}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${color.iconBg} ${color.iconText}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
            {title}
          </p>

          <p className={`mt-1 text-lg font-black ${color.value}`}>
            {value}
          </p>

          <p className="mt-0.5 text-[10px] text-white/30">
            {subtitle}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   MAIN HOME
========================================================= */

export default function Home() {
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const rawHeroY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, 180]
  );

  const heroY = useSpring(rawHeroY, {
    stiffness: 80,
    damping: 25,
  });

  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.7],
    [1, 0]
  );

  const imageScale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, 1.12]
  );

  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -45]
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b14] text-white">

      {/* =====================================================
          GLOBAL BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#070b14]" />

        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />

        <AmbientOrb
          className="left-[3%] top-[8%] h-[420px] w-[420px] bg-cyan-500"
          duration={14}
        />

        <AmbientOrb
          className="right-[2%] top-[25%] h-[450px] w-[450px] bg-violet-600"
          duration={17}
          delay={2}
        />

        <AmbientOrb
          className="bottom-[10%] left-[35%] h-[400px] w-[400px] bg-blue-600"
          duration={16}
          delay={4}
        />
      </div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center overflow-hidden px-5 py-28 sm:px-8 lg:px-12"
      >
        {/* Hero background glow */}
        <div className="absolute left-1/2 top-[30%] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[150px]" />

        <motion.div
          style={{
            y: heroY,
            opacity: heroOpacity,
          }}
          className="relative mx-auto w-full max-w-7xl"
        >
          <div className="grid items-center gap-16 lg:grid-cols-[1fr_0.92fr]">

            {/* =================================================
                HERO LEFT
            ================================================= */}

            <div className="relative z-10">

              <motion.div
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.7,
                }}
                className="mb-7 inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2 backdrop-blur-xl"
              >
                <motion.span
                  animate={{
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="h-2 w-2 rounded-full bg-cyan-400"
                />

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300 sm:text-xs">
                  India's Transport Management Platform
                </span>
              </motion.div>

              <motion.h1
                initial={{
                  opacity: 0,
                  y: 45,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.9,
                  delay: 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="max-w-4xl text-5xl font-black leading-[0.94] tracking-tight sm:text-6xl lg:text-[82px]"
              >
                Run your fleet.
                <br />

                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Smarter.
                </span>
              </motion.h1>

              <motion.p
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.3,
                }}
                className="mt-8 max-w-2xl text-base leading-8 text-white/50 sm:text-lg"
              >
                Buddy Fleets connects trips, LR/Bilty, vehicles, drivers,
                diesel, maintenance, tyres, compliance, accounting and
                settlements into one intelligent transport command center.
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.45,
                }}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  to="/signup"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-4 text-sm font-black text-slate-950 shadow-2xl shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-400/30"
                >
                  Start Free Trial

                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  to="/features"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] px-7 py-4 text-sm font-bold text-white/75 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                >
                  Explore Features
                </Link>
              </motion.div>

              {/* Trust mini row */}
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.7,
                  duration: 0.8,
                }}
                className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/30"
              >
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  Fleet Management
                </span>

                <span className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  Transport Operations
                </span>

                <span className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  Finance & Compliance
                </span>
              </motion.div>
            </div>

            {/* =================================================
                HERO RIGHT
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.88,
                x: 50,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
              }}
              transition={{
                duration: 1,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative mx-auto w-full max-w-[570px]"
            >
              {/* Outer glow */}
              <div className="absolute -inset-8 rounded-[45px] bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-violet-500/20 blur-3xl" />

              {/* Dashboard frame */}
              <div className="relative rounded-[34px] border border-white/10 bg-white/[0.045] p-3 shadow-2xl shadow-black/50 backdrop-blur-2xl">

                <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#0b111c]">

                  {/* Dashboard top bar */}
                  <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                    </div>

                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">
                      Buddy Fleets Command Center
                    </div>

                    <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                  </div>

                  {/* Hero image */}
                  <div className="relative h-[390px] overflow-hidden">
                    <motion.img
                      style={{
                        scale: imageScale,
                        y: imageY,
                      }}
                      src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1400&q=85"
                      alt="Commercial transport truck"
                      className="h-full w-full object-cover opacity-70"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#080d16] via-[#080d16]/20 to-transparent" />

                    {/* Scan line */}
                    <motion.div
                      animate={{
                        y: ["-20%", "120%"],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute left-0 right-0 top-0 h-24 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent"
                    />

                    {/* Radar circles */}
                    <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/20">
                      <motion.div
                        animate={{
                          scale: [0.7, 1.35],
                          opacity: [0.6, 0],
                        }}
                        transition={{
                          duration: 2.6,
                          repeat: Infinity,
                        }}
                        className="absolute inset-0 rounded-full border border-cyan-400/30"
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
                        <div className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom bg-gradient-to-t from-cyan-400 to-transparent" />
                      </motion.div>
                    </div>

                    {/* Vehicle marker */}
                    <motion.div
                      animate={{
                        y: [0, -7, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-400/15 text-2xl shadow-xl shadow-cyan-500/30 backdrop-blur-xl"
                    >
                      🚛
                    </motion.div>

                    {/* Bottom telemetry */}
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">
                              Fleet Telemetry
                            </p>

                            <p className="mt-1 text-sm font-bold text-white">
                              Vehicle Monitoring Active
                            </p>
                          </div>

                          <span className="flex items-center gap-2 text-[10px] font-semibold text-emerald-300">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                            LIVE
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <div className="rounded-xl bg-white/[0.05] p-3">
                            <p className="text-[9px] text-white/30">
                              Vehicles
                            </p>
                            <p className="mt-1 text-sm font-bold text-white">
                              128
                            </p>
                          </div>

                          <div className="rounded-xl bg-white/[0.05] p-3">
                            <p className="text-[9px] text-white/30">
                              Trips
                            </p>
                            <p className="mt-1 text-sm font-bold text-white">
                              46
                            </p>
                          </div>

                          <div className="rounded-xl bg-white/[0.05] p-3">
                            <p className="text-[9px] text-white/30">
                              Alerts
                            </p>
                            <p className="mt-1 text-sm font-bold text-amber-300">
                              08
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <FloatingDataCard
                className="-left-8 top-20"
                title="Fleet Status"
                value="98.4%"
                subtitle="Operational"
                icon="⚡"
                accent="cyan"
              />

              <FloatingDataCard
                className="-right-8 bottom-20"
                title="Trips Today"
                value="142"
                subtitle="Consignments"
                icon="📊"
                accent="violet"
              />
            </motion.div>
          </div>

          {/* =================================================
              STATS
          ================================================= */}

          <div className="mt-20 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.65 + index * 0.08,
                }}
                whileHover={{
                  y: -5,
                }}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl"
              >
                <p className="text-3xl font-black text-white">
                  {stat.value}
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{
            y: [0, 8, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        >
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/30">
            Explore
          </span>

          <div className="h-8 w-px bg-gradient-to-b from-cyan-400/70 to-transparent" />
        </motion.div>
      </section>

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="relative px-5 py-32 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">

            <motion.div
              initial={{
                opacity: 0,
                x: -50,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.8,
              }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
                One connected ecosystem
              </p>

              <h2 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
                Your transport business.
                <br />

                <span className="text-white/30">
                  One command center.
                </span>
              </h2>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: 50,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.8,
                delay: 0.1,
              }}
              className="flex items-end"
            >
              <p className="max-w-3xl text-base leading-8 text-white/45 sm:text-lg">
                Stop jumping between registers, spreadsheets, WhatsApp
                messages and disconnected systems. Buddy Fleets gives your
                team a single operational layer for the entire fleet.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CORE FEATURES
      ===================================================== */}

      <section className="relative px-5 pb-32 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">

          <div className="mb-14 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
                Core capabilities
              </p>

              <h2 className="mt-4 text-4xl font-black sm:text-5xl">
                Built for serious transport operations.
              </h2>
            </div>

            <Link
              to="/features"
              className="group inline-flex items-center gap-2 text-sm font-bold text-white/50 transition hover:text-white"
            >
              View all modules

              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {coreFeatures.map((feature, index) => (
              <motion.article
                key={feature.number}
                initial={{
                  opacity: 0,
                  y: 70,
                  rotateX: 10,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -8,
                }}
                className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur-xl"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-110 group-hover:opacity-80"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#080d16] via-[#080d16]/20 to-transparent" />

                  <div className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-lg backdrop-blur-xl">
                    {feature.icon}
                  </div>

                  <span className="absolute right-5 top-5 text-xs font-mono text-white/35">
                    {feature.number}
                  </span>
                </div>

                <div className="p-7">
                  <h3 className="text-xl font-black text-white transition-colors group-hover:text-cyan-300">
                    {feature.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-white/45">
                    {feature.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-xs font-bold text-white/30 transition-all group-hover:gap-4 group-hover:text-white/70">
                    Discover module
                    <span>→</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          WORKFLOW
      ===================================================== */}

      <section className="relative border-y border-white/5 px-5 py-32 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">

          <div className="mb-16 max-w-3xl">
            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400"
            >
              End-to-end workflow
            </motion.p>

            <motion.h2
              initial={{
                opacity: 0,
                y: 25,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.1,
              }}
              className="mt-5 text-4xl font-black sm:text-6xl"
            >
              From booking to settlement.
              <br />

              <span className="text-white/30">
                Everything stays connected.
              </span>
            </motion.h2>
          </div>

          <div className="relative">

            {/* Connecting line */}
            <div className="absolute left-[10%] right-[10%] top-8 hidden h-px bg-gradient-to-r from-cyan-400/10 via-cyan-400/40 to-violet-400/10 lg:block" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {workflow.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{
                    opacity: 0,
                    y: 40,
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
                    duration: 0.6,
                    delay: index * 0.1,
                  }}
                  className="relative"
                >
                  <motion.div
                    whileHover={{
                      y: -8,
                    }}
                    className="relative z-10 h-full rounded-3xl border border-white/10 bg-[#0a101b] p-6 transition-colors hover:border-cyan-400/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl">
                        {item.icon}
                      </div>

                      <span className="text-[10px] font-mono text-white/25">
                        {item.step}
                      </span>
                    </div>

                    <h3 className="mt-7 text-lg font-black">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-xs leading-6 text-white/40">
                      {item.text}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          COMMAND CENTER
      ===================================================== */}

      <section className="relative px-5 py-32 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">

          <div className="grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">

            {/* Text */}
            <motion.div
              initial={{
                opacity: 0,
                x: -50,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.8,
              }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
                Fleet intelligence
              </p>

              <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
                See your entire operation.
                <br />

                <span className="text-white/30">
                  At a glance.
                </span>
              </h2>

              <p className="mt-6 text-sm leading-8 text-white/45 sm:text-base">
                Get a clear picture of active trips, vehicles, expenses,
                deliveries and pending actions without digging through
                multiple registers.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Trip & LR visibility",
                  "Vehicle & driver status",
                  "Finance & diesel monitoring",
                  "Maintenance & compliance alerts",
                ].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{
                      opacity: 0,
                      x: -20,
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay: index * 0.08,
                    }}
                    className="flex items-center gap-3 text-sm text-white/60"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-xs text-emerald-300">
                      ✓
                    </span>

                    {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Dashboard */}
            <motion.div
              initial={{
                opacity: 0,
                x: 50,
                scale: 0.95,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 0.8,
              }}
              className="relative"
            >
              <div className="absolute -inset-8 rounded-[40px] bg-violet-500/10 blur-3xl" />

              <div className="relative rounded-[30px] border border-white/10 bg-white/[0.035] p-3 shadow-2xl shadow-black/40 backdrop-blur-2xl">

                <div className="rounded-[23px] border border-white/5 bg-[#0b111c] p-5 sm:p-7">

                  {/* Dashboard header */}
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                        Live command center
                      </p>

                      <h3 className="mt-2 text-xl font-black">
                        Fleet Overview
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-[10px] font-bold text-emerald-300">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                      SYSTEM ONLINE
                    </div>
                  </div>

                  {/* Metric cards */}
                  <div className="mt-7 grid grid-cols-2 gap-3">
                    {[
                      {
                        label: "Active Vehicles",
                        value: "128",
                        change: "+12%",
                        icon: "🚛",
                      },
                      {
                        label: "Running Trips",
                        value: "46",
                        change: "+08%",
                        icon: "🛣️",
                      },
                      {
                        label: "Deliveries",
                        value: "142",
                        change: "+18%",
                        icon: "📦",
                      },
                      {
                        label: "Pending Alerts",
                        value: "08",
                        change: "Action",
                        icon: "🔔",
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{
                          opacity: 0,
                          y: 20,
                        }}
                        whileInView={{
                          opacity: 1,
                          y: 0,
                        }}
                        viewport={{
                          once: true,
                        }}
                        transition={{
                          delay: index * 0.08,
                        }}
                        whileHover={{
                          y: -3,
                        }}
                        className="rounded-2xl border border-white/5 bg-white/[0.025] p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">
                            {item.icon}
                          </span>

                          <span
                            className={`text-[9px] font-bold ${
                              item.label === "Pending Alerts"
                                ? "text-amber-300"
                                : "text-emerald-300"
                            }`}
                          >
                            {item.change}
                          </span>
                        </div>

                        <p className="mt-4 text-2xl font-black">
                          {item.value}
                        </p>

                        <p className="mt-1 text-[9px] uppercase tracking-wider text-white/30">
                          {item.label}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Graph */}
                  <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white/70">
                          Operational Performance
                        </p>

                        <p className="mt-1 text-[9px] text-white/25">
                          Last 7 days
                        </p>
                      </div>

                      <span className="text-xs font-bold text-cyan-300">
                        +24.8%
                      </span>
                    </div>

                    <div className="mt-7 flex h-32 items-end gap-2">
                      {[35, 52, 43, 70, 61, 82, 94, 75, 88, 100].map(
                        (height, index) => (
                          <motion.div
                            key={index}
                            initial={{
                              height: 0,
                            }}
                            whileInView={{
                              height: `${height}%`,
                            }}
                            viewport={{
                              once: true,
                            }}
                            transition={{
                              duration: 0.7,
                              delay: index * 0.05,
                              ease: "easeOut",
                            }}
                            className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-600/20 to-cyan-400/70"
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          BENEFITS
      ===================================================== */}

      <section className="relative px-5 py-28 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">

          <div className="mb-14 text-center">
            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400"
            >
              Why Buddy Fleets
            </motion.p>

            <motion.h2
              initial={{
                opacity: 0,
                y: 25,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.1,
              }}
              className="mt-4 text-4xl font-black sm:text-5xl"
            >
              Built around real fleet problems.
            </motion.h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{
                  opacity: 0,
                  y: 40,
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
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -7,
                }}
                className="group rounded-[28px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-colors duration-300 hover:border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl">
                    {benefit.icon}
                  </div>

                  <span className="text-xs font-mono text-white/20">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-black">
                  {benefit.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-white/40">
                  {benefit.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          CINEMATIC CTA
      ===================================================== */}

      <section className="relative px-5 py-28 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.94,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.8,
            }}
            className="relative overflow-hidden rounded-[38px] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/[0.10] via-blue-500/[0.05] to-violet-500/[0.10] px-7 py-16 text-center sm:px-12 sm:py-20"
          >
            {/* Glow */}
            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-[100px]" />

            {/* Grid */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "50px 50px",
              }}
            />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
                Ready to modernize?
              </p>

              <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
                Your fleet deserves
                <br />

                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  better technology.
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
                Bring your transport operations together with Buddy Fleets
                and build a faster, cleaner and more connected workflow.
              </p>

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/signup"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-sm font-black text-slate-950 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-50"
                >
                  Get Started

                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  to="/features"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-4 text-sm font-bold text-white/75 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                >
                  Explore Platform
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom spacing */}
      <div className="h-10" />
    </main>
  );
}