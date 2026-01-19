import React, { useContext, useEffect, useState } from 'react';
import browser from 'webextension-polyfill';

import { SettingContext } from '../../context';
import registerShortcuts from '../shortcuts/shortcuts';
import Store from '../store';
import type { FancyTabMasterTreeConfig } from './fancy-tab-master-tree';
import { FancyTabMasterTree } from './fancy-tab-master-tree';
import type { TreeData, TreeNode } from './nodes/nodes';

import './style.less';

const registerBrowserEventHandlers = (tmTree: FancyTabMasterTree) => {
    // Listen for messages from background script using native browser API
    browser.runtime.onMessage.addListener((message: any) => {
        if (!message || !message.type) return;
        
        switch (message.type) {
            case 'add-tab':
                tmTree.createTab(message.data);
                break;
            case 'remove-tab':
                tmTree.removeTab(message.data.tabId);
                break;
            case 'remove-window':
                tmTree.removeWindow(message.data.windowId);
                break;
            case 'move-tab':
                const { windowId, fromIndex, toIndex, tabId } = message.data;
                tmTree.moveTab(windowId, tabId, fromIndex, toIndex);
                break;
            case 'update-tab':
                tmTree.updateTab(message.data);
                break;
            case 'activated-tab':
                tmTree.activeTab(message.data.windowId, message.data.tabId);
                break;
            case 'attach-tab':
                tmTree.attachTab(message.data.windowId, message.data.tabId, message.data.newIndex);
                break;
            case 'detach-tab':
                tmTree.detachTab(message.data.tabId);
                break;
            case 'window-focus':
                tmTree.windowFocus(message.data.windowId);
                break;
            case 'add-window':
                tmTree.createWindow(message.data);
                break;
            case 'replace-tab':
                tmTree.replaceTab(message.data.addedTabId, message.data.removedTabId);
                break;
        }
    });
    
    registerShortcuts(tmTree);
};

export interface TabMasterTreeProps extends FancyTabMasterTreeConfig {
    source?: TreeNode<TreeData>[];
    enableBrowserEventHandler?: boolean;
    onInit?: (tmTree: FancyTabMasterTree) => void;
}

export const TabMasterTree: React.FC<TabMasterTreeProps> = ({ source, onInit, ...otherProps }) => {
    let treeContainer: HTMLElement | null = null;
    const [tabMasterTree, setTabMasterTree] = useState<FancyTabMasterTree | null>(null);
    const { setting } = useContext(SettingContext);
    useEffect(() => {
        const $el = $(treeContainer!);
        const config: FancyTabMasterTreeConfig = { ...otherProps };
        const tmTree = new FancyTabMasterTree($el, config, setting);
        setTabMasterTree(tmTree);
        Store.tree = tmTree.tree;
        const loadedPromise = tmTree.initTree(source).then(() => {
            if (onInit) {
                onInit(tmTree);
            }
        });
        if (otherProps.enableBrowserEventHandler) {
            loadedPromise.then(() => {
                registerBrowserEventHandlers(tmTree);
            });
        }
    }, []);
    useEffect(() => {
        if (tabMasterTree) {
            tabMasterTree.settings = setting;
            tabMasterTree.tree.render(true, true);
        }
    }, [setting.autoScrollToActiveTab, setting.createNewTabByLevel, setting.showUrl, tabMasterTree]);

    useEffect(() => {
        if (source && tabMasterTree) {
            tabMasterTree.initTree(source);
        }
    }, [source, tabMasterTree]);

    return (
        <div className="tree-container">
            <div id="tree" ref={(el) => (treeContainer = el)} />
        </div>
    );
};

TabMasterTree.defaultProps = {
    enableBrowserEventHandler: true,
};
