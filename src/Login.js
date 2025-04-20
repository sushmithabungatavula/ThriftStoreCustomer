import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LocationPicker from './pages/LocationPicker';
import { LoginContext } from './context/LoginContext';

const COLORS = {
  background: '#ffffff',
  formText: '#1e1e1e',
  inputBorder: '#cccccc',
  divider: '#888888',
  buttonBg: '#000000',
  buttonText: '#ffffff',
  linkText: '#000000',
};

const Login = () => {
  const { isLoggedIn, setIsLoggedIn, setCartId } = useContext(LoginContext);
  const [showSignUp, setShowSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupFname, setSignupFname] = useState('');
  const [signupLname, setSignupLname] = useState('');
  const [signupemail, setSignupemail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const re = /^(?=.*[!@#$%^&*])(?=.*\d).{8,}$/;
    return re.test(pwd);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/login', { email, password });
      const { token ,customer_id, cartId, wishlistId, addressID1,addressID2,addressID3,addressID4 } = response.data;
      localStorage.setItem('customerId', customer_id);
      localStorage.setItem('wishlistId', wishlistId);
      localStorage.setItem('cartId', cartId);
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      localStorage.setItem('addressID1', addressID1);
      localStorage.setItem('addressID2', addressID2);
      localStorage.setItem('addressID3', addressID3);
      localStorage.setItem('addressID4', addressID4);
      setCartId(cartId);
      setIsLoggedIn(true);
      navigate('/EcommerceHome');
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Wrong password. Please try again.');
      } else {
        alert('No account found. Please check your email or create a new account.');
      }
    }
  };


  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupemail.includes('@')) return alert('Please enter a valid email address.');
    if (signupPassword !== signupConfirmPassword) return alert("Passwords don't match.");
    if (!validatePassword(signupPassword)) return alert('Password must be 8+ characters, include a symbol and a number.');

    const user = {
      name: signupFname + ' ' + signupLname,
      email: signupemail,
      password: signupPassword,
      registration_date: new Date().toISOString(),
    };

    try {
      const response = await axios.post('http://localhost:3000/api/signup', user);
      if (response.status === 201) {
        navigate('/EcommerceHome');
        alert('Signup successful!');
        setShowSignUp(false);
      }
    } catch (error) {
      alert('Signup failed');
    }
  };

  if (isLoggedIn) return <LocationPicker />;

  return (
    <PageContainer>
      <FormContainer>
        <LeftPanel>
          <LottieIframe
            src="https://lottie.host/embed/ec2b4502-e34f-4e3e-8f06-a5a2b2986273/UbNN7xc4jk.lottie"
            allowFullScreen
            frameBorder="0"
          />
        </LeftPanel>
        <RightPanel>
          <BrandTitle>THRIFT STORE</BrandTitle>
          {!showSignUp ? (
            <form onSubmit={handleLogin}>
              <SectionTitle>Sign In</SectionTitle>
              <InputField type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required />
              <InputField type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
              <Button type="submit">Login</Button>
              <Divider>or</Divider>
              <SubText>New User? <strong onClick={() => setShowSignUp(true)}>Create an Account</strong></SubText>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <SectionTitle>Sign Up</SectionTitle>
              <InputField type="text" value={signupFname} onChange={(e) => setSignupFname(e.target.value)} placeholder="First Name" required />
              <InputField type="text" value={signupLname} onChange={(e) => setSignupLname(e.target.value)} placeholder="Last Name" required />
              <InputField type="email" value={signupemail} onChange={(e) => setSignupemail(e.target.value)} placeholder="Email Address" required />
              <InputField type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Password" required />
              <InputField type="password" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} placeholder="Confirm Password" required />
              <Button type="submit">Register</Button>
              <SubText>Already have an account? <strong onClick={() => setShowSignUp(false)}>Login</strong></SubText>
            </form>
          )}
        </RightPanel>
      </FormContainer>
    </PageContainer>
  );
};

export default Login;

const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${COLORS.background};
  font-family: Arial, sans-serif;
  justify-content: center;
  align-items: center;
`;

const FormContainer = styled.div`
  display: flex;
  width: 90%;
  max-width: 1100px;
  background-color: ${COLORS.background};
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
`;

const LeftPanel = styled.div`
  flex: 1;
  background-color: ${COLORS.background};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const LottieIframe = styled.iframe`
  width: 100%;
  max-width: 400px;
  height: 400px;
  border: none;
`;

const RightPanel = styled.div`
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const BrandTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 900;
  color: ${COLORS.formText};
  text-align: center;
  margin-bottom: 10px;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 1.8rem;
  font-weight: 800;
  color: ${COLORS.formText};
  margin-bottom: 20px;
`;

const InputField = styled.input`
  width: 100%;
  padding: 14px;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid ${COLORS.inputBorder};
  font-size: 1rem;
  font-family: Arial, sans-serif;
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background-color: ${COLORS.buttonBg};
  color: ${COLORS.buttonText};
  font-weight: bold;
  font-size: 1rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 10px;
  font-family: Arial, sans-serif;
`;

const Divider = styled.div`
  text-align: center;
  margin: 10px 0;
  color: ${COLORS.divider};
`;

const SubText = styled.p`
  text-align: center;
  font-size: 0.95rem;
  color: #333;
  font-family: Arial, sans-serif;
  strong {
    cursor: pointer;
    color: ${COLORS.linkText};
  }
`;
