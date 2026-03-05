import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Skeleton
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as ViewIcon,
  Search as SearchIcon 
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { Plant, HealthStatus } from '../types/plant';
import { fetchPlants, deletePlant } from '../api/plants';

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25];

interface SortConfig {
  field: keyof Plant;
  direction: 'asc' | 'desc';
}

export const PlantList: React.FC = () => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    field: 'id', 
    direction: 'asc' 
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery(
    ['plants', page, rowsPerPage, searchTerm, sortConfig],
    () => fetchPlants({ page, limit: rowsPerPage, search: searchTerm, sort: sortConfig })
  );

  const handleSort = (field: keyof Plant) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDeleteClick = (plantId: string) => {
    setPlantToDelete(plantId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (plantToDelete) {
      try {
        await deletePlant(plantToDelete);
        refetch();
      } catch (error) {
        console.error('Error deleting plant:', error);
      }
      setDeleteDialogOpen(false);
      setPlantToDelete(null);
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-red-500 mb-4">Error loading plants: {error?.message}</p>
        <Button variant="contained" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const healthStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return '';
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <TextField
            placeholder="Search plants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: <SearchIcon className="mr-2 text-gray-400" />,
            }}
            className="w-64"
          />
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/plants/create')}
        >
          Add New Plant
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {isLoading ? (
          <div className="p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height={53} className="mb-2" />
            ))}
          </div>
        ) : data?.plants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No plants found</p>
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSort('id')}
                  className="cursor-pointer"
                >
                  ID
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('healthStatus')}
                  className="cursor-pointer"
                >
                  Health Status
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.plants.map((plant) => (
                <TableRow key={plant.id}>
                  <TableCell>{plant.id}</TableCell>
                  <TableCell>
                    <span className={healthStatusColor(plant.healthStatus)}>
                      {plant.healthStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => router.push(`/plants/${plant.id}`)}
                      size="small"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => router.push(`/plants/${plant.id}/edit`)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(plant.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TablePagination
          component="div"
          count={data?.total || 0}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
        />
      </div>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this plant?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PlantList;