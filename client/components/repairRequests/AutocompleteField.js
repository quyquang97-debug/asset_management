import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
    wrapper: { position: 'relative' },
    dropdown: {
        position: 'absolute',
        zIndex: 1300,
        width: '100%',
        maxHeight: 240,
        overflowY: 'auto',
    },
}));

/**
 * Autocomplete input field. Calls fetchSuggestions on each keystroke >= 1 char.
 * Rejects free-text: on blur without selection, clears value and calls onSelect(null).
 *
 * @param {object} props
 * @returns {React.ReactElement}
 */
const AutocompleteField = ({
    label,
    fetchSuggestions,
    displayFormat,
    onSelect,
    onInputChange,
    value,
    error,
    disabled
}) => {
    const classes = useStyles();
    const [inputText, setInputText] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        setInputText(value || '');
        if (!value) {
            setSelectedId(null);
        }
    }, [value]);

    const handleChange = (e) => {
        const text = e.target.value;
        setInputText(text);
        if (onInputChange) {
            onInputChange(text);
        }
        setSelectedId(null);
        onSelect(null);
        if (text.length >= 1) {
            fetchSuggestions(text)
                .then((res) => {
                    const items = res.data.data || [];
                    setSuggestions(items);
                    setOpen(items.length > 0);
                })
                .catch(() => {
                    setSuggestions([]);
                    setOpen(false);
                });
        } else {
            setSuggestions([]);
            setOpen(false);
        }
    };

    const handleSelect = (item) => {
        const display = displayFormat(item);
        setInputText(display);
        if (onInputChange) {
            onInputChange(display);
        }
        setSelectedId(item.id);
        onSelect(item.id, display, item);
        setOpen(false);
        setSuggestions([]);
    };

    const handleBlur = () => {
        // Delay to allow ListItem click to fire first
        setTimeout(() => {
            if (!selectedId) {
                setInputText('');
                if (onInputChange) {
                    onInputChange('');
                }
                onSelect(null);
            }
            setOpen(false);
        }, 150);
    };

    return (
        <div className={classes.wrapper} ref={wrapperRef}>
            <TextField
                label={label}
                value={inputText}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(error)}
                helperText={error || ''}
                fullWidth
                disabled={disabled}
                inputProps={{ autoComplete: 'off' }}
            />
            {open && (
                <Paper className={classes.dropdown} elevation={4}>
                    <List dense>
                        {suggestions.map((item) => (
                            <ListItem
                                button
                                key={item.id}
                                onMouseDown={() => handleSelect(item)}
                            >
                                <ListItemText primary={displayFormat(item)} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
        </div>
    );
};

AutocompleteField.propTypes = {
    label: PropTypes.string.isRequired,
    fetchSuggestions: PropTypes.func.isRequired,
    displayFormat: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onInputChange: PropTypes.func,
    value: PropTypes.string,
    error: PropTypes.string,
    disabled: PropTypes.bool,
};

AutocompleteField.defaultProps = {
    value: '',
    error: '',
    disabled: false,
    onInputChange: null,
};

export default AutocompleteField;
