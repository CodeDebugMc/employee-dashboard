const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const fileUpload = require('express-fileupload');

const webtoken = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyparser = require('body-parser');
const xlsx = require('xlsx');
const childrenRouter = require('./dashboardRoutes/Children');

const EligibilityRoute = require('./dashboardRoutes/Eligibility');
const VoluntaryWork = require('./dashboardRoutes/Voluntary');
const CollegeRoute = require('./dashboardRoutes/College');
const VocationalRoute = require('./dashboardRoutes/Vocational');
const PersonalRoute = require('./dashboardRoutes/PersonalInfo');
const WorkExperienceRoute = require('./dashboardRoutes/WorkExperience');
const OtherInformation = require('./dashboardRoutes/OtherSkills');
const AllData = require('./dashboardRoutes/DataRoute');
const Attendance = require('./dashboardRoutes/Attendance');
const { error } = require('console');

const app = express();

//MIDDLEWARE
app.use(fileUpload());
app.use(express.json());

app.use(express.json());
app.use(cors());
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // BAgo
app.use('/ChildrenRoute', childrenRouter);
app.use('/VoluntaryRoute', VoluntaryWork);
app.use('/eligibilityRoute', EligibilityRoute);
app.use('/college', CollegeRoute);
app.use('/vocational', VocationalRoute);
app.use('/personalinfo', PersonalRoute);
app.use('/WorkExperienceRoute', WorkExperienceRoute);
app.use('/OtherInfo', OtherInformation);
app.use('/allData', AllData);
app.use('/attendance', Attendance);
app.use('/poster', express.static('poster'));

//MYSQL CONNECTION
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'earist_hris',
});

//MYSQL CONNECTION
const db2 = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'earist_hris',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Database Connected');
});

//REGISTER
app.post('/register', async (req, res) => {
  const { employeeNumber, username, email, role, password } = req.body;
  const hashedPass = await bcrypt.hash(password, 10);

  const query = `INSERT INTO users (employeeNumber, username, email, role, password) VALUES (?,?,?,?,?)`;

  db.query(
    query,
    [employeeNumber, username, email, role, hashedPass],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.status(200).send({ message: 'User Registered Successfully' });
    }
  );
});

//LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM users WHERE email = ?
    
    `;

  db.query(query, [email], async (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0)
      return res
        .status(400)
        .send({ message: 'User not found or Employee Number does not match' });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).send({ message: 'Invalid Credentials' });

    const token = webtoken.sign(
      {
        id: user.id,
        username: user.username,
        employeeNumber: user.employeeNumber,
        email: user.email,
        role: user.role,
      },
      'secret',
      { expiresIn: '1h' }
    );
    res.status(200).send({
      token,
      email: user.email,
      role: user.role,
      employeeNumber: user.employeeNumber,
    });
  });
});

//data
app.get('/data', (req, res) => {
  const query = `SELECT * FROM learning_and_development_table`;
  db.query(query, (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(result);
  });
});

//Read
app.get('/learning_and_development_table', (req, res) => {
  const query = 'SELECT * FROM learning_and_development_table';
  db.query(query, (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(result);
  });
});

//Add
app.post('/learning_and_development_table', (req, res) => {
  const {
    titleOfProgram,
    dateFrom,
    dateTo,
    numberOfHours,
    typeOfLearningDevelopment,
    conductedSponsored,
    person_id,
  } = req.body;
  const query =
    'INSERT INTO learning_and_development_table (titleOfProgram, dateFrom, dateTo, numberOfHours, typeOfLearningDevelopment, conductedSponsored, person_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(
    query,
    [
      titleOfProgram,
      dateFrom,
      dateTo,
      numberOfHours,
      typeOfLearningDevelopment,
      conductedSponsored,
      person_id,
    ],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.status(201).send({ message: 'Item created', id: result.insertId });
    }
  );
});

//Update
app.put('/learning_and_development_table/:id', (req, res) => {
  const {
    titleOfProgram,
    dateFrom,
    dateTo,
    numberOfHours,
    typeOfLearningDevelopment,
    conductedSponsored,
    person_id,
  } = req.body;
  const { id } = req.params;
  const query =
    'UPDATE learning_and_development_table SET titleOfProgram = ?, dateFrom = ?, dateTo = ?, numberOfHours = ?, typeOfLearningDevelopment = ?, conductedSponsored = ?, person_id = ? WHERE id = ?';
  db.query(
    query,
    [
      titleOfProgram,
      dateFrom,
      dateTo,
      numberOfHours,
      typeOfLearningDevelopment,
      conductedSponsored,
      person_id,
      id,
    ],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.status(200).send({ message: 'Item updated' });
    }
  );
});

//delete
app.delete('/learning_and_development_table/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM learning_and_development_table WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send({ message: 'Item deleted' });
  });
});

// File uploads

// Convert Excel date to normalized UTC date
function excelDateToUTCDate(excelDate) {
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
}

// New carousel for employee dashboard
// app.post(
//   '/upload_learning_and_development_table',
//   upload1.single('file'),
//   (req, res) => {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     try {
//       // Read the uploaded XLS file
//       const workbook = xlsx.readFile(req.file.path);
//       const sheet_name = workbook.SheetNames[0];
//       const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name]);

//       // Log the uploaded data for troubleshooting
//       console.log('Uploaded employee info data:', sheet);

//       // Insert data into MySQL
//       sheet.forEach((row) => {
//         const titleOfProgram = row.titleOfProgram;
//         const dateFrom = excelDateToUTCDate(row.dateFrom);
//         const formattedDateFrom = dateFrom.toISOString().split('T')[0];
//         const dateTo = excelDateToUTCDate(row.dateTo);
//         const formattedDateTo = dateTo.toISOString().split('T')[0];
//         const numberOfHours = row.numberOfHours;
//         const typeOfLearningDevelopment = row.typeOfLearningDevelopment;
//         const conductedSponsored = row.conductedSponsored;

//         const query =
//           'INSERT INTO learning_and_development_table (titleOfProgram, dateFrom, dateTo, numberOfHours, typeOfLearningDevelopment, conductedSponsored) VALUES (?, ?, ?, ?, ?, ?)';
//         db.query(
//           query,
//           [
//             titleOfProgram,
//             formattedDateFrom,
//             formattedDateTo,
//             numberOfHours,
//             typeOfLearningDevelopment,
//             conductedSponsored,
//           ],
//           (err, result) => {
//             if (err) {
//               console.error('Error inserting data into the table', err);
//               return;
//             }
//             console.log('Data inserted into the table successfully:', result);
//           }
//         );
//       });

//       // Send response after insertion
//       res.json({
//         message: 'Excel file uploaded and data inserted successfully',
//       });
//     } catch (error) {
//       console.error('Error processing uploaded XLS file:', error);
//       res.status(500).json({ error: 'Error processing uploaded XLS file' });
//     } finally {
//       // Delete the uploaded file to save space on the server
//       fs.unlink(req.file.path, (err) => {
//         if (err) {
//           console.error('Error deleting uploaded file:', err);
//         } else {
//           console.log('Uploaded excel file deleted');
//         }
//       });
//     }
//   }
// );

// Banner start here.
// File upload config
const storageForPoster = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'poster/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage: storageForPoster });

app.post('/api/posts', upload.single('banner'), (req, res) => {
  const { title, content } = req.body;
  const banner = req.file.filename;

  db.query(
    'INSERT INTO poster (title, content, banner) VALUES (?, ?, ?)',
    [title, content, banner],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: 'Post created successfully' });
    }
  );
});

app.get('/api/posts', (_, res) => {
  db.query('SELECT * FROM poster ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Get settings
app.get('/api/settings', (req, res) => {
  db.query('SELECT * FROM settings WHERE id = 1', (err, result) => {
    if (err) throw err;
    res.send(result[0]);
  });
});

// Helper function to delete old logo
const deleteOldLogo = (logoUrl) => {
  if (!logoUrl) return; // If no logo URL, exit early

  const logoPath = path.join(__dirname, logoUrl); // Construct the full path to the logo file
  fs.unlink(logoPath, (err) => {
    if (err) {
      console.error(`Error deleting old logo at ${logoPath}: ${err}`);
    } else {
      console.log(`Previous logo at ${logoPath} deleted successfully.`);
    }
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const companyLogoUpload = multer({ storage });

// Update settings
app.post('/api/settings', companyLogoUpload.single('logo'), (req, res) => {
  const companyName = req.body.company_name || '';
  const headerColor = req.body.header_color || '#ffffff';
  const footerText = req.body.footer_text || '';
  const footerColor = req.body.footer_color || '#ffffff';
  const logoUrl = req.file ? `/uploads/${req.file.filename}` : null;

  // Check if settings already exist
  db.query('SELECT * FROM settings WHERE id = 1', (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      // Existing settings found

      const oldLogoUrl = result[0].logo_url; // Save old logo URL for deletion

      // Update existing settings
      const query =
        'UPDATE settings SET company_name = ?, header_color = ?, footer_text = ?, footer_color = ?' +
        (logoUrl ? ', logo_url = ?' : '') +
        ' WHERE id = 1';
      const params = [companyName, headerColor, footerText, footerColor];
      if (logoUrl) params.push(logoUrl);

      db.query(query, params, (err) => {
        if (err) throw err;

        // If there's a new logo, delete the old one
        if (logoUrl && oldLogoUrl) {
          deleteOldLogo(oldLogoUrl);
        }

        res.send({ success: true });
      });
    } else {
      // Insert new settings
      const query =
        'INSERT INTO settings (company_name, header_color, footer_text, footer_color, logo_url) VALUES (?, ?, ?, ?, ?)';
      db.query(
        query,
        [companyName, headerColor, footerText, footerColor, logoUrl],
        (err) => {
          if (err) throw err;
          res.send({ success: true });
        }
      );
    }
  });
});

// Fetch official time records for a person_id (Monday to Sunday)
app.get('/officialtimetable/:employeeID', (req, res) => {
  const { employeeID } = req.params;
  const sql = 'SELECT * FROM officialtime WHERE employeeID = ? ORDER BY id';

  db.query(sql, [employeeID], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(results);
  });
});

// app.post("/officialtimetable", (req, res) => {
//   const { employeeID, records } = req.body;

//   // Insert or update logic
//   const sql = `
//     INSERT INTO officialtime (
//       employeeID, day,
//       officialTimeIN,
//       officialBreaktimeIN,
//       officialBreaktimeOUT,
//       officialTimeOUT,
//       officialHonorariumTimeIN,
//       officialHonorariumTimeOUT,
//       officialServiceCreditTimeIN,
//       officialServiceCreditTimeOUT,
//       officialOverTimeIN,
//       officialOverTimeOUT,
//       breaktime
//     )
//     VALUES ?
//     ON DUPLICATE KEY UPDATE
//       officialTimeIN = VALUES(officialTimeIN),
//       officialBreaktimeIN = VALUES(officialBreaktimeIN),
//       officialBreaktimeOUT = VALUES(officialBreaktimeOUT),
//       officialTimeOUT = VALUES(officialTimeOUT),
//       officialHonorariumTimeIN = VALUES(officialHonorariumTimeIN),
//       officialHonorariumTimeOUT = VALUES(officialHonorariumTimeOUT),
//       officialServiceCreditTimeIN = VALUES(officialServiceCreditTimeIN),
//       officialServiceCreditTimeOUT = VALUES(officialServiceCreditTimeOUT),
//       officialOverTimeIN = VALUES(officialOverTimeIN),
//       officialOverTimeOUT = VALUES(officialOverTimeOUT)
//       WHERE employeeID = employeeID and day = day
//   `;

