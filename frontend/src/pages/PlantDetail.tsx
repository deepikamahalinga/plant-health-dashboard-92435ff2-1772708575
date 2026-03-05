import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Breadcrumbs, Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plant, SensorReading } from '../types';
import { getPlant, deletePlant, getPlantSensorReadings } from '../api/plants';
import LoadingSpinner from '../components/LoadingSpinner';

const PlantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [plant, setPlant] = useState<Plant | null>(null);
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadPlant();
  }, [id]);

  const loadPlant = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!id) throw new Error('Plant ID is required');
      
      const plantData = await getPlant(id);
      if (!plantData) {
        throw new Error('Plant not found');
      }
      
      setPlant(plantData);
      
      // Load sensor readings
      const readings = await getPlantSensorReadings(id);
      setSensorReadings(readings);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!id) return;
      await deletePlant(id);
      navigate('/plants');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete plant');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={loadPlant}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="p-4">
        <Alert severity="warning">Plant not found</Alert>
      </div>
    );
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return '';
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs className="mb-4">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/plants">Plants</Link>
        <Typography color="textPrimary">Plant Details</Typography>
      </Breadcrumbs>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4">Plant Details</Typography>
        <div className="space-x-2">
          <Button 
            variant="outlined"
            onClick={() => navigate('/plants')}
          >
            Back to List
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate(`/plants/${id}/edit`)}
          >
            Edit Plant
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Plant
          </Button>
        </div>
      </div>

      {/* Plant Details Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Typography variant="subtitle2" className="text-gray-600">ID</Typography>
            <Typography>{plant.id}</Typography>
          </div>
          <div>
            <Typography variant="subtitle2" className="text-gray-600">Health Status</Typography>
            <Typography className={getHealthStatusColor(plant.healthStatus)}>
              {plant.healthStatus.charAt(0).toUpperCase() + plant.healthStatus.slice(1)}
            </Typography>
          </div>
        </div>
      </div>

      {/* Sensor Readings Chart */}
      {sensorReadings.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <Typography variant="h6" className="mb-4">Sensor Reading History</Typography>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorReadings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this plant? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PlantDetail;