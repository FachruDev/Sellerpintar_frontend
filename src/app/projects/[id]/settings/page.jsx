'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { projectsAPI, membersAPI, userAPI, tasksAPI } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui-bundle';
import { Loader2, UserRound, UserPlus, Trash2, Check, X, Search, Shield, ArrowLeft, Mail, Pencil } from 'lucide-react';
import { Analytics } from "@vercel/analytics/next"

export default function ProjectSettingsPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  // State utama
  const [project, setProject] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Current user (untuk cek owner)
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    userAPI.getProfile()
      .then(setCurrentUser)
      .catch(() => {});
  }, []);

  // Fetch project + anggota
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const proj = await projectsAPI.getProjectById(id);
        setProject(proj);
        setProjectName(proj.name);
        const mem = await membersAPI.getProjectMembers(id);
        setMembers(mem.members || []);
      } catch (err) {
        setError('Gagal memuat proyek. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Siapa owner proyek
  const isOwner = currentUser?.id === project?.owner?.id;

  // Ubah nama proyek
  const handleUpdateName = async () => {
    if (!projectName.trim()) {
      alert('Nama proyek tidak boleh kosong');
      return;
    }
    try {
      await projectsAPI.updateProject(id, { name: projectName.trim() });
      setProject((prev) => ({ ...prev, name: projectName.trim() }));
      setIsEditingName(false);
    } catch (err) {
      alert('Gagal menyimpan nama proyek.');
    }
  };

  // Cari user
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      setSearching(true);
      const results = await userAPI.searchUsers(searchTerm);
      
      // Ekstrak ID dari member
      const existingIds = members.map((m) => {
        // Cek berbagai kemungkinan struktur data
        if (m.user && m.user.id) return m.user.id;
        if (m.userId) return m.userId;
        return m.id; // Fallback ke ID member kalo ga ada properti lain
      }).filter(Boolean); // Filter undefined/null values
      
      // Filter hasil pencarian
      const filteredResults = results.filter((u) => !existingIds.includes(u.id));
      setSearchResults(filteredResults);
    } catch (err) {
      console.error('Search error:', err);
      alert('Gagal mencari user.');
    } finally {
      setSearching(false);
    }
  };

  // Invit anggota
  const handleInviteMember = async (userId) => {
    try {
      const res = await membersAPI.inviteMember(id, { userId });
      
      // Periksa struktur data membership yang ditambahkan ke state biar sesuai
      const newMember = res.membership || res;
      
      // Tambah member baru ke state
      setMembers((prev) => [...prev, newMember]);
      
      // Hapus hasil pencarian + reset search term
      setSearchResults([]);
      setSearchTerm('');
    } catch (err) {
      alert('Gagal mengundang anggota.');
    }
  };

  // Delete anggota
  const handleRemoveMember = async (membershipId) => {
    try {
      await membersAPI.removeMember(id, membershipId);
      setMembers((prev) => prev.filter((m) => (m.membershipId || m.id) !== membershipId));
    } catch (err) {
      alert('Gagal menghapus anggota.');
    }
  };

  // Delete proyek
  const handleDeleteProject = async () => {
    try {
      // Periksa apakah proyek masih memiliki tasks
      const tasks = await tasksAPI.getProjectTasks(id);
      if (tasks && tasks.length > 0) {
        alert('Proyek masih memiliki tugas. Hapus semua tugas terlebih dahulu sebelum menghapus proyek.');
        return;
      }
      
      // Periksa apakah proyek masih memiliki anggota selain owner
      if (members.length > 1) {
        alert('Proyek masih memiliki anggota. Hapus semua anggota terlebih dahulu sebelum menghapus proyek.');
        return;
      }
      
      // Coba hapus proyek
      await projectsAPI.deleteProject(id);
      router.push('/dashboard');
    } catch (err) {
      
      // pesan error
      if (err.message) {
        alert(`Gagal menghapus proyek: ${err.message}`);
      } else {
        alert('Gagal menghapus proyek. Pastikan semua tugas dan anggota sudah dihapus terlebih dahulu.');
      }
    }
  };

  // loding
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground text-sm">Memuat pengaturan proyek...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-lg mx-auto mt-10 border-destructive bg-red-50 dark:bg-red-900/20">
        <CardHeader>
          <CardTitle className="text-destructive">Gagal Memuat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="px-2 sm:px-6 lg:px-8 py-6 space-y-8 max-w-3xl mx-auto">
      <Analytics/>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Pengaturan Proyek
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola nama proyek, anggota, dan tindakan sensitif.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/projects/${id}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali ke Proyek
        </Button>
      </div>

      {/* Info Proyek */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="w-5 h-5 text-primary" />
            Informasi Proyek
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label htmlFor="projectName">Nama Proyek</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={!isOwner || !isEditingName}
                className={!isOwner ? 'bg-muted' : ''}
              />
              {isOwner && (
                isEditingName ? (
                  <>
                    <Button
                      size="icon"
                      variant="default"
                      onClick={handleUpdateName}
                      title="Simpan"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        setProjectName(project.name);
                        setIsEditingName(false);
                      }}
                      title="Batal"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setIsEditingName(true)}
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                )
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="projectOwner">Owner</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="projectOwner"
                value={project.owner?.email || 'Tidak diketahui'}
                disabled
                className="bg-muted"
              />
              <Badge variant="secondary" className="flex items-center gap-1">
                <UserRound className="w-4 h-4" />
                Owner
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Members */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="w-5 h-5 text-primary" />
              Undang Anggota
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Cari email user"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={searching || !searchTerm.trim()}
                variant="default"
                size="icon"
                title="Cari user"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            {searchResults.length > 0 && (
              <ul className="divide-y border rounded-md bg-muted/30">
                {searchResults.map((u) => (
                  <li key={u.id} className="py-2 px-3 flex justify-between items-center">
                    <span className="text-sm">{u.email}</span>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleInviteMember(u.id)}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Undang
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {!searching && searchTerm && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground">User tidak ditemukan.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Daftar Anggota */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserRound className="w-5 h-5 text-primary" />
            Anggota Proyek
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada anggota.</p>
          ) : (
            <ul className="divide-y border rounded-md">
              {members.map((m) => {
                const membershipId = m.membershipId || m.id;
                const email = m.user?.email || m.email || 'Tidak diketahui';
                const isMemberOwner = m.user?.id === project?.owner?.id;
                return (
                  <li key={membershipId} className="py-2 px-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <UserRound className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{email}</span>
                      {isMemberOwner && (
                        <Badge variant="secondary" className="ml-1">Owner</Badge>
                      )}
                    </div>
                    {isOwner && !isMemberOwner && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveMember(membershipId)}
                        title="Hapus anggota"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Hapus
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {isOwner && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive mb-4">
              Menghapus proyek ini tidak dapat dibatalkan! Semua data tugas & anggota akan hilang.
            </p>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Hapus Proyek
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal Konfirmasi Hapus */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Hapus Proyek
            </DialogTitle>
            <DialogDescription>
              Anda yakin ingin menghapus proyek ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row-reverse gap-2 pt-2">
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Hapus
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <X className="w-4 h-4 mr-1" />
                Batal
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}