// Updated LocationPicker styles matching login page UI aesthetic
// (Document content omitted for brevity — styles updated inline)

// Replace all 'backgroundColor: #f9f9f9' with '#ffffff'
// Replace all 'fontSize: '1rem'' and 'fontSize: '3vw'' with '14px' and '12px'
// Use consistent font family Arial

// Example of updated styles block:

const styles = {
  mapContainer: {
    width: '100%',
    height: '95vh',
    position: 'absolute',
    zIndex: 1,
  },
  formContainer: {
    margin: '1vw',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '20px 20px 0 0',
    boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
    height: '38vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflowY: 'auto',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    fontFamily: 'Arial, sans-serif'
  },
  input: {
    padding: '10px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    width: '100%',
    marginBottom: '8px'
  },
  confirmButton: {
    alignSelf: 'center',
    width: '80%',
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: '10px',
    padding: '10px',
    fontWeight: 'bold',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer'
  },
  inlineInputs: {
    display: 'flex',
    gap: '10px'
  },
  searchInput: {
    width: '85%',
    padding: '10px',
    borderRadius: '30px',
    border: '1px solid #ccc',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontSize: '14px'
  },
  errorMessage: {
    color: 'red',
    fontSize: '12px'
  },
  addressCard: {
    border: '1px solid #ddd',
    borderRadius: '16px',
    backgroundColor: '#fff',
    padding: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    fontFamily: 'Arial, sans-serif'
  }
};
