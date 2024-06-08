const fs = require('fs');
const { format } = require('date-fns')
const PatolocoBot = require("./Bots/patoloco.js")
const KabumBot = require("./Bots/kabum.js")
const MercadoLivreBot = require("./Bots/mercL.js")

const PRODUTO = "Ryzen 5 5600G" // Change here
const CEP = 98480000 // Change here

class RobotManager{
    constructor(){
        this.shops = []
        this.data  = {}
    }
    async createRobots(){
        const patolocoBot = new PatolocoBot(PRODUTO, CEP);
        const kabumBot = new KabumBot(PRODUTO, CEP);
        const mercadoLivreBot = new MercadoLivreBot(PRODUTO, CEP);
        return { patolocoBot , kabumBot , mercadoLivreBot}
    }
    async executeRobots(patoloco, kabum, mercL){
        await patoloco.execute().then(()=> this.shops.push(patoloco.patolocoOBJ));
        await kabum.execute().then(()=> this.shops.push(kabum.kabumOBJ));
        await mercL.execute().then(()=> this.shops.push(mercL.mercadoLivreOBJ));
    }
    async manageData() {
        this.data = {
            produto_pesquisado: PRODUTO,
            dataPesquisa: format(new Date(), 'yyyyMMddHHmmss'),
            lojas:this.shops
        }
    }
    async createPrintFolder() {
        try {
            fs.mkdirSync(`./Prints/${PRODUTO}`);    
        } catch (error) {
            console.log("The directory already Exists");      
        }
    }
    async init() {
        const { pichauBot , kabumBot , mercadoLivreBot } = await this.createRobots();
        await this.createPrintFolder();
        await this.executeRobots(pichauBot, kabumBot, mercadoLivreBot);
        await this.manageData();
        await this.updateJSON();
    }
    async updateJSON() {
        fs.readFile('./data/dados.json', 'utf8', (err, data) =>{
            if(err){
                const dados = [this.data]
                const jsonString = JSON.stringify(dados,null,2)
                fs.writeFile('./data/dados.json', jsonString, ()=> console.log("OK"));
            
            } else{
                try {
                    const dados = JSON.parse(data);
                    dados.push(this.data)
                    const jsonString = JSON.stringify(dados, null, 2)

                    fs.writeFile('./data/dados.json' , jsonString, (err) => console.log(err))
                } catch (error) {
                    console.log("ERROR => "+ error);
                }
            }
        })
    }
}
const robotManager = new RobotManager()
robotManager.init();
