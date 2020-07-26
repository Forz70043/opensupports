import React              from 'react';
import {connect}          from 'react-redux';
import classNames         from 'classnames';
import Icon               from 'core-components/icon';

class MainLayoutFooter extends React.Component {

    render() {
        return (
            <div className={this.getClass()}>
                {this.props.adminPanelOpened ? this.renderExtraLinks() : null}
                <div className="main-layout-footer__powered">
                    Copyright 2020 © 
                </div>
            </div>
        );
    }

    renderExtraLinks() {
        return (
            <div className="main-layout-footer__extra-links">
                Customization powered by 
                <a className="main-layout-footer__extra-link" href="https://www.linkedin.com/in/alfonsopisicchio/" target="_blank"><Icon name="linkedin"/></a>
                <span> | </span>
                <a className="main-layout-footer__extra-link" href="https://github.com/Forz70043" target="_blank"><Icon name="github"/></a>
            </div>
        );
    }

    getClass() {
        let classes = {
            'main-layout-footer': true,
            'main-layout-footer_admin-panel': this.props.adminPanelOpened
        };

        return classNames(classes);
    }
}

export default connect((store) => {
    return {
        adminPanelOpened: store.session.staff
    };
})(MainLayoutFooter);
