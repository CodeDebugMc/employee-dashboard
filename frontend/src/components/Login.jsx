import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, TextField, Button, Container, Link, Box } from '@mui/material';
import logo from '../assets/logo.PNG';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      setErrorMessage('Please fill all asked credentials');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log('Login response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Login response data:', data);

        if (data.token) {
          localStorage.setItem('token', data.token);

          const decoded = JSON.parse(atob(data.token.split('.')[1]));
          console.log('Decoded JWT:', decoded);

          // Store required info in localStorage
          localStorage.setItem('email', decoded.email || data.email || '');
          localStorage.setItem('role', decoded.role || data.role || '');
          localStorage.setItem(
            'employeeNumber',
            decoded.employeeNumber || data.employeeNumber || ''
          );

          // Sanity log
          console.log('Saved to localStorage:', {
            email: localStorage.getItem('email'),
            role: localStorage.getItem('role'),
            employeeNumber: localStorage.getItem('employeeNumber'),
          });

          // Navigate based on role
          const role = decoded.role || data.role;
          if (role === 'superadmin' || role === 'administrator') {
            navigate('/home');
          } else if (role === 'staff') {
            navigate('/pdsfile');
          } else {
            setErrorMessage('Unauthorized role');
          }
        } else {
          setErrorMessage('No token received from the server.');
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Invalid Credentials');
    }
  };

  return (
    <Container
      sx={{
        width: '90%',
        height: '90%',
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: '-18%',
        marginBottom: '25px',
        paddingBottom: '40px',
      }}
    >
      <form className="Form" onSubmit={handleLogin}>
        <Box
          sx={{
            backgroundColor: '#A31D1D',
            borderRadius: 4,
            padding: 3,
            marginTop: '-81px',
            justifyContent: 'center',
            width: 'calc(80% + 25%)',
            marginLeft: '-33px',
            marginBottom: '30px',
          }}
        >
          <img
            src={logo}
            alt="E.A.R.I.S.T Logo"
            style={{
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'white',
              padding: '2px 3px',
            }}
          />
        </Box>
        <h2>Login to your Account</h2>

        {errMessage && (
          <Alert sx={{ textAlign: 'center' }} severity="error">
            {errMessage}
          </Alert>
        )}

        <TextField
          name="email"
          label="Email"
          sx={{ margin: '5% 0', width: '100%' }}
          autoComplete="email"
          onChange={handleChanges}
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          sx={{ marginBottom: '5%', width: '100%' }}
          autoComplete="current-password"
          onChange={handleChanges}
        />

        <p>
          <Link
            onClick={() => navigate('/forgot-password')}
            underline="hover"
            sx={{
              cursor: 'pointer',
              color: 'black',
              fontSize: '12px',
              textDecoration: 'none',
            }}
          >
            Forgot your Password?
          </Link>
        </p>

        <Button
          type="submit"
          variant="contained"
          sx={{ width: '100%', bgcolor: '#A31D1D', marginBottom: '-15%' }}
        >
          Login
        </Button>
      </form>
    </Container>
  );
};

export default Login;
