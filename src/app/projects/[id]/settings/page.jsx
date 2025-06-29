'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { projectsAPI, membersAPI, userAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';

export default function ProjectSettingsPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  // State
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

  // Fetch current user untuk memeriksa ownership
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const me = await userAPI.getProfile();
        setCurrentUser(me);
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    })();
  }, []);

  // Fetch project & members
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
        console.error('Error fetching project data:', err);
        setError('Failed to load project. Please try again later.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Tentukan owner
  const isOwner = currentUser?.id === project?.owner?.id;

  // Handlers
  const handleUpdateName = async () => {
    if (!projectName.trim()) {
      alert('Project name tidak boleh kosong');
      return;
    }
    try {
      await projectsAPI.updateProject(id, { name: projectName.trim() });
      setProject(prev => ({ ...prev, name: projectName.trim() }));
      setIsEditingName(false);
    } catch (err) {
      console.error('Error updating project name:', err);
      alert('Gagal menyimpan nama project.');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      setSearching(true);
      const results = await userAPI.searchUsers(searchTerm);
      const existingIds = members.map(m => m.user.id);
      setSearchResults(results.filter(u => !existingIds.includes(u.id)));
    } catch (err) {
      console.error('Error searching users:', err);
      alert('Gagal mencari user.');
    } finally {
      setSearching(false);
    }
  };

  const handleInviteMember = async (userId) => {
    try {
      const res = await membersAPI.inviteMember(id, { userId });
      setMembers(prev => [...prev, res.membership]);
      setSearchResults([]);
      setSearchTerm('');
    } catch (err) {
      console.error('Error inviting member:', err);
      alert('Gagal mengundang member.');
    }
  };

  const handleRemoveMember = async (membershipId) => {
    try {
      await membersAPI.removeMember(id, membershipId);
      setMembers(prev => prev.filter(m => (m.membershipId || m.id) !== membershipId));
    } catch (err) {
      console.error('Error removing member:', err);
      alert('Gagal menghapus member.');
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectsAPI.deleteProject(id);
      router.push('/dashboard');
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Gagal menghapus project.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 my-6">
        <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage project settings and members
          </p>
        </div>
        <Button onClick={() => router.push(`/projects/${id}`)}>
          Back to Project
        </Button>
      </div>

      {/* Project Info */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Project Information</h2>
        <div>
          <Label htmlFor="projectName" className="block mb-1">Project Name</Label>
          <div className="flex space-x-2">
            <Input
              id="projectName"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              disabled={!isOwner || !isEditingName}
              className={!isOwner ? 'bg-gray-50 dark:bg-gray-700' : ''}
            />
            {isOwner && (
              isEditingName ? (
                <>
                  <Button onClick={handleUpdateName}>Save</Button>
                  <Button onClick={() => {
                    setProjectName(project.name);
                    setIsEditingName(false);
                  }}>Cancel</Button>
                </>
              ) : (
                <Button onClick={() => setIsEditingName(true)}>Edit</Button>
              )
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="projectOwner" className="block mb-1">Owner</Label>
          <Input
            id="projectOwner"
            value={project.owner?.email || 'Unknown'}
            disabled
            className="bg-gray-50 dark:bg-gray-700"
          />
        </div>
      </Card>

      {/* Invite Members (owner only) */}
      {isOwner && (
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Invite Members</h2>
          <div className="flex space-x-2">
            <Input
              placeholder="Search by email"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching || !searchTerm.trim()}>
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          {searchResults.length > 0 && (
            <ul className="divide-y">
              {searchResults.map(u => (
                <li key={u.id} className="py-2 flex justify-between">
                  <span>{u.email}</span>
                  <Button onClick={() => handleInviteMember(u.id)}>Invite</Button>
                </li>
              ))}
            </ul>
          )}
          {!searching && searchTerm && searchResults.length === 0 && (
            <p className="text-sm text-gray-500">No users found.</p>
          )}
        </Card>
      )}

      {/* Project Members (dilihat oleh semua, dihapus hanya oleh owner) */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Project Members</h2>
        {members.length === 0 ? (
          <p className="text-sm text-gray-500">No members yet.</p>
        ) : (
          <ul className="divide-y">
            {members.map(m => {
              const membershipId = m.membershipId || m.id;
              const email = m.user?.email || m.email || 'Unknown member';
              return (
                <li key={membershipId} className="py-2 flex justify-between items-center">
                  <span className="text-sm text-gray-900 dark:text-white">{email}</span>
                  {isOwner && (
                    <Button onClick={() => handleRemoveMember(membershipId)}>
                      Remove
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Danger Zone (owner only) */}
      {isOwner && (
        <Card className="p-6 border-red-200 dark:border-red-800">
          <h2 className="text-lg font-medium text-red-600 dark:text-red-400">Danger Zone</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Deleting this project is irreversible.
          </p>
          <Button onClick={() => setIsDeleteModalOpen(true)} className="bg-red-600 hover:bg-red-700">
            Delete Project
          </Button>
        </Card>
      )}

      {/* Delete Konfirmasi Modal */}
      {isDeleteModalOpen && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirm Delete
            </h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button onClick={handleDeleteProject} className="bg-red-600 hover:bg-red-700">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
