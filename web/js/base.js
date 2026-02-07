class HeaderComponent extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const response = await fetch('header.html');
        const content = await response.text();
        this.innerHTML = content;
    }
}
window.customElements.define('my-header', HeaderComponent);

const primaryHeader = document.querySelector('my-header');
const scrollWatcher = document.createElement('div');


class FooterComponent extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const response = await fetch('footer.html');
        const content = await response.text();
        this.innerHTML = content;
    }
}
window.customElements.define('my-footer', FooterComponent);


class Section_cards extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const response = await fetch('section_cards.html');
        const content = await response.text();
        this.innerHTML = content;
    }
}
window.customElements.define('my-cards', Section_cards);