import { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import { CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material';
import { green, red, orange } from '@mui/material/colors';
import dayjs from 'dayjs';
import axios from 'axios';

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/leaves')
      .then((res) => {
        setLeaves(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (loading)
    return <CircularProgress sx={{ display: 'block', m: '2rem auto' }} />;
  if (error)
    return <Alert severity="error">Failed to load leave requests.</Alert>;

  const paginatedData = leaves.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Leave History
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee #</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Leave Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Requested At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell>{leave.employeeNumber}</TableCell>
                <TableCell>{leave.username}</TableCell>
                <TableCell>{leave.leave_description}</TableCell>
                <TableCell>
                  {dayjs(leave.date).format('MMMM D, YYYY')}
                </TableCell>
                <TableCell>
                  {leave.status === '1' ? (
                    <span
                      style={{
                        color: green[600],
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <CheckCircle fontSize="small" sx={{ mr: 0.5 }} /> Approved
                    </span>
                  ) : leave.status === '0' ? (
                    <span
                      style={{
                        color: red[600],
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Cancel fontSize="small" sx={{ mr: 0.5 }} /> Rejected
                    </span>
                  ) : (
                    <span
                      style={{
                        color: orange[700],
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <HourglassEmpty fontSize="small" sx={{ mr: 0.5 }} />{' '}
                      Pending
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {dayjs(leave.created_at).format('MMM D, YYYY h:mm A')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={leaves.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[rowsPerPage]} // Lock to 10 per page
      />
    </Paper>
  );
};

export default LeaveHistory;
