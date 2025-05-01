import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#1976d2', '#e0e0e0']; // used, remaining

const LeaveBalance = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUserId(decoded.id);
    } catch (err) {
      console.error('Invalid token:', err);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchLeaveBalance = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/leave-balance/${userId}`
        );
        setLeaveData(response.data);
      } catch (error) {
        console.error('Error fetching leave balance:', error);
      }
    };

    fetchLeaveBalance();
  }, [userId]);

  if (!leaveData.length) {
    return <Typography>No leave balance data found.</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Leave Balances
      </Typography>
      <Grid container spacing={3}>
        {leaveData.map((leave, index) => {
          const used = parseFloat(leave.hours_taken);
          const total = parseFloat(leave.available_hours);
          const remaining = Math.max(total - used, 0);

          const chartData = [
            { name: 'Used', value: used },
            { name: 'Remaining', value: remaining },
          ];

          return (
            <Grid item xs={12} md={4} key={index}>
              <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  {leave.description}
                </Typography>

                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={COLORS[i % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} hours`} />
                  </PieChart>
                </ResponsiveContainer>

                <Typography variant="body2">
                  {used} / {total} hours used
                </Typography>
                <Typography variant="body1">
                  {(remaining / 8).toFixed(1)} day(s) remaining
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default LeaveBalance;
