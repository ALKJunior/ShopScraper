const { remote , Key} = require('webdriverio');
const { format } = require('date-fns')

class MercadoLivreBot {
    constructor(product, cep){
        this.product = product;
        this.CEP = cep;
        this.mercadoLivreOBJ = {}
    }
    async start() {
        global.browser = await remote({
            capabilities: {
              browserName: 'chrome',
              'goog:chromeOptions': {
                args: process.env.CI ? ['headless', 'disable-gpu'] : []
              }
            }
          });
    }
    async waitAndClick(selector) {
        await browser.$(selector).waitForClickable({timeout:30000});
        await browser.$(selector).click();
    }
    async adjustBrowser() {
        await browser.url("https://www.mercadolivre.com.br/");
        await this.waitAndClick("input.nav-search-input");
        await browser.keys(`${this.product}`);
        await this.waitAndClick("button.nav-search-btn");
        await browser.pause(1000);
        await this.waitAndClick("ol.ui-search-layout li.ui-search-layout__item");
    }
    async putCEP() {
        await this.waitAndClick("div.nav-header-plus-cp-wrapper.nav-area.nav-bottom-area.nav-left-area")
        await browser.$("div.andes-form-control__control").isDisplayed();
        await browser.pause(2000)
        await browser.keys(`${this.CEP}`)
        await browser.pause(1000);
        await browser.keys(Key.Enter)
    }
    async getFreight() {
        await this.putCEP();
        const freight = await browser.$('p.ui-pdp-media__title span[data-testid="price-part"]').getText();
        let formattedFreight = await freight.replace(/\n/g, '');        
        return formattedFreight;
    }
    async getPrice() {
        const price = await browser.$("div.ui-pdp-price__second-line span.ui-pdp-price__part").getText();
        let formattedPrice = await price.replace(/\n/g, '');        
        return formattedPrice;
    }
    async getItemData() {
        //await browser.saveScreenshot(`./Prints/${this.product}/${name.replace(/\s+/g, '_').replace(/\W/g, '')}-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.png`);
        const name = await browser.$("h1.ui-pdp-title").getText();
        const price = await this.getPrice();
        const freight = await this.getFreight();
        await this.setItemData(name, price, freight)
    }
    async setItemData(name, price, freight) {
        this.mercadoLivreOBJ = {
            nome:"Mercado Livre",
            produto: name,
            preco: price,
            frete: freight,
        }
    }
    
    async end() {
        console.log(this.mercadoLivreOBJ);
        await browser.deleteSession();
        }
    async execute(){
        await this.start();
        await this.adjustBrowser();
        await this.getItemData();
        await browser.pause(2000);
        await this.end();
    }
}
module.exports = MercadoLivreBot;