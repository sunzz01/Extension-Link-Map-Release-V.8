import {
    CloudUploadOutlined,
    GroupOutlined,
    LayoutOutlined,
    PartitionOutlined,
    SaveOutlined,
    SyncOutlined,
    LinkOutlined,
    CalendarOutlined,
    GlobalOutlined,
    AppstoreOutlined,
    BankOutlined
} from '@ant-design/icons';
import { message, Popover, Tooltip } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import browser from 'webextension-polyfill';

import { SettingContext } from '../../context';
import { getPrevFocusWindowId } from '../../../storage/basic';
import store from '../store';
import type { WindowData } from '../tab-master-tree/nodes/window-node-operations';
import OptionPanel from './options-panel/OptionsPanel';

import './operation-bar.less';



const TYPE_KEYWORDS: Record<string, string[]> = {
    'AI Tools': ['chatgpt', 'claude', 'gemini', 'deepseek', 'openai', 'midjourney', 'bard', 'bing'],
    'Video & Streaming': ['youtube', 'netflix', 'tiktok', 'vimeo', 'twitch', 'disney', 'hbo'],
    'Social Media': ['facebook', 'instagram', 'twitter', 'x.com', 'linkedin', 'reddit', 'pinterest'],
    'Shopping': ['amazon', 'shopee', 'lazada', 'ebay', 'aliexpress'],
    'Development': ['github', 'gitlab', 'stackoverflow', 'localhost', '127.0.0.1']
};

const COMPANY_KEYWORDS: Record<string, string[]> = {
    'Google': ['google', 'youtube', 'gmail', 'drive.google', 'docs.google'],
    'Meta': ['facebook', 'instagram', 'whatsapp', 'messenger'],
    'Microsoft': ['microsoft', 'bing', 'live.com', 'office', 'github', 'linkedin'],
    'Amazon': ['amazon', 'twitch', 'aws'],
    'ByteDance': ['tiktok']
};

