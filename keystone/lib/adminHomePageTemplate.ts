/**
 * Injected into `.keystone/admin/pages/index.js` via `ui.getAdditionalFiles`.
 * Replaces the default export so we can catch `useKeystone` metadata failures gracefully.
 */
export const ADMIN_HOME_PAGE_SRC = `
import { HomePage as KeystoneHomePage } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/pages/HomePage';
import { createElement, Component, useEffect } from 'react';

function AdminHomeDebugMount(props) {
  useEffect(function () {
    console.info('[keystone][admin-ui] Home route mounted', typeof window !== 'undefined' ? window.location.href : '');
  }, []);
  return props.children;
}

class AdminMetadataErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(
      "[keystone][admin-ui] AdminMetadataErrorBoundary caught render error",
      error,
      info && info.componentStack,
    );
  }

  render() {
    if (this.state.error) {
      const msg = String(
        this.state.error && this.state.error.message
          ? this.state.error.message
          : this.state.error
      );
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return createElement(
        'div',
        {
          style: {
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
            maxWidth: 560,
          },
        },
        createElement(
          'h1',
          { style: { fontSize: 20, marginBottom: 12 } },
          'Admin metadata could not load'
        ),
        createElement('p', { style: { color: '#444' } }, msg),
        createElement(
          'p',
          { style: { marginTop: 16, fontSize: 14, color: '#666' } },
          'Open DevTools → Network and confirm POST ',
          origin + '/api/graphql',
          ' returns 200. A 404 on /admin/api/graphql means the server must map it to /api/graphql (restart Keystone after pulling updates).'
        )
      );
    }
    return this.props.children;
  }
}

export default function HomePage() {
  return createElement(
    AdminHomeDebugMount,
    null,
    createElement(
      AdminMetadataErrorBoundary,
      null,
      createElement(KeystoneHomePage, null)
    )
  );
}
`;
