/*********************************************************************
 * LocationPicker.js – 4 fixed slots bound to addressID1‑4
 * - null‑safe Ant‑List
 * - single Mapbox map
 * - state / country inputs
 * - center‑marker: lat/lng taken from map.getCenter() on save / update
 *********************************************************************/

import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import {
  Input,
  Button,
  List,
  message,
  Radio,
  Card,
  Modal,
} from 'antd';
import {
  AimOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useGeolocated } from 'react-geolocated';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';

/* ---------------- Mapbox token ---------------- */
mapboxgl.accessToken =
  'pk.eyJ1IjoiZ3NhaXRlamEwMDEiLCJhIjoiY2x5a3MyeXViMDl3NjJqcjc2OHQ3NTVoNiJ9.b5q6xpWN2yqeaKTaySgcBQ';

/* ---------------- slot helpers ---------------- */
const SLOT_KEYS = ['addressID1', 'addressID2', 'addressID3', 'addressID4'];
const firstEmpty = (arr) => arr.findIndex((x) => x === null);

const LocationPicker = () => {
  /* ---------- refs & map ---------- */
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  /* ---------- geo ---------- */
  const [deviceLocation, setDeviceLocation] = useState(null);
  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: { enableHighAccuracy: true, timeout: 30000 },
      watchPosition: true,
    });

  /* ---------- slots ---------- */
  const [slots, setSlots] = useState(Array(SLOT_KEYS.length).fill(null)); // [{…}|null,…]
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  /* ---------- UI flags ---------- */
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  /* ---------- form fields ---------- */
  const [name, setName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [district, setDistrict] = useState('');
  const [addressType, setAddressType] = useState('home');

  /* ---------- misc ---------- */
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  /* ------------------- load slots on mount ------------------- */
  useEffect(() => {
    (async () => {
      const filled = await Promise.all(
        SLOT_KEYS.map(async (key) => {
          const id = localStorage.getItem(key);
          if (!id) return null;
          try {
            const { data } = await axios.get(
              `http://localhost:3000/api/address/${id}`
            );
            return data;
          } catch {
            return null; // 404 => keep slot empty
          }
        })
      );
      setSlots(filled);
    })();
  }, []);

  /* ------------------- init map once ------------------- */
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [78.476, 17.366],
      zoom: 18,
    });
    mapInstance.current = map;
    return () => map.remove();
  }, []);

  /* ------------------- center on GPS ------------------- */
  useEffect(() => {
    if (coords) {
      const here = { lat: coords.latitude, lng: coords.longitude };
      setDeviceLocation(here);
      mapInstance.current?.flyTo({ center: [here.lng, here.lat], zoom: 18 });
    }
  }, [coords]);

  /* ------------------- REST helpers ------------------- */
  const createAddress = (id, body) =>
    axios.post(`http://localhost:3000/api/address/${id}`, body).then((r) => r.data);
  const updateAddress = (id, body) =>
    axios.put(`http://localhost:3000/api/address/${id}`, body).then((r) => r.data);
  const deleteAddress = (id) =>
    axios.delete(`http://localhost:3000/api/address/${id}`);

  /* ------------------- form helpers ------------------- */
  const resetForm = () => {
    setName('');
    setAddressLine1('');
    setAddressLine2('');
    setPostalCode('');
    setCity('');
    setState('');
    setCountry('');
    setDistrict('');
    setAddressType('home');
    setSelectedAddressId(null);
  };

  /* ------------------- SAVE (create) ------------------- */
  const handleConfirmLocation = async () => {
    const slotIndex = firstEmpty(slots);
    if (slotIndex === -1)
      return message.error('All 4 slots are full — delete one first.');

    const slotKey = SLOT_KEYS[slotIndex];
    const addressId = localStorage.getItem(slotKey);
    if (!addressId)
      return message.error(`No addressId found in localStorage for ${slotKey}`);

    const center = mapInstance.current.getCenter();
    const body = {
      name,
      addressLine1,
      addressLine2,
      pincode: postalCode,
      region: city,
      state,
      country,
      district,
      addressType,
      latitude: center.lat,
      longitude: center.lng,
    };

    try {
      const newAddr = await createAddress(addressId, body);
      setSlots((prev) => {
        const cp = [...prev];
        cp[slotIndex] = newAddr;
        return cp;
      });
      message.success('Address saved!');
      setIsFormVisible(false);
      resetForm();
    } catch (e) {
      message.error(e.response?.data?.message || 'Failed to save address');
    }
  };

  /* ------------------- UPDATE ------------------- */
  const handleUpdateAddress = async () => {
    const center = mapInstance.current.getCenter();
    const body = {
      name,
      addressLine1,
      addressLine2,
      pincode: postalCode,
      region: city,
      state,
      country,
      district,
      addressType,
      latitude: center.lat,
      longitude: center.lng,
    };
    try {
      const upd = await updateAddress(selectedAddressId, body);
      setSlots((prev) =>
        prev.map((s) => (s?.addressId === selectedAddressId ? upd : s))
      );
      message.success('Updated.');
      setIsFormVisible(false);
      resetForm();
    } catch (e) {
      message.error(e.response?.data?.message || 'Update failed');
    }
  };

  /* ------------------- DELETE ------------------- */
  const confirmDelete = async () => {
    try {
      await deleteAddress(selectedAddressId);
    } catch (e) {
      /* ignore 404 */ 
    }
    const idx = slots.findIndex((s) => s?.addressId === selectedAddressId);
    if (idx !== -1) {
      setSlots((prev) => {
        const cp = [...prev];
        cp[idx] = null;
        return cp;
      });
    }
    setDeleteModalVisible(false);
    setSelectedAddressId(null);
    message.success('Deleted');
  };

  /* ------------------- Search helpers ------------------- */
  const handleSearch = async (val) => {
    setAddress(val);
    if (val.length < 3) return setSuggestions([]);
    try {
      const { data } = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${val}.json`,
        { params: { access_token: mapboxgl.accessToken, limit: 5 } }
      );
      setSuggestions(data.features);
    } catch {
      setSuggestions([]);
    }
  };


  const handleAddressSelect = (addr) => {
    setSelectedAddressId(addr.addressId);
    setIsFormVisible(false);
  
    /* fly the map to this address (guard against NULLs) */
    if (addr.latitude && addr.longitude && mapInstance.current) {
      mapInstance.current.flyTo({
        center: [addr.longitude, addr.latitude],
        zoom: 18,
      });
    }
  };

  const handleSuggestionClick = (feat) => {
    const [lng, lat] = feat.geometry.coordinates;
    mapInstance.current.setCenter([lng, lat]);
    setSuggestions([]);
  };

  /* ------------------- list data ------------------- */
  const listData = slots.map(
    (slot, i) => slot || { __empty: true, addressId: `empty-${i}` }
  );

  /* ------------------- JSX ------------------- */
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* --- search bar --- */}
      <div style={styles.searchContainer}>
        <Input
          placeholder="Search area / street"
          prefix={<SearchOutlined />}
          value={address}
          onChange={(e) => handleSearch(e.target.value)}
          style={styles.searchInput}
        />
        {suggestions.length > 0 && (
          <div style={styles.suggestionsContainer}>
            <List
              bordered
              dataSource={suggestions}
              renderItem={(it) => (
                <List.Item onClick={() => handleSuggestionClick(it)}>
                  {it.place_name}
                </List.Item>
              )}
            />
          </div>
        )}
      </div>

      {/* --- map --- */}
      <div ref={mapRef} style={styles.mapContainer} />

      {/* fixed center marker when form visible */}
      {isFormVisible && (
        <div style={styles.centerMarker}>
          <img
            src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png"
            alt="center"
            style={{ width: 25, height: 41 }}
          />
        </div>
      )}

      {/* --- current location --- */}
      <Button
        icon={<AimOutlined />}
        type="primary"
        disabled={!isGeolocationAvailable || !isGeolocationEnabled}
        onClick={() => {
          if (deviceLocation)
            mapInstance.current?.flyTo({
              center: [deviceLocation.lng, deviceLocation.lat],
              zoom: 18,
            });
        }}
        style={styles.currentLocBtn}
      />

      {/* --- sliding panel --- */}
      <div style={styles.formContainer}>
        {/* --- slot cards --- */}
        {!isFormVisible && (
          <>
            <List
              grid={{ gutter: 16, column: 2 }}
              dataSource={listData}
              rowKey={(item) => item.addressId}
              renderItem={(item, idx) => (
                <List.Item>
                  {item.__empty ? (
                    <Card
                      hoverable
                      onClick={() => {
                        if (firstEmpty(slots) === -1)
                          return message.error('All slots full.');
                        setIsFormVisible(true);
                        resetForm();
                      }}
                      style={{ ...styles.addressCard, ...styles.emptyCard }}
                    >
                      <EnvironmentOutlined /> &nbsp; Add address
                    </Card>
                  ) : (
                    <Card
                      hoverable
                      style={
                        selectedAddressId === item.addressId
                          ? { ...styles.addressCard, ...styles.selectedCard }
                          : styles.addressCard
                      }
                      onClick={() => handleAddressSelect(item)}
                    >
                      <Radio
                        checked={selectedAddressId === item.addressId}
                        style={styles.radio}
                      />
                      <div style={styles.addressInfo}>
                        <p style={styles.addressName}>{item.name}</p>
                        <p style={{ margin: 0 }}>
                          {item.addressLine1}, {item.addressLine2}
                        </p>
                        <p style={{ margin: 0 }}>
                          {item.region}, {item.state} – {item.pincode}
                        </p>
                      </div>
                      {selectedAddressId === item.addressId && (
                        <>
                          <Button
                            type="primary"
                            onClick={() => {
                              /* pre‑fill form */
                              setName(item.name);
                              setAddressLine1(item.addressLine1);
                              setAddressLine2(item.addressLine2);
                              setPostalCode(item.pincode);
                              setCity(item.region);
                              setState(item.state);
                              setCountry(item.country);
                              setDistrict(item.district);
                              setAddressType(item.addressType);
                              setIsFormVisible(true);
                            }}
                            style={styles.editButton}
                          >
                            Edit
                          </Button>
                          <DeleteOutlined
                            onClick={() => setDeleteModalVisible(true)}
                            style={styles.deleteIcon}
                          />
                        </>
                      )}
                    </Card>
                  )}
                </List.Item>
              )}
            />
            <div style={styles.buttonRow}>
              <Button
                type="primary"
                onClick={() => {
                  if (firstEmpty(slots) === -1)
                    return message.error('All slots full.');
                  resetForm();
                  setIsFormVisible(true);
                }}
                style={styles.confirmButton}
              >
                Add New Address
              </Button>
              <Button onClick={() => navigate('/profile')}>Close</Button>
            </div>
          </>
        )}

        {/* --- form --- */}
        {isFormVisible && (
          <>
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />
            <Input
              placeholder="Address line 1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              style={styles.input}
            />
            <Input
              placeholder="Address line 2"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              style={styles.input}
            />
            <Input
              placeholder="Pincode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              style={styles.input}
            />
            <Input
              placeholder="City / Region"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={styles.input}
            />
            <Input
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              style={styles.input}
            />
            <Input
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={styles.input}
            />

            <Radio.Group
              value={addressType}
              onChange={(e) => setAddressType(e.target.value)}
              style={styles.radioGroup}
            >
              <Radio.Button value="home">Home</Radio.Button>
              <Radio.Button value="office">Office</Radio.Button>
              <Radio.Button value="others">Others</Radio.Button>
            </Radio.Group>

            <Button
              type="primary"
              onClick={selectedAddressId ? handleUpdateAddress : handleConfirmLocation}
              style={styles.confirmButton}
            >
              {selectedAddressId ? 'Update Address' : 'Save Address'}
            </Button>
            <Button onClick={() => setIsFormVisible(false)}>Cancel</Button>
          </>
        )}
      </div>

      {/* --- delete confirm modal --- */}
      <Modal
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Yes"
        cancelText="No"
        title="Delete this address?"
      >
        Are you sure you want to delete the selected address?
      </Modal>
    </div>
  );
};

/* ------------------- styles ------------------- */
const styles = {
  mapContainer: {
    width: '100%',
    height: '95vh',
    position: 'absolute',
    zIndex: 1,
  },
  centerMarker: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    transform: 'translate(-50%, -100%)',
    pointerEvents: 'none',
    zIndex: 1000,
  },
  searchContainer: {
    position: 'absolute',
    top: 30,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  searchInput: { borderRadius: 50 },
  suggestionsContainer: {
    position: 'absolute',
    top: 42,
    width: '100%',
    background: '#fff',
    border: '1px solid #ccc',
    maxHeight: 200,
    overflowY: 'auto',
    zIndex: 1000,
  },
  formContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    height: '40vh',
    background: '#fff',
    padding: 16,
    boxShadow: '0 -4px 12px rgba(0,0,0,.1)',
    overflowY: 'auto',
    zIndex: 10,
  },
  addressCard: {
    flex: '0 0 calc(50% - 16px)',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
  },
  emptyCard: { justifyContent: 'center', color: '#999' },
  selectedCard: { border: '2px solid #4caf50' },
  radio: { marginRight: 8 },
  addressInfo: { lineHeight: 1.2 },
  addressName: { fontWeight: 600 },
  buttonRow: { display: 'flex', gap: 8 },
  confirmButton: { flex: 1 },
  currentLocBtn: {
    position: 'absolute',
    top: '60vh',
    right: 20,
    borderRadius: '50%',
    padding: 12,
    zIndex: 1000,
  },
  deleteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 16,
    color: 'red',
  },
  input: { marginBottom: 8 },
  radioGroup: { marginBottom: 8 },
};

export default LocationPicker;
