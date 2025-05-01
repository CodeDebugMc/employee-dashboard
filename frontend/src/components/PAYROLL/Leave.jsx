import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Container,
  Typography,
} from '@mui/material';

const Leave = () => {
  const [data, setData] = useState([]);
  const [leave, setLeave] = useState({
    leave_code: '',
    description: '',
    number_hours: '',
  });

  const [editingId, setEditingId] = useState(null);

  const fetchLeave = async () => {
    try {
      const response = await axios.get('http://localhost:5000/leave');
      setData(response.data);
    } catch (err) {
      console.error('Error fetching leave data', err.message);
    }
  };

  useEffect(() => {
    fetchLeave();
  }, []);

  const handleChange = (e) => {
    setLeave({
      ...leave,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/leave/${editingId}`, leave);
      } else {
        await axios.post('http://localhost:5000/leave', leave);
      }
      setEditingId(null);
      fetchLeave();
      resetForm();
    } catch (error) {
      console.error('Error submitting leave data', error);
    }
  };

  const handleEdit = (item) => {
    const { leave_code, description, number_hours } = item;
    setLeave({ leave_code, description, number_hours });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/leave/${id}`);
      fetchLeave();
    } catch (error) {
      console.error('Error deleting leave record', error);
    }
  };

  const handleCancel = () => {
    resetForm();
    setEditingId(null);
  };

  const resetForm = () => {
    setLeave({
      leave_code: '',
      description: '',
      number_hours: '',
    });
  };

  return (
    <Container>
      {/* Header */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          backgroundColor: '#6D2323', // Maroon color
          color: '#FEF9E1', // Cream color
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        Leave Records Management
      </Typography>

      {/* Form Box for Leave (white background) */}
      <Paper
        elevation={3}
        sx={{
          padding: 3,
          backgroundColor: '#ffffff', // White background
          borderRadius: '8px',
          marginBottom: '24px',
        }}
      >
        <Box display="flex" flexWrap="wrap" sx={{ marginBottom: 3, gap: 2 }}>
          {Object.keys(leave).map((key) => (
            <TextField
              key={key}
              label={key.replace(/([A-Z])/g, ' $1').trim()}
              name={key}
              value={leave[key]}
              onChange={handleChange}
              sx={{
                width: '23%',
                color: '#000000', // Black text for the input
              }}
            />
          ))}
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: '#6D2323', // Maroon for Add/Update
              '&:hover': {
                backgroundColor: '#9C2A2A', // Darker maroon for hover
              },
              height: '55px',
            }}
          >
            {editingId ? 'Update' : 'Add'}
          </Button>
          {editingId && (
            <Button
              onClick={handleCancel}
              variant="contained"
              color="error"
              sx={{
                height: '55px',
              }}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Paper>

      {/* Data Table */}
      <TableContainer
        component={Paper}
        sx={{ maxHeight: 500, overflow: 'auto' }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow style={{ backgroundColor: '#6D2323' }}>
              <TableCell style={{ color: '#000000', fontWeight: 'bold' }}>
                Leave Code
              </TableCell>
              <TableCell style={{ color: '#000000', fontWeight: 'bold' }}>
                Description
              </TableCell>
              <TableCell style={{ color: '#000000', fontWeight: 'bold' }}>
                Number of Hours
              </TableCell>

              <TableCell style={{ color: '#000000', fontWeight: 'bold' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.leave_code}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.number_hours}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleEdit(item)}
                    variant="contained"
                    sx={{
                      backgroundColor: '#6D2323', // Maroon for Edit
                      color: '#FEF9E1', // Cream color text
                      '&:hover': {
                        backgroundColor: '#9C2A2A', // Darker maroon hover
                      },
                      marginRight: '8px',
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    variant="contained"
                    color="error"
                    sx={{
                      backgroundColor: '#000000', // Black for Delete
                      color: '#ffffff', // White text
                      '&:hover': {
                        backgroundColor: '#333333', // Darker black hover
                      },
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Leave;
