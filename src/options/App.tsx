import { useEffect, useState } from 'react';
import './App.scss';

type SidePanelPosition = 'left' | 'right';

const App = () => {
    const [position, setPosition] = useState<SidePanelPosition>('right');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load saved position
        chrome.storage.local.get(['sidePanelPosition'], (result) => {
            if (result.sidePanelPosition) {
                setPosition(result.sidePanelPosition);
            }
        });
    }, []);

    const handleSave = async () => {
        await chrome.storage.local.set({ sidePanelPosition: position });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleOpenChromeSettings = () => {
        // Open Chrome appearance settings where user can change side panel position
        chrome.tabs.create({ 
            url: 'chrome://settings/appearance',
            active: true 
        });
    };

    return (
        <div className="app">
            <div className="options-container">
                <h1 className="title">Link Map Settings</h1>
                
                <div className="setting-section highlight">
                    <h2 className="section-title">🔄 Switch Side Panel Position</h2>
                    <p className="section-description">
                        Chrome controls the Side Panel position. Click the button below to open Chrome Settings.
                    </p>
                    
                    <div className="chrome-settings-box">
                        <div className="instruction-steps">
                            <div className="step">
                                <span className="step-number">1</span>
                                <span className="step-text">Click "Open Chrome Settings" button</span>
                            </div>
                            <div className="step">
                                <span className="step-number">2</span>
                                <span className="step-text">Find <strong>"Side panel position"</strong> section</span>
                            </div>
                            <div className="step">
                                <span className="step-number">3</span>
                                <span className="step-text">Choose <strong>Left</strong> or <strong>Right</strong></span>
                            </div>
                        </div>
                        
                        <button 
                            className="chrome-settings-btn"
                            onClick={handleOpenChromeSettings}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 6v6l4 2"/>
                            </svg>
                            Open Chrome Settings
                        </button>
                    </div>
                </div>

                <div className="setting-section">
                    <h2 className="section-title">Preferred Position (Reference)</h2>
                    <p className="section-description">
                        This is your preference, but actual position is controlled by Chrome
                    </p>
                    
                    <div className="position-selector">
                        <button
                            className={`position-btn ${position === 'left' ? 'active' : ''}`}
                            onClick={() => setPosition('left')}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="4" width="7" height="16" rx="1" fill="currentColor" opacity="0.8"/>
                                <rect x="12" y="4" width="9" height="16" rx="1" fill="currentColor" opacity="0.2"/>
                            </svg>
                            <span>Left</span>
                        </button>
                        
                        <button
                            className={`position-btn ${position === 'right' ? 'active' : ''}`}
                            onClick={() => setPosition('right')}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="4" width="9" height="16" rx="1" fill="currentColor" opacity="0.2"/>
                                <rect x="14" y="4" width="7" height="16" rx="1" fill="currentColor" opacity="0.8"/>
                            </svg>
                            <span>Right</span>
                        </button>
                    </div>
                    
                    <button 
                        className={`save-btn ${saved ? 'saved' : ''}`}
                        onClick={handleSave}
                    >
                        {saved ? '✓ Saved!' : 'Save Preference'}
                    </button>
                </div>

                <div className="info-section">
                    <h3>⌨️ Keyboard Shortcut</h3>
                    <p>Press <kbd>Shift</kbd> + <kbd>Ctrl</kbd> + <kbd>L</kbd> to open Side Panel</p>
                    <p className="info-note">You can customize this shortcut in <code>chrome://extensions/shortcuts</code></p>
                </div>
            </div>
        </div>
    );
};

export default App;
