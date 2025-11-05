import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { projectApi, metricsApi } from '../services/api';
import { format } from 'date-fns';
// Icons - using simple SVG components
const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { connected, publicKey } = useWallet();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery(
    ['project', id],
    () => projectApi.getProject(id!),
    { enabled: !!id }
  );

  const { data: metrics } = useQuery(
    ['metrics', id],
    () => metricsApi.getProjectMetrics(id!, 30),
    { enabled: !!id }
  );

  const favoriteMutation = useMutation(
    () => projectApi.toggleFavorite(id!),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project', id]);
      },
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Project not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      {project.bannerUrl && (
        <div className="h-64 bg-gray-800 rounded-lg overflow-hidden mb-6">
          <img
            src={project.bannerUrl}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
            <div className="flex items-start space-x-6 mb-6">
              {project.logoUrl ? (
                <img
                  src={project.logoUrl}
                  alt={project.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-primary-600 flex items-center justify-center text-4xl font-bold">
                  {project.symbol[0]}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                  {project.status === 'FEATURED' && (
                    <span className="px-3 py-1 bg-yellow-500 text-black text-sm font-semibold rounded-full">
                      Featured
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      project.status === 'APPROVED'
                        ? 'bg-green-500 text-white'
                        : project.status === 'PENDING'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="text-2xl text-gray-400">{project.symbol}</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-3">Description</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{project.description}</p>
            </div>

            {/* Tags */}
            {project.tags.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-3">Links</h2>
              <div className="flex flex-wrap gap-4">
                {project.website && (
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-primary-400 hover:text-primary-300"
                  >
                    <span>Website</span>
                    <ExternalLinkIcon />
                  </a>
                )}
                {project.twitter && (
                  <a
                    href={`https://twitter.com/${project.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-primary-400 hover:text-primary-300"
                  >
                    <span>Twitter</span>
                    <ExternalLinkIcon />
                  </a>
                )}
                {project.discord && (
                  <a
                    href={project.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-primary-400 hover:text-primary-300"
                  >
                    <span>Discord</span>
                    <ExternalLinkIcon />
                  </a>
                )}
                {project.telegram && (
                  <a
                    href={project.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-primary-400 hover:text-primary-300"
                  >
                    <span>Telegram</span>
                    <ExternalLinkIcon />
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-primary-400 hover:text-primary-300"
                  >
                    <span>GitHub</span>
                    <ExternalLinkIcon />
                  </a>
                )}
              </div>
            </div>

            {/* Token Info */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-3">Token Information</h2>
              <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Token Address:</span>
                  <code className="text-primary-400 text-sm">{project.tokenAddress}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Token Mint:</span>
                  <code className="text-primary-400 text-sm">{project.tokenMint}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Decimals:</span>
                  <span className="text-white">{project.tokenDecimals}</span>
                </div>
                {project.tokenSupply && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Supply:</span>
                    <span className="text-white">
                      {parseFloat(project.tokenSupply).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Actions</h2>
            {connected ? (
              <button
                onClick={() => favoriteMutation.mutate()}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
              >
                <HeartIcon />
                <span>Favorite ({project.favorites})</span>
              </button>
            ) : (
              <p className="text-gray-400 text-sm text-center">
                Connect wallet to favorite projects
              </p>
            )}
          </div>

          {/* Metrics */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Metrics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Swap Volume</p>
                <p className="text-2xl font-bold text-white">
                  {parseFloat(project.swapVolume).toLocaleString()} SOL
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Liquidity</p>
                <p className="text-2xl font-bold text-white">
                  {parseFloat(project.liquidity).toLocaleString()} SOL
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Holders</p>
                <p className="text-2xl font-bold text-white">{project.holders.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Views</p>
                <p className="text-2xl font-bold text-white">{project.views.toLocaleString()}</p>
              </div>
              {project.currentPrice && (
                <div>
                  <p className="text-gray-400 text-sm">Current Price</p>
                  <p className="text-2xl font-bold text-white">
                    {parseFloat(project.currentPrice).toFixed(6)} SOL
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Project Info */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Project Info</h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-400">Submitted by</p>
                <p className="text-white font-mono">{project.user.walletAddress.slice(0, 8)}...</p>
              </div>
              <div>
                <p className="text-gray-400">Created</p>
                <p className="text-white">
                  {format(new Date(project.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              {project.approvedAt && (
                <div>
                  <p className="text-gray-400">Approved</p>
                  <p className="text-white">
                    {format(new Date(project.approvedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