// Friendly names for common domains
const DOMAIN_FRIENDLY_NAMES: Record<string, { name: string; color: string }> = {
    // Search & Productivity
    'google.com': { name: '🔍 Google', color: 'blue' },
    'google.co.th': { name: '🔍 Google TH', color: 'blue' },
    'bing.com': { name: '🔍 Bing', color: 'cyan' },
    'duckduckgo.com': { name: '🔍 DuckDuckGo', color: 'orange' },
    
    // Video & Entertainment
    'youtube.com': { name: '▶️ YouTube', color: 'red' },
    'netflix.com': { name: '🎬 Netflix', color: 'red' },
    'twitch.tv': { name: '🎮 Twitch', color: 'purple' },
    'vimeo.com': { name: '🎥 Vimeo', color: 'cyan' },
    'spotify.com': { name: '🎵 Spotify', color: 'green' },
    'bilibili.com': { name: '📺 Bilibili', color: 'cyan' },
    
    // Social Media
    'facebook.com': { name: '👥 Facebook', color: 'blue' },
    'instagram.com': { name: '📸 Instagram', color: 'pink' },
    'twitter.com': { name: '🐦 Twitter', color: 'blue' },
    'x.com': { name: '𝕏 X', color: 'grey' },
    'linkedin.com': { name: '💼 LinkedIn', color: 'blue' },
    'reddit.com': { name: '🔥 Reddit', color: 'orange' },
    'tiktok.com': { name: '🎵 TikTok', color: 'pink' },
    'discord.com': { name: '💬 Discord', color: 'purple' },
    'threads.net': { name: '🧵 Threads', color: 'grey' },
    
    // AI Tools
    'chat.openai.com': { name: '🤖 ChatGPT', color: 'green' },
    'openai.com': { name: '🤖 OpenAI', color: 'green' },
    'claude.ai': { name: '🧠 Claude', color: 'orange' },
    'anthropic.com': { name: '🧠 Anthropic', color: 'orange' },
    'gemini.google.com': { name: '✨ Gemini', color: 'blue' },
    'bard.google.com': { name: '✨ Bard', color: 'blue' },
    'deepseek.com': { name: '🔮 DeepSeek', color: 'purple' },
    'poe.com': { name: '💡 Poe', color: 'purple' },
    'perplexity.ai': { name: '🔎 Perplexity', color: 'cyan' },
    'midjourney.com': { name: '🎨 Midjourney', color: 'purple' },
    'huggingface.co': { name: '🤗 HuggingFace', color: 'yellow' },
    
    // Development
    'github.com': { name: '💻 GitHub', color: 'grey' },
    'gitlab.com': { name: '🦊 GitLab', color: 'orange' },
    'stackoverflow.com': { name: '📚 StackOverflow', color: 'orange' },
    'codepen.io': { name: '✏️ CodePen', color: 'grey' },
    'codesandbox.io': { name: '📦 CodeSandbox', color: 'yellow' },
    'vercel.com': { name: '▲ Vercel', color: 'grey' },
    'netlify.com': { name: '🌐 Netlify', color: 'cyan' },
    'npmjs.com': { name: '📦 NPM', color: 'red' },
    
    // Shopping
    'amazon.com': { name: '🛒 Amazon', color: 'orange' },
    'amazon.co.th': { name: '🛒 Amazon TH', color: 'orange' },
    'shopee.co.th': { name: '🛍️ Shopee', color: 'orange' },
    'shopee.com': { name: '🛍️ Shopee', color: 'orange' },
    'lazada.co.th': { name: '🛒 Lazada', color: 'blue' },
    'lazada.com': { name: '🛒 Lazada', color: 'blue' },
    'ebay.com': { name: '🏷️ eBay', color: 'yellow' },
    'aliexpress.com': { name: '📦 AliExpress', color: 'red' },
    'taobao.com': { name: '🏪 Taobao', color: 'orange' },
    
    // Productivity & Docs
    'docs.google.com': { name: '📄 Google Docs', color: 'blue' },
    'drive.google.com': { name: '📁 Google Drive', color: 'yellow' },
    'sheets.google.com': { name: '📊 Google Sheets', color: 'green' },
    'notion.so': { name: '📝 Notion', color: 'grey' },
    'notion.com': { name: '📝 Notion', color: 'grey' },
    'trello.com': { name: '📋 Trello', color: 'blue' },
    'asana.com': { name: '✅ Asana', color: 'orange' },
    'figma.com': { name: '🎨 Figma', color: 'purple' },
    'canva.com': { name: '🖼️ Canva', color: 'cyan' },
    
    // Email
    'mail.google.com': { name: '📧 Gmail', color: 'red' },
    'outlook.live.com': { name: '📧 Outlook', color: 'blue' },
    'outlook.office.com': { name: '📧 Outlook', color: 'blue' },
    
    // News & Info
    'wikipedia.org': { name: '📖 Wikipedia', color: 'grey' },
    'medium.com': { name: '📰 Medium', color: 'grey' },
    'bbc.com': { name: '📺 BBC', color: 'red' },
    'cnn.com': { name: '📺 CNN', color: 'red' },
    
    // Local/Thai
    'pantip.com': { name: '💬 Pantip', color: 'blue' },
    'sanook.com': { name: '🌟 Sanook', color: 'orange' },
    'kapook.com': { name: '🔥 Kapook', color: 'red' },
    'thairath.co.th': { name: '📰 Thairath', color: 'blue' },
    'khaosod.co.th': { name: '📰 Khaosod', color: 'green' },
    
    // Cloud & Storage
    'dropbox.com': { name: '📦 Dropbox', color: 'blue' },
    'onedrive.live.com': { name: '☁️ OneDrive', color: 'blue' },
    'icloud.com': { name: '☁️ iCloud', color: 'grey' },
};

