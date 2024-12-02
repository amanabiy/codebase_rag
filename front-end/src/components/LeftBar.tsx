import React, { useEffect, useState } from 'react';
import { Select, Input, Spin } from 'antd';

// Define a type for the repository
type Repository = {
  url_path: string;
  name: string; // Add other properties as needed
};

const LeftBar = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [submittedRepo, setSubmittedRepo] = useState<Repository | null>(null);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/repositories');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setRepositories(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  const handleSubmit = async () => {
    const repoToSubmit = selectedRepo || repoUrl;
    if (repoToSubmit) {
      setLoading(true);
      setRepoUrl('');
      try {
        const response = await fetch('http://127.0.0.1:5000/clone', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: repoToSubmit }),
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        setSelectedRepo(repoUrl);
        const fetchRepositories = async () => {
            try {
              const response = await fetch('http://127.0.0.1:5000/repositories');
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              const data = await response.json();
              setRepositories(data);
            } catch (error: any) {
              setError(error.message);
            } finally {
              setLoading(false);
            }
        };
        fetchRepositories()
        setSubmittedRepo({ url_path: repoUrl, name: repoToSubmit });
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="ml-4 mt-10 flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <Spin tip="Indexing your repository..." size="large" />
          <div className="text-center text-gray-500 mx-auto">Please wait while we index the repo.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="repository-list ml-4 mt-10">
      <h2 className="text-xl font-bold mb-4 text-center">Repositories</h2>
      {selectedRepo && (
        <div className="selected-repo p-3 rounded mb-4">
          <small>Chatting With</small><div className="font-semibold">{selectedRepo}</div>
        </div>
      )}
      <div className="mb-4 flex flex-col items-center">
        {repositories.length === 0 ? (
          <div className="text-red-500 mb-2">No repositories found.</div>
        ) : (
          <Select
            showSearch
            placeholder="Select a repository"
            optionFilterProp="label"
            onChange={(value: string) => setSelectedRepo(value)}
            onSearch={(value: string) => setSearchTerm(value)}
            options={repositories
              .filter(repo => repo.url_path.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(repo => ({
                value: repo.url_path,
                label: repo.url_path,
              }))}
            className="w-full mb-4"
            style={{ width: '100%' }}
          />
        )}
        <hr className="my-4 border-t border-gray-200" />
        <small className="text-gray-500 mb-2">If you can't find the repository above, add it here.</small>
        <Input
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="Type repository URL"
          className="w-full mb-4" // Changed width to full and added margin bottom
        />
        <button 
          onClick={handleSubmit}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default LeftBar;
