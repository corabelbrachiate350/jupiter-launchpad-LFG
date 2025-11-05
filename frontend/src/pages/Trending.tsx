import { useQuery } from 'react-query';
import { metricsApi, Project } from '../services/api';
import ProjectCard from '../components/ProjectCard';

export default function Trending() {
  const { data: projects, isLoading, error } = useQuery(
    'trending',
    () => metricsApi.getTrending(20)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">Loading trending projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-400">Error loading trending projects</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">🔥 Trending Projects</h1>
      <p className="text-gray-400 mb-8">
        Projects with the highest swap volume and engagement
      </p>

      {!projects || projects.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No trending projects yet. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: Project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

