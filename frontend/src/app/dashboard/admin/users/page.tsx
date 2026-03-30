'use client';

import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { UserTable } from '@/components/admin/UserTable';
import { UserForm } from '@/components/admin/UserForm';
import { Modal } from '@/components/ui/Modal';
import type { User } from '@/types/user.types';

export default function AdminUsersPage() {
  const { users, meta, isLoadingList, query, setSearch, setPage, setSorting, setFilters, toggleActivo } = useUsers();
  const { roles } = useRoles();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleNew = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100">Gestión de Usuarios</h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
          Registra nuevos usuarios y asígnales un rol de acceso.
        </p>
      </div>

      <UserTable
        users={users}
        meta={meta}
        isLoading={isLoadingList}
        query={query}
        roles={roles}
        onSearch={setSearch}
        onPageChange={setPage}
        onSortChange={setSorting}
        onFilterRole={(rolId) => setFilters({ rolId })}
        onFilterActivo={(activo) => setFilters({ activo })}
        onNew={handleNew}
        onEdit={handleEdit}
        onToggleActivo={(user) => toggleActivo(user.id)}
      />

      <Modal
        isOpen={showForm}
        onClose={handleCancel}
        title={editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
      >
        <UserForm
          initialValues={editingUser ?? undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Modal>
    </div>
  );
}