//   const values = records.map((r) => [
//     employeeID,
//     r.day,
//     r.officialTimeIN,
//     r.officialBreaktimeIN,
//     r.officialBreaktimeOUT,
//     r.officialTimeOUT,
//     r.officialHonorariumTimeIN,
//     r.officialHonorariumTimeOUT,
//     r.officialServiceCreditTimeIN,
//     r.officialServiceCreditTimeOUT,
//     r.officialOverTimeIN,
//     r.officialOverTimeOUT,
//     r.breaktime,
//   ]);

//   db.query(sql, [values], (err) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ message: "Records saved successfully" });
//   });
// });

app.post('/officialtimetable', (req, res) => {
  const { employeeID, records } = req.body;

  if (!records || records.length === 0) {
    return res.status(400).json({ message: 'No records to insert or update.' });
  }

  // Prepare values for bulk insert
  const values = records.map((r) => [
    employeeID,
    r.day,
    r.officialTimeIN,
    r.officialBreaktimeIN,
    r.officialBreaktimeOUT,
    r.officialTimeOUT,
    r.officialHonorariumTimeIN,
    r.officialHonorariumTimeOUT,
    r.officialServiceCreditTimeIN,
    r.officialServiceCreditTimeOUT,
    r.officialOverTimeIN,
    r.officialOverTimeOUT,
    r.breaktime,
  ]);

  const sql = `
    INSERT INTO officialtime (
      employeeID, day,
      officialTimeIN,
      officialBreaktimeIN,
      officialBreaktimeOUT,
      officialTimeOUT,
      officialHonorariumTimeIN,
      officialHonorariumTimeOUT,
      officialServiceCreditTimeIN,
      officialServiceCreditTimeOUT,
      officialOverTimeIN,
      officialOverTimeOUT,
      breaktime
    )
    VALUES ?
    ON DUPLICATE KEY UPDATE 
      officialTimeIN = VALUES(officialTimeIN),
      officialBreaktimeIN = VALUES(officialBreaktimeIN),
      officialBreaktimeOUT = VALUES(officialBreaktimeOUT),
      officialTimeOUT = VALUES(officialTimeOUT),
      officialHonorariumTimeIN = VALUES(officialHonorariumTimeIN),
      officialHonorariumTimeOUT = VALUES(officialHonorariumTimeOUT),
      officialServiceCreditTimeIN = VALUES(officialServiceCreditTimeIN),
      officialServiceCreditTimeOUT = VALUES(officialServiceCreditTimeOUT),
      officialOverTimeIN = VALUES(officialOverTimeIN),
      officialOverTimeOUT = VALUES(officialOverTimeOUT),
      breaktime = VALUES(breaktime)
  `;

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error('Error inserting or updating records:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Records inserted or updated successfully' });
  });
});

// EXCEL UPLOAD FOR OFFICIAL TIME

// app.post("/upload-excel-faculty-official-time", (req, res) => {
//   if (!req.files || !req.files.file) {
//     return res.status(400).json({ message: "No file uploaded." });
//   }

//   const file = req.files.file;
//   const workbook = xlsx.read(file.data, { type: "buffer" });
//   const sheetName = workbook.SheetNames[0];
//   const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//   if (!sheet.length) {
//     return res.status(400).json({ message: "Excel file is empty." });
//   }

//   const values = sheet.map((row) => [
//     row.employeeID,
//     row.day,
//     row.officialTimeIN,
//     row.officialBreaktimeIN,
//     row.officialBreaktimeOUT,
//     row.officialTimeOUT,
//     row.officialHonorariumTimeIN,
//     row.officialHonorariumTimeOUT,
//     row.officialServiceCreditTimeIN,
//     row.officialServiceCreditTimeOUT,
//     row.officialOverTimeIN,
//     row.officialOverTimeOUT,
//   ]);

//   const sql = `
//     INSERT INTO officialtime (
//       employeeID, day,
//       officialTimeIN,
//       officialBreaktimeIN,
//       officialBreaktimeOUT,
//       officialTimeOUT,
//       officialHonorariumTimeIN,
//       officialHonorariumTimeOUT,
//       officialServiceCreditTimeIN,
//       officialServiceCreditTimeOUT,
//       officialOverTimeIN,
//       officialOverTimeOUT

//     )
//     VALUES ?
//     ON DUPLICATE KEY UPDATE
//       officialTimeIN = VALUES(officialTimeIN),
//       officialBreaktimeIN = VALUES(officialBreaktimeIN),
//       officialBreaktimeOUT = VALUES(officialBreaktimeOUT),
//       officialTimeOUT = VALUES(officialTimeOUT),
//       officialHonorariumTimeIN = VALUES(officialHonorariumTimeIN),
//       officialHonorariumTimeOUT = VALUES(officialHonorariumTimeOUT),
//       officialServiceCreditTimeIN = VALUES(officialServiceCreditTimeIN),
//       officialServiceCreditTimeOUT = VALUES(officialServiceCreditTimeOUT),
//       officialOverTimeIN = VALUES(officialOverTimeIN),
//       officialOverTimeOUT = VALUES(officialOverTimeOUT)

