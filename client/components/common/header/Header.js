import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import i18n from '../../../i18n';
import * as authService from '../../../services/authService';

const drawerWidth = 250;

const LANGUAGES = [
    { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'ja', flag: '🇯🇵', label: '日本語' },
];

const styles = theme => ({
    appBar: {
        position: 'absolute',
        zIndex: theme.zIndex.navDrawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginLeft: 45,
    },
    menuButtonShift: {
        marginLeft: -15,
    },
    flex: {
        flex: 1,
    },
    langButton: {
        color: 'inherit',
        textTransform: 'none',
        marginRight: 8,
        fontSize: 14,
    },
    langFlag: {
        fontSize: 18,
        marginRight: 6,
        lineHeight: 1,
    },
    menuItemFlag: {
        fontSize: 18,
        marginRight: 10,
        lineHeight: 1,
    },
    menuItemSelected: {
        fontWeight: 700,
    },
});

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentLang: i18n.language || 'vi',
            anchorEl: null,
        };
        this.handleLanguageChanged = this.handleLanguageChanged.bind(this);
    }

    componentDidMount() {
        i18n.on('languageChanged', this.handleLanguageChanged);
    }

    componentWillUnmount() {
        i18n.off('languageChanged', this.handleLanguageChanged);
    }

    handleLanguageChanged(lng) {
        this.setState({ currentLang: lng });
    }

    openMenu(e) {
        this.setState({ anchorEl: e.currentTarget });
    }

    closeMenu() {
        this.setState({ anchorEl: null });
    }

    selectLanguage(code) {
        i18n.changeLanguage(code);
        this.setState({ anchorEl: null });
    }

    logOut(e) {
        e.preventDefault();
        this.props.actions.logout();
    }

    render() {
        const { classes, navDrawerOpen, handleToggleDrawer } = this.props;
        const { currentLang, anchorEl } = this.state;
        const current = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

        return (
            <div>
                <AppBar className={classNames(classes.appBar, navDrawerOpen && classes.appBarShift)}>
                    <Toolbar>
                        <IconButton
                            aria-label="Menu"
                            onClick={handleToggleDrawer}
                            className={classNames(
                                !navDrawerOpen && classes.menuButton,
                                navDrawerOpen && classes.menuButtonShift
                            )}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography type="title" color="inherit" className={classes.flex} />

                        {/* Language dropdown */}
                        <Button
                            className={classes.langButton}
                            onClick={this.openMenu.bind(this)}
                            aria-owns={anchorEl ? 'lang-menu' : undefined}
                            aria-haspopup="true"
                        >
                            <span className={classes.langFlag}>{current.flag}</span>
                            {current.label}
                            <ExpandMoreIcon fontSize="small" style={{ marginLeft: 2 }} />
                        </Button>
                        <Menu
                            id="lang-menu"
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={this.closeMenu.bind(this)}
                            getContentAnchorEl={null}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            {LANGUAGES.map(({ code, flag, label }) => (
                                <MenuItem
                                    key={code}
                                    selected={code === currentLang}
                                    onClick={() => this.selectLanguage(code)}
                                    className={code === currentLang ? classes.menuItemSelected : ''}
                                >
                                    <span className={classes.menuItemFlag}>{flag}</span>
                                    {label}
                                </MenuItem>
                            ))}
                        </Menu>

                        <Button color="inherit" onClick={this.logOut.bind(this)}>Logout</Button>
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

Header.propTypes = {
    classes: PropTypes.object.isRequired,
};

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(Object.assign({}, authService), dispatch),
});

export default connect(null, mapDispatchToProps)(withStyles(styles)(Header));
