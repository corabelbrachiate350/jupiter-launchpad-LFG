import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { projectApi, Project } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import { useState } from 'react';

export default function Home() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const { data, isLoading, error } = useQuery(
    ['projects', page, search, selectedTag],
    () => projectApi.getProjects({ page, limit: 20, search, tag: selectedTag || undefined }),
    { keepPreviousData: true }
  );

  const { data: featuredData } = useQuery('featured', projectApi.getFeatured);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-400">Error loading projects</div>
      </div>
    );
  }

  const projects = data?.projects || [];
  const featured = featuredData || [];

  return (
    <div>
      {/* Featured Section */}
      {featured.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">⭐ Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.slice(0, 3).map((project: Project) => (
              <ProjectCard key={project.id} project={project} featured />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['DeFi', 'NFT', 'Gaming', 'DAO', 'Infrastructure', 'Social'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedTag === tag
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">All Projects</h2>
        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No projects found. Be the first to submit one!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: Project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {/* Pagination */}
            {data?.pagination && data.pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
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
          </>
        )}
      </div>
    </div>
  );
}

