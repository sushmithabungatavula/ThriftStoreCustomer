// AccountInfo page styled to match Login Page UI
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { FaEdit } from 'react-icons/fa';

const AccountInfo = () => {
  const [userData, setProfileData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loginCredits, setLoginCredits] = useState({});

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get('https://recycle-backend-apao.onrender.com/api/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProfileData(response.data);
        setLoginCredits(response.data.loginCredentials[0]);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...userData, [name]: value });
  };

  const handleSave = async () => {
    try {
      await axios.post('https://recycle-backend-apao.onrender.com/api/users', userData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEditMode(false);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  return (
    <Container style={{ fontFamily: 'Arial, sans-serif', padding: '40px', maxWidth: '800px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <Row className="justify-content-center">
        <Col xs={12}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '30px', color: '#1e1e1e' }}>Account Information</h2>

          <Card style={{ marginBottom: '24px', border: '1px solid #ddd', borderRadius: '12px' }}>
            <Card.Body>
              <Card.Title style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px' }}>
                Personal Information
                <FaEdit style={{ cursor: 'pointer', color: '#000' }} onClick={() => setEditMode(true)} />
              </Card.Title>
              {editMode ? (
                <Form style={{ marginTop: '20px' }}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={loginCredits.username || ''}
                      onChange={handleInputChange}
                      placeholder="Enter your username"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={userData.name || ''}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Contact</Form.Label>
                    <Form.Control
                      type="text"
                      name="contact"
                      value={userData.contactNumber || ''}
                      onChange={handleInputChange}
                      placeholder="Enter your contact number"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Group>
                  <Button variant="dark" onClick={handleSave} style={{ width: '100%', borderRadius: '10px', fontWeight: 'bold' }}>
                    Save
                  </Button>
                </Form>
              ) : (
                <div style={{ marginTop: '20px', fontSize: '14px', color: '#444' }}>
                  <p><strong>Username:</strong> {loginCredits.username}</p>
                  <p><strong>Name:</strong> {userData.name}</p>
                  <p><strong>Contact:</strong> {userData.contactNumber}</p>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card style={{ border: '1px solid #ddd', borderRadius: '12px' }}>
            <Card.Body>
              <Card.Title style={{ fontSize: '16px' }}>Account Balance</Card.Title>
              <p><strong>Wallet Balance:</strong> {userData.wallet}</p>
              <p><strong>Green Points:</strong> {userData.greenpoints}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AccountInfo;
