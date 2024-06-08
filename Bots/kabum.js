const { remote , Key} = require('webdriverio');
const { format } = require('date-fns')

class KabumBot {
    constructor(product, cep){
        this.product = product;
        this.CEP = cep;
        this.kabumOBJ = {}
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

    async adjustBrowser() {
        await browser.url("https://www.kabum.com.br/");
        await browser.$("input.id_search_input").waitForDisplayed({timeout:20000})
        await browser.$("input.id_search_input").setValue(`${this.product}`)
        await browser.keys(Key.Enter);
        await browser.$("article.productCard").click();
    }
    async openFreightPanel(){
        const input = await browser.$("input#inputCalcularFrete");
        await input.click()
        await input.setValue(`${this.CEP}`)
        await browser.keys(Key.Enter);
    }
    async getPrice() {
        ;
        return price;
    }
    async getFreight() {
        await browser.scroll(0,500);
        await this.openFreightPanel();
        await browser.$("div#listaOpcoesFrete").waitForDisplayed({timeout:10000});
        const freight = await browser.$("span.etvZuo").getText();
        return freight;
    }
    
    async getItemData() {
        await browser.saveScreenshot(`./Prints/${this.product}/${name.replace(/\s+/g, '_').replace(/\W/g, '')}-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.png`);
        const name = await browser.$("h1.sc-58b2114e-6.brTtKt").getText();
        const price = await browser.$("h4.finalPrice").getText()
        const freight = await this.getFreight();
        await this.setItemData(name, price, freight);
    }

    async setItemData(name, price, freight) {
        this.kabumOBJ = {
            nome:"Kabum",
            produto: name,
            preco: price,
            frete: freight
        }
    }
    
    async end() {
        console.log(this.kabumOBJ);
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
module.exports = KabumBot;