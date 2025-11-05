import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminApi, Project } from '../services/api';
import { format } from 'date-fns';

export default function AdminPanel() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['admin-projects', page, statusFilter],
    () => adminApi.getProjects({ page, limit: 20, status: statusFilter || undefined })
  );

  const { data: stats } = useQuery('admin-stats', adminApi.getStats);

  const updateStatusMutation = useMutation(
    ({ projectId, status, rejectionReason }: { projectId: string; status: string; rejectionReason?: string }) =>
      adminApi.updateProjectStatus(projectId, status, rejectionReason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-projects']);
        queryClient.invalidateQueries('admin-stats');
      },
    }
  );

  const handleStatusUpdate = (projectId: string, status: string, rejectionReason?: string) => {
    updateStatusMutation.mutate({ projectId, status, rejectionReason });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const projects = data?.projects || [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <p className="text-gray-400 text-sm">Total Projects</p>
            <p className="text-3xl font-bold text-white">{stats.projects.total}</p>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.projects.pending}</p>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <p className="text-gray-400 text-sm">Approved</p>
            <p className="text-3xl font-bold text-green-400">{stats.projects.approved}</p>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <p className="text-gray-400 text-sm">Featured</p>
            <p className="text-3xl font-bold text-primary-400">{stats.projects.featured}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="FEATURED">Featured</option>
        </select>
      </div>

      {/* Projects Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {projects.map((project: Project) => (
                <tr key={project.id} className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      {project.logoUrl ? (
                        <img
                          src={project.logoUrl}
                          alt={project.name}
                          className="w-10 h-10 rounded-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
                          {project.symbol[0]}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">{project.name}</div>
                        <div className="text-sm text-gray-400">{project.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'APPROVED'
                          ? 'bg-green-500 text-white'
                          : project.status === 'PENDING'
                          ? 'bg-yellow-500 text-black'
                          : project.status === 'FEATURED'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {format(new Date(project.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      {project.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(project.id, 'APPROVED')}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(project.id, 'REJECTED')}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(project.id, 'FEATURED')}
                            className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-xs"
                          >
                            Feature
                          </button>
                        </>
                      )}
                      {project.status === 'APPROVED' && (
                        <button
                          onClick={() => handleStatusUpdate(project.id, 'FEATURED')}
                          className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-xs"
                        >
                          Feature
                        </button>
                      )}
                      <a
                        href={`/project/${project.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
                      >
                        View
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-2 p-4 border-t border-gray-800">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="text-gray-400">
              Page {page} of {data.pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
              disabled={page === data.pagination.pages}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