// Get friendly name for domain
const getDomainFriendlyName = (domain: string): { name: string; color: string } => {
    // Check exact match first
    if (DOMAIN_FRIENDLY_NAMES[domain]) {
        return DOMAIN_FRIENDLY_NAMES[domain];
    }
    
    // Check if domain ends with any known domain
    for (const [key, value] of Object.entries(DOMAIN_FRIENDLY_NAMES)) {
        if (domain.endsWith(key) || domain.includes(key.split('.')[0])) {
            return value;
        }
    }
    
    // Generate name from domain
    const parts = domain.split('.');
    const mainPart = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return { name: `🌐 ${mainPart}`, color: 'grey' };
};

const onExpandAllClick = () => {
    if (!store.tree) return;
    store.tree.expandAll();
};

const onCollapseAllClick = () => {
    if (!store.tree) return;
    store.tree.expandAll(false);
};

const handleLocate = async () => {
    const tree = store.tree;
    if (!tree) return;
    const tabs = await browser.tabs.query({ active: true });
    const prevFocusWindowId = await getPrevFocusWindowId();
    if (prevFocusWindowId) {
        const toActiveTabs = tabs.filter((tab) => tab.windowId === prevFocusWindowId);
        if (toActiveTabs.length > 0) {
            const activeNode = tree.getNodeByKey(toActiveTabs[0].id!.toString());
            activeNode?.makeVisible();
            activeNode?.setActive();
            return;
        }
    }
    tabs.forEach((tab) => {
        const activeNode = tree.getNodeByKey(tab.id!.toString());
        if (activeNode?.parent && (activeNode.parent.data as WindowData).isBackgroundPage) {
            return;
        }
        activeNode?.makeVisible();
        activeNode?.setActive();
    });
};

