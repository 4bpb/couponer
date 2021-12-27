var fetch = require('node-fetch');
const {shell } = require('electron');
const { existsSync } = require('original-fs');


window.addEventListener('DOMContentLoaded', () => {

    document.getElementById("submit").addEventListener("click", Main);

    async function Main(){
        var tableHeaderRowCount = 1;
        var table = document.getElementById('gotresult');
        var rowCount = table.rows.length;
        for (var i = tableHeaderRowCount; i < rowCount; i++) {
            table.deleteRow(tableHeaderRowCount);
        }

        let couponArray = []
        let rawurl = document.getElementById("website").value
        let capurl = capitalizeWords(rawurl)


        if(rawurl.includes('http') || rawurl.length<1){
            alert('Please only input the store name. Ex: Amazon, Bestbuy, Starbucks')
            process.crash()
        }


        //Honey
        fetch('https://d.joinhoney.com/v3?operationName=web_getStoreByLabel&variables=%7B%22label%22%3A%22'+rawurl+'%22%7D',{
            timeout: 10000, 
        })
        .then(res => res.json())
        .then(json => {
            let coupons = json.data.getStoreByLabel.publicCoupons

            coupons.forEach(element => {
                let code = element.code
                let description = element.generatedDescription

                couponArray.push(code+':'+description)

                var table = document.getElementById("gotresult");

                var row = table.insertRow(table.length);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                cell1.innerHTML = code;
                cell2.innerHTML = description;
            });

            
        })
        .catch(error =>{
            fetch('https://d.joinhoney.com/v3?operationName=ios_autocomplete&operationVersion=7&variables=%7B%22query%22:%22'+rawurl+'%22%7D', {
                headers: {
                    'Host': 'd.joinhoney.com',
                    'Service-Version': '2.7.0',
                    'Accept': '*/*',
                    'Service-Name': 'honey-mobile',
                    'User-Agent': 'Honey/20 CFNetwork/1325.0.1 Darwin/21.1.0',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            })
            .then(res => res.json())
            .then(json => {
                let stores = json.data.autocomplete.stores
                

                stores.forEach(element => {
                    if(element.name===capurl){
                        let storeid = element.storeId

                        fetch('https://d.joinhoney.com/v3?operationName=mobile_getStoreById&operationVersion=6', {
                            method: 'POST',
                            headers: {
                                'Host': 'd.joinhoney.com',
                                'Content-Type': 'application/json',
                                'Service-Version': '2.7.0',
                                'Accept': '*/*',
                                'Service-Name': 'honey-mobile',
                                'Accept-Language': 'en-US,en;q=0.9',
                                'User-Agent': 'Honey/20 CFNetwork/1325.0.1 Darwin/21.1.0'
                            },
                            body: JSON.stringify({"operationName":"mobile_getStoreById","operationVersion":6,"variables":{"storeId":storeid}})
                        })
                        .then(res => res.json())
                        .then(json => {
                            let coupons2 = json.data.getStoreById.publicCoupons

                            coupons2.forEach(element => {
                                let deal = element.code
                                let description = element.description



                                couponArray.push(deal+':'+description)

                                var table = document.getElementById("gotresult");
                
                                var row = table.insertRow(table.length);
                                var cell1 = row.insertCell(0);
                                var cell2 = row.insertCell(1);
                                cell1.innerHTML = deal;
                                cell2.innerHTML = description;
                            });
                        })
                    }
                });
            });
        })

        //Rakuten
        fetch('https://apituner.ecbsn.com/apituner/v1/store/reward/list?channel=3',{
            timeout: 10000, 
        })
        .then(res => res.json())
        .then(json => {
            let stores = json.store
            stores.forEach(element => {
                if(element.name===capurl){
                    let id = element.id


                    fetch('https://apituner.ecbsn.com/apituner/mobile/store/'+id+'/coupons/list',{
                        timeout: 10000, 
                    })
                    .then(res => res.json())
                    .then(json => {
                        let possibleCoupons = json.coupons

                        possibleCoupons.forEach(element => {
                            if(element.code != undefined){
                                let rakutenCode = element.code
                                let rakutenDescription = element.description
    
    
                                couponArray.push(rakutenCode+':'+rakutenDescription)
    
                                var table = document.getElementById("gotresult");
                
                                var row = table.insertRow(table.length);
                                var cell1 = row.insertCell(0);
                                var cell2 = row.insertCell(1);
                                cell1.innerHTML = rakutenCode;
                                cell2.innerHTML = rakutenDescription;
                            }
                        });
                    });

                }
            });
        })

        //ID ME
        let index = 0
        idme(index)
        function idme(index){
            fetch('https://shop.id.me/offers.json?page='+index+'&q='+capurl,{
                headers: {
                    'authority': 'shop.id.me',
                    'cache-control': 'max-age=0',
                    'upgrade-insecure-requests': '1',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'sec-gpc': '1',
                    'sec-fetch-site': 'none',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-user': '?1',
                    'sec-fetch-dest': 'document',
                    'accept-language': 'en-US,en;q=0.9'
                }
            })
            .then(res => res.json())
            .then(json => {
                console.log(json)
                if(json.length===0){
                    console.log('yes')
                } else {
                    json.forEach(element => {
                        let idmeCode = element.affiliate_url
                        let idmeDescription = element.title
                        let idmeMerchant = element.merchant_name

                        console.log(idmeMerchant)
                        couponArray.push(idmeCode+':'+idmeDescription)
    
                        var table = document.getElementById("gotresult");
        
                        var row = table.insertRow(table.length);
                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        
                        cell1.innerHTML = idmeMerchant+' - <a href="'+idmeCode+'" target="_blank" >Link</a>'
                        cell2.innerHTML = idmeDescription;
                    });

                    index++
                    idme(index)
                }

            })
        }




        
        console.log(couponArray)
    }


  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  const appendText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.append(text)
  }


  function capitalizeWords(string) {
    return string.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};


})