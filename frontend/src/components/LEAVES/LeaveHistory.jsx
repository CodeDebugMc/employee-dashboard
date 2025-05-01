import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Typography } from '@mui/material';
import { Card, CardContent } from '@mui/material'; // Use MUI's Card directly if "@/components/ui/card" is a problem

const LeaveHistory = () => {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10; // number of records per page
  const [isLastPage, setIsLastPage] = useState(false); // 👈 NEW

  const fetchHistory = async (currentPage) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/leave-history?page=${currentPage}&limit=${limit}`
      );
      setLeaveHistory(res.data);
      setIsLastPage(res.data.length < limit); // 👈 If fewer than 10 records, we hit the last page
    } catch (error) {
      console.error('Error fetching leave history:', error);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (!isLastPage) {
      setPage(page + 1);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Leave History (Page {page})
      </Typography>

      {leaveHistory.length === 0 ? (
        <Typography>No leave history available.</Typography>
      ) : (
        leaveHistory.map((leave) => (
          <Card key={leave.id} style={{ marginBottom: '10px' }}>
            <CardContent>
              <Typography variant="h6">
                {leave.employee_name} ({leave.employee_email})
              </Typography>
              <Typography variant="subtitle1">
                {leave.leave_description} ({leave.leave_code})
              </Typography>
              <Typography variant="body2">Status: {leave.status}</Typography>
              <Typography variant="caption">
                Requested at: {new Date(leave.requested_at).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}

      <div
        style={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handlePrevPage}
          disabled={page === 1}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNextPage}
          disabled={isLastPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default LeaveHistory;
