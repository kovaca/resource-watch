import App from 'next/app';
import { Provider } from 'react-redux';
import withRedux from 'next-redux-wrapper';
import { QueryClient, QueryClientProvider } from 'react-query';
import initStore from 'lib/store';

// es6 shim for .finally() in promises
import finallyShim from 'promise.prototype.finally';

import {
  setUser,
} from 'redactions/user';
import { setMobileDetect, mobileParser } from 'react-responsive-redux';
import { setHostname } from 'redactions/common';

// global styles
import 'css/index.scss';

finallyShim.shim();

const queryClient = new QueryClient();

class RWApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const {
      req,
      store,
      isServer,
    } = ctx;

    // sets hostname
    const hostname = isServer ? req.headers.host : window.origin;
    store.dispatch(setHostname(hostname));

    // sets user data coming from a request (server) or the store (client)
    const { user } = isServer ? req : store.getState();
    if (user) store.dispatch(setUser(user));

    // mobile detection
    if (isServer) {
      const mobileDetect = mobileParser(req);
      store.dispatch(setMobileDetect(mobileDetect));
    }

    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {};

    return {
      pageProps: {
        ...pageProps,
        user,
        isServer,
      },
    };
  }

  render() {
    const {
      Component,
      pageProps,
      store,
    } = this.props;

    // expose store when run in Cypress
    if (typeof window !== 'undefined' && window.Cypress) {
      window.store = store;
    }

    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </Provider>
    );
  }
}

export default withRedux(initStore)(RWApp);
