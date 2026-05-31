'use client';
// hooks/useLogin.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export type RoleId = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'SUPER_ADMIN';

export function useLogin() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState<RoleId>('ADMIN');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [schoolSlug, setSchoolSlug] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roleOpen, setRoleOpen] = useState(false);

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({
        identifier,
        password,
        role,
        schoolSlug: role !== 'SUPER_ADMIN' ? schoolSlug : undefined,
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message || 'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return {
    role, setRole,
    identifier, setIdentifier,
    password, setPassword,
    schoolSlug, setSchoolSlug,
    showPw, setShowPw,
    loading, error,
    roleOpen, setRoleOpen,
    handleSubmit
  };
}