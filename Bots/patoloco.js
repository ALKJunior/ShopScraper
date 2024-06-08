const { remote , Key} = require('webdriverio');
const { format } = require('date-fns')

class PatolocoBot {
    constructor(product, cep){
        this.product = product;
        this.CEP = cep;
        this.patolocoOBJ = {}
    }
    async start() {
        global.browser = await remote({
            capabilities: {
              browserName: 'chrome',
              'goog:chromeOptions': {
                args: process.env.CI ? ['headless', 'disable-gpu'] : ['--guest']
              }
            }
          });
    }

    async adjustBrowser() {
      await browser.url("https://patoloco.com.br/");
      await browser.$('input#suggestive-search-input').setValue(this.product);
      await browser.$("button.fa.fa-search").click();
      await browser.$("article.product").click();
      
    }
    async getPrice() {
      try {
        const price = await browser.$('div.price.text-success span[itemprop="price"]').getText();
        return price;
      } catch (error) {
        return "Product Unavailable"
      }
    }
    async getFreight() {
      try {
        await browser.scroll(0,500);
        await browser.$("input#frete-cep").setValue(this.CEP);
        await browser.$("span.input-group-btn button.btn-sm").click();
        await browser.pause(3000)
        await browser.scroll(0,500);
        const freight = await browser.$("div.list-group-item div.pull-right").getText();
        return freight;
      } catch (error) {
        return "Product Unavailable"
      }
    } 
        
    async getItemData() {
      await browser.saveScreenshot(`./Prints/${this.product}/${name.replace(/\s+/g, '_').replace(/\W/g, '')}-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.png`);
      const name = await browser.$("h1.product-name span").getText();
      const price = await this.getPrice()
      const freight = await this.getFreight()
      await this.setItemData(name, price, freight);
    }
    async setItemData(name, price, freight) {
        this.patolocoOBJ = {
            nome:"Patoloco",
            produto: name,
            preco: price,
            frete: freight,
        }
    }
    
    async end() {
    await browser.deleteSession();
    }
    async execute(){
      await this.start();
      await this.adjustBrowser();
      await this.getItemData();
      await this.end();
    }
}
module.exports = PatolocoBot;
