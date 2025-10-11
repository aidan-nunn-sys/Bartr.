function createMarketplaceArt() {
    const marketplaceArt = `
███╗   ███╗ █████╗ ██████╗ ██╗  ██╗ ███████╗ ████████╗██████╗ ██╗      █████╗  ██████╗███████╗
████╗ ████║██╔══██╗██╔══██╗██║  ██║ ██╔════╝ ╚══██╔══╝██╔══██╗██║     ██╔══██╗██╔════╝██╔════╝
██╔████╔██║███████║██████╔╝█████║   █████╗      ██║   ██████╔╝██║     ███████║██║     █████╗  
██║╚██╔╝██║██╔══██║██╔══██╗██╔══██║ ██╔══╝      ██║   ██╔══   ██║     ██╔══██║██║     ██╔══╝  
██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██║ ███████╗    ██║   ██║     ███████╗██║  ██║╚██████╗███████╗
  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚══════╝    ╚═╝   ╚═╝     ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝  
`;

    const container = document.getElementById('marketplace-title-container');

    if (!container) {
        console.error('Error: Element with ID "marketplace-title-container" was not found.');
        return;
    }

    const preElement = document.createElement('pre');
    preElement.id = 'marketplace-ascii';
    preElement.textContent = marketplaceArt;

    container.appendChild(preElement);

    container.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { offsetWidth, offsetHeight } = preElement;
        const { left, top } = preElement.getBoundingClientRect();
        
        const x = (clientX - left - offsetWidth / 2) / 25;
        const y = (clientY - top - offsetHeight / 2) / 25;

        preElement.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
    });

    container.addEventListener('mouseleave', () => {
        preElement.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
}

export default createMarketplaceArt;

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', createMarketplaceArt);
}