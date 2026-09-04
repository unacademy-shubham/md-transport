import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const inputBase =
  'w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-cyan-400/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-cyan-400/10';

function AmbientOrb({ className = '' }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.12, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`pointer-events-none absolute rounded-full blur-[110px] ${className}`}
    />
  );
}

function LightTrail({
  delay = 0,
  duration = 8,
  bottom = 'bottom-[16%]',
  width = 'w-48',
}) {
  return (
    <motion.div
      initial={{
        x: '-30vw',
        opacity: 0,
      }}
      animate={{
        x: '130vw',
        opacity: [0, 0.4, 0.7, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={`pointer-events-none absolute left-0 ${bottom} h-px ${width} bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent`}
    />
  );
}

function AnimatedTruck() {
  return (
    <motion.div
      initial={{
        x: '-20vw',
        opacity: 0,
      }}
      animate={{
        x: '125vw',
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 22,
        repeat: Infinity,
        repeatDelay: 3,
        ease: 'linear',
      }}
      className="pointer-events-none absolute bottom-[7%] left-0 z-[4]"
    >
      <div className="relative h-16 w-44 sm:h-20 sm:w-56">

        {/* TRUCK UNDER GLOW */}
        <div className="absolute -bottom-2 left-2 h-5 w-44 rounded-full bg-cyan-400/20 blur-xl sm:w-52" />

        {/* TRAILER */}
        <div className="absolute left-0 top-1 h-11 w-32 rounded-md border border-cyan-300/20 bg-gradient-to-br from-slate-700/80 via-slate-800/80 to-[#07101f] shadow-[0_0_30px_rgba(34,211,238,0.12)] sm:h-14 sm:w-40">
          <div className="absolute left-2 right-2 top-2 h-1 rounded-full bg-cyan-400/40" />

          <div className="absolute left-2 top-5 text-[7px] font-black uppercase tracking-[0.25em] text-slate-500 sm:top-6">
            BUDDY FLEETS
          </div>

          <div className="absolute bottom-2 left-2 h-1 w-8 rounded-full bg-blue-400/30" />

          <div className="absolute bottom-2 right-2 h-1 w-12 rounded-full bg-violet-400/30" />
        </div>

        {/* CABIN */}
        <div className="absolute right-0 top-5 h-8 w-12 rounded-r-lg rounded-tl-sm border border-cyan-300/25 bg-gradient-to-br from-cyan-500/30 via-blue-600/30 to-violet-700/30 shadow-[0_0_25px_rgba(34,211,238,0.2)] sm:top-7 sm:h-10 sm:w-14">
          <div className="absolute left-2 top-2 h-3 w-7 rounded-sm border border-cyan-300/20 bg-cyan-300/10 sm:h-4 sm:w-9" />
        </div>

        {/* FRONT LIGHT */}
        <div className="absolute right-[-4px] top-[31px] h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(34,211,238,1)] sm:top-[39px]" />

        {/* WHEELS */}
        <div className="absolute bottom-0 left-6 h-6 w-6 rounded-full border-2 border-slate-500 bg-[#020617] shadow-[0_0_10px_rgba(34,211,238,0.2)] sm:left-8 sm:h-7 sm:w-7" />

        <div className="absolute bottom-0 right-6 h-6 w-6 rounded-full border-2 border-slate-500 bg-[#020617] shadow-[0_0_10px_rgba(34,211,238,0.2)] sm:right-7 sm:h-7 sm:w-7" />

        {/* WHEEL HUBS */}
        <div className="absolute bottom-[7px] left-[35px] h-2 w-2 rounded-full bg-slate-600 sm:bottom-[8px] sm:left-[42px]" />

        <div className="absolute bottom-[7px] right-[35px] h-2 w-2 rounded-full bg-slate-600 sm:bottom-[8px] sm:right-[42px]" />
      </div>
    </motion.div>
  );
}

function RadarPulse() {
  return (
    <div className="pointer-events-none absolute right-[10%] top-[35%] hidden h-40 w-40 lg:block">

      <motion.div
        animate={{
          scale: [0.7, 1.4],
          opacity: [0.45, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeOut',
        }}
        className="absolute inset-0 rounded-full border border-cyan-400/20"
      />

      <motion.div
        animate={{
          scale: [0.7, 1.4],
          opacity: [0.3, 0],
        }}
        transition={{
          duration: 3,
          delay: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
        className="absolute inset-0 rounded-full border border-cyan-400/15"
      />

      <div className="absolute inset-[20%] rounded-full border border-cyan-400/10" />

      <div className="absolute inset-[38%] rounded-full border border-cyan-400/20 bg-cyan-400/5" />

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute left-1/2 top-1/2 h-[1px] w-1/2 origin-left bg-gradient-to-r from-cyan-400/70 to-transparent"
      />

      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,1)]" />
    </div>
  );
}

export default function Signup() {
  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({
    companyName: '',
    yourName: '',
    email: '',
    mobile: '',
    password: '',
    terms: false,
  });

  // =========================================================
  // UI STATES
  // =========================================================

  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // =========================================================
  // PASSWORD VALIDATION
  // =========================================================

  const passwordRules = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    symbol: /[\W_]/.test(formData.password),
  };

  const isPasswordValid =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number &&
    passwordRules.symbol;

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // ---------------------------------------------------------
    // MOBILE NUMBER
    // Only numbers allowed
    // ---------------------------------------------------------

    if (name === 'mobile') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);

      setFormData((prev) => ({
        ...prev,
        mobile: numericValue,
      }));

      setError('');
      return;
    }

    // ---------------------------------------------------------
    // NORMAL INPUT / CHECKBOX
    // ---------------------------------------------------------

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setError('');
  };

  // =========================================================
  // HANDLE REGISTER
  // =========================================================

  const handleRegister = (e) => {
    e.preventDefault();

    // ---------------------------------------------------------
    // COMPANY NAME
    // ---------------------------------------------------------

    if (!formData.companyName.trim()) {
      setError('Please enter your company name.');
      return;
    }

    // ---------------------------------------------------------
    // YOUR NAME
    // ---------------------------------------------------------

    if (!formData.yourName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    // ---------------------------------------------------------
    // EMAIL
    // ---------------------------------------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    // ---------------------------------------------------------
    // MOBILE
    // ---------------------------------------------------------

    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // ---------------------------------------------------------
    // PASSWORD
    // ---------------------------------------------------------

    if (!isPasswordValid) {
      setError(
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.'
      );
      return;
    }

    // ---------------------------------------------------------
    // TERMS
    // ---------------------------------------------------------

    if (!formData.terms) {
      setError(
        'Please accept the terms before creating your account.'
      );
      return;
    }

    // ---------------------------------------------------------
    // BACKEND API INTEGRATION POINT
    // ---------------------------------------------------------
    //
    // Yahan future mein signup API connect kar sakte ho.
    //
    // Example:
    //
    // await fetch('/api/signup', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(formData),
    // });
    //
    // ---------------------------------------------------------

    setError('');
    setSubmitted(true);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#050914] font-sans text-white">

      {/* =====================================================
          CINEMATIC BACKGROUND
      ===================================================== */}

      <div className="fixed inset-0 z-0 overflow-hidden">

        <img
          src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=85&w=2400&auto=format&fit=crop"
          alt="Buddy Fleets transport fleet"
          className="h-full w-full object-cover object-center opacity-45"
        />

        {/* Main dark overlay */}
        <div className="absolute inset-0 bg-[#050914]/70" />

        {/* Horizontal gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050914] via-[#050914]/85 to-[#071329]/70" />

        {/* Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-transparent to-[#050914]/50" />

      </div>

      {/* =====================================================
          ANIMATED GRID
      ===================================================== */}

      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.7) 1px, transparent 1px)',
          backgroundSize: '55px 55px',
        }}
      />

      {/* =====================================================
          AMBIENT LIGHTS
      ===================================================== */}

      <AmbientOrb className="left-[5%] top-[12%] h-80 w-80 bg-cyan-500/20" />

      <AmbientOrb className="right-[8%] top-[20%] h-96 w-96 bg-violet-600/20" />

      <AmbientOrb className="bottom-[5%] left-[35%] h-72 w-72 bg-blue-600/15" />

      {/* =====================================================
          MOVING LIGHT TRAILS
      ===================================================== */}

      <LightTrail delay={0} duration={8} bottom="bottom-[16%]" width="w-56" />

      <LightTrail delay={2.5} duration={9} bottom="bottom-[21%]" width="w-72" />

      <LightTrail delay={5} duration={7} bottom="bottom-[12%]" width="w-40" />

      {/* =====================================================
          ANIMATED TRUCK
      ===================================================== */}

      <AnimatedTruck />

      {/* =====================================================
          RADAR
      ===================================================== */}

      <RadarPulse />

      {/* =====================================================
          ROAD GLOW
      ===================================================== */}

      <div className="pointer-events-none fixed bottom-[7%] left-0 right-0 z-[3] h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent shadow-[0_0_18px_rgba(34,211,238,0.3)]" />

      <div className="pointer-events-none fixed bottom-[5%] left-0 right-0 z-[2] h-16 bg-gradient-to-t from-cyan-500/[0.05] to-transparent blur-xl" />

      {/* =====================================================
          TOP BRAND & CENTER NAVIGATION
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.7,
        }}
        className="absolute left-6 right-6 top-6 z-50 flex items-center justify-between pointer-events-auto sm:left-10 sm:right-10 sm:top-8"
      >
        <Link
          to="/"
          className="group flex items-center gap-3"
        >

          {/* Logo */}

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 text-sm font-black text-white shadow-lg shadow-cyan-500/20 transition-transform duration-300 group-hover:scale-105">
            BF
          </div>

          {/* Brand */}

          <div>

            <div className="text-base font-black tracking-tight text-white">
              Buddy Fleets
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
              Fleet Intelligence
            </div>

          </div>

        </Link>

        {/* TOP CENTER NAVIGATION LINKS */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 rounded-full border border-white/10 bg-[#07101f]/90 px-8 py-3.5 shadow-2xl backdrop-blur-2xl md:flex">
          <Link to="/" className="text-sm font-semibold text-slate-200 hover:text-cyan-400 transition">Home</Link>
          <Link to="/features" className="text-sm font-semibold text-slate-200 hover:text-cyan-400 transition">Features</Link>
          <Link to="/about" className="text-sm font-semibold text-slate-200 hover:text-cyan-400 transition">About Us</Link>
          <Link to="/contact" className="text-sm font-semibold text-slate-200 hover:text-cyan-400 transition">Contact Us</Link>
        </nav>

        {/* Balanced Spacer for Flex Layout */}
        <div className="hidden md:block w-40"></div>
      </motion.div>

      {/* =====================================================
          LEFT SIDE HERO
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          x: -35,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 0.9,
          delay: 0.15,
        }}
        className="absolute left-[7%] top-1/2 z-10 hidden max-w-md -translate-y-1/2 xl:block"
      >

        {/* Badge */}

        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 backdrop-blur-md">

          <span className="relative flex h-2 w-2">

            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />

          </span>

          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            Start Your Fleet Journey
          </span>

        </div>

        {/* Main heading */}

        <h1 className="text-5xl font-black leading-[1.02] tracking-tight text-white 2xl:text-6xl">

          Run your fleet

          <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
            smarter.
          </span>

        </h1>

        {/* Description */}

        <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
          Bring vehicles, drivers, trips, expenses, compliance and workshop
          operations together in one intelligent transport command center.
        </p>

        {/* Benefits */}

        <div className="mt-8 space-y-3">

          {[
            '5-day free demo',
            'Centralized fleet operations',
            'Real-time visibility & control',
          ].map((item, index) => (
            <motion.div
              key={item}
              initial={{
                opacity: 0,
                x: -15,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.5 + index * 0.1,
              }}
              className="flex items-center gap-3 text-xs font-medium text-slate-300"
            >

              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-[10px] text-cyan-300">
                ✓
              </span>

              {item}

            </motion.div>
          ))}

        </div>

      </motion.div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="relative z-20 flex h-full items-center justify-center px-4 sm:px-6 lg:justify-end lg:px-[9%]">

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
          className="relative w-full max-w-md"
        >

          {/* =================================================
              CARD OUTER GLOW
          ================================================== */}

          <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-violet-500/20 blur-2xl" />

          {/* =================================================
              MAIN CARD
          ================================================== */}

          <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#07101f]/95 shadow-2xl shadow-black/60 backdrop-blur-2xl">

            {/* Top accent */}

            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

            {/* Internal cyan glow */}

            <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-cyan-500/10 blur-[90px]" />

            {/* Internal violet glow */}

            <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-violet-600/10 blur-[90px]" />

            {/* =================================================
                CARD CONTENT
            ================================================== */}

            <div className="relative p-5 sm:p-6">

              {/* =================================================
                  HEADER
              ================================================== */}

              <div className="mb-3">

                <div className="mb-1.5 flex items-center gap-2">

                  <span className="h-1.5 w-8 rounded-full bg-cyan-400" />

                  <span className="h-1.5 w-3 rounded-full bg-blue-500" />

                  <span className="h-1.5 w-2 rounded-full bg-violet-500" />

                </div>

                <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                  Create your account
                </h2>

                <p className="mt-0.5 text-[11px] leading-4 text-slate-400">
                  Start managing transport operations with 5-day free demo.
                </p>

              </div>

              {/* =================================================
                  FORM
              ================================================== */}

              {!submitted ? (

                <form
                  onSubmit={handleRegister}
                  noValidate
                  className="space-y-2.5"
                >

                  {/* =================================================
                      COMPANY + NAME
                  ================================================== */}

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">

                    {/* Company */}

                    <div>

                      <label
                        htmlFor="companyName"
                        className="mb-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400"
                      >
                        Company Name
                      </label>

                      <input
                        id="companyName"
                        type="text"
                        name="companyName"
                        required
                        autoComplete="organization"
                        placeholder="Company name"
                        value={formData.companyName}
                        onChange={handleChange}
                        className={inputBase}
                      />

                    </div>

                    {/* Name */}

                    <div>

                      <label
                        htmlFor="yourName"
                        className="mb-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400"
                      >
                        Your Name
                      </label>

                      <input
                        id="yourName"
                        type="text"
                        name="yourName"
                        required
                        autoComplete="name"
                        placeholder="Full name"
                        value={formData.yourName}
                        onChange={handleChange}
                        className={inputBase}
                      />

                    </div>

                  </div>

                  {/* =================================================
                      EMAIL
                  ================================================== */}

                  <div>

                    <label
                      htmlFor="email"
                      className="mb-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400"
                    >
                      Email Address
                    </label>

                    <div className="relative">

                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-cyan-400/60">
                        @
                      </span>

                      <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${inputBase} pl-9`}
                      />

                    </div>

                  </div>

                  {/* =================================================
                      MOBILE
                  ================================================== */}

                  <div>

                    <label
                      htmlFor="mobile"
                      className="mb-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400"
                    >
                      Mobile Number
                    </label>

                    <div className="relative">

                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                        +91
                      </span>

                      <input
                        id="mobile"
                        type="tel"
                        name="mobile"
                        required
                        autoComplete="tel"
                        inputMode="numeric"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        placeholder="10-digit mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className={`${inputBase} pl-14`}
                      />

                    </div>

                  </div>

                  {/* =================================================
                      PASSWORD
                  ================================================== */}

                  <div>

                    <label
                      htmlFor="password"
                      className="mb-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400"
                    >
                      Password
                    </label>

                    <div className="relative">

                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        autoComplete="new-password"
                        maxLength={8}
                        placeholder="Secure password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`${inputBase} pr-20`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => !prev)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-500 transition-colors hover:bg-white/5 hover:text-cyan-300"
                        aria-label={
                          showPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                      >
                        {showPassword ? 'HIDE' : 'SHOW'}
                      </button>

                    </div>

                    {/* =================================================
                        PASSWORD CRITERIA
                    ================================================== */}

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[9px]">

                      <span
                        className={
                          passwordRules.length
                            ? 'font-bold text-cyan-400'
                            : 'text-slate-500'
                        }
                      >
                        • 8 Chars
                      </span>

                      <span
                        className={
                          passwordRules.uppercase
                            ? 'font-bold text-cyan-400'
                            : 'text-slate-500'
                        }
                      >
                        • A-Z
                      </span>

                      <span
                        className={
                          passwordRules.lowercase
                            ? 'font-bold text-cyan-400'
                            : 'text-slate-500'
                        }
                      >
                        • a-z
                      </span>

                      <span
                        className={
                          passwordRules.number
                            ? 'font-bold text-cyan-400'
                            : 'text-slate-500'
                        }
                      >
                        • 0-9
                      </span>

                      <span
                        className={
                          passwordRules.symbol
                            ? 'font-bold text-cyan-400'
                            : 'text-slate-500'
                        }
                      >
                        • Symbol
                      </span>

                    </div>

                  </div>

                  {/* =================================================
                      ERROR MESSAGE
                  ================================================== */}

                  {error && (

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -5,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="rounded-xl border border-red-400/20 bg-red-400/[0.06] px-3 py-2"
                      role="alert"
                    >

                      <div className="flex items-start gap-2">

                        <span className="mt-0.5 text-red-400">
                          !
                        </span>

                        <p className="text-[10px] leading-4 text-red-300">
                          {error}
                        </p>

                      </div>

                    </motion.div>

                  )}

                  {/* =================================================
                      TERMS CHECKBOX
                  ================================================== */}

                  <div className="pt-0.5">

                    <label
                      htmlFor="terms"
                      className="group flex cursor-pointer items-start gap-2.5 select-none"
                    >

                      {/* Real checkbox */}

                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        checked={formData.terms}
                        onChange={handleChange}
                        className="peer sr-only"
                      />

                      {/* Custom checkbox */}

                      <span
                        aria-hidden="true"
                        className="
                          mt-0.5
                          flex
                          h-4
                          w-4
                          shrink-0
                          items-center
                          justify-center
                          rounded
                          border
                          border-white/15
                          bg-white/[0.03]
                          text-[10px]
                          font-black
                          text-transparent
                          transition-all
                          duration-200
                          group-hover:border-cyan-400/40
                          peer-checked:border-cyan-400
                          peer-checked:bg-cyan-400
                          peer-checked:text-slate-950
                        "
                      >
                        ✓
                      </span>

                      {/* Terms text */}

                      <span className="text-[10px] leading-3.5 text-slate-500 transition-colors duration-200 group-hover:text-slate-400">
                        I agree to use Buddy Fleets responsibly and provide accurate business info.
                      </span>

                    </label>

                  </div>

                  {/* =================================================
                      SUBMIT BUTTON
                  ================================================== */}

                  <motion.button
                    whileHover={{
                      y: -2,
                    }}
                    whileTap={{
                      scale: 0.985,
                    }}
                    type="submit"
                    className="
                      group
                      relative
                      mt-1
                      w-full
                      overflow-hidden
                      rounded-2xl
                      bg-gradient-to-r
                      from-cyan-400
                      via-blue-500
                      to-violet-600
                      px-4
                      py-3
                      text-sm
                      font-black
                      text-white
                      shadow-xl
                      shadow-blue-600/20
                      transition-all
                      duration-300
                      hover:shadow-cyan-500/20
                      focus:outline-none
                      focus:ring-4
                      focus:ring-cyan-400/20
                    "
                  >

                    {/* Button shine */}

                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                    <span className="relative flex items-center justify-center gap-2">

                      Start 5-Day Free Demo

                      <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>

                    </span>

                  </motion.button>

                </form>

              ) : (

                /* =================================================
                    SUCCESS STATE
                ================================================== */

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.6,
                  }}
                  className="py-4 text-center"
                >

                  {/* Success icon */}

                  <motion.div
                    initial={{
                      scale: 0,
                    }}
                    animate={{
                      scale: 1,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 180,
                      delay: 0.15,
                    }}
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-xl text-emerald-300 shadow-lg shadow-emerald-500/10"
                  >
                    ✓
                  </motion.div>

                  {/* Heading */}

                  <h3 className="mt-4 text-xl font-black text-white">
                    Check Your Email
                  </h3>

                  {/* Message */}

                  <p className="mt-2 text-xs leading-5 text-slate-300">
                    We have sent a confirmation link to{' '}
                    <span className="font-semibold text-cyan-300">
                      {formData.email}
                    </span>
                    . Click the link inside the email to verify your account.
                  </p>

                  {/* Login button */}

                  <motion.button
                    whileHover={{
                      y: -2,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    type="button"
                    onClick={() => navigate('/login')}
                    className="
                      mt-5
                      w-full
                      rounded-2xl
                      bg-gradient-to-r
                      from-cyan-400
                      via-blue-500
                      to-violet-600
                      px-6
                      py-3
                      text-xs
                      font-black
                      text-white
                      shadow-xl
                      shadow-blue-600/20
                      transition-all
                    "
                  >
                    Go to Login →
                  </motion.button>

                </motion.div>

              )}

              {/* =================================================
                  LOGIN REDIRECT
              ================================================== */}

              <div className="mt-3 border-t border-white/[0.07] pt-2.5 text-center">

                <p className="text-xs text-slate-500">

                  Already have a company account?{' '}

                  <Link
                    to="/login"
                    className="font-bold text-cyan-300 transition-colors hover:text-cyan-200 hover:underline"
                  >
                    Log in here
                  </Link>

                </p>

              </div>

            </div>

          </div>

        </motion.div>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="absolute bottom-2 left-0 right-0 z-20 text-center">

        <p className="text-[10px] text-slate-600">

          Copyright © {new Date().getFullYear()}{' '}

          <span className="font-bold text-slate-400">
            BUDDY COMPUTERS
          </span>

          . All rights reserved.

        </p>

      </div>

      {/* MOBILE BOTTOM GLOW */}

      <div className="pointer-events-none absolute bottom-0 left-1/2 z-[1] h-40 w-[80%] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[100px] xl:hidden" />

    </div>
  );
}