import { useState, useEffect, useCallback } from 'react';
import { getSiteDashboard } from '../services/siteService';

export const useSiteData = (siteId) => {
  const [site, setSite] = useState(null);
  const [monthlyUpdates, setMonthlyUpdates] = useState([]);
  const [finalProducts, setFinalProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSiteData = useCallback(async () => {
    if (!siteId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSiteDashboard(siteId);
      setSite(data.site);
      setMonthlyUpdates(data.monthlyUpdates || []);
      setFinalProducts(data.finalProducts || []);
    } catch (err) {
      console.error(`Error loading site data for ${siteId}:`, err);
      setError(err.response?.data?.error || 'Failed to load site information.');
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    fetchSiteData();
  }, [fetchSiteData]);

  return {
    site,
    monthlyUpdates,
    finalProducts,
    loading,
    error,
    refetch: fetchSiteData,
  };
};
