import React, {
  createElement,
} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { APP_HEADER_ITEMS } from 'layout/header/constants';

const header = {
  about: import('../header-about'),
  dashboards: import('../header-dashboards'),
  data: import('../header-data'),
  'get-involved': import('../header-get-involved'),
  menu: import('../header-menu'),
  'menu-mobile': import('../header-menu-mobile'),
  search: import('../header-search'),
  user: import('../header-user'),
};

const HeaderMenu = ({
  user,
}) => {
  const {
    pathname,
  } = useRouter();

  const {
    token,
  } = user;

  return (
    <nav className="header-menu">
      <ul>
        {APP_HEADER_ITEMS.map((item) => {
          const isUserLogged = !!token;

          // if user is defined but it is not equal to the current token
          if (typeof item.user !== 'undefined' && item.user !== isUserLogged) return null;

          const activeClassName = classnames({ '-active': item.pages && item.pages.includes(pathname) });
          let DropdownMenu;
          if (item.id !== 'blog') {
            DropdownMenu = dynamic(() => header[item.id]);
          }

          return (
            <li
              key={item.label}
              className={activeClassName}
            >
              {(!DropdownMenu && item.href && !item.external)
                && (
                <Link href={item.href}>
                  <a>{item.label}</a>
                </Link>
                )}

              {(!DropdownMenu && item.external) && (
                <a href={item.href}>
                  {item.label}
                </a>
              )}

              {DropdownMenu && createElement(DropdownMenu, item)}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

HeaderMenu.propTypes = {
  user: PropTypes.shape({
    token: PropTypes.string,
  }).isRequired,
};

export default HeaderMenu;
