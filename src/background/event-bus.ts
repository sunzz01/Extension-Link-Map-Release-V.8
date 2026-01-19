import type { DataTypeKey, GetDataType } from '@garinz/webext-bridge';
import type { JsonValue } from 'type-fest';
import browser from 'webextension-polyfill';



const EXT_HOME_PAGE_PATH = 'tree.html';

export async function sendMessageToExt<K extends DataTypeKey>(
    messageId: K,
    message: GetDataType<K, JsonValue>,
) {
    // Broadcast to ALL extension contexts (Side Panel, Popup, etc.) using native browser API
    try {
        await browser.runtime.sendMessage({
            type: messageId,
            data: message
        });
    } catch (error) {
        // Ignore: no receivers (extension page not open)
    }
}

export function isContentScriptPage(url?: string) {
    return url === browser.runtime.getURL(EXT_HOME_PAGE_PATH);
}