//   `;

//   db.query(sql, [values], (err, result) => {
//     if (err) {
//       console.error("Error inserting/updating records:", err);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json({ message: "Excel data uploaded successfully", affectedRows: result.affectedRows });
//   });
// });

app.post('/upload-excel-faculty-official-time', (req, res) => {
  if (!req.files || !req.files.file) {
    console.error('No file uploaded.');
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const file = req.files.file;
  console.log('Uploaded file:', file.name);

  const workbook = xlsx.read(file.data, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  console.log('Extracted Data:', sheet);

  if (!sheet.length) {
    console.error('Excel file is empty.');
    return res.status(400).json({ message: 'Excel file is empty.' });
  }

  const values = sheet
    .map((row) => [
      row.employeeID?.toString().trim(),
      row.day,
      row.officialTimeIN || null,
      row.officialBreaktimeIN || null,
      row.officialBreaktimeOUT || null,
      row.officialTimeOUT || null,
      row.officialHonorariumTimeIN || null,
      row.officialHonorariumTimeOUT || null,
      row.officialServiceCreditTimeIN || null,
      row.officialServiceCreditTimeOUT || null,
      row.officialOverTimeIN || null,
      row.officialOverTimeOUT || null,
    ])
    .filter((row) => row[0]); // Remove rows without employeeID

  if (values.length === 0) {
    console.error('No valid data to insert.');
    return res.status(400).json({ message: 'No valid data to insert.' });
  }

  const sql = `
    INSERT INTO officialtime (
      employeeID, day,
      officialTimeIN,
      officialBreaktimeIN,
      officialBreaktimeOUT,
      officialTimeOUT,
      officialHonorariumTimeIN,
      officialHonorariumTimeOUT,
      officialServiceCreditTimeIN,
      officialServiceCreditTimeOUT,
      officialOverTimeIN,
      officialOverTimeOUT
    )
    VALUES ?
    ON DUPLICATE KEY UPDATE 
      officialTimeIN = VALUES(officialTimeIN),
      officialBreaktimeIN = VALUES(officialBreaktimeIN),
      officialBreaktimeOUT = VALUES(officialBreaktimeOUT),
      officialTimeOUT = VALUES(officialTimeOUT),
      officialHonorariumTimeIN = VALUES(officialHonorariumTimeIN),
      officialHonorariumTimeOUT = VALUES(officialHonorariumTimeOUT),
      officialServiceCreditTimeIN = VALUES(officialServiceCreditTimeIN),
      officialServiceCreditTimeOUT = VALUES(officialServiceCreditTimeOUT),
      officialOverTimeIN = VALUES(officialOverTimeIN),
      officialOverTimeOUT = VALUES(officialOverTimeOUT)
  `;

  console.log('SQL Query:', sql);
  console.log('Values:', values);

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error('MySQL Error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({
      message: 'Excel data uploaded successfully',
      affectedRows: result.affectedRows,
    });
  });
});

//////// ROLES

app.get('/api/user-role/:user', (req, res) => {
  const { user } = req.params;
  const query = 'SELECT role FROM users where id = ?';
  db.query(query, [user], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.lengt > 0) {
      res.json({ role: results[0].role });
    } else {
      console.log(res);
      res.status(400).json({ error: 'User not found' });
    }
  });
});

///////// PAYROLL

