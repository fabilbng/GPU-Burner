const addToCardNbb = async (url, pid, category) => {
    while (true){
        sendNotif('Adding To Card...')
        try {
            const response = await fetch(`${url}/action/add_product`, {
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "accept-language": "en-US,en;q=0.9,de;q=0.8",
                    "cache-control": "max-age=0",
                    "content-type": "application/x-www-form-urlencoded",
                    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "same-origin",
                    "sec-fetch-user": "?1",
                    "upgrade-insecure-requests": "1"
                },
                "referrer": `${url}`,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": "warranty_choice=default&" +
                    `products_id=${pid}&` +
                    `categories_id=${category}`,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            })
            console.log(response)
            if (response.status === 302){
                sendNotif('Successfully Added To Cart')
                break
            }
        } catch (error) {
            sendNotif('Error Adding To Card Retrying...')
            await timeout(1000)
        }
    }
}



chrome.runtime.onMessage.addListener(
    (request) => {
        if (request.message === 'addToCardNbb'){
            addToCardNbb(request.url, request.productId, request.categoryId)
        }
    }
)