import { Link } from 'react-router-dom';
import { Project } from '../services/api';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

export default function ProjectCard({ project, featured }: ProjectCardProps) {
  return (
    <Link to={`/project/${project.id}`}>
      <div
        className={`bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-primary-500 transition-all ${
          featured ? 'ring-2 ring-primary-500' : ''
        }`}
      >
        {project.bannerUrl && (
          <div className="h-32 bg-gray-800 overflow-hidden">
            <img
              src={project.bannerUrl}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start space-x-4">
            {project.logoUrl ? (
              <img
                src={project.logoUrl}
                alt={project.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-primary-600 flex items-center justify-center text-2xl font-bold">
                {project.symbol[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-white truncate">{project.name}</h3>
                {featured && <span className="text-yellow-400">⭐</span>}
              </div>
              <p className="text-gray-400 text-sm mt-1">{project.symbol}</p>
            </div>
          </div>

          <p className="text-gray-300 mt-4 line-clamp-3">{project.description}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-800">
            <div>
              <p className="text-gray-400 text-xs">Swap Volume</p>
              <p className="text-white font-semibold">
                {parseFloat(project.swapVolume).toLocaleString()} SOL
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Liquidity</p>
              <p className="text-white font-semibold">
                {parseFloat(project.liquidity).toLocaleString()} SOL
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Views</p>
              <p className="text-white font-semibold">{project.views.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Favorites</p>
              <p className="text-white font-semibold">{project.favorites.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            {format(new Date(project.createdAt), 'MMM d, yyyy')}
          </div>
        </div>
      </div>
    </Link>
  );
}