// Get all payroll
app.get('/api/payroll', (req, res) => {
  db.query('SELECT * FROM payroll', (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});

// Add
app.post('/api/payroll', (req, res) => {
  const {
    name,
    position,
    rateNbc188,
    nbc594,
    increment,
    grossSalary,
    abs,
    d,
    h,
    m,
    netSalary,
    withholdingTax,
    totalGsisDeds,
    totalPagibigDeds,
    philhealth,
    totalOtherDeds,
    totalDeductions,
    pay1st,
    pay2nd,
    rtIns,
    ec,
    pagibig,
  } = req.body;

  const sql = `
      INSERT INTO payroll 
      (name, position, rateNbc188, nbc594, increment, grossSalary, abs, d, h, m, 
       netSalary, withholdingTax, totalGsisDeds, totalPagibigDeds, philhealth, 
       totalOtherDeds, totalDeductions, pay1st, pay2nd, rtIns, ec, pagibig) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      position,
      rateNbc188,
      nbc594,
      increment,
      grossSalary,
      abs,
      d,
      h,
      m,
      netSalary,
      withholdingTax,
      totalGsisDeds,
      totalPagibigDeds,
      philhealth,
      totalOtherDeds,
      totalDeductions,
      pay1st,
      pay2nd,
      rtIns,
      ec,
      pagibig,
    ],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json({
          message: 'Payroll record added successfully',
          id: result.insertId,
        });
      }
    }
  );
});

// Update
app.put('/api/payroll/:id', (req, res) => {
  const { id } = req.params;
  const {
    name,
    position,
    rateNbc188,
    nbc594,
    increment,
    grossSalary,
    abs,
    d,
    h,
    m,
    netSalary,
    withholdingTax,
    totalGsisDeds,
    totalPagibigDeds,
    philhealth,
    totalOtherDeds,
    totalDeductions,
    pay1st,
    pay2nd,
    rtIns,
    ec,
    pagibig,
  } = req.body;

  const sql = `UPDATE payroll SET 
    name=?, position=?, rateNbc188=?, nbc594=?, increment=?, grossSalary=?, abs=?, d=?, h=?, m=?,
    netSalary=?, withholdingTax=?, totalGsisDeds=?, totalPagibigDeds=?, philhealth=?,
    totalOtherDeds=?, totalDeductions=?, pay1st=?, pay2nd=?, rtIns=?, ec=?, pagibig=? 
    WHERE id=?`;

  db.query(
    sql,
    [
      name,
      position,
      rateNbc188,
      nbc594,
      increment,
      grossSalary,
      abs,
      d,
      h,
      m,
      netSalary,
      withholdingTax,
      totalGsisDeds,
      totalPagibigDeds,
      philhealth,
      totalOtherDeds,
      totalDeductions,
      pay1st,
      pay2nd,
      rtIns,
      ec,
      pagibig,
      id,
    ],
    (err, result) => {
      if (err) res.status(500).send(err);
      else res.json({ message: 'Payroll record updated successfully' });
    }
  );
});

// delete
app.delete('/api/payroll/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM payroll WHERE id=?', [id], (err, result) => {
    if (err) res.status(500).send(err);
    else res.json({ message: 'Payroll record deleted successfully' });
  });
});

//////// REMITTANCE

// Get all remittance records
app.get('/api/remittance', (req, res) => {
  db.query('SELECT * FROM remittances', (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});

// Add a new remittance record
app.post('/api/remittance', (req, res) => {
  const {
    name,
    withHoldingTax,
    personalLifeRet,
    gsisSalarayLoan,
    gsisPolicyLoan,
    gfal,
    cpl,
    mpl,
    mplLite,
    emergencyLoan,
    totalGsisDeds,
    pagibigFundCont,
    pagibig2,
    multiPurpLoan,
    totalPagibigDeds,
    philhealth,
    disallowance,
    landbankSalaryLoan,
    earistCreditCoop,
    feu,
    mtslaSalaryLoan,
    savingAndLoan,
    totalOtherDeds,
    totalDeds,
  } = req.body;

  const sql = `
      INSERT INTO remittances
      ( name,
    withHoldingTax,
    personalLifeRet,
    gsisSalarayLoan,
    gsisPolicyLoan,
    gfal,
    cpl,
    mpl,
    mplLite,
    emergencyLoan,
    totalGsisDeds,
    pagibigFundCont,
    pagibig2,
    multiPurpLoan,
    totalPagibigDeds,
    philhealth,
    disallowance,
    landbankSalaryLoan,
    earistCreditCoop,
    feu,
    mtslaSalaryLoan,
    savingAndLoan,
    totalOtherDeds,
    totalDeds)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      withHoldingTax,
      personalLifeRet,
      gsisSalarayLoan,
      gsisPolicyLoan,
      gfal,
      cpl,
      mpl,
      mplLite,
      emergencyLoan,
      totalGsisDeds,
      pagibigFundCont,
      pagibig2,
      multiPurpLoan,
      totalPagibigDeds,
      philhealth,
      disallowance,
      landbankSalaryLoan,
      earistCreditCoop,
      feu,
      mtslaSalaryLoan,
      savingAndLoan,
      totalOtherDeds,
      totalDeds,
    ],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json({
          message: 'Remittance record added successfully',
          id: result.insertId,
        });
      }
    }
  );
});

// Update a remittances record
app.put('/api/remittance/:id', (req, res) => {
  const { id } = req.params;
  const {
    name,
    withHoldingTax,
    personalLifeRet,
    gsisSalarayLoan,
    gsisPolicyLoan,
    gfal,
    cpl,
    mpl,
    mplLite,
    emergencyLoan,
    totalGsisDeds,
    pagibigFundCont,
    pagibig2,
    multiPurpLoan,
    totalPagibigDeds,
    philhealth,
    disallowance,
    landbankSalaryLoan,
    earistCreditCoop,
    feu,
    mtslaSalaryLoan,
    savingAndLoan,
    totalOtherDeds,
    totalDeds,
  } = req.body;

  const sql = `UPDATE remittances SET
      name = ?,
      withHoldingTax = ?,
      personalLifeRet= ?,
      gsisSalarayLoan= ?,
      gsisPolicyLoan= ?,
      gfal= ?,
      cpl= ?,
      mpl= ?,
      mplLite= ?,
      emergencyLoan= ?,
      totalGsisDeds= ?,
      pagibigFundCont= ?,
      pagibig2= ?,
      multiPurpLoan= ?,
      totalPagibigDeds= ?,
      philhealth= ?,
      disallowance= ?,
      landbankSalaryLoan= ?,
      earistCreditCoop= ?,
      feu= ?,
      mtslaSalaryLoan= ?,
      savingAndLoan= ?,
      totalOtherDeds= ?,
      totalDeds= ?
    WHERE id=?`;

  db.query(
    sql,
    [
      name,
      withHoldingTax,
      personalLifeRet,
      gsisSalarayLoan,
      gsisPolicyLoan,
      gfal,
      cpl,
      mpl,
      mplLite,
      emergencyLoan,
      totalGsisDeds,
      pagibigFundCont,
      pagibig2,
      multiPurpLoan,
      totalPagibigDeds,
      philhealth,
      disallowance,
      landbankSalaryLoan,
      earistCreditCoop,
      feu,
      mtslaSalaryLoan,
      savingAndLoan,
      totalOtherDeds,
      totalDeds,
      id,
    ],
    (err) => {
      if (err) res.status(500).send(err);
      else res.json({ message: 'Remittance record updated successfully' });
    }
  );
});

