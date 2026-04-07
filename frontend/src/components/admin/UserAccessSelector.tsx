'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, UserPlus, Loader2 } from 'lucide-react';
import { useUserSearch, type UserSearchResult } from '@/hooks/useUserSearch';
import type { ReportUserAccess } from '@/types/report.types';

interface UserAccessSelectorProps {
  value: number[];
  onChange: (ids: number[]) => void;
  existingUsers?: ReportUserAccess[];
}

export function UserAccessSelector({ value, onChange, existingUsers = [] }: UserAccessSelectorProps) {
  const { query, setQuery, results, isLoading } = useUserSearch();
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Inicializar usuarios seleccionados desde existingUsers
  useEffect(() => {
    if (existingUsers.length > 0 && selectedUsers.length === 0) {
      const mapped = existingUsers
        .filter((ru) => ru.usuario)
        .map((ru) => ({
          id: ru.usuario!.id,
          email: ru.usuario!.email,
          nombreCompleto: ru.usuario!.nombreCompleto,
        }));
      setSelectedUsers(mapped);
    }
  }, [existingUsers]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addUser = (user: UserSearchResult) => {
    if (value.includes(user.id)) return;
    const newIds = [...value, user.id];
    onChange(newIds);
    setSelectedUsers((prev) => [...prev, user]);
    setQuery('');
    setShowDropdown(false);
  };

  const removeUser = (userId: number) => {
    onChange(value.filter((id) => id !== userId));
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const filteredResults = results.filter((r) => !value.includes(r.id));

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
        Acceso especial por usuario (opcional)
      </label>

      {/* Chips de usuarios seleccionados */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedUsers.map((user) => (
            <span
              key={user.id}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {user.email}
              <button
                type="button"
                onClick={() => removeUser(user.id)}
                className="hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Buscador */}
      <div ref={wrapperRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => { if (query.length >= 3) setShowDropdown(true); }}
            placeholder="Buscar usuario por email..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-white/20 rounded-lg text-sm bg-white dark:bg-sidebar-main text-slate-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sidebar-accent/60 focus:border-transparent"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
          )}
        </div>

        {/* Dropdown de sugerencias */}
        {showDropdown && query.length >= 3 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-sidebar-main border border-slate-200 dark:border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-slate-500">Buscando...</div>
            ) : filteredResults.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500">
                {results.length > 0 ? 'Todos los resultados ya fueron agregados' : 'No se encontraron usuarios'}
              </div>
            ) : (
              filteredResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => addUser(user)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-slate-700 dark:text-gray-200">{user.email}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-gray-400">{user.nombreCompleto}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {query.length > 0 && query.length < 3 && (
        <p className="text-xs text-slate-500 mt-1">Escribe al menos 3 caracteres para buscar</p>
      )}
    </div>
  );
}
