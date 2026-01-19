import { merge } from 'lodash';
import React, { useEffect, useState } from 'react';

import { DEFAULT_SETTING } from '../../storage/idb';
import { SettingContext } from '../context';
import Help from './help/Help';
import OperationBar from './operation-bar/OperationBar';
import { Search } from './search/Search';
import Settings from './settings/Settings';
import store from './store';
import { TabMasterTree } from './tab-master-tree/TabMasterTree';

import '../../styles/app.less';

const App: React.FC = () => {
    const [setting, setSetting] = useState(DEFAULT_SETTING);

    // init setting in memory from indexedDB
    useEffect(() => {
        store.db.getSetting().then((setting) => {
            setting && setSetting(merge({}, DEFAULT_SETTING, setting));
        });
    }, []);

    useEffect(() => {
        const $root = $(':root');
        if (setting.theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => {
                mediaQuery.matches ? $root.attr('theme', 'dark') : $root.attr('theme', 'light');
            };
            const isDarkMode = mediaQuery.matches;
            $root.attr('theme', isDarkMode ? 'dark' : 'light');
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
            $root.attr('theme', setting.theme);
            return () => {};
        }
    }, [setting.theme]);

    useEffect(() => {
        if (setting.primaryColor) {
            document.documentElement.style.setProperty('--primary-color', setting.primaryColor);
        }
    }, [setting.primaryColor]);

    return (
        <SettingContext.Provider value={{ setting, setSetting }}>
            <div className="app">
                <div id="header">
                    <Search />
                    <Settings />
                </div>
                <OperationBar />
                <TabMasterTree />
                <div id="footer">
                </div>
                <Help />
            </div>
        </SettingContext.Provider>
    );
};

export default App;
