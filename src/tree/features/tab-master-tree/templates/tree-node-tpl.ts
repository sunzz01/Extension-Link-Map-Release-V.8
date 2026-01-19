import { escape } from 'lodash';
import log from 'loglevel';
import Mustache from 'mustache';

export enum TPL_CONSTANTS {
    TYPE_ATTR = 'zt-type',
    NODE_ITEM = 'node-item',
    NODE_KEY = 'node-key',
    NODE_CLOSE = 'node-close',
    NODE_EDIT = 'node-edit',
    NODE_REMOVE = 'node-remove',
    NODE_MUTE_TOGGLE = 'node-mute-toggle',
}

const {
    TYPE_ATTR,
    NODE_CLOSE,
    NODE_KEY,
    NODE_EDIT,
    NODE_ITEM,
    NODE_REMOVE,
    NODE_MUTE_TOGGLE,
} = TPL_CONSTANTS;

export class TreeNodeTpl {
    /** 按钮组HTML结构 */
    static BUTTON_GROUP = `<span class="zt-node-button-group">
        <span class="iconfont icon-edit zt-node-btn edit-alias" ${TYPE_ATTR}="${NODE_EDIT}" ${NODE_KEY}="{{key}}"></span>
        <span class="iconfont icon-roundclosefill zt-node-btn close" ${TYPE_ATTR}="${NODE_CLOSE}" ${NODE_KEY}="{{key}}"></span>
        <span class="iconfont icon-trash zt-node-btn remove" ${TYPE_ATTR}="${NODE_REMOVE}" ${NODE_KEY}="{{key}}"></span>
    </span>`;

    /** Node HTML结构 */
    static TEMPLATE = `<span class="zt-node {{nodeType}} {{closedClass}}" ${TYPE_ATTR}="${NODE_ITEM}" ${NODE_KEY}="{{key}}">
            {{#audible?}}
                <span class="audio-indicator {{#muted?}}muted{{/muted?}}" ${TYPE_ATTR}="${NODE_MUTE_TOGGLE}" ${NODE_KEY}="{{key}}" title="Click to mute/unmute">
                    <svg class="speaker-icon" viewBox="0 0 24 24">
                        <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-4 0h-2.5l-5 5v7.5h5l5 5v-17.5z"/>
                    </svg>
                    <span class="speaker-wave"></span>
                </span>
            {{/audible?}}
            {{#alias}}
                <span class="zt-node-alias">{{{alias}}}</span>
            {{/alias}}
            {{#titleAndAlis?}}<span class="zt-node-splitter"> | </span>{{/titleAndAlis?}}
            {{#title}}
            <span class="zt-node-title {{aliasClass}}">{{{title}}}{{#closedWindow?}}(closed){{/closedWindow?}}</span>
            {{/title}}
            {{#showUrl?}}
            <span class="zt-node-url" style="color:#1e88e5; margin-left:8px; font-size:0.85em; opacity:0.9;"> l {{url}}</span>
            {{/showUrl?}}
        {{#buttonGroup?}}
            {{> buttonGroup}}
        {{/buttonGroup?}}
    </span>`;

    /** rendered mustache html */
    public html: string;

    constructor(node: Fancytree.FancytreeNode, enableButtonGroup = true, showUrl = false) {
        const { key, title, data } = node;
        const {
            closed,
            windowType,
            alias,
            nodeType,
            aliasWithHighlight,
            titleWithHighlight,
            url,
            audible,
            mutedInfo,
        } = data;
        if (windowType) log.debug(key, closed);
        this.html = Mustache.render(
            TreeNodeTpl.TEMPLATE,
            {
                key,
                'title': titleWithHighlight ?? escape(title),
                'alias': aliasWithHighlight ?? escape(alias),
                nodeType,
                'url': url,
                'aliasClass': alias ? 'alias' : '',
                'buttonGroup?': enableButtonGroup && title !== 'pending', // pending节点不显示按钮组
                'closedWindow?': closed && windowType, // closed window节点显示(closed)
                'closedClass': closed ? 'closed' : '',
                'titleAndAlis?': title && alias,
                'showUrl?': showUrl && url && nodeType === 'tab', // Show URL only for tabs and if enabled
                'audible?': audible && !mutedInfo?.muted,
                'muted?': mutedInfo?.muted,
            },
            { buttonGroup: TreeNodeTpl.BUTTON_GROUP },
        );
    }
}

Mustache.parse(TreeNodeTpl.TEMPLATE);
Mustache.parse(TreeNodeTpl.BUTTON_GROUP);

export default TreeNodeTpl;
