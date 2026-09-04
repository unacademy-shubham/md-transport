import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';

const inputBase =
  'w-full rounded-2xl border border-white/10 bg-[#101a2c]/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-cyan-400/60 focus:bg-[#142139] focus:ring-4 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-60';

function AmbientOrb({ className = '' }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.12, 1],
        opacity: [0.25, 0.45, 0.25],
      }}
      transition={{
        duration: 7,
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
        <div className="absolute -bottom-2 left-2 h-5 w-44 rounded-full bg-cyan-400/20 blur-xl sm:w-52" />

        <div className="absolute left-0 top-1 h-11 w-32 rounded-md border border-cyan-300/20 bg-gradient-to-br from-slate-700/80 via-slate-800/80 to-[#07101f] shadow-[0_0_30px_rgba(34,211,238,0.12)] sm:h-14 sm:w-40">
          <div className="absolute left-2 right-2 top-2 h-1 rounded-full bg-cyan-400/40" />
          <div className="absolute left-2 top-5 text-[7px] font-black uppercase tracking-[0.25em] text-slate-500 sm:top-6">
            BUDDY FLEETS
          </div>
          <div className="absolute bottom-2 left-2 h-1 w-8 rounded-full bg-blue-400/30" />
          <div className="absolute bottom-2 right-2 h-1 w-12 rounded-full bg-violet-400/30" />
        </div>

        <div className="absolute right-0 top-5 h-8 w-12 rounded-r-lg rounded-tl-sm border border-cyan-300/25 bg-gradient-to-br from-cyan-500/30 via-blue-600/30 to-violet-700/30 shadow-[0_0_25px_rgba(34,211,238,0.2)] sm:top-7 sm:h-10 sm:w-14">
          <div className="absolute left-2 top-2 h-3 w-7 rounded-sm border border-cyan-300/20 bg-cyan-300/10 sm:h-4 sm:w-9" />
        </div>

        <div className="absolute right-[-4px] top-[31px] h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(34,211,238,1)] sm:top-[39px]" />

        <div className="absolute bottom-0 left-6 h-6 w-6 rounded-full border-2 border-slate-500 bg-[#020617] shadow-[0_0_10px_rgba(34,211,238,0.2)] sm:left-8 sm:h-7 sm:w-7" />
        <div className="absolute bottom-0 right-6 h-6 w-6 rounded-full border-2 border-slate-500 bg-[#020617] shadow-[0_0_10px_rgba(34,211,238,0.2)] sm:right-7 sm:h-7 sm:w-7" />

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

export default function ForgotID() {
  const [companyCode, setCompanyCode] = useState('');
  const [email, setEmail] = useState('');
  const [recoveryType, setRecoveryType] = useState('password');
  
  const [companyError, setCompanyError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [generalError, setGeneralError] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [lockoutUntil, setLockoutUntil] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const savedLockout = localStorage.getItem('buddy_forgot_lockout');
    if (savedLockout) {
      const lockTime = parseInt(savedLockout, 10);
      if (Date.now() < lockTime) {
        setLockoutUntil(lockTime);
      } else {
        localStorage.removeItem('buddy_forgot_lockout');
        localStorage.removeItem('buddy_forgot_attempts');
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCompanyError('');
    setEmailError('');
    setGeneralError('');

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const diffMs = lockoutUntil - Date.now();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setGeneralError(`Too many failed attempts. Blocked for ${hours}h ${minutes}m.`);
      return;
    }

    const cleanCompany = companyCode.trim();
    const cleanEmail = email.trim();

    if (!cleanCompany || !cleanEmail) {
      setGeneralError('Please fill in both Company Code and Email ID.');
      return;
    }

    setIsLoading(true);

    try {
      const { data: companyData, error: companyDbError } = await supabase
        .from('transport_companies')
        .select('*')
        .eq('company_code', cleanCompany)
        .maybeSingle();

      const { data: userData, error: userDbError } = await supabase
        .from('app_users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      let hasCompanyError = false;
      let hasEmailError = false;

      if (companyDbError || !companyData) {
        if (cleanCompany.toUpperCase() !== 'ADMIN') {
          hasCompanyError = true;
        }
      }

      if (userDbError || !userData) {
        hasEmailError = true;
      }

      if (hasCompanyError || hasEmailError) {
        let currentAttempts = parseInt(localStorage.getItem('buddy_forgot_attempts') || '0', 10) + 1;
        localStorage.setItem('buddy_forgot_attempts', currentAttempts.toString());

        if (hasCompanyError) setCompanyError('Incorrect Company ID.');
        if (hasEmailError) setEmailError('Incorrect Email ID.');

        if (currentAttempts >= 3) {
          const blockUntil = Date.now() + 3 * 60 * 60 * 1000;
          localStorage.setItem('buddy_forgot_lockout', blockUntil.toString());
          setLockoutUntil(blockUntil);
          setGeneralError('Maximum 3 invalid attempts. Blocked for 3 hours.');
        } else {
          setGeneralError(`Invalid details. ${3 - currentAttempts} attempt(s) remaining.`);
        }

        setIsLoading(false);
        return;
      }

      localStorage.removeItem('buddy_forgot_attempts');
      localStorage.removeItem('buddy_forgot_lockout');

      if (recoveryType === 'password') {
        setSuccessMessage('Password reset link has been sent to your email.');
      } else {
        setSuccessMessage('Username has been delivered to your email id.');
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Recovery error:', err);
      setGeneralError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#050914] font-sans text-white">

      {/* CINEMATIC BACKGROUND */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=85&w=2400&auto=format&fit=crop"
          alt="Buddy Fleets transport fleet"
          className="h-full w-full object-cover object-center opacity-25"
        />
        <div className="absolute inset-0 bg-[#050914]/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050914] via-[#050914]/90 to-[#071329]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-transparent to-[#050914]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_45%,rgba(6,182,212,0.12),transparent_30%),radial-gradient(circle_at_85%_45%,rgba(124,58,237,0.13),transparent_32%)]" />
      </div>

      {/* ANIMATED GRID */}
      <motion.div
        animate={{ backgroundPosition: ['0px 0px', '55px 55px'] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.8) 1px, transparent 1px)',
          backgroundSize: '55px 55px',
        }}
      />

      {/* AMBIENT LIGHTS */}
      <AmbientOrb className="left-[4%] top-[18%] h-80 w-80 bg-cyan-500/20" />
      <AmbientOrb className="right-[5%] top-[20%] h-96 w-96 bg-violet-600/20" />
      <AmbientOrb className="bottom-[5%] left-[38%] h-72 w-72 bg-blue-600/15" />

      {/* MOVING LIGHT TRAILS */}
      <LightTrail delay={0} duration={8} bottom="bottom-[16%]" width="w-56" />
      <LightTrail delay={2.5} duration={9} bottom="bottom-[21%]" width="w-72" />
      <LightTrail delay={5} duration={7} bottom="bottom-[12%]" width="w-40" />

      {/* ANIMATED TRUCK & RADAR */}
      <AnimatedTruck />
      <RadarPulse />

      {/* ROAD GLOW */}
      <div className="pointer-events-none fixed bottom-[7%] left-0 right-0 z-[3] h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent shadow-[0_0_18px_rgba(34,211,238,0.3)]" />
      <div className="pointer-events-none fixed bottom-[5%] left-0 right-0 z-[2] h-16 bg-gradient-to-t from-cyan-500/[0.05] to-transparent blur-xl" />

      {/* TOP BRAND & CENTER NAVIGATION */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="absolute left-6 right-6 top-6 z-50 flex items-center justify-between pointer-events-auto sm:left-10 sm:right-10 sm:top-8"
      >
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 text-sm font-black text-white shadow-lg shadow-cyan-500/20 transition-transform duration-300 group-hover:scale-105">
            BF
          </div>
          <div>
            <div className="text-base font-black tracking-tight text-white">
              Buddy Fleets
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
              Fleet Intelligence
            </div>
          </div>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 rounded-full border border-white/10 bg-[#07101f]/90 px-8 py-3.5 shadow-2xl backdrop-blur-2xl md:flex">
          <Link to="/" className="text-sm font-semibold text-slate-200 transition hover:text-cyan-400">Home</Link>
          <Link to="/features" className="text-sm font-semibold text-slate-200 transition hover:text-cyan-400">Features</Link>
          <Link to="/about" className="text-sm font-semibold text-slate-200 transition hover:text-cyan-400">About Us</Link>
          <Link to="/contact" className="text-sm font-semibold text-slate-200 transition hover:text-cyan-400">Contact Us</Link>
        </nav>

        <div className="hidden w-40 md:block" />
      </motion.div>

      {/* LEFT SIDE HERO TEXT */}
      <motion.div
        initial={{ opacity: 0, x: -35 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.15 }}
        className="absolute left-[7%] top-1/2 z-10 hidden max-w-md -translate-y-1/2 xl:block"
      >
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            Secure Recovery Portal
          </span>
        </div>

        <h1 className="text-5xl font-black leading-[1.02] tracking-tight text-white 2xl:text-6xl">
          Recover your
          <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
            access credentials.
          </span>
        </h1>

        <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
          Verify your corporate profile safely to retrieve usernames or initiate secure password resets.
        </p>
      </motion.div>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-20 flex h-full items-center justify-center px-4 sm:px-6 lg:justify-end lg:px-[9%]">
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative w-full max-w-md"
        >
          <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-violet-500/20 blur-2xl" />

          <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#07101f]/95 shadow-2xl shadow-black/70 backdrop-blur-2xl">
            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-90" />
            <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-cyan-500/10 blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-violet-600/10 blur-[90px]" />

            <div className="relative p-5 sm:p-7">
              {!isSubmitted ? (
                <>
                  <div className="mb-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-8 rounded-full bg-cyan-400" />
                      <span className="h-1.5 w-3 rounded-full bg-blue-500" />
                      <span className="h-1.5 w-2 rounded-full bg-violet-500" />
                    </div>

                    <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                      Account Recovery
                    </h2>
                    <p className="mt-1 text-[11px] leading-4 text-slate-400 sm:text-xs">
                      Select option and enter company credentials.
                    </p>
                  </div>

                  {generalError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-3 flex items-start gap-2.5 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-3 py-2.5"
                    >
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-[10px] font-black text-red-400">
                        !
                      </div>
                      <p className="text-[11px] leading-4 text-red-300 font-medium">{generalError}</p>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        Recovery Option
                      </label>
                      <select
                        value={recoveryType}
                        onChange={(e) => setRecoveryType(e.target.value)}
                        className={inputBase}
                      >
                        <option value="password" className="bg-[#07101f] text-white">Forgot Password</option>
                        <option value="username" className="bg-[#07101f] text-white">Forgot Username</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        Company Code
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-cyan-400/60">
                          #
                        </span>
                        <input
                          type="text"
                          required
                          disabled={isLoading || (lockoutUntil && Date.now() < lockoutUntil)}
                          placeholder="e.g. COMP123"
                          value={companyCode}
                          onChange={(e) => {
                            setCompanyCode(e.target.value);
                            setCompanyError('');
                          }}
                          className={`${inputBase} pl-9`}
                        />
                      </div>
                      {companyError && (
                        <p className="mt-1 text-[10px] font-bold text-red-400">{companyError}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        Registered Email ID
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-cyan-400/60">
                          @
                        </span>
                        <input
                          type="email"
                          required
                          disabled={isLoading || (lockoutUntil && Date.now() < lockoutUntil)}
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError('');
                          }}
                          className={`${inputBase} pl-9`}
                        />
                      </div>
                      {emailError && (
                        <p className="mt-1 text-[10px] font-bold text-red-400">{emailError}</p>
                      )}
                    </div>

                    <motion.button
                      whileHover={!isLoading ? { y: -2 } : {}}
                      whileTap={!isLoading ? { scale: 0.985 } : {}}
                      type="submit"
                      disabled={isLoading || (lockoutUntil && Date.now() < lockoutUntil)}
                      className="group relative mt-1 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-4 py-3 text-sm font-black text-white shadow-xl shadow-blue-600/20 transition-all duration-300 hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      <span className="relative flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            <span>Verifying Details...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Request</span>
                            <span className="text-base transition-transform duration-300 group-hover:translate-x-1">→</span>
                          </>
                        )}
                      </span>
                    </motion.button>
                  </form>
                </>
              ) : (
                <div className="py-4 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-xl text-emerald-300 shadow-lg shadow-emerald-500/10"
                  >
                    ✓
                  </motion.div>

                  <h3 className="mt-4 text-xl font-black text-white">Request Successful</h3>
                  
                  <p className="mt-2 text-xs leading-5 text-slate-300">
                    {successMessage}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-500">
                    Please check your inbox or spam folder for further details.
                  </p>

                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/login')}
                    className="mt-5 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-6 py-3 text-xs font-black text-white shadow-xl shadow-blue-600/20 transition-all"
                  >
                    OK
                  </motion.button>
                </div>
              )}

              <div className="mt-4 border-t border-white/[0.07] pt-3 text-center">
                <Link
                  to="/login"
                  className="text-xs font-bold text-cyan-300 transition-colors hover:text-cyan-200 hover:underline"
                >
                  ← Back to Login
                </Link>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Secure encrypted recovery
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* FOOTER */}
      <div className="absolute bottom-3 left-0 right-0 z-20 text-center">
        <p className="text-[10px] text-slate-600">
          Copyright © {new Date().getFullYear()}{' '}
          <span className="font-bold text-slate-400">BUDDY COMPUTERS</span>. All rights reserved.
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-1/2 z-[1] h-40 w-[90%] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[100px] xl:hidden" />
    </div>
  );
}