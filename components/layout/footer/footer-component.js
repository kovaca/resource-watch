import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'routes';

// Components
import CompoundMenu from 'components/ui/CompoundMenu';
import Carousel from 'components/ui/Carousel';
import Icon from 'components/ui/Icon';

const data = [
  { name: 'Data', route: 'explore' },
  { name: 'Explore Datasets', route: 'explore' },
  { name: 'Dashboards', route: 'dashboards' },
  { name: 'Planet Pulse', anchor: '/data/pulse' },
  { name: 'App Gallery', route: 'get_involved_detail', params: { id: 'apps' } }
];

const about = [
  { name: 'About', route: 'about' },
  { name: 'Partners', route: 'about_partners' },
  { name: 'FAQs', route: 'about_faqs' },
  { name: 'Terms of Service', route: 'terms-of-service' },
  { name: 'Privacy', route: 'privacy-policy' }
];

const insights = [
  { name: 'Blog', route: 'insights' },
  { name: 'Recent Signals', route: 'insights' },
  { name: 'Highlighted Signals', route: 'insights' }
];

const getInvolved = [
  { name: 'Get Involved', route: 'get_involved' },
  { name: 'Submit a Story', route: 'get_involved_detail', params: { id: 'submit-an-insight' } },
  { name: 'Contribute Data', route: 'get_involved_detail', params: { id: 'contribute-data' } },
  { name: 'Join the Community', route: 'get_involved_detail', params: { id: 'join-community' } }
];

class Footer extends React.Component {
  static propTypes = {
    fetchPartners: PropTypes.func,
    footer: PropTypes.object
  };

  componentDidMount() {
    this.props.fetchPartners();
  }

  getPartners() {
    const { footer } = this.props;

    return footer.partners.list.map(p => (
      <div key={p.id} className="item">
        <Link route="partner" params={{ id: p.id }}>
          <a>
            <img className="-img" src={`${process.env.STATIC_SERVER_URL}${p.logo.thumb}`} alt={p.name} />
          </a>
        </Link>
      </div>
    ));
  }

  render() {
    const { footer } = this.props;
    const menuData = [data, about, insights, getInvolved];

    return (
      <footer className="l-footer">
        <div className="footer-main">
          <div className="l-container">
            <div className="row">
              <div className="column small-12">
                <img
                  className="footer-logo"
                  height={21}
                  width={129}
                  src="/static/images/logo-embed.png"
                  alt="Resource Watch"
                />
              </div>
            </div>
          </div>
          <CompoundMenu items={menuData} />
        </div>

        <div className="footer-social">
          <ul>
            <li>
              <a href="https://twitter.com/resource_watch" target="_blank" rel="noopener noreferrer">
                <Icon name="icon-twitter" />
              </a>
            </li>
            <li>
              <a href="https://www.facebook.com/ResourceWatch/" target="_blank" rel="noopener noreferrer">
                <Icon name="icon-facebook" />
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-intro">
          <div className="title">
            <Link route="about_partners"><a>Partners</a></Link>
          </div>

          <div className="l-container">
            <div className="row">
              <div className="column small-12">
                <div className="c-partners-slider">
                  {footer.partners.list.length ? <Carousel items={this.getPartners()} /> : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-lower">
          <div className="l-container">
            <div className="row">
              <div className="column small-12">
                <div className="footer-container">
                  <div className="footer-item">
                    <a href="http://www.wri.org/" target="_blank" rel="noreferrer noopener">
                      <img src="/static/images/wri-logo.svg" alt="WRI logo" />
                    </a>
                  </div>
                  <div className="footer-item">
                    <p className="-bold">World Resources Institute</p>
                    <p>10 G Street NE Suite 800, Washington, DC 20002, USA</p>
                    <p>Phone +1 (202) 729-7600    |    Fax: +1 (202) 720 7610</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;