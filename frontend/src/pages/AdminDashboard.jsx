import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createClient, createSite, uploadMonthlyData, uploadFinalProduct } from '../services/siteService';
import api from '../services/api';
import { FiUpload, FiArrowLeft, FiPlus, FiTrendingUp } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('client'); // client, site, monthly, product
  const [loading, setLoading] = useState(false);

  // States for selectors
  const [clients, setClients] = useState([]);
  const [sites, setSites] = useState([]);

  // Fetch client & site selectors
  const loadSelectors = useCallback(async () => {
    try {
      const [clientRes, siteRes] = await Promise.all([
        api.get('/admin/clients-list'),
        api.get('/admin/sites-list'),
      ]);
      setClients(clientRes.data.clients || []);
      setSites(siteRes.data.sites || []);
    } catch (e) {
      console.warn('Could not load admin selectors:', e.response?.data?.error || e.message);
    }
  }, []); // no deps — stable function reference

  useEffect(() => {
    loadSelectors();
  }, [loadSelectors]);

  // Form 1: Client
  const [clientName, setClientName] = useState('');
  const [clientLogo, setClientLogo] = useState(null);
  const [clientLogoUrl, setClientLogoUrl] = useState('');

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    if (!clientName) return toast.error('Client name is required.');

    setLoading(true);
    const formData = new FormData();
    formData.append('client_name', clientName);
    if (clientLogo) formData.append('company_logo', clientLogo);
    if (clientLogoUrl) formData.append('company_logo_url', clientLogoUrl);

    try {
      await createClient(formData);
      toast.success('Client registered successfully!');
      setClientName('');
      setClientLogo(null);
      setClientLogoUrl('');
      loadSelectors();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create client.');
    } finally {
      setLoading(false);
    }
  };

  // Form 2: Site
  const [siteClientId, setSiteClientId] = useState('');
  const [siteName, setSiteName] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [siteStatus, setSiteStatus] = useState('Active');
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');

  const handleSiteSubmit = async (e) => {
    e.preventDefault();
    if (!siteClientId || !siteName) return toast.error('Client ID and Site Name are required.');

    setLoading(true);
    try {
      await createSite({
        client_id: siteClientId,
        site_name: siteName,
        location: siteLocation,
        status: siteStatus,
        start_date: startDate,
        completion_date: completionDate,
      });
      toast.success('Project Site created successfully!');
      setSiteName('');
      setSiteLocation('');
      setStartDate('');
      setCompletionDate('');
      loadSelectors();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create site.');
    } finally {
      setLoading(false);
    }
  };

  // Form 3: Monthly Update & Media
  const [mSiteId, setMSiteId] = useState('');
  const [mMonth, setMMonth] = useState(new Date().getMonth() + 1);
  const [mYear, setMYear] = useState(new Date().getFullYear());
  const [mProgress, setMProgress] = useState(0);
  const [mNotes, setMNotes] = useState('');

  const [mPanoTitle, setMPanoTitle] = useState('');
  const [mPanoFile, setMPanoFile] = useState(null);
  const [mPanoUrl, setMPanoUrl] = useState('');

  const [mVidTitle, setMVidTitle] = useState('');
  const [mVidType, setMVidType] = useState('walkthrough');
  const [mVidFile, setMVidFile] = useState(null);
  const [mVidUrl, setMVidUrl] = useState('');

  const [mImgFolder, setMImgFolder] = useState('General');
  const [mImgFiles, setMImgFiles] = useState(null);
  const [mImgUrls, setMImgUrls] = useState('');

  const handleMonthlySubmit = async (e) => {
    e.preventDefault();
    if (!mSiteId || !mMonth || !mYear) return toast.error('Site, Month, and Year are required.');

    setLoading(true);
    const formData = new FormData();
    formData.append('site_id', mSiteId);
    formData.append('month', mMonth);
    formData.append('year', mYear);
    formData.append('progress_percentage', mProgress);
    formData.append('notes', mNotes);

    // Panorama
    formData.append('panorama_title', mPanoTitle);
    formData.append('type', '360');
    if (mPanoFile) formData.append('panorama_file', mPanoFile);
    if (mPanoUrl) formData.append('tour_url', mPanoUrl);

    // Video
    formData.append('video_title', mVidTitle);
    formData.append('video_type', mVidType);
    if (mVidFile) formData.append('video_file', mVidFile);
    if (mVidUrl) formData.append('video_url', mVidUrl);

    // Images
    formData.append('folder_name', mImgFolder);
    if (mImgFiles) {
      for (let i = 0; i < mImgFiles.length; i++) {
        formData.append('image_files', mImgFiles[i]);
      }
    }
    if (mImgUrls) formData.append('image_urls', mImgUrls);

    try {
      await uploadMonthlyData(formData);
      toast.success('Monthly tracking data uploaded successfully!');
      // Clear inputs
      setMNotes('');
      setMPanoTitle('');
      setMPanoFile(null);
      setMPanoUrl('');
      setMVidTitle('');
      setMVidFile(null);
      setMVidUrl('');
      setMImgFiles(null);
      setMImgUrls('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload monthly data.');
    } finally {
      setLoading(false);
    }
  };

  // Form 4: Final Blueprint Product
  const [pSiteId, setPSiteId] = useState('');
  const [pType, setPType] = useState('elevation');
  const [pTitle, setPTitle] = useState('');
  const [pProductFile, setPProductFile] = useState(null);
  const [pProductUrl, setPProductUrl] = useState('');
  const [pPreviewFile, setPPreviewFile] = useState(null);
  const [pPreviewUrl, setPPreviewUrl] = useState('');

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!pSiteId || !pType || !pTitle) return toast.error('Site, Type, and Title are required.');

    setLoading(true);
    const formData = new FormData();
    formData.append('site_id', pSiteId);
    formData.append('product_type', pType);
    formData.append('title', pTitle);
    formData.append('type', pType); // For Cloudinary folder mapping config in upload.js

    if (pProductFile) formData.append('product_file', pProductFile);
    if (pProductUrl) formData.append('product_url', pProductUrl);
    if (pPreviewFile) formData.append('preview_file', pPreviewFile);
    if (pPreviewUrl) formData.append('preview_url', pPreviewUrl);

    try {
      await uploadFinalProduct(formData);
      toast.success('Final Blueprint schematic saved successfully!');
      setPTitle('');
      setPProductFile(null);
      setPProductUrl('');
      setPPreviewFile(null);
      setPPreviewUrl('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload final product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-xl px-md">
      <Toaster position="top-right" />

      {/* Top Title Bar */}
      <div className="mb-lg flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-textPrimary flex items-center gap-xs">
            Admin Upload System
          </h1>
          <p className="text-sm text-textSecondary mt-xs">
            Create clients/sites and upload monthly media walkthroughs without modifying source code.
          </p>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="btn-secondary py-xs text-sm flex items-center gap-xs"
        >
          <FiArrowLeft />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-borderLight mb-lg overflow-x-auto">
        {[
          { id: 'client', label: '1. Register Client' },
          { id: 'site', label: '2. Register Project Site' },
          { id: 'monthly', label: '3. Upload Monthly Data' },
          { id: 'product', label: '4. Upload Blueprints' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-md py-sm font-semibold text-sm whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id
              ? 'border-primaryDark text-textPrimary'
              : 'border-transparent text-textMuted hover:text-textSecondary'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form content */}
      <div className="bg-white rounded-card border border-borderLight shadow-card p-lg">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center z-10 rounded-card">
            <div className="w-10 h-10 border-4 border-borderLight border-t-primaryDark rounded-full animate-spin"></div>
            <p className="mt-sm text-xs font-semibold text-textSecondary">Uploading file payloads to storage...</p>
          </div>
        )}

        {/* Tab 1: Client registration */}
        {activeTab === 'client' && (
          <form onSubmit={handleClientSubmit} className="space-y-md">
            <h3 className="text-base font-bold text-textPrimary mb-sm">Register New Corporate Client</h3>
            <div>
              <label className="form-label">Client / Company Name</label>
              <input
                type="text"
                placeholder="e.g. BuildCorp Holdings"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="form-label">Company Logo File</label>
                <input
                  type="file"
                  onChange={(e) => setClientLogo(e.target.files[0])}
                  className="form-input"
                  accept="image/*"
                />
              </div>
              <div>
                <label className="form-label">Logo URL Fallback (For demo convenience)</label>
                <input
                  type="text"
                  placeholder="https://example.com/logo.jpg"
                  value={clientLogoUrl}
                  onChange={(e) => setClientLogoUrl(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-sm mt-md flex items-center justify-center gap-xs">
              <FiPlus />
              Create Client organization
            </button>
          </form>
        )}

        {/* Tab 2: Site registration */}
        {activeTab === 'site' && (
          <form onSubmit={handleSiteSubmit} className="space-y-md">
            <h3 className="text-base font-bold text-textPrimary mb-sm">Register New Construction Site</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="form-label">Associate Client</label>
                <select
                  value={siteClientId}
                  onChange={(e) => setSiteClientId(e.target.value)}
                  className="form-input"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((c) => (
                    <option key={c.client_id} value={c.client_id}>
                      {c.client_name}
                    </option>
                  ))}
                  {clients.length === 0 && (
                    <option value="temp-default">Fallback Client (BuildCorp)</option>
                  )}
                </select>
              </div>
              <div>
                <label className="form-label">Site / Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Tower Plaza"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
            <div>
              <label className="form-label">Location Address</label>
              <input
                type="text"
                placeholder="e.g. 100 Skyline Blvd, Sector 4"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div>
                <label className="form-label">Project Status</label>
                <select
                  value={siteStatus}
                  onChange={(e) => setSiteStatus(e.target.value)}
                  className="form-input"
                >
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Completion Date Target</label>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-sm mt-md flex items-center justify-center gap-xs">
              <FiPlus />
              Initialize Project Site
            </button>
          </form>
        )}

        {/* Tab 3: Monthly data & file uploads */}
        {activeTab === 'monthly' && (
          <form onSubmit={handleMonthlySubmit} className="space-y-md">
            <div className="border-b border-borderLight pb-sm mb-md flex items-center gap-xs">
              <FiTrendingUp className="text-primaryDark" />
              <h3 className="text-base font-bold text-textPrimary">Upload Monthly Tracking Data</h3>
            </div>

            {/* Core Update details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
              <div className="md:col-span-2">
                <label className="form-label">Select Site</label>
                <select
                  value={mSiteId}
                  onChange={(e) => setMSiteId(e.target.value)}
                  className="form-input"
                >
                  <option value="">-- Choose Site --</option>
                  {sites.map((s) => (
                    <option key={s.site_id} value={s.site_id}>
                      {s.site_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Month (1-12)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={mMonth}
                  onChange={(e) => setMMonth(parseInt(e.target.value))}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Year</label>
                <input
                  type="number"
                  value={mYear}
                  onChange={(e) => setMYear(parseInt(e.target.value))}
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="form-label">Progress Percentage (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={mProgress}
                  onChange={(e) => setMProgress(parseInt(e.target.value))}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Tracking Updates Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Steel framing completed on Level 5."
                  value={mNotes}
                  onChange={(e) => setMNotes(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Media 1: Panorama */}
            <div className="border-t border-borderLight pt-md mt-lg">
              <h4 className="font-bold text-sm text-textSecondary mb-sm">Media A: 360° Panorama Tour</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                <div className="md:col-span-1">
                  <label className="form-label">Panorama Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Level 3 Core 360"
                    value={mPanoTitle}
                    onChange={(e) => setMPanoTitle(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Upload Equirectangular file</label>
                  <input
                    type="file"
                    onChange={(e) => setMPanoFile(e.target.files[0])}
                    className="form-input"
                    accept="image/*"
                  />
                </div>
                <div>
                  <label className="form-label">Tour Image URL Fallback</label>
                  <input
                    type="text"
                    placeholder="https://pannellum.org/images/alma.jpg"
                    value={mPanoUrl}
                    onChange={(e) => setMPanoUrl(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Media 2: Video */}
            <div className="border-t border-borderLight pt-md mt-lg">
              <h4 className="font-bold text-sm text-textSecondary mb-sm">Media B: Progress Drone/Walkthrough Video</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
                <div className="md:col-span-1">
                  <label className="form-label">Video Title</label>
                  <input
                    type="text"
                    placeholder="e.g. June drone walkthrough"
                    value={mVidTitle}
                    onChange={(e) => setMVidTitle(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Video Type</label>
                  <select
                    value={mVidType}
                    onChange={(e) => setMVidType(e.target.value)}
                    className="form-input"
                  >
                    <option value="walkthrough">Walkthrough</option>
                    <option value="flythrough">Flythrough (Drone)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Video File</label>
                  <input
                    type="file"
                    onChange={(e) => setMVidFile(e.target.files[0])}
                    className="form-input"
                    accept="video/*"
                  />
                </div>
                <div>
                  <label className="form-label">Video URL Fallback</label>
                  <input
                    type="text"
                    placeholder="https://commondatastorage.googleapis.com/.../ForBiggerBlazes.mp4"
                    value={mVidUrl}
                    onChange={(e) => setMVidUrl(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Media 3: Progress photos */}
            <div className="border-t border-borderLight pt-md mt-lg">
              <h4 className="font-bold text-sm text-textSecondary mb-sm">Media C: Progress photo folder</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                <div>
                  <label className="form-label">Folder Name / Class</label>
                  <input
                    type="text"
                    placeholder="e.g. Steel framing, Excavation"
                    value={mImgFolder}
                    onChange={(e) => setMImgFolder(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Upload multiple photos</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setMImgFiles(e.target.files)}
                    className="form-input"
                    accept="image/*"
                  />
                </div>
                <div>
                  <label className="form-label">Image URLs Fallback (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="https://example.com/a.jpg, https://example.com/b.jpg"
                    value={mImgUrls}
                    onChange={(e) => setMImgUrls(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-sm mt-lg flex items-center justify-center gap-xs">
              <FiUpload />
              Upload Monthly Update Payload
            </button>
          </form>
        )}

        {/* Tab 4: Blueprints */}
        {activeTab === 'product' && (
          <form onSubmit={handleProductSubmit} className="space-y-md">
            <h3 className="text-base font-bold text-textPrimary mb-sm">Upload Blueprint or Schematic Layout</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div>
                <label className="form-label">Associate Project Site</label>
                <select
                  value={pSiteId}
                  onChange={(e) => setPSiteId(e.target.value)}
                  className="form-input"
                >
                  <option value="">-- Choose Site --</option>
                  {sites.map((s) => (
                    <option key={s.site_id} value={s.site_id}>
                      {s.site_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Product Type</label>
                <select
                  value={pType}
                  onChange={(e) => setPType(e.target.value)}
                  className="form-input"
                >
                  <option value="elevation">Elevation View</option>
                  <option value="top-view">Aerial / Top View</option>
                </select>
              </div>
              <div>
                <label className="form-label">Blueprint Title</label>
                <input
                  type="text"
                  placeholder="e.g. Front Elevation Layout"
                  value={pTitle}
                  onChange={(e) => setPTitle(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Document upload panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg border-t border-borderLight pt-md mt-md">
              <div className="space-y-md">
                <h4 className="font-bold text-sm text-textSecondary">1. Main Blueprint PDF/Image</h4>
                <div>
                  <label className="form-label">Upload Blueprint File</label>
                  <input
                    type="file"
                    onChange={(e) => setPProductFile(e.target.files[0])}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Blueprint URL Fallback</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-1503387762-592deb58ef4e"
                    value={pProductUrl}
                    onChange={(e) => setPProductUrl(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="space-y-md">
                <h4 className="font-bold text-sm text-textSecondary">2. Preview Thumbnail Image</h4>
                <div>
                  <label className="form-label">Upload Thumbnail File</label>
                  <input
                    type="file"
                    onChange={(e) => setPPreviewFile(e.target.files[0])}
                    className="form-input"
                    accept="image/*"
                  />
                </div>
                <div>
                  <label className="form-label">Thumbnail URL Fallback</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-1503387762-592deb58ef4e"
                    value={pPreviewUrl}
                    onChange={(e) => setPPreviewUrl(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-sm mt-lg flex items-center justify-center gap-xs">
              <FiUpload />
              Register Blueprint Product
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
