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

const HolidaySuspension = () => {
  const [data, setData] = useState([]);
  const [holidayAndSuspension, setHolidayAndSuspension] = useState({
    description: '',
    date: '',
    status: '',
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchHolidayAndSuspension();
  }, []);

  const fetchHolidayAndSuspension = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/holiday-suspension'
      );
      setData(response.data);
    } catch (err) {
      console.error('Error fetching holiday suspension data', err.message);
    }
  };

  const handleChange = (e) => {
    setHolidayAndSuspension({
      ...holidayAndSuspension,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/holiday-suspension/${editingId}`,
          holidayAndSuspension
        );
      } else {
        await axios.post(
          'http://localhost:5000/holiday-suspension',
          holidayAndSuspension
        );
      }
      setEditingId(null);
      fetchHolidayAndSuspension();
      resetForm();
    } catch (error) {
      console.error('Error submitting holiday suspension data', error);
    }
  };

  const handleEdit = (item) => {
    const { description, date, status } = item;
    setHolidayAndSuspension({ description, date, status });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/holiday-suspension/${id}`);
      fetchHolidayAndSuspension();
    } catch (error) {
      console.error('Error deleting holiday suspension record', error);
    }
  };

  const handleCancel = () => {
    resetForm();
    setEditingId(null);
  };

  const resetForm = () => {
    setHolidayAndSuspension({
      description: '',
      date: '',
      status: '',
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
        Holiday and Suspension Records
      </Typography>

      {/* Form Box for Holiday and Suspension (white background) */}
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
          {Object.keys(holidayAndSuspension).map((key) => (
            <TextField
              key={key}
              label={key.replace(/([A-Z])/g, ' $1').trim()}
              name={key}
              value={holidayAndSuspension[key]}
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
                No.
              </TableCell>
              <TableCell style={{ color: '#000000', fontWeight: 'bold' }}>
                Description
              </TableCell>
              <TableCell style={{ color: '#000000', fontWeight: 'bold' }}>
                Date
              </TableCell>
              <TableCell style={{ color: '#000000', fontWeight: 'bold' }}>
                Status
              </TableCell>
              <TableCell style={{ color: '#000000', fontWeight: 'bold' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.status}</TableCell>
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

export default HolidaySuspension;