app.delete('/api/remittance/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM remittances WHERE id=?', [id], (err) => {
    if (err) res.status(500).send(err);
    else res.json({ message: 'Remittance record deleted successfully' });
  });
});

/////// ITEM-TABLE

// Get all records (Include `dateCreated`)
app.get('/api/item-table', (req, res) => {
  const sql = `SELECT id, item_description, employeeID, item_code, salary_grade, dateCreated FROM item_table`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Database Query Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(result);
  });
});

// Add new item (`dateCreated` is automatic)
app.post('/api/item-table', (req, res) => {
  const { item_description, employeeID, item_code, salary_grade } = req.body;

  const sql = `
      INSERT INTO item_table (item_description, employeeID, item_code, salary_grade)
      VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [item_description, employeeID, item_code, salary_grade],
    (err, result) => {
      if (err) {
        console.error('Database Insert Error:', err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.json({
        message: 'Item record added successfully',
        id: result.insertId,
      });
    }
  );
});

// Update item (`dateCreated` remains unchanged)
app.put('/api/item-table/:id', (req, res) => {
  const { id } = req.params;
  const { item_description, employeeID, item_code, salary_grade } = req.body;

  const sql = `
    UPDATE item_table SET
      item_description = ?,
      employeeID = ?,
      item_code = ?,
      salary_grade = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [item_description, employeeID, item_code, salary_grade, id],
    (err, result) => {
      if (err) {
        console.error('Database Update Error:', err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json({ message: 'Item record updated successfully' });
    }
  );
});

// Delete item
app.delete('/api/item-table/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM item_table WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Database Delete Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item record deleted successfully' });
  });
});

// SALARY GRADE TABLE START
// Create
app.post('/salary-grade', (req, res) => {
  const {
    effectivityDate,
    sg_number,
    step1,
    step2,
    step3,
    step4,
    step5,
    step6,
    step7,
    step8,
  } = req.body;

  const query =
    'INSERT INTO salary_grade_table (effectivityDate, sg_number, step1, step2, step3, step4, step5, step6, step7, step8) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [
    effectivityDate,
    sg_number,
    step1,
    step2,
    step3,
    step4,
    step5,
    step6,
    step7,
    step8,
  ];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      res.status(200).send('Salary grade added successfully');
    }
  });
});

// Read (Get all records)
app.get('/salary-grade', (req, res) => {
  const query = 'SELECT * FROM salary_grade_table';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
    } else {
      res.status(200).json(results);
    }
  });
});

// Update (Update a record by ID)
app.put('/salary-grade/:id', (req, res) => {
  const { id } = req.params;
  const {
    effectivityDate,
    sg_number,
    step1,
    step2,
    step3,
    step4,
    step5,
    step6,
    step7,
    step8,
  } = req.body;

  const query =
    'UPDATE salary_grade_table SET effectivityDate = ?, sg_number = ?, step1 = ?, step2 = ?, step3 = ?, step4 = ?, step5 = ?, step6 = ?, step7 = ?, step8 = ? WHERE id = ?';
  const values = [
    effectivityDate,
    sg_number,
    step1,
    step2,
    step3,
    step4,
    step5,
    step6,
    step7,
    step8,
    id,
  ];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
    } else {
      res.status(200).send('Salary grade updated successfully');
    }
  });
});

// Delete (Delete a record by ID)
app.delete('/salary-grade/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM salary_grade_table WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).send('Error deleting data');
    } else {
      res.status(200).send('Salary grade deleted successfully');
    }
  });
});

//SALARY GRADE TABLE END

// Get all records
app.get('/api/salary-grade-status', (req, res) => {
  db.query('SELECT * FROM salary_grade_status', (err, result) => {
    if (err) res.status(500).send(err);
    else res.json(result);
  });
});

// Add a new record
app.post('/api/salary-grade-status', (req, res) => {
  const { effectivityDate, step_number, status } = req.body;

  const sql = `
    INSERT INTO salary_grade_status (effectivityDate, step_number, status)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [effectivityDate, step_number, status], (err, result) => {
    if (err) res.status(500).send(err);
    else
      res.json({ message: 'Record added successfully', id: result.insertId });
  });
});

// Update a record
app.put('/api/salary-grade-status/:id', (req, res) => {
  const { id } = req.params;
  const { effectivityDate, step_number, status } = req.body;

  const sql = `
    UPDATE salary_grade_status 
    SET effectivityDate = ?, step_number = ?, status = ?
    WHERE id = ?
  `;

  db.query(sql, [effectivityDate, step_number, status, id], (err) => {
    if (err) res.status(500).send(err);
    else res.json({ message: 'Record updated successfully' });
  });
});

// Delete a record
app.delete('/api/salary-grade-status/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM salary_grade_status WHERE id = ?', [id], (err) => {
    if (err) res.status(500).send(err);
    else res.json({ message: 'Record deleted successfully' });
  });
});

// Get all department table
app.get('/api/department-table', (req, res) => {
  db.query('SELECT * FROM department_table', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Get a single department table by ID
app.get('/api/department-table/:id', (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT * FROM department_table WHERE id = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.length === 0)
        return res.status(404).send('Department not found');
      res.json(result[0]);
    }
  );
});

// Add a new department table
app.post('/api/department-table', (req, res) => {
  const { code, description } = req.body;
  if (!code || !description)
    return res.status(400).send('Code and description are required');

  const sql = `INSERT INTO department_table (code, description) VALUES (?, ?)`;
  db.query(sql, [code, description], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).json({ id: result.insertId, code, description });
  });
});

// Update a department table
app.put('/api/department-table/:id', (req, res) => {
  const { id } = req.params;
  const { code, description } = req.body;

  const sql = `UPDATE department_table SET code = ?, description = ? WHERE id = ?`;
  db.query(sql, [code, description, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send('Department updated successfully');
  });
});

// Delete a department table
app.delete('/api/department-table/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM department_table WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send('Department deleted successfully');
  });
});

/////////////////////////////////////////////////////////////////////////////
// Get all department Assignment
app.get('/api/department-assignment', (req, res) => {
  db.query('SELECT * FROM department_assignment', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Get a single department assignment by ID
app.get('/api/department-assignment/:id', (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT * FROM department_assignment WHERE id = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.length === 0)
        return res.status(404).send('Department not found');
      res.json(result[0]);
    }
  );
});

// Add a new department assignment
app.post('/api/department-assignment', (req, res) => {
  const { department_id, employeeID } = req.body;
  if (!department_id || !employeeID)
    return res.status(400).send('Code and description are required');

  const sql = `INSERT INTO department_assignment (department_id, employeeID) VALUES (?, ?)`;
  db.query(sql, [department_id, employeeID], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).json({ id: result.insertId, department_id, employeeID });
  });
});

// Update a department assignment
app.put('/api/department-assignment/:id', (req, res) => {
  const { id } = req.params;
  const { department_id, employeeID } = req.body;

  const sql = `UPDATE department_assignment SET department_id = ?, employeeID = ? WHERE id = ?`;
  db.query(sql, [department_id, employeeID, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send('Department updated successfully');
  });
});

// Delete a department assigenment
app.delete('/api/department-assignment/:id', (req, res) => {
  const { id } = req.params;
  db.query(
    'DELETE FROM department_assignment WHERE id = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send('Department deleted successfully');
    }
  );
});

// LEAVE

app.get('/leave', (req, res) => {
  const sql = `SELECT * FROM leave_table`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Database Query Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(result);
  });
});

app.post('/leave', (req, res) => {
  const { leave_code, description, number_hours } = req.body;

  if (!leave_code) {
    return res.status(400).json({ error: 'Leave code is required' });
  }

  const sql = `INSERT INTO leave_table (leave_code, description, number_hours) VALUES (?,?,?)`;
  db.query(sql, [leave_code, description, number_hours], (err, result) => {
    if (err) {
      console.error('Database Insert Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.status(201).json({
      message: 'Leave record added successfully',
      id: result.insertId,
    });
  });
});

app.put('/leave/:id', (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const { leave_code, description, number_hours } = req.body;

  if (!leave_code) {
    return res.status(400).json({ error: 'Leave code is required' });
  }

  const sql = `UPDATE leave_table SET leave_code = ?, description = ?, number_hours = ? WHERE id = ?`;
  db.query(sql, [leave_code, description, number_hours, id], (err, result) => {
    if (err) {
      console.error('Database Update Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Leave record not found' });
    }

    res.json({ message: 'Leave record updated successfully' });
  });
});

app.delete('/leave/:id', (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const sql = `DELETE FROM leave_table WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Database Delete Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Leave record not found' });
    }

    res.json({ message: 'Leave record deleted successfully' });
  });
});

//LEAVE ASSIGNMENT START
// CREATE Leave Assignment
app.post('/leave_assignment', (req, res) => {
  const { employeeID, leaveID, noOfLeaves } = req.body;
  const sql =
    'INSERT INTO leave_assignment (employeeID, leaveID, noOfLeaves) VALUES (?, ?, ?)';
  db.query(sql, [employeeID, leaveID, noOfLeaves], (err, result) => {
    if (err) return res.status(500).json(err);
    res
      .status(201)
      .json({ message: 'Leave Assignment Created', id: result.insertId });
  });
});

// READ Leave Assignments
app.get('/leave_assignment', (req, res) => {
  const sql = 'SELECT * FROM leave_assignment';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// UPDATE Leave Assignment
app.put('/leave_assignment/:id', (req, res) => {
  const { id } = req.params;
  const { employeeID, leaveID, noOfLeaves } = req.body;
  const sql =
    'UPDATE leave_assignment SET employeeID=?, leaveID=?, noOfLeaves=? WHERE id=?';
  db.query(sql, [employeeID, leaveID, noOfLeaves, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Leave Assignment Updated' });
  });
});

// DELETE Leave Assignment
app.delete('/leave_assignment/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM leave_assignment WHERE id=?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Leave Assignment Deleted' });
  });
});

// HOLIDAY

app.get('/holiday-suspension', (req, res) => {
  const sql = `SELECT * FROM holidayandsuspension`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Database Query Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(result);
  });
});

app.post('/holiday-suspension', (req, res) => {
  const { description, date, status } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const sql = `INSERT INTO holidayandsuspension (description, date, status) VALUES (?, ?, ?)`;
  db.query(sql, [description, date, status], (err, result) => {
    if (err) {
      console.error('Database Insert Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.status(201).json({
      message: 'Holiday and Suspension record added successfully',
      id: result.insertId,
    });
  });
});

