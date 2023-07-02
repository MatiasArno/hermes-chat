class WelcomePage extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
	}

	render() {
		this.innerHTML = `
            <div class="welcome__header">
                <h1 class="welcome__title"> HERMES </h1>
            </div>

            <div class="welcome__form-container">
                <welcome-form></welcome-form>
            </div>
        `;
	}
}

customElements.define('welcome-page', WelcomePage);
