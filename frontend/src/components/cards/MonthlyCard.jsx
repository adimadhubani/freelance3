import React from 'react';
import { FiCalendar, FiChevronRight, FiFolder, FiMaximize, FiPlay } from 'react-icons/fi';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MonthlyCard = ({ month, year, title, progress = 0, notes, thumbnail, type, onClick }) => {
  const label = `${months[month - 1] || 'Month'} ${year}`;
  const isImage = type === 'image';
  return <article className={`data-card media-card ${isImage ? 'media-card--folder' : ''}`} onClick={onClick}>
    {isImage ? <div className="folder-card"><FiFolder /><div><strong>{label}</strong><span>{notes || title}</span></div><FiChevronRight /></div> : <><div className="media-card__label">{label}{month === new Date().getMonth() + 1 && <em>Latest</em>}</div><div className="media-card__image">{thumbnail ? <img src={thumbnail} alt={title} loading="lazy" /> : <div className="media-card__empty">Preview unavailable</div>}<span>{type === 'video' ? <FiPlay /> : <FiMaximize />}</span></div><div className="media-card__body"><strong>{title}</strong><p>Work Progress</p><div className="flex items-center gap-2"><div className="progress-blue flex-1"><i style={{ width: `${progress}%` }} /></div><b>{progress}%</b></div></div></>}
    <footer><FiCalendar /> {isImage ? `${months[month - 1]} ${year}` : `${months[month - 1]} ${year}`}</footer>
  </article>;
};
export default MonthlyCard;
