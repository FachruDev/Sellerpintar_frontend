'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export function TaskDetailModal({ isOpen, onClose, task, projectMembers, onUpdate, onDelete }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' }
  ];
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Task title is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const updatedData = {
        title: title.trim(),
        description: description.trim(),
        status,
        assigneeId: assigneeId || null
      };
      
      console.log('Updating task:', task.id, updatedData);
      await onUpdate(task.id, updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
      alert(`Failed to update task: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      console.log('Deleting task:', task.id);
      await onDelete(task.id);
      // Parent component akan menangani penutupan modal kalo penghapusan berhasil
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(`Failed to delete task: ${error.message || 'Unknown error'}`);
      setIsSubmitting(false);
      setIsDeleteConfirmOpen(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Main Modal Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      
      {/* Main Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md overflow-hidden shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {isEditing ? (
              // Edit Form
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </Label>
                  <Input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    rows={4}
                  />
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Assignee
                  </Label>
                  <select
                    id="assignee"
                    value={assigneeId || ''}
                    onChange={e => setAssigneeId(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  >
                    <option value="">Unassigned</option>
                    {projectMembers?.map(member => (
                      <option
                        key={member.user.id}
                        value={member.user.id}
                      >
                        {member.user.email}
                      </option>
                    ))}
                  </select>
                </div>
              </form>
            ) : (
              // View Mode
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    {task.title}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {status === 'todo' ? 'To Do' : status === 'in-progress' ? 'In Progress' : 'Done'}
                  </span>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {task.description || 'No description provided.'}
                  </p>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Assignee</h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {projectMembers?.find(m => m.id === task.assigneeId || m.user?.id === task.assigneeId)?.email || 
                     projectMembers?.find(m => m.id === task.assigneeId || m.user?.id === task.assigneeId)?.user?.email || 
                     'Unassigned'}
                  </p>
                </div>
                
                <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    Created: {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'Unknown'}
                  </div>
                  {task.updatedAt && task.updatedAt !== task.createdAt && (
                    <div>
                      Updated: {new Date(task.updatedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex flex-row-reverse">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  className="ml-3 inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <>
          {/* Delete Modal Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50" onClick={() => setIsDeleteConfirmOpen(false)}></div>
          
          {/* Delete Modal Content */}
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md overflow-hidden shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mx-0">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Delete Task
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this task? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex flex-row-reverse">
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
} 