
CREATE TABLE leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employeeNumber INT NOT NULL,
  leave_type VARCHAR(50),
  date DATE,
  status ENUM('pending', '1', '0') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeNumber) REFERENCES users(employeeNumber),
  FOREIGN KEY (leave_type) REFERENCES leave_table(leave_code)
);


CREATE TABLE leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_number INT NOT NULL,
  leave_type VARCHAR(50),
  date DATE,
  status ENUM('pending', '1', '0') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_number) REFERENCES users(employeeNumber),
  FOREIGN KEY (leave_type) REFERENCES leave_table(leave_code)
);

// Explain the query **NOTE
app.get('/api/leaves', (req, res) => {
  const query = `
    SELECT 
      l.id,
      u.employeeNumber,
      u.username,
      l.leave_type,
      lt.description AS leave_description,
      l.date,
      l.status,
      l.created_at
    FROM leaves l
    JOIN users u ON l.employee_number = u.employeeNumber
    JOIN leave_table lt ON l.leave_type = lt.leave_code
    ORDER BY l.date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('MySQL error:', err); // ✅ log it
      return res
        .status(500)
        .json({ message: 'Error fetching leave requests', error: err });
    }

    res.json(results);
  });
});

