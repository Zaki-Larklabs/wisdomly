'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Environment } from '@react-three/drei';
import { Shield, GraduationCap, Users, UserCircle, ArrowRight, Eye, EyeOff, Sparkles, ChevronDown } from 'lucide-react';
import { useLogin } from '@/hooks/useLogin'; // Your newly decoupled logic

const ROLES = [
  { id: 'ADMIN', label: 'Administrator', icon: Shield, color: '#6366F1', desc: 'Manage your entire school' },
  { id: 'TEACHER', label: 'Teacher', icon: GraduationCap, color: '#0EA5E9', desc: 'Your classroom, your way' },
  { id: 'STUDENT', label: 'Student', icon: UserCircle, color: '#10B981', desc: 'Learn and grow' },
  { id: 'PARENT', label: 'Parent', icon: Users, color: '#F59E0B', desc: 'Stay connected' },
] as const;

// --- WebGL Ambient Background ---
function AmbientBackground({ activeColor }: { activeColor: string }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Floating, distorting liquid orb */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
          <Sphere args={[1.5, 64, 64]} position={[1.5, 0, -2]}>
            <MeshDistortMaterial
              color={activeColor}
              envMapIntensity={1}
              clearcoat={1}
              clearcoatRoughness={0.1}
              metalness={0.8}
              roughness={0.2}
              distort={0.4}
              speed={2}
            />
          </Sphere>
        </Float>
      </Canvas>
      
      {/* Volumetric light overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 70% 50%, ${activeColor}15 0%, transparent 50%), 
                       radial-gradient(circle at 30% 80%, ${activeColor}10 0%, transparent 40%)`,
          mixBlendMode: 'screen'
        }}
      />
    </div>
  );
}

// --- Main Page Component ---
export default function LoginPage() {
  const {
    role, setRole,
    identifier, setIdentifier,
    password, setPassword,
    schoolSlug, setSchoolSlug,
    showPw, setShowPw,
    loading, error,
    roleOpen, setRoleOpen,
    handleSubmit
  } = useLogin();

  const activeRole = ROLES.find(r => r.id === role)!;
  const identifierLabel = role === 'STUDENT' ? 'Roll Number' : 'Email or Phone';
  const identifierPlaceholder = role === 'STUDENT' ? 'e.g. 10A001' : 'Enter your email or phone';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0C0A09] selection:bg-indigo-500/30">
      
      {/* 3D WebGL Layer */}
      <AmbientBackground activeColor={activeRole.color} />

      {/* Grid Texture Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
      />

      {/* UI Layer */}
      <motion.div 
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div 
          className="rounded-3xl p-8 overflow-hidden"
          style={{
            background: 'rgba(20, 18, 16, 0.65)',
            backdropFilter: 'blur(40px) saturate(2)',
            WebkitBackdropFilter: 'blur(40px) saturate(2)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <motion.div 
              layout
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${activeRole.color}, ${activeRole.color}88)` }}
            >
              <Sparkles size={18} color="white" strokeWidth={2} />
            </motion.div>
            <div>
              <p className="font-semibold text-sm text-white tracking-tight">Wisdomly OS</p>
              <p className="text-xs text-white/40">Enterprise Platform</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl text-white mb-2" style={{ fontFamily: 'var(--w-font-display, "Instrument Serif", serif)' }}>
              Welcome back
            </h1>
            <p className="text-sm text-white/50">
              Sign in to your {activeRole.label.toLowerCase()} workspace
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl mb-6 flex items-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Custom Role Selector (Spatial Dropdown) */}
            <div className="relative">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">
                Scope Role
              </label>
              <button
                type="button"
                onClick={() => setRoleOpen(!roleOpen)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-inner" style={{ background: `${activeRole.color}30` }}>
                  <activeRole.icon size={14} style={{ color: activeRole.color }} strokeWidth={2} />
                </div>
                <span className="flex-1 text-left text-white font-medium">{activeRole.label}</span>
                <motion.div animate={{ rotate: roleOpen ? 180 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
                  <ChevronDown size={16} className="text-white/40" />
                </motion.div>
              </button>

              <AnimatePresence>
                {roleOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="absolute top-[calc(100%+8px)] left-0 right-0 rounded-2xl overflow-hidden z-50 border border-white/10"
                    style={{ background: 'rgba(20,18,16,0.8)', backdropFilter: 'blur(20px)', boxShadow: '0 24px 48px rgba(0,0,0,0.8)' }}
                  >
                    {ROLES.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => { setRole(r.id); setRoleOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-white/5 text-left"
                        style={{ color: role === r.id ? r.color : 'rgba(255,255,255,0.6)' }}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${r.color}20` }}>
                          <r.icon size={14} style={{ color: r.color }} />
                        </div>
                        <div>
                          <p className="font-medium">{r.label}</p>
                          <p className="text-[10px] text-white/30">{r.desc}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* School Slug (Hidden for Super Admins) */}
            <AnimatePresence mode="popLayout">
              {role !== 'SUPER_ADMIN' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">School Domain</label>
                  <input
                    type="text"
                    value={schoolSlug}
                    onChange={e => setSchoolSlug(e.target.value)}
                    placeholder="e.g. greenvalley-school"
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all placeholder:text-white/20 text-white"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', caretColor: activeRole.color }}
                    onFocus={e => (e.target.style.borderColor = activeRole.color)}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Identifier Input */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">{identifierLabel}</label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder={identifierPlaceholder}
                required
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all placeholder:text-white/20 text-white"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', caretColor: activeRole.color }}
                onFocus={e => (e.target.style.borderColor = activeRole.color)}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">Security Key</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm outline-none transition-all placeholder:text-white/20 text-white"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', caretColor: activeRole.color }}
                  onFocus={e => (e.target.style.borderColor = activeRole.color)}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 relative overflow-hidden group"
              style={{ background: `linear-gradient(135deg, ${activeRole.color}, ${activeRole.color}cc)` }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  Authenticate <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}