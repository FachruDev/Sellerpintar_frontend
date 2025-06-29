'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, Button, Input, Label, Textarea, Badge } from '@/components/ui-bundle';
import { AlertTriangle, Pencil, Trash2, User, Save, X, Loader2 } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'Belum Dikerjakan' },
  { value: 'in-progress', label: 'Sedang Berjalan' },
  { value: 'done', label: 'Selesai' },
];

const statusBadge = {
  todo: 'bg-muted text-gray-700 dark:text-gray-200',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  done: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

export function TaskDetailModal({
  isOpen,
  onClose,
  task,
  projectMembers,
  onUpdate,
  onDelete,
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Cari assignee
  const assignee =
    projectMembers?.find(
      (m) => m.id === task.assigneeId || m.user?.id === task.assigneeId
    ) || null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Judul tugas wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);

      const updatedData = {
        title: title.trim(),
        description: description.trim(),
        status,
        assigneeId: assigneeId || null,
      };

      await onUpdate(task.id, updatedData);
      setIsEditing(false);
    } catch (error) {
      alert(`Gagal memperbarui tugas: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await onDelete(task.id);
      // Tutup modal di-handle sama parent
    } catch (error) {
      alert(`Gagal menghapus tugas: ${error.message || 'Unknown error'}`);
      setIsSubmitting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <>
      {/* Main Modal */}
      <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Detail Tugas
              </DialogTitle>
              <DialogDescription>
                Lihat detail tugas, edit, atau hapus jika perlu.
              </DialogDescription>
            </DialogHeader>

            {isEditing ? (
              <div className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="title" className="mb-1 block">
                    Judul Tugas
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="mb-1 block">
                    Deskripsi
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Penjelasan tugas (opsional)"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="status" className="mb-1 block">
                    Status
                  </Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-slate-900"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="assignee" className="mb-1 block">
                    Penanggung Jawab
                  </Label>
                  <select
                    id="assignee"
                    value={assigneeId || ''}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-slate-900"
                  >
                    <option value="">Tidak Ditugaskan</option>
                    {projectMembers?.map((member) => (
                      <option key={member.user.id} value={member.user.id}>
                        {member.user?.name || member.user?.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-5 mt-2">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{task.title}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      Dibuat:{' '}
                      {task.createdAt
                        ? new Date(task.createdAt).toLocaleString('id-ID')
                        : 'Tidak diketahui'}
                      {task.updatedAt &&
                        task.updatedAt !== task.createdAt && (
                          <>
                            <span className="mx-2">|</span>
                            Diperbarui:{' '}
                            {new Date(task.updatedAt).toLocaleString('id-ID')}
                          </>
                        )}
                    </div>
                  </div>
                  <Badge className={statusBadge[task.status] || ''}>
                    {STATUS_OPTIONS.find((o) => o.value === task.status)?.label || task.status}
                  </Badge>
                </div>

                <div>
                  <Label className="text-xs">Deskripsi</Label>
                  <p className="mt-1 text-sm text-muted-foreground min-h-[40px]">
                    {task.description || <span className="italic opacity-60">Tidak ada deskripsi.</span>}
                  </p>
                </div>

                <div>
                  <Label className="text-xs">Penanggung Jawab</Label>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    {assignee ? (
                      <>
                        <User className="w-4 h-4" />
                        <span>
                          {assignee.user?.name || assignee.email || assignee.user?.email}
                        </span>
                      </>
                    ) : (
                      <span className="italic opacity-60 flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Tidak Ditugaskan
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tombol action */}
            <DialogFooter className="flex flex-row-reverse gap-2 pt-6">
              {isEditing ? (
                <>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="animate-spin h-4 w-4" />
                        Menyimpan...
                      </span>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1" />
                        Simpan
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Batal
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Hapus
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto"
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Tutup
                    </Button>
                  </DialogClose>
                </>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi buat Hapus */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Hapus Tugas
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row-reverse gap-2 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Menghapus...
                </span>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Hapus
                </>
              )}
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 mr-1" />
                Batal
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}