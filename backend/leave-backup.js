// Get leave types
// app.get('/api/leave-types', (req, res) => {
//   db.query(
//     'SELECT leave_code, description FROM leave_table',
//     (err, results) => {
//       if (err)
//         return res.status(500).json({ message: 'Error fetching leave types' });
//       res.json(results);
//     }
//   );
// });

// Get leave history for an employee
app.get('/api/leaves/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT l.*, lt.description AS leave_description
    FROM leaves l
    JOIN leave_table lt ON l.leave_code = lt.leave_code
    WHERE l.employee_id = ?
    ORDER BY l.requested_at DESC
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching history' });
    res.json(results);
  });
});

// API for Leave Approval
app.get('/api/leaves/pending', (req, res) => {
  const query = `
    SELECT *
    FROM leaves
    WHERE status = NULL
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching leaves' });
    res.json(results);
  });
});

// For approve and rejected Leave approval
app.put('/api/leaves/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, manager_id } = req.body;

  const query = `UPDATE leaves SET status = ?, manager_id = ? WHERE id = ?`;
  db.query(query, [status, manager_id, id], (err) => {
    if (err) return res.status(500).json({ message: 'Error updating status' });
    res.json({ message: 'Leave status updated' });
  });
});

app.get('/api/leaves/approved', (req, res) => {
  const query = `
    SELECT 
      l.id AS leave_id,
      l.employee_id,
      l.leave_code,
      l.date,
      l.status,
      l.requested_at,
      u.username AS approved_by
    FROM leaves l
    LEFT JOIN users u ON l.manager_id = u.id
    WHERE l.status = '1'
  `;
  db.query(query, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: 'Error fetching approved leaves' });
    res.json(results);
  });
});

// GET all pending leaves (optional: filter by manager's team later)
app.get('/api/leaves', (req, res) => {
  const query = `
    SELECT l.*, e.name AS employee_name, lt.description AS leave_description
    FROM leaves l
    JOIN employees e ON l.employee_id = e.id
    JOIN leave_table lt ON l.leave_code = lt.leave_code
    WHERE l.status = '0'
    ORDER BY l.requested_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching leaves' });
    res.json(results);
  });
});

// APPLY Leave Backend
// Create leave request
app.post('/api/leaves', (req, res) => {
  const { employee_id, leave_code, date } = req.body;

  const query = `
    INSERT INTO leaves (employee_id, leave_code, date)
    VALUES (?, ?, ?)
  `;

  db.query(query, [employee_id, leave_code, date], (err, result) => {
    if (err) {
      console.error('Error inserting leave request:', err);
      return res
        .status(500)
        .json({ message: 'Database error', error: err.message });
    }
    res
      .status(201)
      .json({ message: 'Leave request submitted', id: result.insertId });
  });
});

// Get all leave history of employee
app.get('/api/leave-history', (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default page 1
  const limit = parseInt(req.query.limit) || 10; // Default 10 items per page
  const offset = (page - 1) * limit;

  const query = `
    SELECT 
      l.id, 
      l.leave_code, 
      lt.description AS leave_description, 
      l.date, 
      l.status, 
      l.requested_at,
      u.username AS employee_name,
      u.email AS employee_email
    FROM leaves l
    JOIN leave_table lt ON l.leave_code = lt.leave_code
    JOIN users u ON l.employee_id = u.employeeNumber
    ORDER BY l.requested_at DESC
    LIMIT ? OFFSET ?
  `;

  db.query(query, [limit, offset], (err, results) => {
    if (err)
      return res.status(500).json({ message: 'Error fetching leave history' });
    res.json(results);
  });
});

app.get('/api/leave-balance/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      lt.leave_code,
      lt.description,
      lt.number_hours,
      COUNT(l.id) * 8 AS hours_taken
    FROM assigned_leaves al
    JOIN leave_table lt ON al.leave_code = lt.leave_code
    LEFT JOIN leaves l 
      ON lt.leave_code = l.leave_code 
      AND l.employee_id = ? 
      AND l.status = '1'
    WHERE al.employee_id = ?
    GROUP BY lt.leave_code, lt.description, lt.number_hours
  `;

  db.query(query, [id, id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching leave balance' });
    }

    const formatted = results.map((item) => ({
      ...item,
      available_hours: parseFloat(item.number_hours),
      hours_taken: parseFloat(item.hours_taken || 0),
      hours_remaining:
        parseFloat(item.number_hours) - parseFloat(item.hours_taken || 0),
      days_remaining:
        (parseFloat(item.number_hours) - parseFloat(item.hours_taken || 0)) / 8,
    }));

    res.json(formatted);
  });
});

// Attendance Tracking for Employee Dashboard starts here.
app.get('/api/attendance/recent/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT date, Day, timeIN, breaktimeIN, breaktimeOUT, timeOUT
    FROM attendancerecord
    WHERE personID = ?
    ORDER BY date DESC
    LIMIT 5
  `;
  db.query(query, [id], (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: 'Error fetching attendance records' });
    res.json(results);
  });
});
