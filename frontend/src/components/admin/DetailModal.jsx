import React from 'react';
import { FiX, FiInfo, FiLayers, FiCalendar, FiMapPin, FiCheckCircle, FiActivity, FiFileText } from 'react-icons/fi';

const DetailModal = ({
  isOpen,
  title = 'Item Details',
  entityType = 'client', // 'client', 'site', 'monthlyUpdate', 'finalProduct'
  data = null,
  onClose,
}) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg">
              <FiInfo />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                {entityType} details
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto space-y-5 text-sm">
          {/* Client Details */}
          {entityType === 'client' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                {data.company_logo ? (
                  <img
                    src={data.company_logo}
                    alt={data.client_name}
                    className="w-14 h-14 rounded-lg object-contain bg-white p-1 border border-gray-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xl">
                    {data.client_name?.charAt(0) || 'C'}
                  </div>
                )}
                <div>
                  <h4 className="text-base font-bold text-gray-900">{data.client_name}</h4>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {data.client_id}</p>
                  {data.users?.[0]?.email && (
                    <p className="text-xs text-gray-600 font-mono mt-0.5">Login: {data.users[0].email}</p>
                  )}
                  {data.office_location && (
                    <p className="text-xs text-blue-700 font-medium mt-1 flex items-center gap-1">
                      <FiMapPin className="text-blue-500 shrink-0" />
                      {data.office_location}
                      {data.office_latitude && data.office_longitude && (
                        <span className="text-[10px] text-gray-400 font-mono">
                          ({data.office_latitude}, {data.office_longitude})
                        </span>
                      )}
                    </p>
                  )}
                  <span className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    data.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {data.status || 'Active'}
                  </span>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Associated Sites ({data.sites?.length || 0})
                </h5>
                {data.sites && data.sites.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.sites.map((site) => (
                      <div key={site.site_id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                        <div>
                          <strong className="block text-xs text-gray-800 font-semibold">{site.site_name}</strong>
                          <span className="text-[11px] text-gray-500">{site.status}</span>
                        </div>
                        <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600 font-mono">
                          {site.site_id.substring(0, 8)}...
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No registered sites for this client yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Site Details */}
          {entityType === 'site' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="text-base font-bold text-gray-900">{data.site_name}</h4>
                <p className="text-xs text-blue-600 font-medium mt-1">
                  Client: {data.client?.client_name || 'N/A'}
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div>
                    <span className="text-gray-500 block">Location:</span>
                    <span className="font-semibold text-gray-800">{data.location || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Status:</span>
                    <span className="font-semibold text-gray-800">{data.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Start Date:</span>
                    <span className="font-semibold text-gray-800">{data.start_date ? data.start_date.substring(0, 10) : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Completion Target:</span>
                    <span className="font-semibold text-gray-800">{data.completion_date ? data.completion_date.substring(0, 10) : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Update Details */}
          {entityType === 'monthlyUpdate' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-gray-900">
                    Update for {data.site?.site_name || 'Site'}
                  </h4>
                  <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold">
                    {data.month}/{data.year}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Client: {data.site?.client?.client_name || 'N/A'}
                </p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Overall Progress</span>
                    <span>{data.progress_percentage}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${data.progress_percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {data.notes && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Notes</h5>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">{data.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="block text-lg font-bold text-gray-800">{data.panoramas?.length || 0}</span>
                  <span className="text-[11px] text-gray-500 font-medium uppercase">360° Panoramas</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="block text-lg font-bold text-gray-800">{data.videos?.length || 0}</span>
                  <span className="text-[11px] text-gray-500 font-medium uppercase">Videos</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="block text-lg font-bold text-gray-800">{data.images?.length || 0}</span>
                  <span className="text-[11px] text-gray-500 font-medium uppercase">Photos & Docs</span>
                </div>
              </div>
            </div>
          )}

          {/* Final Product Details */}
          {entityType === 'finalProduct' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="text-base font-bold text-gray-900">{data.title}</h4>
                <p className="text-xs text-blue-600 font-medium mt-1">
                  Site: {data.site?.site_name || 'N/A'} (Client: {data.site?.client?.client_name || 'N/A'})
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-semibold uppercase">
                    {data.product_type}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    Created: {new Date(data.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {data.preview_url && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Preview</h5>
                  <div className="max-h-60 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100">
                    <img
                      src={data.preview_url}
                      alt={data.title}
                      className="max-h-60 max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              {data.file_url && (
                <div className="pt-2">
                  <a
                    href={data.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                  >
                    <FiFileText /> Open / Download Source Document
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
