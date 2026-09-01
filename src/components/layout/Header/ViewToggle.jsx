/**
 * ViewToggle - Switches between list and feed view
 */

export default function ViewToggle({ viewMode, onViewChange }) {
  const handleClick = (mode) => (e) => {
    e.preventDefault();
    onViewChange(mode);
  };

  return (
    <div className="view-toggle">
      <button
        className={`view-toggle__btn text-3 ${viewMode === 'list' ? 'view-toggle__btn--active' : ''}`}
        onClick={handleClick('list')}
        aria-pressed={viewMode === 'list'}
      >
        list
      </button>
      <button
        className={`view-toggle__btn text-3 ${viewMode === 'feed' ? 'view-toggle__btn--active' : ''}`}
        onClick={handleClick('feed')}
        aria-pressed={viewMode === 'feed'}
      >
        feed
      </button>
    </div>
  );
}
