import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  CardMedia,
  Grid,
  Typography,
  Button,
  Modal,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  CircularProgress
} from '@mui/material';

const steps = ['PLACED', 'SHIPPED', 'DELIVERED'];

export default function OrderDetails() {
  const location = useLocation();
  const order = location.state?.order;
  const [itemDetails, setItemDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [canceling, setCanceling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    if (order && order[0]?.item_id) {
      const fetchItemDetails = async () => {
        try {
          const response = await axios.get(`https://thriftstorebackend-8xii.onrender.com/api/item/${order[0].item_id}`);
          setItemDetails(response.data);
        } catch (error) {
          console.error('Error fetching item details:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchItemDetails();
    }
  }, [order]);

  if (!order) return <p>No order details available.</p>;

  const orderDate = new Date(order[0].order_date).toLocaleDateString();


  const getStepperIndex = (status) => {
    switch (status.toLowerCase()) {
      case 'placed':
        return 0;
      case 'shipped':
        return 1;
      case 'delivered':
        return 2;
      default:
        return 0;
    }
  };
  
  const isFinalStatus = ['cancelled', 'approve_cancel', 'delivered'].includes(order[0].order_status.toLowerCase());
  
  const activeStep = getStepperIndex(order[0].order_status);

  const handleCancel = () => setCancelModalOpen(true);

  const handleConfirmCancel = async () => {
    if (!selectedReason) return;

    setCanceling(true);

    try {
      const response = await axios.post('http://localhost:3000/api/orders/cancel', {
        return_reason: selectedReason,
        order_id: order[0].order_id
      });

      console.log('Cancellation response:', response.data);
      setCancelSuccess(true);
      setCancelModalOpen(false);
    } catch (err) {
      console.error('Cancellation failed:', err);
    } finally {
      setCanceling(false);
    }
  };

  return (
    <Box>
      <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '100%' }}>
        <Grid item xs={12} sm={10} md={12} lg={12}>
          <Card>
            {/* HEADER */}
            <CardHeader
              title={
                <Box mb={3} pb={2}>
                  <Typography variant="body2" color="text.secondary" style={{ fontSize: '35px' }}>
                    Order ID <strong style={{ color: '#000' }}>{order[0].order_id}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" style={{ fontSize: '20px' }}>
                    Placed On <strong style={{ color: '#000' }}>{orderDate}</strong>
                  </Typography>
                </Box>
              }
            />

            {/* BODY */}
            <CardContent sx={{ p: 2 }}>
              {order.map((item) => (
                <Box
                  key={item.item_id}
                  display="flex"
                  flexDirection={{ xs: 'column', md: 'row' }}
                  mb={3}
                  pb={2}
                  borderBottom="1px solid rgba(0,0,0,0.1)"
                >
                  <Box flex="1 1 auto" mr={{ md: 2 }} mb={{ xs: 2, md: 0 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {itemDetails ? itemDetails.name : 'Loading...'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Brand: {itemDetails ? itemDetails.brand : 'Loading...'}
                    </Typography>
                    <Typography variant="h5" mt={1} mb={1}>
                      ${parseFloat(item.item_price).toFixed(2)}{' '}
                      <Typography variant="body2" component="span" color="text.secondary">
                        via (COD)
                      </Typography>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tracking Status on: <strong style={{ color: '#000' }}>11:30pm, Today</strong>
                    </Typography>
                  </Box>

                  {/* IMAGE */}
                  <Box sx={{ flexShrink: 0, textAlign: 'center' }}>
                    <CardMedia
                      component="img"
                      image={itemDetails ? itemDetails.imageURL : '/placeholder.jpg'}
                      alt={itemDetails ? itemDetails.name : 'Loading...'}
                      sx={{ maxWidth: 250, margin: '0 auto' }}
                    />
                  </Box>
                </Box>
              ))}

              {/* MUI STEPPER */}
              <Stepper alternativeLabel activeStep={activeStep} sx={{ my: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>

            {/* FOOTER */}
            {!isFinalStatus && (
              <CardActions sx={{ p: 2, justifyContent: 'center' }}>
                <Button variant="text" size="small" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="text" size="small">
                  Pre-pay
                </Button>
                <Button variant="text" size="small" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                  <i className="fas fa-ellipsis-v" />
                </Button>
              </CardActions>
            )}

          </Card>
        </Grid>
      </Grid>

      {/* CANCEL MODAL */}
      <Modal open={cancelModalOpen} onClose={() => setCancelModalOpen(false)}>
        <Box
          sx={{
            width: 400,
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            mx: 'auto',
            mt: '15%',
          }}
        >
          <Typography variant="h6" mb={2}>
            Reason for Cancellation
          </Typography>
          <RadioGroup
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
          >
            <FormControlLabel value="Ordered by mistake" control={<Radio />} label="Ordered by mistake" />
            <FormControlLabel value="Found a better price" control={<Radio />} label="Found a better price" />
            <FormControlLabel value="Expected delivery too late" control={<Radio />} label="Expected delivery too late" />
            <FormControlLabel value="Other" control={<Radio />} label="Other" />
          </RadioGroup>

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={handleConfirmCancel}
              disabled={!selectedReason || canceling}
            >
              {canceling ? <CircularProgress size={20} color="inherit" /> : 'Confirm Cancellation'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
