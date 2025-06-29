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
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch project and members data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projectData = await projectsAPI.getProjectById(id);
        setProject(projectData);
        
        const membersData = await membersAPI.getProjectMembers(id);
        setMembers(membersData.members || []);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Search users by email
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setSearching(true);
      const results = await userAPI.searchUsers(searchTerm);
      
      // Filter out users who are already members
      const existingMemberIds = members.map(member => member.id);
      const filteredResults = results.filter(user => !existingMemberIds.includes(user.id));
      
      setSearchResults(filteredResults);
    } catch (err) {
      console.error('Error searching users:', err);
      alert('Failed to search users. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Invite member to project
  const handleInviteMember = async (userId) => {
    try {
      const response = await membersAPI.inviteMember(id, { userId });
      setMembers(prev => [...prev, response.membership]);
      setSearchResults([]);
      setSearchTerm('');
    } catch (err) {
      console.error('Error inviting member:', err);
      alert('Failed to invite member. Please try again.');
    }
  };

  // Remove member from project
  const handleRemoveMember = async (membershipId) => {
    try {
      await membersAPI.removeMember(id, membershipId);
      setMembers(prev => prev.filter(member => member.membershipId !== membershipId));
    } catch (err) {
      console.error('Error removing member:', err);
      alert('Failed to remove member. Please try again.');
    }
  };

  // Delete project
  const handleDeleteProject = async () => {
    try {
      await projectsAPI.deleteProject(id);
      router.push('/dashboard');
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project. Please try again.');
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
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage project settings and members
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => router.push(`/projects/${id}`)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Project
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Project Information */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Project Information</h2>
          <div>
            <Label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Name
            </Label>
            <Input
              id="projectName"
              value={project.name}
              disabled
              className="bg-gray-50 dark:bg-gray-700"
            />
          </div>
          <div className="mt-4">
            <Label htmlFor="projectOwner" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Owner
            </Label>
            <Input
              id="projectOwner"
              value={project.owner?.email || 'Unknown'}
              disabled
              className="bg-gray-50 dark:bg-gray-700"
            />
          </div>
        </Card>

        {/* Invite Members */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Invite Members</h2>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching || !searchTerm.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Results</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {searchResults.map((user) => (
                  <li key={`search-${user.id}`} className="py-3 flex justify-between items-center">
                    <span className="text-sm text-gray-900 dark:text-white">{user.email}</span>
                    <Button
                      onClick={() => handleInviteMember(user.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Invite
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {searchTerm && searchResults.length === 0 && !searching && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No users found with that email.</p>
          )}
        </Card>

        {/* Project Members */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Project Members</h2>
          {members.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No members in this project yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {members.map((member) => (
                <li key={`member-${member.membershipId || member.id}`} className="py-3 flex justify-between items-center">
                  <span className="text-sm text-gray-900 dark:text-white">{member.email}</span>
                  <Button
                    onClick={() => handleRemoveMember(member.membershipId)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border border-red-200 dark:border-red-800">
          <h2 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Once you delete a project, there is no going back. Please be certain.
          </p>
          <Button
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Project
          </Button>
        </Card>
      </div>

      {/* Delete Project Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setIsDeleteModalOpen(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Delete Project</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this project? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  type="button"
                  onClick={handleDeleteProject}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}