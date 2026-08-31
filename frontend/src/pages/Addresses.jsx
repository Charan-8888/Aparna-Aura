import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, X } from 'lucide-react';
import SectionTitle from '../components/SectionTitle/SectionTitle';
import Loader from '../components/Loader/Loader';
import ErrorState from '../components/ErrorState/ErrorState';
import EmptyState from '../components/EmptyState/EmptyState';
import Input from '../components/Input/Input';
import LocationPicker from '../components/LocationPicker/LocationPicker';
import addressService from '../services/addressService';

const AddressForm = ({ initialData, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    house_no: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    latitude: null,
    longitude: null,
    is_default: false,
    ...initialData,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleLocationSelect = ({ latitude, longitude, address }) => {
    const resolvedCity = address.city || address.town || address.village || address.municipality || address.county;
    const resolvedStreet = address.road || address.pedestrian || address.neighbourhood || address.suburb;
    setFormData((prev) => ({
      ...prev,
      latitude: Number(latitude).toFixed(6),
      longitude: Number(longitude).toFixed(6),
      house_no: address.house_number || prev.house_no,
      street: resolvedStreet || prev.street,
      city: resolvedCity || prev.city,
      state: address.state || prev.state,
      pincode: address.postcode || prev.pincode,
      country: address.country || prev.country,
    }));
  };

  return (
    <motion.form 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="premium-card p-6 md:p-8 mb-8"
      onSubmit={handleSubmit}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-[var(--color-brand)]">
          {initialData ? 'Edit Address' : 'Add New Address'}
        </h3>
        <button type="button" onClick={onCancel} className="p-2 text-[#8A8A8A] hover:text-[#2C2C2C] rounded-full hover:bg-[var(--color-secondary-bg)] transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Input required label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} />
        <Input required type="tel" autoComplete="tel" label="Recipient Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number for this delivery" />
        <Input required label="House No / Flat" name="house_no" value={formData.house_no} onChange={handleChange} />
        <Input required label="Street" name="street" value={formData.street} onChange={handleChange} />
        <Input label="Landmark (Optional)" name="landmark" value={formData.landmark} onChange={handleChange} />
        <Input required label="City" name="city" value={formData.city} onChange={handleChange} />
        <Input required label="State" name="state" value={formData.state} onChange={handleChange} />
        <Input required label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
        <LocationPicker latitude={formData.latitude} longitude={formData.longitude} onSelect={handleLocationSelect} />
      </div>

      <div className="mt-6 flex items-center">
        <input 
          type="checkbox" 
          id="is_default" 
          name="is_default" 
          checked={formData.is_default} 
          onChange={handleChange} 
          className="w-4 h-4 text-[var(--color-brand)] rounded border-[#E6E1D8] focus:ring-[var(--color-accent)] cursor-pointer"
        />
        <label htmlFor="is_default" className="ml-2 text-sm text-[var(--color-text-main)] cursor-pointer">
          Make this my default address
        </label>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary min-w-[140px]">
          {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Address'}
        </button>
      </div>
    </motion.form>
  );
};

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressService.getAddresses();
      setAddresses(Array.isArray(data) ? data : (data.results || []));
      setError(null);
    } catch (err) {
      setError('Failed to load addresses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingAddress) {
        await addressService.updateAddress(editingAddress.id, formData);
      } else {
        await addressService.createAddress(formData);
      }
      await fetchAddresses();
      setShowForm(false);
      setEditingAddress(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await addressService.deleteAddress(id);
      setAddresses((prev) => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && !showForm) return <Loader fullScreen />;

  return (
    <div className="container-default section-padding pb-24">
      <div className="aura-route-hero aura-route-hero--compact flex items-center justify-between mb-8">
        <SectionTitle title="My Addresses" />
        {!showForm && (
          <button 
            onClick={handleAddNew}
            className="btn-primary flex items-center gap-2 !py-2 !px-4 !rounded-full !text-sm"
          >
            <Plus size={16} /> Add New
          </button>
        )}
      </div>

      {error && !showForm && (
        <ErrorState message={error} onRetry={fetchAddresses} />
      )}

      <AnimatePresence>
        {showForm && (
          <AddressForm 
            initialData={editingAddress} 
            onSave={handleSave} 
            onCancel={() => setShowForm(false)} 
            loading={saving}
          />
        )}
      </AnimatePresence>

      {!showForm && !error && addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No addresses found"
          description="Add a shipping address to checkout quickly."
          action={
            <button 
              onClick={handleAddNew}
              className="btn-primary mt-4"
            >
              Add New Address
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <motion.div 
              key={address.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`premium-card p-6 relative ${address.is_default ? '!border-[var(--color-accent)] bg-[var(--color-accent)]/5' : ''}`}
            >
              {address.is_default && (
                <span className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-wider bg-white px-2.5 py-1 rounded-full shadow-sm border border-[var(--color-accent)]/20">
                  <CheckCircle2 size={12} /> Default
                </span>
              )}
              <h4 className="text-base font-bold text-[var(--color-brand)] mb-1">{address.full_name}</h4>
              <p className="text-sm text-[var(--color-muted)] mb-4">Recipient: {address.phone}</p>
              
              <div className="text-sm text-[var(--color-text-main)] space-y-1 leading-relaxed">
                <p>{address.house_no}, {address.street}</p>
                {address.landmark && <p>{address.landmark}</p>}
                <p>{address.city}, {address.state} - {address.pincode}</p>
                <p>{address.country}</p>
              </div>

              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[var(--color-border)]">
                <button 
                  onClick={() => handleEdit(address)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-brand)] transition-colors"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(address.id)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-muted)] hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;
