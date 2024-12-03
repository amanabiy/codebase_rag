import React, { useEffect, useState } from 'react';
import { Select, Input, Spin } from 'antd';
import { useToast } from '@apideck/components';
import { useMessages } from 'utils/useMessages';
import config from '../utils/config';
// import dotenv from 'dotenv';

// dotenv.config();

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
  const [repoUrl, setRepoUrl] = useState('');
  const { initializeChat, selectedRepo, setSelectedRepo } = useMessages()
  const { addToast } = useToast()
  const BACKEND_URL = config.backendUrl;

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/repositories`,
          {
            method: 'GET', 
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          }
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setRepositories(data);
      } catch (error: any) {
        console.log(error)
        addToast({ title: `Couldn't fetch repos ${error.message}`, type: 'error' })
        setRepositories([])
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
      try {
        const response = await fetch(`${BACKEND_URL}/clone`, {
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
              const response = await fetch(`${BACKEND_URL}/repositories`,
                {
                  method: 'GET', 
                  headers: {
                    'ngrok-skip-browser-warning': 'true'
                  }
                }
              );
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
        console.log("here", response)
        fetchRepositories()
        setSelectedRepo(repoUrl)
        setRepoUrl('');
    } catch (error: any) {
      addToast({ title: 'An error occurred', type: 'error' })
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    initializeChat(selectedRepo);
  }, [selectedRepo]);

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
    <div className="repository-list ml-4 mt-10" style={{ width: '300px' }}>
      <h2 className="text-xl font-bold mb-4 text-center">Repositories</h2>
      {selectedRepo && (
        <div className="flex flex-col selected-repo p-3 rounded mb-4">
          <small>Chatting With</small><small className="font-semibold">{selectedRepo}</small>
        </div>
      )}
      <div className="mb-4 flex flex-col items-center ">
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
            style={{ width: '300px' }}
            dropdownStyle={{ width: 'auto', backgroundColor: '#f0f0f0' }}
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
          className="bg-blue-400 text-white p-2 rounded w-full"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default LeftBar;
