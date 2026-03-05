import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Plant } from '../types/Plant';
import { getPlant, updatePlant } from '../api/plants';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

// Validation schema
const plantSchema = z.object({
  id: z.string().uuid(),
  healthStatus: z.enum(['healthy', 'warning', 'critical'])
});

type PlantFormData = z.infer<typeof plantSchema>;

const PlantEdit: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<PlantFormData>({
    id: '',
    healthStatus: 'healthy'
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [originalData, setOriginalData] = useState<PlantFormData | null>(null);

  // Fetch existing plant data
  useEffect(() => {
    const fetchPlant = async () => {
      try {
        if (!id) return;
        const plant = await getPlant(id);
        if (!plant) {
          throw new Error('Plant not found');
        }
        setFormData(plant);
        setOriginalData(plant);
        setFetchLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch plant');
        setFetchLoading(false);
      }
    };
    fetchPlant();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    if (originalData) {
      setFormData(originalData);
    }
    setValidationErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    try {
      // Validate form data
      const validatedData = plantSchema.parse(formData);
      
      setLoading(true);
      await updatePlant(validatedData);
      navigate(`/plants/${id}`);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: {[key: string]: string} = {};
        err.errors.forEach(error => {
          if (error.path) {
            errors[error.path[0]] = error.message;
          }
        });
        setValidationErrors(errors);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update plant');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Plant</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Health Status
          </label>
          <select
            name="healthStatus"
            value={formData.healthStatus}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              validationErrors.healthStatus ? 'border-red-500' : ''
            }`}
            disabled={loading}
          >
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          {validationErrors.healthStatus && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.healthStatus}</p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Plant'}
          </button>
          
          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Reset
          </button>
          
          <button
            type="button"
            onClick={() => navigate(`/plants/${id}`)}
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlantEdit;