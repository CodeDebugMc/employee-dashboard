import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  createTheme,
  ThemeProvider,
  Typography,
  Box,
} from '@mui/material';
import axios from 'axios';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './components/Login';
import Register from './components/Register';
import Unauthorized from './components/Unauthorized';
import AllIcons from './components/Page';
import SettingsForm from './SettingsForm';

import Home from './components/Home';
import Sidebar from './components/Sidebar';

// Leave
import LeaveForm from './components/LEAVES/LeaveForm';
import LeaveBalance from './components/LEAVES/LeaveBalance';
import LeaveHistory from './components/LEAVES/LeaveHistory';
import LeaveApproval from './components/LEAVES/LeaveApproval';
import AdminAnnouncements from './components/LEAVES/AdminAnnouncement';
// import EmployeeCarousel from './components/EmployeeCaraousel';
import AdminAnnouncementForm from './components/AdminAnnouncementForm';

// New Carousel
import PostPlatform from './components/PostPlatform';
import PostCarousel from './components/PostCarousel';

//DASHBOARD
import PersonalTable from './components/DASHBOARD/PersonTable';
import Children from './components/DASHBOARD/Children';
import College from './components/DASHBOARD/College';
import OtherSkills from './components/DASHBOARD/OtheSkills';
import WorkExperience from './components/DASHBOARD/WorkExperience';
import Vocational from './components/DASHBOARD/Vocational';
import LearningAndDevelopment from './components/DASHBOARD/LearningAndDevelopment';
import VoluntaryWork from './components/DASHBOARD/Voluntary';
import Eligibility from './components/DASHBOARD/Eligibility';

//RECORDS
import ViewAttendanceRecord from './components/ATTENDANCE/ViewAttendanceRecord';
import AttendanceSearch from './components/ATTENDANCE/ViewAttendance';
import DailyTimeRecord from './components/ATTENDANCE/DailyTimeRecord';
import DailyTimeRecordFaculty from './components/ATTENDANCE/DailyTimeRecordFaculty';
import AttendanceForm from './components/ATTENDANCE/AllAttendanceRecord';
import AttendanceModule from './components/ATTENDANCE/AttendanceModule';
import AttendanceModuleFaculty from './components/ATTENDANCE/AttendanceModuleFaculty';
import AttendanceModuleFaculty40 from './components/ATTENDANCE/AttendanceModuleFaculty40hrs';
import OverallAttendancePage from './components/ATTENDANCE/OverallAttendance';
import OfficialTimeForm from './components/ATTENDANCE/OfficialTimeForm';

//PAYROLL
import PayrollTable from './components/PAYROLL/PayrollTable';
import Remittances from './components/PAYROLL/Remittances';
import ItemTable from './components/PAYROLL/ItemTable';
import SalaryGradeTable from './components/PAYROLL/SalaryGradeTable';
import SalaryGradeStatusTable from './components/PAYROLL/SalaryGradeStatusTable';
import DepartmentTable from './components/PAYROLL/DepartmentTable';
import DepartmentAssignment from './components/PAYROLL/DepartmentAssignment';
import HolidaySuspension from './components/PAYROLL/HolidaySuspension';
import Leave from './components/PAYROLL/Leave';
import LeaveAssignment from './components/PAYROLL/LeaveAssignment';

//FORMS
import AssessmentClearance from './components/FORMS/AssessmentClearance';
import Clearance from './components/FORMS/Clearance';
import ClearanceBack from './components/FORMS/ClearanceBack';
import FacultyClearance from './components/FORMS/FacultyClearance';
import FacultyClearance70Days from './components/FORMS/FacultyClearance70Days';
import InServiceTraining from './components/FORMS/InServiceTraining';
import LeaveCard from './components/FORMS/LeaveCard';
import LeaveCardBack from './components/FORMS/LeaveCardBack';
import LocatorSlip from './components/FORMS/LocatorSlip';
import PermissionToTeach from './components/FORMS/PermissionToTeach';
import RequestForID from './components/FORMS/RequestForID';
import SalnFront from './components/FORMS/SalnFront';
import SalnBack from './components/FORMS/SalnBack';
import ScholarshipAgreement from './components/FORMS/ScholarshipAgreement';
import SubjectStillToBeTaken from './components/FORMS/SubjectStillToBeTaken';
import IndividualFacultyLoading from './components/FORMS/IndividualFacultyLoading';
import HrmsRequestForms from './components/FORMS/HRMSRequestForms';

// PDS
import PDS1 from './components/PDS1';
import PDS2 from './components/PDS2';
import PDS3 from './components/PDS3';
import PDS4 from './components/PDS4';
// import { PictureAsPdfOutlined } from '@mui/icons-material';
import ForgotPassword from './components/ForgotPassword';

const drawerWidth = 250;

function App() {
  const [settings, setSettings] = useState({});
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [open4, setOpen4] = useState(false);
  const [open5, setOpen5] = useState(false);
  // const [selectedItem, setSelectedItem] = useState(null);
  const location = useLocation();

  const handleClick = () => setOpen(!open);
  const handleClickAttendance = () => setOpen2(!open2);
  const handleClickPayroll = () => setOpen3(!open3);
  const handleClickForms = () => setOpen4(!open4);
  const handleClickPDSFiles = () => setOpen5(!open5);

  // const handleItemClick = (item) => {
  //   setSelectedItem(item);
  // };

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <ThemeProvider
      theme={createTheme({
        typography: {
          fontFamily: 'Poppins, sans-serif',
          body1: { fontSize: '13px' }, // adjust sidebar fontsize
        },
      })}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '10vh',
          overflow: 'hidden',
        }}
      >
        <AppBar
          position="fixed"
          sx={{ zIndex: 1201, bgcolor: '#6d2323', height: '60px' }} // adjust HEADER
        >
          <Toolbar>
            {settings.logo_url && (
              <img
                src={`http://localhost:5000${settings.logo_url}`}
                alt="Logo"
                style={{ height: '40px', marginRight: '10px' }}
              />
            )}
            <Typography variant="h6" noWrap>
              {settings.company_name || 'Organization Name'}
            </Typography>
          </Toolbar>
        </AppBar>

        {!['/', '/login', '/Register', '/forgot-password'].includes(
          location.pathname
        ) && (
          <Sidebar
            open={open}
            handleClick={handleClick}
            open2={open2}
            handleClickAttendance={handleClickAttendance}
            open3={open3}
            handleClickPayroll={handleClickPayroll}
            open4={open4}
            handleClickForms={handleClickForms}
            open5={open5}
            handleClickPDSFiles={handleClickPDSFiles}
          />
        )}

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'transparent', // etong kupal nato ang naglalagay ng white background
            p: 10,
            marginLeft: `${drawerWidth}px`,
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          <Toolbar />
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Login />} />
            {/* Endpoint for leave management */}
            <Route path="/leave" element={<LeaveForm />} />
            <Route path="/leave-balance" element={<LeaveBalance />} />
            <Route path="/leave-history" element={<LeaveHistory />} />
            <Route path="/leave-approval" element={<LeaveApproval />} />

            {/* Endpoint for Carousel*/}
            <Route path="/announcement" element={<AdminAnnouncements />} />
            {/* <Route
              path="/announcement-caraousel"
              element={<EmployeeCarousel />}
            /> */}
            <Route
              path="/announcement-form"
              element={<AdminAnnouncementForm />}
            />
            {/* Endpoint for New Carousel*/}
            <Route path="/post-platform" element={<PostPlatform />} />
            <Route path="/post-carousel" element={<PostCarousel />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute
                  allowedRoles={['administrator', 'superadmin', 'staff']}
                >
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="/allicons" element={<AllIcons />} />
            <Route
              path="/children"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <Children />
                </ProtectedRoute>
              }
            />
            <Route
              path="/voluntarywork"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <VoluntaryWork />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learningdev"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <LearningAndDevelopment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/eligibility"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <Eligibility />
                </ProtectedRoute>
              }
            />
            <Route
              path="/college"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <College />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vocational"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <Vocational />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workexperience"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <WorkExperience />
                </ProtectedRoute>
              }
            />
            <Route
              path="/personalinfo"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <PersonalTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/other-information"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <OtherSkills />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <SettingsForm onUpdate={fetchSettings} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view_attendance"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <ViewAttendanceRecord />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search_attendance"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <AttendanceSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/daily_time_record"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <DailyTimeRecord />
                </ProtectedRoute>
              }
            />
            <Route
              path="/daily_time_record_faculty"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <DailyTimeRecordFaculty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance_form"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <AttendanceForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance_module"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <AttendanceModule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance_module_faculty"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <AttendanceModuleFaculty />
                </ProtectedRoute>
              }
            />

            <Route
              path="/attendance_module_faculty_40hrs"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <AttendanceModuleFaculty40 />
                </ProtectedRoute>
              }
            />

            <Route
              path="/attendance_summary"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <OverallAttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/official_time"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <OfficialTimeForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pds1"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <PDS1 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pds2"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <PDS2 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pds3"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <PDS3 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pds4"
              element={
                <ProtectedRoute
                  allowedRoles={['staff', 'administrator', 'superadmin']}
                >
                  <PDS4 />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payroll-table"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <PayrollTable />
                </ProtectedRoute>
              }
            />

            <Route
              path="/remittance-table"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <Remittances />
                </ProtectedRoute>
              }
            />

            <Route
              path="/item-table"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <ItemTable />
                </ProtectedRoute>
              }
            />

            <Route
              path="/salary-grade"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <SalaryGradeTable />
                </ProtectedRoute>
              }
            />

            <Route
              path="/salary-grade-status"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <SalaryGradeStatusTable />
                </ProtectedRoute>
              }
            />

            <Route
              path="/department-table"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <DepartmentTable />
                </ProtectedRoute>
              }
            />

            <Route
              path="/department-assignment"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <DepartmentAssignment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/leave-table"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <Leave />
                </ProtectedRoute>
              }
            />

            <Route
              path="/leave-assignment"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <LeaveAssignment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/holiday-suspension"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <HolidaySuspension />
                </ProtectedRoute>
              }
            />

            <Route
              path="/assessment-clearance"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <AssessmentClearance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clearance"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <Clearance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clearance-back"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <ClearanceBack />
                </ProtectedRoute>
              }
            />

            <Route
              path="/faculty-clearance"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <FacultyClearance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty-clearance-70-days"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <FacultyClearance70Days />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hrms-request-forms"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <HrmsRequestForms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/individual-faculty-loading"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <IndividualFacultyLoading />
                </ProtectedRoute>
              }
            />
            <Route
              path="/in-service-training"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <InServiceTraining />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave-card"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <LeaveCard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave-card-back"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <LeaveCardBack />
                </ProtectedRoute>
              }
            />
            <Route
              path="/locator-slip"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <LocatorSlip />
                </ProtectedRoute>
              }
            />
            <Route
              path="/permission-to-teach"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <PermissionToTeach />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request-for-id"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <RequestForID />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saln-front"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <SalnFront />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saln-back"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <SalnBack />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scholarship-agreement"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <ScholarshipAgreement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subject"
              element={
                <ProtectedRoute allowedRoles={['administrator', 'superadmin']}>
                  <SubjectStillToBeTaken />
                </ProtectedRoute>
              }
            />

            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: '#6d2323',
            color: 'white',
            textAlign: 'center',
            padding: '20px',
            height: '10px',
          }}
        >
          <Typography variant="body2">
            {settings.footer_text || 'Default Footer Text'}
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
