import React, { useState, useEffect } from 'react';
import { FiEdit2, FiX, FiCheck, FiEye, FiEyeOff, FiLock, FiKey } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { updateClientPassword } from '../../services/siteService';

const EditModal = ({
  isOpen,
  title = 'Edit Item',
  entityType = 'client', // 'client', 'site', 'monthlyUpdate', 'finalProduct'
  data = null,
  onSave,
  onCancel,
  onUpdatePassword,
  loading = false,
}) => {
  const [formData, setFormData] = useState({});

  // Password management state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (data) {
      if (entityType === 'client') {
        setFormData({
          client_name: data.client_name || '',
          status: data.status || 'Active',
          company_logo: data.company_logo || '',
          office_location: data.office_location || '',
          office_latitude: data.office_latitude !== null && data.office_latitude !== undefined ? data.office_latitude : '',
          office_longitude: data.office_longitude !== null && data.office_longitude !== undefined ? data.office_longitude : '',
        });
      } else if (entityType === 'site') {
        setFormData({
          site_name: data.site_name || '',
          location: data.location || '',
          status: data.status || 'Active',
          start_date: data.start_date ? data.start_date.substring(0, 10) : '',
          completion_date: data.completion_date ? data.completion_date.substring(0, 10) : '',
        });
      } else if (entityType === 'monthlyUpdate') {
        setFormData({
          progress_percentage: data.progress_percentage ?? 0,
          notes: data.notes || '',
          update_date: data.update_date ? data.update_date.substring(0, 10) : '',
        });
      } else if (entityType === 'finalProduct') {
        setFormData({
          title: data.title || '',
          product_type: data.product_type || 'elevation',
        });
      }
    } else {
      setFormData({});
    }

    // Reset password state when modal opens/data changes
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordLoading(false);
  }, [data, entityType, isOpen]);

  if (!isOpen || !data) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const userEmail = data.users?.[0]?.email || data.email || data.user?.email || 'No email associated';

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    if (pwd.length < 6) return { label: 'Min 6 chars', color: 'text-red-600 bg-red-50' };
    if (pwd.length < 8) return { label: 'Fair', color: 'text-amber-600 bg-amber-50' };
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) {
      return { label: 'Strong', color: 'text-green-600 bg-green-50' };
    }
    return { label: 'Good', color: 'text-blue-600 bg-blue-50' };
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      if (onUpdatePassword) {
        await onUpdatePassword(data.client_id, newPassword);
      } else {
        await updateClientPassword(data.client_id, newPassword);
        toast.success('Client password updated successfully!');
      }
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update client password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg">
              <FiEdit2 />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500">Modify details and save changes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Client Form Fields */}
            {entityType === 'client' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    name="client_name"
                    value={formData.client_name || ''}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="e.g. BuildCorp Holdings"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status || 'Active'}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Company Logo URL
                  </label>
                  <input
                    type="text"
                    name="company_logo"
                    value={formData.company_logo || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Office Location
                  </label>
                  <input
                    type="text"
                    name="office_location"
                    value={formData.office_location || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="e.g. 123 Business Park, Mumbai"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Office Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="office_latitude"
                      value={formData.office_latitude || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      placeholder="e.g. 19.0760"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Office Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="office_longitude"
                      value={formData.office_longitude || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      placeholder="e.g. 72.8777"
                    />
                  </div>
                </div>

                {/* Password Section */}
                <div className="border-t border-gray-200 pt-4 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                      <FiLock />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                        Client User & Password
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Manage login credentials for this client account
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Email (Read-only)
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="w-full border border-gray-200 bg-gray-100 text-gray-600 rounded-lg px-3 py-2 text-sm cursor-not-allowed select-all font-mono text-xs"
                    />
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        New Password
                      </label>
                      {newPassword && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPasswordStrength(newPassword)?.color}`}>
                          {getPasswordStrength(newPassword)?.label}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 6 chars)"
                        className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        tabIndex="-1"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        tabIndex="-1"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-[11px] text-red-500 mt-1 font-medium">Passwords do not match</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handlePasswordUpdate}
                    disabled={passwordLoading || !newPassword || newPassword !== confirmPassword || newPassword.length < 6}
                    className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {passwordLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <FiKey size={14} />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Site Form Fields */}
            {entityType === 'site' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Site Name *
                  </label>
                  <input
                    type="text"
                    name="site_name"
                    value={formData.site_name || ''}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="e.g. Apex Tower Plaza"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Location Address
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="e.g. 100 Skyline Blvd, Sector 4"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status || 'Active'}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="Active">Active</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Target Completion
                    </label>
                    <input
                      type="date"
                      name="completion_date"
                      value={formData.completion_date || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Monthly Update Form Fields */}
            {entityType === 'monthlyUpdate' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Progress Percentage (0 - 100) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    name="progress_percentage"
                    value={formData.progress_percentage ?? 0}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Update Notes
                  </label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={formData.notes || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="Enter monthly milestone progress notes..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Update Date
                  </label>
                  <input
                    type="date"
                    name="update_date"
                    value={formData.update_date || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </>
            )}

            {/* Final Product Form Fields */}
            {entityType === 'finalProduct' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Blueprint Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="e.g. Front Elevation Layout"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Product Type *
                  </label>
                  <select
                    name="product_type"
                    value={formData.product_type || 'elevation'}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="elevation">Elevation View</option>
                    <option value="top-view">Aerial / Top View</option>
                    <option value="blueprint">Blueprint Schematic</option>
                    <option value="render">3D Render</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none flex items-center gap-2 transition-all shadow-sm shadow-blue-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <FiCheck />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
