/**
 * ViewToggle - Switches between list and feed view
 */

export default function ViewToggle({ viewMode, onViewChange }) {
  const handleClick = (mode) => (e) => {
    e.preventDefault();

    // Get current URL parts
    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(Boolean);

    // If clicking "feed" and we're on a project page (3 segments), navigate to category level
    if (mode === 'feed' && segments.length === 3) {
      // Go up one level: /skills/foto/basel-harbour -> /skills/foto?view=feed
      const categoryUrl = `/${segments[0]}/${segments[1]}?view=feed`;
      window.history.pushState(null, "", categoryUrl);
      window.dispatchEvent(new PopStateEvent("popstate"));
      return; // Don't call onViewChange - popstate handler will update state
    }

    // If clicking "list" from feed view, remove query parameter
    if (mode === 'list' && viewMode === 'feed') {
      // Keep current URL but remove ?view=feed
      const currentSearch = new URLSearchParams(window.location.search);
      currentSearch.delete('view');
      const newUrl = pathname + (currentSearch.toString() ? `?${currentSearch.toString()}` : '');
      window.history.pushState(null, "", newUrl);
      window.dispatchEvent(new PopStateEvent("popstate"));
      return; // Don't call onViewChange - popstate handler will update state
    }

    // For other cases, just update the state
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