app.put('/holiday-suspension/:id', (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const { description, date, status } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const sql = `UPDATE holidayandsuspension SET description = ?, date = ?, status = ? WHERE id = ?`;
  db.query(sql, [description, date, status, id], (err, result) => {
    if (err) {
      console.error('Database Update Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: 'Holiday suspension record not found' });
    }

    res.json({ message: 'Holiday suspension record updated successfully' });
  });
});

app.delete('/holiday-suspension/:id', (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const sql = `DELETE FROM holidayandsuspension WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Database Delete Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: 'Holiday suspension record not found' });
    }

    res.json({ message: 'Holiday suspension record deleted successfully' });
  });
});

app.get('/personalinfo/person_table/:employeeNumber', (req, res) => {
  const { employeeNumber } = req.params;
  const query = 'SELECT * FROM person_table WHERE agencyEmployeeNum = ?';

  db.query(query, [employeeNumber], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (result.length === 0) {
      return res.status(404).send('Employee not found');
    }

    res.status(200).send(result[0]); // Send first matched result
  });
});

app.get('/college/college-table/:employeeNumber', (req, res) => {
  const { employeeNumber } = req.params;
  const query = 'SELECT * FROM college_table WHERE person_id = ?';

  db.query(query, [employeeNumber], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (result.length === 0) {
      return res.status(404).send('Employee not found');
    }

    res.status(200).send(result[0]); // Send first matched result
  });
});

app.get('/vocational/vocational-table/:employeeNumber', (req, res) => {
  const { employeeNumber } = req.params;
  const query = 'SELECT * FROM vocational_table WHERE person_id = ?';

  db.query(query, [employeeNumber], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (result.length === 0) {
      return res.status(404).send('Employee not found');
    }

    res.status(200).send(result[0]); // Send first matched result
  });
});

for (let i = 1; i <= 12; i++) {
  app.get(`/childrenRoute/children-table${i}/:employeeNumber`, (req, res) => {
    const { employeeNumber } = req.params;
    const query = `SELECT * FROM children_table WHERE person_id = ? AND incValue=${i}`;

    db.query(query, [employeeNumber], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Internal Server Error');
      }

      if (result.length === 0) {
        return res.status(404).send('Employee not found');
      }

      res.status(200).send(result[0]); // Send first matched result
    });
  });
}

for (let i = 1; i <= 7; i++) {
  app.get(`/eligibilityRoute/eligibility${i}/:employeeNumber`, (req, res) => {
    const { employeeNumber } = req.params;
    const query = `SELECT * FROM eligibility_table WHERE person_id = ? AND incValue = ?`;

    db.query(query, [employeeNumber, i], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Internal Server Error');
      }

      // Always respond with 200. If nothing found, send null
      res.status(200).send(result.length > 0 ? result[0] : null);
    });
  });
}

for (let i = 1; i <= 26; i++) {
  app.get(
    `/WorkExperienceRoute/work-experience-table${i}/:employeeNumber`,
    (req, res) => {
      const { employeeNumber } = req.params;
      const query = `SELECT * FROM work_experience_table WHERE person_id = ? AND incValue = ?`;

      db.query(query, [employeeNumber, i], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).send('Internal Server Error');
        }

        // Always respond with 200. If nothing found, send null
        res.status(200).send(result.length > 0 ? result[0] : null);
      });
    }
  );
}

for (let i = 1; i <= 7; i++) {
  app.get(`/VoluntaryRoute/voluntary-work${i}/:employeeNumber`, (req, res) => {
    const { employeeNumber } = req.params;
    const query = `SELECT * FROM voluntary_work_table WHERE person_id = ? AND incValue = ?`;

    db.query(query, [employeeNumber, i], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Internal Server Error');
      }

      // Always respond with 200. If nothing found, send null
      res.status(200).send(result.length > 0 ? result[0] : null);
    });
  });
}

//=================
// LEAVE START HERE
//=================

// // Get leave types
// app.get('/api/leave-types', async (req, res) => {
//   try {
//     const [rows] = await db.query('SELECT * FROM leave_table');
//     res.json(rows);
//   } catch (err) {
//     console.error('DB error:', err);
//     res.status(500).json({ error: 'Database failed' });
//   }
// });

// // Apply for leave
// app.post('/api/leaves/apply', async (req, res) => {
//   const { employee_id, leave_code, start_date, end_date, reason } = req.body;
//   await db.query(
//     `
//     INSERT INTO apply_leave (employee_id, leave_code, start_date, end_date, reason)
//     VALUES (?, ?, ?, ?, ?)`,
//     [employee_id, leave_code, start_date, end_date, reason]
//   );
//   res.json({ message: 'Leave request submitted' });
// });

// // Get leave history for one employee
// app.get('/api/leaves/:employee_id', async (req, res) => {
//   const [rows] = await db.query(
//     `SELECT * FROM apply_leave WHERE employee_id = ? ORDER BY requested_at DESC`,
//     [req.params.employee_id]
//   );
//   res.json(rows);
// });

// // Update leave status
// app.put('/api/leaves/:id/status', async (req, res) => {
//   const { status } = req.body;
//   await db.query(`UPDATE apply_leave SET status = ? WHERE id = ?`, [
//     status,
//     req.params.id,
//   ]);
//   res.json({ message: 'Leave status updated' });
// });

// Get leave types
app.get('/api/leave-types', (req, res) => {
  db.query(
    'SELECT leave_code, description FROM leave_table',
    (err, results) => {
      if (err)
        return res.status(500).json({ message: 'Error fetching leave types' });
      res.json(results);
    }
  );
});

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

//=================
// LEAVE END HERE
//=================
app.listen(5000, () => {
  console.log('Server runnning');
});
