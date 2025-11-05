import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMutation } from 'react-query';
import { projectApi, CreateProjectData } from '../services/api';
import { solanaService } from '../services/solana';

export default function SubmitProject() {
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const [formData, setFormData] = useState<CreateProjectData & { tagsInput: string }>({
    name: '',
    symbol: '',
    description: '',
    website: '',
    twitter: '',
    telegram: '',
    discord: '',
    github: '',
    tokenAddress: '',
    tokenMint: '',
    logoUrl: '',
    bannerUrl: '',
    tags: [],
    tagsInput: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitMutation = useMutation(
    (data: CreateProjectData) => projectApi.createProject(data),
    {
      onSuccess: (project) => {
        navigate(`/project/${project.id}`);
      },
      onError: (error: any) => {
        setErrors({ submit: error.response?.data?.error || 'Failed to submit project' });
      },
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      tagsInput: value,
      tags: value.split(',').map((t) => t.trim()).filter(Boolean),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!connected) {
      setErrors({ submit: 'Please connect your wallet first' });
      return;
    }

    // Validate token mint
    try {
      const isValid = await solanaService.verifyTokenMint(formData.tokenMint);
      if (!isValid) {
        setErrors({ tokenMint: 'Invalid token mint address' });
        return;
      }
    } catch (error) {
      setErrors({ tokenMint: 'Failed to verify token mint address' });
      return;
    }

    const { tagsInput, ...projectData } = formData;
    submitMutation.mutate(projectData);
  };

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto bg-gray-900 rounded-lg border border-gray-800 p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400">
          Please connect your Solana wallet to submit a project to the launchpad.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Submit Your Project</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token Symbol *
            </label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              required
              maxLength={10}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              minLength={10}
              maxLength={5000}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Token Info */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token Mint Address *
            </label>
            <input
              type="text"
              name="tokenMint"
              value={formData.tokenMint}
              onChange={handleChange}
              required
              placeholder="Enter Solana token mint address"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
            />
            {errors.tokenMint && (
              <p className="mt-1 text-sm text-red-400">{errors.tokenMint}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token Address *
            </label>
            <input
              type="text"
              name="tokenAddress"
              value={formData.tokenAddress}
              onChange={handleChange}
              required
              placeholder="Enter token address"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
            />
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Twitter</label>
              <input
                type="text"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="@username"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Discord</label>
              <input
                type="url"
                name="discord"
                value={formData.discord}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Telegram</label>
              <input
                type="text"
                name="telegram"
                value={formData.telegram}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">GitHub</label>
            <input
              type="url"
              name="github"
              value={formData.github}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Media */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Logo URL</label>
            <input
              type="url"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Banner URL</label>
            <input
              type="url"
              name="bannerUrl"
              value={formData.bannerUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tagsInput"
              value={formData.tagsInput}
              onChange={handleTagsChange}
              placeholder="DeFi, NFT, Gaming"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {errors.submit && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
              <p className="text-red-400">{errors.submit}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitMutation.isLoading}
            className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitMutation.isLoading ? 'Submitting...' : 'Submit Project'}
          </button>
        </form>
      </div>
    </div>
  );
}

