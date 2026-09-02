/**
 * ViewToggle - Switches between list and feed view
 * Always uses URL as single source of truth
 */

export default function ViewToggle({ viewMode, onViewChange }) {
  const handleClick = (mode) => (e) => {
    e.preventDefault();

    // Get current URL parts
    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(Boolean);
    const params = new URLSearchParams(window.location.search);

    let newUrl = pathname;

    // If clicking "feed" and we're on a project page (3 segments), navigate to category level
    if (mode === 'feed' && segments.length === 3) {
      // Go up one level: /skills/foto/basel-harbour -> /skills/foto?view=feed
      newUrl = `/${segments[0]}/${segments[1]}?view=feed`;
    }
    // If clicking "feed" from list view, add query parameter
    else if (mode === 'feed') {
      params.set('view', 'feed');
      newUrl = pathname + '?' + params.toString();
    }
    // If clicking "list" from feed view, remove query parameter
    else if (mode === 'list') {
      params.delete('view');
      newUrl = pathname + (params.toString() ? '?' + params.toString() : '');
    }

    // Update URL and trigger navigation
    window.history.pushState(null, "", newUrl);
    window.dispatchEvent(new PopStateEvent("popstate"));
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
