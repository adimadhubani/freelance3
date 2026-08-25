import React from 'react';
import { useOutletContext } from 'react-router-dom';
import SiteMap from '../components/common/SiteMap';
import { FiMapPin } from 'react-icons/fi';

const SiteMapPage = () => {
    const { site } = useOutletContext() || {};

    return (
        <div className="p-4 md:p-6">
            <div className="section-title mb-6">
                <div className="section-title__icon">
                    <FiMapPin />
                </div>
                <div>
                    <h2>Site Location Map</h2>
                    <p>View the exact location of {site?.site_name || 'the site'} on Google Maps.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <SiteMap
                    latitude={site?.latitude}
                    longitude={site?.longitude}
                    siteName={site?.site_name}
                    googleMapsUrl={site?.google_maps_url}
                />
            </div>
        </div>
    );
};

export default SiteMapPage;