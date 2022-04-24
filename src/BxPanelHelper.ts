/**
 * Контроллер для дополнительных функций панели bitrix
 */
export default class BxPanelHelper {
    options = <any>{
        transitTime: 500,
        transitClass: 'bx-panel-helper--transit',
        visibleClass: 'bx-panel-helper--visible',
        visibleKey: 'bx-panel-helper.visible',
        toggle: '.bx-panel-helper__toggle',
        repeatReloadCount: 4,
        repeatReloadTimeout: 5000,
    };

    element: HTMLElement;
    toggle: HTMLElement;
    toggleRight: HTMLElement;
    repeatReloadCounter: number = 0;
    repeatReloadTimer?: number;

    constructor(el: HTMLElement) {
        this.element = el;

        this.toggle = document.createElement('a');
        this.toggle.classList.add(this.options.toggle.substr(1));
        this.toggle.setAttribute('href', 'javascript:void(0)');
        this.toggle.setAttribute('title', 'Скрыть/показать панель [win + ~ / cmd + §]');

        this.toggleRight = this.toggle.cloneNode() as HTMLElement;
        this.toggleRight.classList.add('right');

        try {
            this.element.insertBefore(this.toggleRight, this.element.children[0]);
            this.element.insertBefore(this.toggle, this.element.children[0]);
        } catch (e) {
            this.element.appendChild(this.toggle);
            this.element.appendChild(this.toggleRight);
        }

        this.restoreVisible();

        setTimeout(() => this.element.classList.add(this.options.transitClass), this.options.transitTime);
        this.repeatReloadCounter = 0;

        this.toggle.addEventListener('click', this.onToggleClick.bind(this));

        if (window) {
            window.addEventListener('keypress', this.onWindowKeyPress.bind(this));
            window.addEventListener('keyup', this.onWindowKeyUp.bind(this));
        }
    }

    onToggleClick() {
        if (!this.element) return;
        this.toggleBxPanelVisible();
    }

    onWindowKeyPress(ev: KeyboardEvent) {
        if (!this.element) return;

        if (ev.metaKey && (ev.code === 'Backquote' || ev.key === '§')) {
            this.toggleBxPanelVisible();
        }
    }

    onWindowKeyUp(ev: KeyboardEvent) {
        if (!this.element) return;

        if (ev.key === 'Control') {
            this.repeatReload();
        } else {
            this.clearReload();
        }
    }

    isBxPanelVisible() {
        return this.element.classList.contains(this.options.visibleClass);
    }

    toggleBxPanelVisible(value?: boolean) {
        let currentValue = this.isBxPanelVisible();

        value = value !== undefined ? value : !currentValue;

        if (value === currentValue) return;

        this.element.classList.toggle(this.options.visibleClass, value);
        this.storeVisible();
    }

    storeVisible() {
        try {
            localStorage.setItem(this.options.visibleKey, this.isBxPanelVisible() ? '1' : '0');
        } catch (e) {
            console.log(e);
        }
    }

    restoreVisible() {
        try {
            const isVisible = !!parseInt(localStorage.getItem(this.options.visibleKey) + '');

            this.toggleBxPanelVisible(isVisible);
        } catch (e) {
            console.log(e);
        }
    }

    repeatReload() {
        if (this.repeatReloadTimer) {
            clearTimeout(this.repeatReloadTimer);
        }
        this.repeatReloadTimer = setTimeout(() => this.repeatReloadCounter = 0, this.options.repeatReloadTimeout);

        this.repeatReloadCounter++;

        if (this.repeatReloadCounter >= this.options.repeatReloadCount) {
            this.toggleClearCache();
            this.repeatReloadCounter = 0;
        }
    }

    clearReload() {
        if (this.repeatReloadTimer) {
            clearTimeout(this.repeatReloadTimer);
            this.repeatReloadTimer = 0;
        }

        this.repeatReloadCounter = 0;
    }

    toggleClearCache() {
        const clearCache = 'clear_cache=Y';
        const position = location.search.indexOf(clearCache);
        // @ts-ignore
        const BX: any = window['BX'];

        if (position < 0) {
            BX.clearCache();
        } else {
            let search = location.search.substr(1).split('&');

            search.splice(search.indexOf(clearCache), 1);

            let url = search.join('&');

            url = (url.length ? '?' : '') + url;

            BX.reload(location.pathname + url + location.hash, false);
        }
    }
}
