'use client';

import { useState } from 'react';
import { Button, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, Textarea } from '@/components/ui-bundle';
import { ListPlus, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  projectMembers,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [assigneeId, setAssigneeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: 'todo', label: 'Belum Dikerjakan' },
    { value: 'in-progress', label: 'Sedang Berjalan' },
    { value: 'done', label: 'Selesai' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Judul tugas wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        ...(assigneeId && { assigneeId }),
      };

      await onSubmit(payload);

      setTitle('');
      setDescription('');
      setStatus('todo');
      setAssigneeId('');
      onClose();
    } catch (err) {
      alert(`Gagal membuat tugas: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open ? onClose() : undefined}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 mb-3">
              <ListPlus className="w-5 h-5 text-primary" />
              Buat Tugas Baru
            </DialogTitle>
            <DialogDescription>
              Lengkapi detail di bawah untuk menambah tugas ke proyek.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            {/* Judul */}
            <div>
              <Label htmlFor="title">Judul Tugas</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                required
                autoFocus
                placeholder="Contoh: Riset fitur baru"
              />
            </div>
            {/* Deskripsi */}
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                placeholder="Penjelasan tugas (opsional)"
                rows={3}
              />
            </div>
            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <div className="relative">
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isSubmitting}
                  className={cn(
                    "peer w-full appearance-none rounded-md border bg-background px-3 py-2 pr-8 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "dark:bg-slate-900",
                  )}
                >
                  {statusOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            {/* Assignee */}
            <div>
              <Label htmlFor="assignee">Penanggung Jawab</Label>
              <div className="relative">
                <select
                  id="assignee"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  disabled={isSubmitting}
                  className={cn(
                    "peer w-full appearance-none rounded-md border bg-background px-3 py-2 pr-8 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "dark:bg-slate-900"
                  )}
                >
                  <option value="">Tidak Ditugaskan</option>
                  {projectMembers?.map((member) => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.email}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-row-reverse gap-2 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Membuat...
                </span>
              ) : (
                <>
                  <ListPlus className="w-4 h-4 mr-1" />
                  Buat Tugas
                </>
              )}
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}