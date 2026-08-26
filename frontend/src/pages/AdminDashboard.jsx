import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  // Create functions
  createClient,
  createSite,
  uploadMonthlyData,
  uploadFinalProduct,
  // CRUD functions
  getAllClients,
  updateClient,
  deleteClient,
  getAllSites,
  updateSite,
  deleteSite,
  getAllMonthlyUpdates,
  updateMonthlyUpdate,
  deleteMonthlyUpdate,
  getAllFinalProducts,
  updateFinalProduct,
  deleteFinalProduct,
} from '../services/siteService';
import api from '../services/api';
import AdminTable from '../components/admin/AdminTable';
import EditModal from '../components/admin/EditModal';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import DetailModal from '../components/admin/DetailModal';
import {
  FiUpload,
  FiArrowLeft,
  FiPlus,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiMapPin,
  FiLayers,
  FiFileText,
  FiActivity,
  FiGrid,
} from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Active top-level Tab: 'dashboard' | 'clients' | 'sites' | 'monthly' | 'products' | 'create'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [createSubTab, setCreateSubTab] = useState('client'); // 'client', 'site', 'monthly', 'product'
  const [loading, setLoading] = useState(false);

  // Data states for CRUD lists
  const [clientsList, setClientsList] = useState([]);
  const [sitesList, setSitesList] = useState([]);
  const [monthlyList, setMonthlyList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  // Form Selectors
  const [selectorClients, setSelectorClients] = useState([]);
  const [selectorSites, setSelectorSites] = useState([]);

  // Modal states
  const [editModalState, setEditModalState] = useState({
    isOpen: false,
    entityType: 'client',
    data: null,
    title: '',
  });

  const [confirmDialogState, setConfirmDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    itemName: '',
    onConfirm: null,
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    entityType: 'client',
    data: null,
    title: '',
  });

  const [actionLoading, setActionLoading] = useState(false);

  // Fetch dropdown selectors
  const loadSelectors = useCallback(async () => {
    try {
      const [clientRes, siteRes] = await Promise.all([
        api.get('/admin/clients-list'),
        api.get('/admin/sites-list'),
      ]);
      setSelectorClients(clientRes.data.clients || []);
      setSelectorSites(siteRes.data.sites || []);
    } catch (e) {
      console.warn('Could not load admin selectors:', e.response?.data?.error || e.message);
    }
  }, []);

  // Fetch all list data for tables & stats
  const fetchAllData = useCallback(async () => {
    setListLoading(true);
    try {
      const [cRes, sRes, mRes, pRes] = await Promise.allSettled([
        getAllClients(),
        getAllSites(),
        getAllMonthlyUpdates(),
        getAllFinalProducts(),
      ]);

      if (cRes.status === 'fulfilled') setClientsList(cRes.value.clients || []);
      if (sRes.status === 'fulfilled') setSitesList(sRes.value.sites || []);
      if (mRes.status === 'fulfilled') setMonthlyList(mRes.value.updates || []);
      if (pRes.status === 'fulfilled') setProductsList(pRes.value.products || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      toast.error('Failed to load some dashboard lists.');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSelectors();
    fetchAllData();
  }, [loadSelectors, fetchAllData]);

  // ============================================================================
  // EDIT HANDLERS
  // ============================================================================

  const handleOpenEdit = (entityType, row) => {
    const titles = {
      client: `Edit Client: ${row.client_name}`,
      site: `Edit Site: ${row.site_name}`,
      monthlyUpdate: `Edit Monthly Update: ${row.site?.site_name || 'Site'} (${row.month}/${row.year})`,
      finalProduct: `Edit Final Product: ${row.title}`,
    };

    setEditModalState({
      isOpen: true,
      entityType,
      data: row,
      title: titles[entityType] || 'Edit Item',
    });
  };

  const handleSaveEdit = async (formData) => {
    const { entityType, data } = editModalState;
    if (!data) return;

    setActionLoading(true);
    try {
      if (entityType === 'client') {
        const res = await updateClient(data.client_id, formData);
        setClientsList((prev) =>
          prev.map((c) => (c.client_id === data.client_id ? { ...c, ...res.client } : c))
        );
        toast.success('Client updated successfully!');
      } else if (entityType === 'site') {
        const res = await updateSite(data.site_id, formData);
        setSitesList((prev) =>
          prev.map((s) => (s.site_id === data.site_id ? { ...s, ...res.site } : s))
        );
        toast.success('Site updated successfully!');
      } else if (entityType === 'monthlyUpdate') {
        const res = await updateMonthlyUpdate(data.update_id, formData);
        setMonthlyList((prev) =>
          prev.map((m) => (m.update_id === data.update_id ? { ...m, ...res.update } : m))
        );
        toast.success('Monthly update saved!');
      } else if (entityType === 'finalProduct') {
        const res = await updateFinalProduct(data.product_id, formData);
        setProductsList((prev) =>
          prev.map((p) => (p.product_id === data.product_id ? { ...p, ...res.product } : p))
        );
        toast.success('Final product updated!');
      }

      setEditModalState({ isOpen: false, entityType: 'client', data: null, title: '' });
      loadSelectors();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update item.');
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================================
  // DELETE HANDLERS
  // ============================================================================

  const handleOpenDelete = (entityType, row) => {
    let title = 'Delete Item';
    let message = 'Are you sure you want to delete this item?';
    let itemName = '';
    let confirmAction = null;

    if (entityType === 'client') {
      title = 'Delete Corporate Client';
      itemName = `${row.client_name} (ID: ${row.client_id})`;
      message =
        'Deleting this client will cascade-delete all associated construction sites, monthly tracking updates, panoramas, and blueprint files!';
      confirmAction = async () => {
        setActionLoading(true);
        try {
          await deleteClient(row.client_id);
          setClientsList((prev) => prev.filter((c) => c.client_id !== row.client_id));
          toast.success('Client deleted successfully.');
          fetchAllData();
          loadSelectors();
        } catch (err) {
          toast.error(err.response?.data?.error || 'Failed to delete client.');
        } finally {
          setActionLoading(false);
          setConfirmDialogState({ isOpen: false });
        }
      };
    } else if (entityType === 'site') {
      title = 'Delete Project Site';
      itemName = `${row.site_name} (Client: ${row.client?.client_name || 'N/A'})`;
      message =
        'Deleting this site will cascade-delete all of its monthly updates, videos, 360 panoramas, and final blueprint schematics!';
      confirmAction = async () => {
        setActionLoading(true);
        try {
          await deleteSite(row.site_id);
          setSitesList((prev) => prev.filter((s) => s.site_id !== row.site_id));
          toast.success('Site deleted successfully.');
          fetchAllData();
          loadSelectors();
        } catch (err) {
          toast.error(err.response?.data?.error || 'Failed to delete site.');
        } finally {
          setActionLoading(false);
          setConfirmDialogState({ isOpen: false });
        }
      };
    } else if (entityType === 'monthlyUpdate') {
      title = 'Delete Monthly Update';
      itemName = `${row.site?.site_name || 'Site'} (${row.month}/${row.year})`;
      message =
        'Deleting this monthly update will remove all associated 360° panoramas, walkthrough videos, and image assets for this period.';
      confirmAction = async () => {
        setActionLoading(true);
        try {
          await deleteMonthlyUpdate(row.update_id);
          setMonthlyList((prev) => prev.filter((m) => m.update_id !== row.update_id));
          toast.success('Monthly update deleted successfully.');
          fetchAllData();
        } catch (err) {
          toast.error(err.response?.data?.error || 'Failed to delete monthly update.');
        } finally {
          setActionLoading(false);
          setConfirmDialogState({ isOpen: false });
        }
      };
    } else if (entityType === 'finalProduct') {
      title = 'Delete Final Product Blueprint';
      itemName = `${row.title} (${row.product_type})`;
      message = 'Are you sure you want to delete this blueprint schematic?';
      confirmAction = async () => {
        setActionLoading(true);
        try {
          await deleteFinalProduct(row.product_id);
          setProductsList((prev) => prev.filter((p) => p.product_id !== row.product_id));
          toast.success('Final product deleted successfully.');
          fetchAllData();
        } catch (err) {
          toast.error(err.response?.data?.error || 'Failed to delete final product.');
        } finally {
          setActionLoading(false);
          setConfirmDialogState({ isOpen: false });
        }
      };
    }

    setConfirmDialogState({
      isOpen: true,
      title,
      message,
      itemName,
      onConfirm: confirmAction,
    });
  };

  // ============================================================================
  // VIEW DETAILS HANDLER
  // ============================================================================

  const handleOpenView = (entityType, row) => {
    setDetailModalState({
      isOpen: true,
      entityType,
      data: row,
      title: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Details`,
    });
  };

  // ============================================================================
  // CREATE FORMS HANDLERS (Unchanged functionality)
  // ============================================================================

  // Form 1: Client
  const [clientName, setClientName] = useState('');
  const [clientUserName, setClientUserName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [clientPasswordConfirm, setClientPasswordConfirm] = useState('');
  const [clientLogo, setClientLogo] = useState(null);
  const [clientLogoUrl, setClientLogoUrl] = useState('');
  const [clientOfficeLocation, setClientOfficeLocation] = useState('');
  const [clientOfficeLatitude, setClientOfficeLatitude] = useState('');
  const [clientOfficeLongitude, setClientOfficeLongitude] = useState('');

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    if (!clientName || !clientUserName || !clientEmail || !clientPassword) {
      return toast.error('Complete the client and login details.');
    }
    if (clientPassword.length < 8) return toast.error('Password must be at least 8 characters.');
    if (clientPassword !== clientPasswordConfirm) return toast.error('Passwords do not match.');

    setLoading(true);
    const formData = new FormData();
    formData.append('client_name', clientName);
    formData.append('user_name', clientUserName);
    formData.append('email', clientEmail);
    formData.append('password', clientPassword);
    if (clientLogo) formData.append('company_logo', clientLogo);
    if (clientLogoUrl) formData.append('company_logo_url', clientLogoUrl);
    if (clientOfficeLocation) formData.append('office_location', clientOfficeLocation);
    if (clientOfficeLatitude) formData.append('office_latitude', clientOfficeLatitude);
    if (clientOfficeLongitude) formData.append('office_longitude', clientOfficeLongitude);

    try {
      await createClient(formData);
      toast.success('Client and login registered successfully!');
      setClientName('');
      setClientUserName('');
      setClientEmail('');
      setClientPassword('');
      setClientPasswordConfirm('');
      setClientLogo(null);
      setClientLogoUrl('');
      setClientOfficeLocation('');
      setClientOfficeLatitude('');
      setClientOfficeLongitude('');
      loadSelectors();
      fetchAllData();
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
  const [siteLatitude, setSiteLatitude] = useState('');
  const [siteLongitude, setSiteLongitude] = useState('');
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
        latitude: siteLatitude,
        longitude: siteLongitude,
        status: siteStatus,
        start_date: startDate,
        completion_date: completionDate,
      });
      toast.success('Project Site created successfully!');
      setSiteName('');
      setSiteLocation('');
      setSiteLatitude('');
      setSiteLongitude('');
      setStartDate('');
      setCompletionDate('');
      loadSelectors();
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create site.');
    } finally {
      setLoading(false);
    }
  };

  // Form 3: Monthly Update
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
  const [m360VidTitle, setM360VidTitle] = useState('');
  const [m360VidFile, setM360VidFile] = useState(null);
  const [m360VidUrl, setM360VidUrl] = useState('');
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

    formData.append('panorama_title', mPanoTitle);
    formData.append('type', '360');
    if (mPanoFile) formData.append('panorama_file', mPanoFile);
    if (mPanoUrl) formData.append('tour_url', mPanoUrl);

    formData.append('video_title', mVidTitle);
    formData.append('video_type', mVidType);
    if (mVidFile) formData.append('video_file', mVidFile);
    if (mVidUrl) formData.append('video_url', mVidUrl);

    formData.append('video_360_title', m360VidTitle);
    if (m360VidFile || m360VidUrl) formData.append('is_360', 'true');
    if (m360VidFile) formData.append('video_360_file', m360VidFile);
    if (m360VidUrl) formData.append('video_360_url', m360VidUrl);

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
      setMNotes('');
      setMPanoTitle('');
      setMPanoFile(null);
      setMPanoUrl('');
      setMVidTitle('');
      setMVidFile(null);
      setMVidUrl('');
      setM360VidTitle('');
      setM360VidFile(null);
      setM360VidUrl('');
      setMImgFiles(null);
      setMImgUrls('');
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload monthly data.');
    } finally {
      setLoading(false);
    }
  };

  // Form 4: Blueprints
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
    formData.append('type', pType);

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
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload final product.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TABLE COLUMN DEFINITIONS
  // ============================================================================

  const clientColumns = [
    {
      header: 'Logo',
      render: (row) =>
        row.company_logo ? (
          <img
            src={row.company_logo}
            alt={row.client_name}
            className="w-9 h-9 rounded-md object-contain bg-gray-50 border border-gray-200"
          />
        ) : (
          <div className="w-9 h-9 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
            {row.client_name?.charAt(0) || 'C'}
          </div>
        ),
    },
    {
      header: 'Client Name',
      key: 'client_name',
      render: (row) => (
        <div>
          <span className="font-semibold text-gray-900 block">{row.client_name}</span>
          <span className="text-[11px] text-gray-400 font-mono">{row.client_id?.substring(0, 8)}...</span>
        </div>
      ),
    },
    {
      header: 'Registered Sites',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
          {row.sites ? row.sites.length : 0} Sites
        </span>
      ),
    },
    {
      header: 'Office Location',
      render: (row) => (
        <div className="flex items-center gap-1 text-xs text-gray-700 max-w-[180px]">
          <FiMapPin className="text-blue-500 shrink-0 text-xs" />
          <span className="truncate" title={row.office_location || 'Not set'}>
            {row.office_location || <span className="text-gray-400 italic">Not set</span>}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.status === 'Active'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
        >
          {row.status || 'Active'}
        </span>
      ),
    },
    {
      header: 'Created Date',
      render: (row) => (
        <span className="text-xs text-gray-500">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
  ];

  const siteColumns = [
    {
      header: 'Site Name',
      key: 'site_name',
      render: (row) => (
        <div>
          <span className="font-semibold text-gray-900 block">{row.site_name}</span>
          <span className="text-[11px] text-gray-400 font-mono">{row.site_id?.substring(0, 8)}...</span>
        </div>
      ),
    },
    {
      header: 'Client',
      render: (row) => (
        <span className="font-medium text-blue-700">{row.client?.client_name || 'N/A'}</span>
      ),
    },
    {
      header: 'Location',
      render: (row) => (
        <span className="text-xs text-gray-600 line-clamp-1">{row.location || '—'}</span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.status === 'Active'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : row.status === 'In Progress'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
        >
          {row.status || 'Active'}
        </span>
      ),
    },
    {
      header: 'Created Date',
      render: (row) => (
        <span className="text-xs text-gray-500">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
  ];

  const monthlyColumns = [
    {
      header: 'Site / Client',
      render: (row) => (
        <div>
          <strong className="block text-gray-900 font-semibold">{row.site?.site_name || 'N/A'}</strong>
          <span className="text-[11px] text-blue-600 font-medium">
            {row.site?.client?.client_name || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Period',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-800 font-mono">
          {String(row.month).padStart(2, '0')}/{row.year}
        </span>
      ),
    },
    {
      header: 'Progress',
      render: (row) => (
        <div className="w-32">
          <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1">
            <span>{row.progress_percentage}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${row.progress_percentage}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Media Included',
      render: (row) => (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span title="360 Panoramas">🌐 {row.panoramas?.length || 0}</span>
          <span title="Videos">🎥 {row.videos?.length || 0}</span>
          <span title="Images">📸 {row.images?.length || 0}</span>
        </div>
      ),
    },
    {
      header: 'Update Date',
      render: (row) => (
        <span className="text-xs text-gray-500">
          {row.update_date ? new Date(row.update_date).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
  ];

  const productColumns = [
    {
      header: 'Blueprint Title',
      key: 'title',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          {row.preview_url ? (
            <img
              src={row.preview_url}
              alt={row.title}
              className="w-10 h-10 rounded object-cover bg-gray-100 border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
              <FiFileText />
            </div>
          )}
          <div>
            <strong className="block text-gray-900 font-semibold">{row.title}</strong>
            <span className="text-[11px] text-gray-400 font-mono">{row.product_id?.substring(0, 8)}...</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Site',
      render: (row) => (
        <div>
          <span className="font-semibold text-gray-800 block">{row.site?.site_name || 'N/A'}</span>
          <span className="text-[11px] text-gray-500">{row.site?.client?.client_name || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 uppercase">
          {row.product_type}
        </span>
      ),
    },
    {
      header: 'Created Date',
      render: (row) => (
        <span className="text-xs text-gray-500">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="admin-workspace">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">
            <FiShield /> Administration Portal
          </span>
          <h1>Project Operations & Data Hub</h1>
          <p>
            Complete control over Clients, Project Sites, Monthly Tracking Updates, and Blueprint Schematics.
          </p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="admin-signout hover:bg-white/10 transition-colors"
        >
          <FiArrowLeft />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Top Tabs */}
      <div className="admin-tabs">
        {[
          { id: 'dashboard', label: '📊 Dashboard Overview' },
          { id: 'clients', label: `🏢 Clients (${clientsList.length})` },
          { id: 'sites', label: `📍 Project Sites (${sitesList.length})` },
          { id: 'monthly', label: `📈 Monthly Updates (${monthlyList.length})` },
          { id: 'products', label: `📐 Final Products (${productsList.length})` },
          { id: 'create', label: '➕ Create Operations' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Panel Content */}
      <div className="admin-panel min-h-[500px]">
        {/* ========================================================================= */}
        {/* TAB 0: DASHBOARD STATS OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">System Overview</h3>
                <p className="text-xs text-gray-500 mt-1">Live metrics across all managed infrastructure</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('create');
                  setCreateSubTab('client');
                }}
                className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3"
              >
                <FiPlus /> Quick Create
              </button>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveTab('clients')}
                className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Clients</span>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    <FiUsers />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-gray-900">{clientsList.length}</span>
                  <p className="text-[11px] text-gray-500 mt-1">Registered corporate partners</p>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('sites')}
                className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Sites</span>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    <FiMapPin />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-gray-900">{sitesList.length}</span>
                  <p className="text-[11px] text-gray-500 mt-1">Monitored construction locations</p>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('monthly')}
                className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly Updates</span>
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    <FiTrendingUp />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-gray-900">{monthlyList.length}</span>
                  <p className="text-[11px] text-gray-500 mt-1">Progress milestones published</p>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('products')}
                className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Final Schematics</span>
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    <FiLayers />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-gray-900">{productsList.length}</span>
                  <p className="text-[11px] text-gray-500 mt-1">Blueprints & Elevation layouts</p>
                </div>
              </div>
            </div>

            {/* Quick Actions and Recent Sites preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Recent Sites */}
              <div className="bg-white rounded-xl p-5 border border-gray-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <FiMapPin className="text-blue-600" /> Recent Construction Sites
                  </h4>
                  <button
                    onClick={() => setActiveTab('sites')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View All →
                  </button>
                </div>
                {sitesList.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4 text-center">No registered sites found.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {sitesList.slice(0, 4).map((site) => (
                      <div key={site.site_id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <strong className="block text-xs text-gray-900">{site.site_name}</strong>
                          <span className="text-[11px] text-gray-500">{site.client?.client_name || 'N/A'}</span>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 bg-green-50 text-green-700 font-semibold rounded-full">
                          {site.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Updates */}
              <div className="bg-white rounded-xl p-5 border border-gray-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <FiActivity className="text-blue-600" /> Recent Progress Logs
                  </h4>
                  <button
                    onClick={() => setActiveTab('monthly')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View All →
                  </button>
                </div>
                {monthlyList.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4 text-center">No monthly updates recorded yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {monthlyList.slice(0, 4).map((update) => (
                      <div key={update.update_id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <strong className="block text-xs text-gray-900">{update.site?.site_name || 'Site'}</strong>
                          <span className="text-[11px] text-gray-500">
                            Month {update.month}/{update.year}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-blue-600">
                          {update.progress_percentage}% Complete
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: CLIENTS LIST CRUD */}
        {/* ========================================================================= */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Manage Corporate Clients</h3>
                <p className="text-xs text-gray-500">View, update, or remove registered client organizations</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('create');
                  setCreateSubTab('client');
                }}
                className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3"
              >
                <FiPlus /> New Client
              </button>
            </div>

            <AdminTable
              columns={clientColumns}
              data={clientsList}
              title="All Registered Clients"
              searchPlaceholder="Search clients by name, ID or status..."
              loading={listLoading}
              onEdit={(row) => handleOpenEdit('client', row)}
              onDelete={(row) => handleOpenDelete('client', row)}
              onView={(row) => handleOpenView('client', row)}
              emptyMessage="No clients found. Click 'New Client' to add one."
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SITES LIST CRUD */}
        {/* ========================================================================= */}
        {activeTab === 'sites' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Manage Construction Sites</h3>
                <p className="text-xs text-gray-500">View, update, or remove project sites across all clients</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('create');
                  setCreateSubTab('site');
                }}
                className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3"
              >
                <FiPlus /> New Site
              </button>
            </div>

            <AdminTable
              columns={siteColumns}
              data={sitesList}
              title="All Construction Sites"
              searchPlaceholder="Search sites by name, client, location..."
              loading={listLoading}
              onEdit={(row) => handleOpenEdit('site', row)}
              onDelete={(row) => handleOpenDelete('site', row)}
              onView={(row) => handleOpenView('site', row)}
              emptyMessage="No sites found. Click 'New Site' to initialize one."
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MONTHLY UPDATES LIST CRUD */}
        {/* ========================================================================= */}
        {activeTab === 'monthly' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Manage Monthly Updates</h3>
                <p className="text-xs text-gray-500">Manage monthly progress milestones, notes, and media logs</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('create');
                  setCreateSubTab('monthly');
                }}
                className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3"
              >
                <FiPlus /> Upload Monthly Data
              </button>
            </div>

            <AdminTable
              columns={monthlyColumns}
              data={monthlyList}
              title="All Monthly Progress Logs"
              searchPlaceholder="Search updates by site, year, month..."
              loading={listLoading}
              onEdit={(row) => handleOpenEdit('monthlyUpdate', row)}
              onDelete={(row) => handleOpenDelete('monthlyUpdate', row)}
              onView={(row) => handleOpenView('monthlyUpdate', row)}
              emptyMessage="No monthly updates recorded yet."
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: FINAL PRODUCTS LIST CRUD */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Manage Final Products & Blueprints</h3>
                <p className="text-xs text-gray-500">View, update, or remove elevation layouts and blueprint schematics</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('create');
                  setCreateSubTab('product');
                }}
                className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3"
              >
                <FiPlus /> Upload Blueprint
              </button>
            </div>

            <AdminTable
              columns={productColumns}
              data={productsList}
              title="All Blueprint Products"
              searchPlaceholder="Search by title, site, type..."
              loading={listLoading}
              onEdit={(row) => handleOpenEdit('finalProduct', row)}
              onDelete={(row) => handleOpenDelete('finalProduct', row)}
              onView={(row) => handleOpenView('finalProduct', row)}
              emptyMessage="No final blueprint products uploaded yet."
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: CREATE OPERATIONS (Existing Create Forms) */}
        {/* ========================================================================= */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* Sub Tabs for Create */}
            <div className="flex items-center gap-2 p-1.5 bg-gray-200/70 rounded-lg w-fit overflow-x-auto">
              {[
                { id: 'client', label: '1. Register Client' },
                { id: 'site', label: '2. Register Site' },
                { id: 'monthly', label: '3. Upload Monthly Data' },
                { id: 'product', label: '4. Final Products' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setCreateSubTab(st.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${createSubTab === st.id
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {loading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center z-10 rounded-card">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="mt-2 text-xs font-semibold text-gray-600">Uploading file payloads to storage...</p>
              </div>
            )}

            {/* Sub-form 1: Client registration */}
            {createSubTab === 'client' && (
              <form onSubmit={handleClientSubmit} className="space-y-4">
                <h3 className="text-base font-bold text-gray-900 mb-1">Register New Corporate Client</h3>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Client User Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={clientUserName}
                      onChange={(e) => setClientUserName(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Client Login Email</label>
                    <input
                      type="email"
                      placeholder="priya@buildcorp.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Client Login Password</label>
                    <input
                      type="password"
                      placeholder="At least 8 characters"
                      value={clientPassword}
                      onChange={(e) => setClientPassword(e.target.value)}
                      className="form-input"
                      minLength="8"
                    />
                  </div>
                  <div>
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Repeat client password"
                      value={clientPasswordConfirm}
                      onChange={(e) => setClientPasswordConfirm(e.target.value)}
                      className="form-input"
                      minLength="8"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="form-label">Logo URL Fallback (Optional)</label>
                    <input
                      type="text"
                      placeholder="https://example.com/logo.jpg"
                      value={clientLogoUrl}
                      onChange={(e) => setClientLogoUrl(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Office Location (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 123 Business Park, Mumbai"
                    value={clientOfficeLocation}
                    onChange={(e) => setClientOfficeLocation(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Office Latitude (Optional)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 19.0760"
                      value={clientOfficeLatitude}
                      onChange={(e) => setClientOfficeLatitude(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Office Longitude (Optional)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 72.8777"
                      value={clientOfficeLongitude}
                      onChange={(e) => setClientOfficeLongitude(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-2.5 mt-4 flex items-center justify-center gap-2">
                  <FiPlus />
                  Create Client & Login
                </button>
              </form>
            )}

            {/* Sub-form 2: Site registration */}
            {createSubTab === 'site' && (
              <form onSubmit={handleSiteSubmit} className="space-y-4">
                <h3 className="text-base font-bold text-gray-900 mb-1">Register New Construction Site</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Associate Client</label>
                    <select
                      value={siteClientId}
                      onChange={(e) => setSiteClientId(e.target.value)}
                      className="form-input"
                    >
                      <option value="">-- Choose Client --</option>
                      {selectorClients.map((c) => (
                        <option key={c.client_id} value={c.client_id}>
                          {c.client_name}
                        </option>
                      ))}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Latitude (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 28.6139"
                      value={siteLatitude}
                      onChange={(e) => setSiteLatitude(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Longitude (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 77.2090"
                      value={siteLongitude}
                      onChange={(e) => setSiteLongitude(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <button type="submit" className="btn-primary w-full py-2.5 mt-4 flex items-center justify-center gap-2">
                  <FiPlus />
                  Initialize Project Site
                </button>
              </form>
            )}

            {/* Sub-form 3: Monthly data upload */}
            {createSubTab === 'monthly' && (
              <form onSubmit={handleMonthlySubmit} className="space-y-4">
                <div className="border-b border-gray-200 pb-2 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FiTrendingUp className="text-blue-600" />
                    <h3 className="text-base font-bold text-gray-900">Upload Monthly Tracking Data</h3>
                  </div>
                  <span className="text-xs bg-gray-100 px-2.5 py-1 rounded border border-gray-200 text-gray-600 font-medium">
                    Max: Videos 200MB | PDFs 100MB | Photos 10MB
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="form-label">Select Site</label>
                    <select
                      value={mSiteId}
                      onChange={(e) => setMSiteId(e.target.value)}
                      className="form-input"
                    >
                      <option value="">-- Choose Site --</option>
                      {selectorSites.map((s) => (
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="form-label">Tracking Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Steel framing completed on Level 5."
                      value={mNotes}
                      onChange={(e) => setMNotes(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Media A: Panorama */}
                {/* <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">
                    Media A: 360° Panorama Tour Image
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
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
                      <label className="form-label">Equirectangular File</label>
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
                </div> */}

                {/* Media B: Walkthrough Video */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">
                    Site Videos & 360° Virtual Tour
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="form-label">Video Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Drone Walkthrough"
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
                        <option value="walkthrough">Site Videos</option>
                        {/* <option value="flythrough">Flythrough (Drone)</option> */}
                        <option value="360">360° Virtual Tour</option>
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
                      <label className="form-label">Video Direct URL</label>
                      <input
                        type="text"
                        placeholder="https://example.com/video.mp4"
                        value={mVidUrl}
                        onChange={(e) => setMVidUrl(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Media C: Photos & Documents */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">
                    Site Images
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">Folder Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Structural Framing"
                        value={mImgFolder}
                        onChange={(e) => setMImgFolder(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Upload Files</label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => setMImgFiles(e.target.files)}
                        className="form-input"
                        accept="image/*,application/pdf"
                      />
                    </div>
                    <div>
                      <label className="form-label">File URLs (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="https://example.com/a.jpg, https://example.com/doc.pdf"
                        value={mImgUrls}
                        onChange={(e) => setMImgUrls(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full py-2.5 mt-4 flex items-center justify-center gap-2">
                  <FiUpload />
                  Upload Monthly Update Payload
                </button>
              </form>
            )}

            {/* Sub-form 4: Blueprints upload */}
            {createSubTab === 'product' && (
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <h3 className="text-base font-bold text-gray-900 mb-1">Final Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">Associate Project Site</label>
                    <select
                      value={pSiteId}
                      onChange={(e) => setPSiteId(e.target.value)}
                      className="form-input"
                    >
                      <option value="">-- Choose Site --</option>
                      {selectorSites.map((s) => (
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
                      <option value="blueprint">Blueprint Schematic</option>
                      <option value="render">3D Render</option>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4 mt-4">
                  <div>
                    <h5 className="font-bold text-xs uppercase text-gray-500 mb-2">1. Main Blueprint File</h5>
                    <div className="space-y-2">
                      <input
                        type="file"
                        onChange={(e) => setPProductFile(e.target.files[0])}
                        className="form-input"
                        accept="image/*,application/pdf"
                      />
                      <input
                        type="text"
                        placeholder="Fallback PDF/File URL"
                        value={pProductUrl}
                        onChange={(e) => setPProductUrl(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs uppercase text-gray-500 mb-2">2. Visual Preview File</h5>
                    <div className="space-y-2">
                      <input
                        type="file"
                        onChange={(e) => setPPreviewFile(e.target.files[0])}
                        className="form-input"
                        accept="image/*"
                      />
                      <input
                        type="text"
                        placeholder="Fallback Preview Image URL"
                        value={pPreviewUrl}
                        onChange={(e) => setPPreviewUrl(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full py-2.5 mt-4 flex items-center justify-center gap-2">
                  <FiUpload />
                  Save Final Blueprint Product
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* GLOBAL MODALS */}
      {/* ========================================================================= */}

      {/* Edit Modal */}
      <EditModal
        isOpen={editModalState.isOpen}
        entityType={editModalState.entityType}
        data={editModalState.data}
        title={editModalState.title}
        loading={actionLoading}
        onSave={handleSaveEdit}
        onCancel={() => setEditModalState({ isOpen: false, entityType: 'client', data: null, title: '' })}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialogState.isOpen}
        title={confirmDialogState.title}
        message={confirmDialogState.message}
        itemName={confirmDialogState.itemName}
        loading={actionLoading}
        onConfirm={confirmDialogState.onConfirm}
        onCancel={() => setConfirmDialogState({ isOpen: false })}
      />

      {/* Detail Modal */}
      <DetailModal
        isOpen={detailModalState.isOpen}
        entityType={detailModalState.entityType}
        data={detailModalState.data}
        title={detailModalState.title}
        onClose={() => setDetailModalState({ isOpen: false, entityType: 'client', data: null, title: '' })}
      />
    </div>
  );
};

export default AdminDashboard;