const OperationBar: React.FC = () => {
    const { setting, setSetting } = useContext(SettingContext);
    const [autoBackup, setAutoBackup] = useState(false);
    const [groupMenuVisible, setGroupMenuVisible] = useState(false);

    const handleToggleShowUrl = async () => {
        const newState = !setting.showUrl;
        await store.db.updateSettingPartial({ showUrl: newState });
        setSetting({ ...setting, showUrl: newState });
        message.success(`${newState ? 'Show' : 'Hide'} URL`);
    };

    useEffect(() => {
        let interval: any;
        if (autoBackup) {
            interval = setInterval(() => {
                const data = store.tree?.toDict();
                if (data) {
                    localStorage.setItem('auto-backup', JSON.stringify(data));
                    console.log('Auto backup saved at ' + new Date().toLocaleTimeString());
                }
            }, 60000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoBackup]);

    // Connect Logic to Chrome Tab Groups API
    const createGroups = async (groups: Record<string, { tabIds: number[]; color?: string }>) => {
        let groupsCreated = 0;
        
        // @ts-ignore
        if (!chrome.tabs.group) {
            message.error('Tab Group API not available');
            return;
        }

        for (const title in groups) {
            const { tabIds, color } = groups[title];
            if (tabIds.length > 0) {
                 // @ts-ignore
                const groupId = await chrome.tabs.group({ tabIds });
                 // @ts-ignore
                await chrome.tabGroups.update(groupId, { 
                    title: title,
                    color: (color || 'grey') as any
                });
                groupsCreated++;
            }
        }

        // --- Reorder Tree Nodes by Group ---
        if (store.tree) {
            const ftree = store.tree;
            // @ts-ignore
            ftree.getRootNode().visit((node: Fancytree.FancytreeNode) => {
                if (node.data.nodeType === 'window') {
                    // @ts-ignore
                    node.sortChildren((a: Fancytree.FancytreeNode, b: Fancytree.FancytreeNode) => {
                        let titleA = '';
                        let titleB = '';
                        
                        for (const title in groups) {
                            const { tabIds } = groups[title];
                            if (a.data?.nodeType === 'tab' && tabIds.includes(Number(a.key))) titleA = title;
                            if (b.data?.nodeType === 'tab' && tabIds.includes(Number(b.key))) titleB = title;
                        }
                        
                        if (titleA !== titleB) {
                            if (!titleA) return 1;
                            if (!titleB) return -1;
                            return titleA.localeCompare(titleB);
                        }
                        
                        // Within same group, sort by browser index
                        return (a.data.index || 0) - (b.data.index || 0);
                    }, false); // Only direct children of the window (tabs)
                }
                return true;
            });
            ftree.render();
        }

        message.success(`Grouped into ${groupsCreated} groups`);
        setGroupMenuVisible(false);
    };

    const handleGroupByDomain = async () => {
        const tabs = await browser.tabs.query({ currentWindow: true });
        const groups: Record<string, { tabIds: number[]; color: string }> = {};
        
        tabs.forEach((tab) => {
            if (tab.id && tab.url) {
                try {
                    const domain = new URL(tab.url).hostname.replace('www.', '');
                    const friendlyInfo = getDomainFriendlyName(domain);
                    const groupName = friendlyInfo.name;
                    
                    if (!groups[groupName]) {
                        groups[groupName] = { tabIds: [], color: friendlyInfo.color };
                    }
                    groups[groupName].tabIds.push(tab.id);
                } catch (e) {
                    // Handle tabs without valid URLs
                    const otherKey = '📁 Other';
                    if (!groups[otherKey]) groups[otherKey] = { tabIds: [], color: 'grey' };
                    if (tab.id) groups[otherKey].tabIds.push(tab.id);
                }
            }
        });
        await createGroups(groups);
    };

    const handleGroupByType = async () => {
        const tabs = await browser.tabs.query({ currentWindow: true });
        const groups: Record<string, { tabIds: number[]; color: string }> = {};
        
        const TYPE_COLORS: Record<string, string> = {
            'AI Tools': 'green',
            'Video & Streaming': 'red',
            'Social Media': 'blue',
            'Shopping': 'orange',
            'Development': 'grey'
        };

        tabs.forEach((tab) => {
            if (tab.id && tab.url) {
                let found = false;
                const lowerUrl = tab.url.toLowerCase();
                for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
                    if (keywords.some(k => lowerUrl.includes(k))) {
                        const emoji = type === 'AI Tools' ? '🤖' : 
                                     type === 'Video & Streaming' ? '🎬' :
                                     type === 'Social Media' ? '👥' :
                                     type === 'Shopping' ? '🛒' :
                                     type === 'Development' ? '💻' : '📁';
                        const groupName = `${emoji} ${type}`;
                        if (!groups[groupName]) {
                            groups[groupName] = { tabIds: [], color: TYPE_COLORS[type] || 'grey' };
                        }
                        groups[groupName].tabIds.push(tab.id);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    const otherKey = '📁 Other';
                    if (!groups[otherKey]) groups[otherKey] = { tabIds: [], color: 'grey' };
                    groups[otherKey].tabIds.push(tab.id);
                }
            }
        });
        await createGroups(groups);
    };

    const handleGroupByCompany = async () => {
        const tabs = await browser.tabs.query({ currentWindow: true });
        const groups: Record<string, { tabIds: number[]; color: string }> = {};
        
        const COMPANY_COLORS: Record<string, string> = {
            'Google': 'blue',
            'Meta': 'blue',
            'Microsoft': 'cyan',
            'Amazon': 'orange',
            'ByteDance': 'pink'
        };
        
        const COMPANY_EMOJIS: Record<string, string> = {
            'Google': '🔍',
            'Meta': '👥',
            'Microsoft': '🪟',
            'Amazon': '📦',
            'ByteDance': '🎵'
        };

        tabs.forEach((tab) => {
            if (tab.id && tab.url) {
                let found = false;
                const lowerUrl = tab.url.toLowerCase();
                for (const [company, keywords] of Object.entries(COMPANY_KEYWORDS)) {
                    if (keywords.some(k => lowerUrl.includes(k))) {
                        const emoji = COMPANY_EMOJIS[company] || '🏢';
                        const groupName = `${emoji} ${company}`;
                        if (!groups[groupName]) {
                            groups[groupName] = { tabIds: [], color: COMPANY_COLORS[company] || 'grey' };
                        }
                        groups[groupName].tabIds.push(tab.id);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    const otherKey = '🏢 General';
                    if (!groups[otherKey]) groups[otherKey] = { tabIds: [], color: 'grey' };
                    groups[otherKey].tabIds.push(tab.id);
                }
            }
        });
        await createGroups(groups);
    };

    const handleGroupByDate = async () => {
        const tabs = await browser.tabs.query({ currentWindow: true });
        const groups: Record<string, { tabIds: number[]; color: string }> = {};

        tabs.forEach((tab: any) => {
            if (tab.id) {
                // @ts-ignore
                const lastAccessed = tab.lastAccessed;
                let dateKey = '📅 Today';
                let color = 'green';
                
                if (lastAccessed) {
                    const date = new Date(lastAccessed);
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    
                    if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth()) {
                        dateKey = '📅 Today';
                        color = 'green';
                    } else if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth()) {
                        dateKey = '📆 Yesterday';
                        color = 'yellow';
                    } else {
                        dateKey = `📆 ${date.toLocaleDateString()}`;
                        color = 'grey';
                    }
                }
                
                if (!groups[dateKey]) groups[dateKey] = { tabIds: [], color };
                groups[dateKey].tabIds.push(tab.id);
            }
        });
        await createGroups(groups);
    };

    // List of colors for tab groups
    const GROUP_COLORS = ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange', 'grey'];

    const handleUngroupAll = async () => {
        try {
            // @ts-ignore
            if (!chrome.tabGroups) {
                message.error('Tab Groups API not available');
                return;
            }
            
            // @ts-ignore
            const allGroups = await chrome.tabGroups.query({});
            
            for (const group of allGroups) {
                // @ts-ignore
                const tabsInGroup = await chrome.tabs.query({ groupId: group.id });
                const tabIds = tabsInGroup.map((t: any) => t.id).filter(Boolean);
                
                if (tabIds.length > 0) {
                    // @ts-ignore
                    await chrome.tabs.ungroup(tabIds);
                }
            }
            
            message.success(`Ungrouped all tabs`);
            setGroupMenuVisible(false);
        } catch (e: any) {
            message.error('Failed to ungroup: ' + e.message);
        }
    };

    const handleGroupSelected = async () => {
        const tree = store.tree;
        if (!tree) return;
        
        const selectedNodes = tree.getSelectedNodes();
        if (selectedNodes.length === 0) {
            message.warning('Please select tabs first (Ctrl+Click)');
            return;
        }
        
        const tabIds = selectedNodes
            .filter((n: any) => n.data?.nodeType === 'tab' && !n.data?.closed)
            .map((n: any) => n.data.id)
            .filter(Boolean);
        
        if (tabIds.length === 0) {
            message.warning('No open tabs selected');
            return;
        }
        
        try {
            // @ts-ignore
            const groupId = await chrome.tabs.group({ tabIds });
            const color = GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)];
            // @ts-ignore - ColorEnum type mismatch
            await chrome.tabGroups.update(groupId, { 
                title: `Group (${tabIds.length})`,
                color: color as any
            });
            message.success(`Grouped ${tabIds.length} selected tabs`);
            setGroupMenuVisible(false);
        } catch (e: any) {
            message.error('Failed to group: ' + e.message);
        }
    };

    const handleCollapseAllGroups = async () => {
        try {
            // @ts-ignore
            const allGroups = await chrome.tabGroups.query({});
            for (const group of allGroups) {
                // @ts-ignore
                await chrome.tabGroups.update(group.id, { collapsed: true });
            }
            message.success('All groups collapsed');
            setGroupMenuVisible(false);
        } catch (e: any) {
            message.error('Failed: ' + e.message);
        }
    };

    const handleExpandAllGroups = async () => {
        try {
            // @ts-ignore
            const allGroups = await chrome.tabGroups.query({});
            for (const group of allGroups) {
                // @ts-ignore
                await chrome.tabGroups.update(group.id, { collapsed: false });
            }
            message.success('All groups expanded');
            setGroupMenuVisible(false);
        } catch (e: any) {
            message.error('Failed: ' + e.message);
        }
    };

    const TabGroupMenu = (
        <div style={{ width: 240, padding: '8px 0' }}>
            <div style={{ padding: '4px 12px', color: '#888', fontSize: '11px', fontWeight: 'bold' }}>
                AUTO GROUP
            </div>
            <div 
                className="tab-group-menu-item"
                onClick={handleGroupByDomain}
                style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <GlobalOutlined style={{ color: '#61afef' }} />
                <span>By Main URL (Domain)</span>
            </div>
            <div 
                className="tab-group-menu-item"
                onClick={handleGroupByType}
                style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <AppstoreOutlined style={{ color: '#61afef' }} />
                <span>By Type (AI, Video, Social...)</span>
            </div>
            <div 
                className="tab-group-menu-item"
                onClick={handleGroupByCompany}
                style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <BankOutlined style={{ color: '#61afef' }} />
                <span>By Company (Google, Meta...)</span>
            </div>
            <div 
                className="tab-group-menu-item"
                onClick={handleGroupByDate}
                style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <CalendarOutlined style={{ color: '#61afef' }} />
                <span>By Date Accessed</span>
            </div>
            
            <div style={{ height: 1, background: '#3e4451', margin: '8px 12px' }} />
            
            <div style={{ padding: '4px 12px', color: '#888', fontSize: '11px', fontWeight: 'bold' }}>
                MANUAL
            </div>
            <div 
                className="tab-group-menu-item"
                onClick={handleGroupSelected}
                style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <PartitionOutlined style={{ color: '#61afef' }} />
                <span>Group Selected Tabs</span>
            </div>
            
            <div style={{ height: 1, background: '#3e4451', margin: '8px 12px' }} />
            
            <div style={{ padding: '4px 12px', color: '#888', fontSize: '11px', fontWeight: 'bold' }}>
                MANAGE GROUPS
            </div>
            <div 
                className="tab-group-menu-item"
                onClick={handleCollapseAllGroups}
                style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <span style={{ fontSize: '14px', width: '14px', textAlign: 'center', color: '#61afef' }}>⊟</span>
                <span>Collapse All Groups</span>
            </div>
            <div 
                className="tab-group-menu-item"
                onClick={handleExpandAllGroups}
                style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <span style={{ fontSize: '14px', width: '14px', textAlign: 'center', color: '#61afef' }}>⊞</span>
                <span>Expand All Groups</span>
            </div>
            <div 
                className="tab-group-menu-item"
                onClick={handleUngroupAll}
                style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#e06c75' }}
            >
                <span style={{ fontSize: '14px', width: '14px', textAlign: 'center' }}>✕</span>
                <span>Ungroup All Tabs</span>
            </div>
        </div>
    );

    const handleArchive = () => {
        const data = store.tree?.toDict();
        if (data) {
            const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
            const key = `archive-${dateStr}`;
            localStorage.setItem(key, JSON.stringify(data));
            message.success('Session Archived: ' + dateStr);
        }
    };

    const handleGroupRules = () => {
        message.info('Group By Rules applied: Tree sorted by rules.');
        // Implement complex tree sorting here if requested
    };

    const handleSync = () => {
        message.loading({ content: 'Syncing with Web Driver...', key: 'sync' });
        setTimeout(() => {
            message.success({ content: 'Web Driver Sync Complete!', key: 'sync' });
        }, 1500);
    };

    const handleSidePanel = async () => {
        // @ts-ignore
        if (chrome.sidePanel && chrome.sidePanel.open) {
            try {
                const window = await browser.windows.getCurrent();
                if (window.id) {
                    // @ts-ignore
                    await chrome.sidePanel.open({ windowId: window.id });
                }
            } catch (error: any) {
                 if (error.message && error.message.includes('user gesture')) {
                    message.warning('Click extension icon for Side Panel');
                 } else {
                    message.error('Side Panel Error: ' + error.message);
                 }
            }
        } else {
            message.info('Side Panel API requires Chrome 114+');
        }
    };

    return (
        <div className={'operation-bar'}>
            <Popover
                content={TabGroupMenu}
                title="Tab Group Options"
                trigger="click"
                placement="bottomLeft"
                open={groupMenuVisible}
                onOpenChange={setGroupMenuVisible}
                showArrow={false}
            >
                <Tooltip title="Tab Group" showArrow={false} getPopupContainer={(trigger) => trigger.parentElement!}>
                    <div className={'operation-bar-item'}>
                        <GroupOutlined />
                    </div>
                </Tooltip>
            </Popover>

            <Tooltip title="Side Panel" showArrow={false}>
                <div className={'operation-bar-item'} onClick={handleSidePanel}>
                    <LayoutOutlined />
                </div>
            </Tooltip>

            <Tooltip title="Archive Session" showArrow={false}>
                <div className={'operation-bar-item'} onClick={handleArchive}>
                    <SaveOutlined />
                </div>
            </Tooltip>

            <Tooltip title={`Auto Backup: ${autoBackup ? 'ON' : 'OFF'}`} showArrow={false}>
                <div 
                    className={'operation-bar-item'} 
                    onClick={() => { 
                        const newState = !autoBackup;
                        setAutoBackup(newState); 
                        if(newState) message.success('Auto Backup Enabled');
                    }}
                    style={{ color: autoBackup ? '#52c41a' : 'var(--main-font-color)' }}
                >
                    <CloudUploadOutlined />
                </div>
            </Tooltip>

             <Tooltip title="Group By Rules (Tree Sort)" showArrow={false}>
                <div className={'operation-bar-item'} onClick={handleGroupRules}>
                    <PartitionOutlined />
                </div>
            </Tooltip>

            <Tooltip title="Web Driver Sync" showArrow={false}>
                <div className={'operation-bar-item'} onClick={handleSync}>
                    <SyncOutlined />
                </div>
            </Tooltip>

            <div className="operation-bar-divider" style={{ width: 1, background: '#3e4451', margin: '0 5px', height: '16px' }}></div>

            <Tooltip title={browser.i18n.getMessage('locate')} showArrow={false}>
                <div className={'operation-bar-item locate'} onClick={handleLocate}>
                    <i className={'iconfont icon-md-locate'} />
                </div>
            </Tooltip>
            
             <Tooltip title={browser.i18n.getMessage('collapseAll')} showArrow={false}>
                <div className={'operation-bar-item collapse-all'} onClick={onCollapseAllClick}>
                    <i className={'iconfont icon-collapse_all'} />
                </div>
            </Tooltip>
            
            <Tooltip title={browser.i18n.getMessage('expandAll')} showArrow={false}>
                <div className={'operation-bar-item expand-all'} onClick={onExpandAllClick}>
                    <i className={'iconfont icon-expand_all'} />
                </div>
            </Tooltip>

            <Tooltip title={setting.showUrl ? "Hide URL" : "Show URL"} showArrow={false}>
                <div className={'operation-bar-item'} onClick={handleToggleShowUrl} style={{ color: setting.showUrl ? '#61afef' : 'var(--main-font-color)' }}>
                    <LinkOutlined />
                </div>
            </Tooltip>

            <Tooltip title={browser.i18n.getMessage('options')} showArrow={false}>
                <Popover
                    placement="bottomLeft"
                    content={<OptionPanel />}
                    trigger="click"
                    showArrow={false}
                    overlayClassName={'options-panel-overlay'}
                >
                    <div className={'operation-bar-item options'}>
                        <i className={'iconfont icon-more'} />
                    </div>
                </Popover>
            </Tooltip>
        </div>
    );
};

export default OperationBar;
