const axios = require('axios');
const Mailjs = require("@cemalgnlts/mailjs");
const cheerio = require('cheerio');
const fs = require('fs');
const mailjs = new Mailjs();
async function randomPhoneNumber() {
    const prefixes = ['090', '091', '092', '093', '094', '095', '096', '097', '098', '099'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 1000000).toString().padStart(7, '0');
    return `${prefix}${number}`;
}
async function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
async function randomEmail() {
    try {
        const domainsResponse = await mailjs.getDomains();
        const domains = domainsResponse.data;
        if (!Array.isArray(domains) || domains.length === 0) {
            throw new Error('No domains available or data format is incorrect');
        }

        const randomDomain = domains[Math.floor(Math.random() * domains.length)].domain;
        if (!randomDomain) {
            throw new Error('Unable to find a valid domain');
        }
        const randomAddress = await generateRandomString(10);
        const emailAddress = `${randomAddress}@${randomDomain}`;

        const password = Math.random().toString(36).slice(-8);
        const accountResponse = await mailjs.register(emailAddress, password);
        const account = accountResponse.data;
        return {
            address: account.address,
            password: password
        };
    } catch (error) {
        console.error('Error creating random email:', error.message);
        throw error;
    }
}
async function randomDateOfBirth() {
    const year = Math.floor(Math.random() * (2002 - 1980 + 1)) + 1980;
    const month = 8;
    const day = Math.floor(Math.random() * 31) + 1;

    const formattedDay = day.toString().padStart(2, '0');

    return `${year}-${month.toString().padStart(2, '0')}-${formattedDay}`;
}
async function randomName() {
    const firstNames = ['Tuan', 'Anh', 'Binh', 'Chau', 'Dung', 'Hanh', 'Hieu', 'Hoa', 'Khoa', 'Linh', 'Minh', 'Nam', 'Ngoc', 'Phuong', 'Quang', 'Son', 'Tuan', 'Trang', 'Vinh'];
    const lastNames = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Phan', 'Vu', 'Vo', 'Dang', 'Bui', 'Do', 'Ho', 'Ngo', 'Duong', 'Ly'];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return { firstName, lastName };
}
async function randomProxy(){

}
async function imeiAndroid(){

}
async function signUp(phone, email,dateOfBirth,firstName, lastName) {
    const url = "https://sbvn.wrapper.vifb.vn/ms-customer/api/Member/SignUp";
    const headers = {
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?0',
        'Authorization': 'undefined',
        'x-language-key': 'en',
        'x-issuer': 'PORTAL',
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'host': 'sbvn.wrapper.vifb.vn'
    };
    const data = {
        "mobileNo": phone,
        "email": email,
        "password": "Tung1234@",
        "confirmPassword": "Tung1234@",
        "registerType": 0,
        "firstName": firstName,
        "lastName": lastName,
        "dob": dateOfBirth,
        "nationality": "VN",
        "salutation": "Mr",
        "subscription": {"email": true},
        "cardLists": [{"cardNo": "", "passcode": ""}],
        "gender": ""
    }

    const response = axios.post(url, data, {headers: headers});
    return (await response).data;

}

async function verifyRegistration(mid,cn,ts){
    const url= "https://card.starbucks.vn/api/account/verifyRegistration";
    const headers = {
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?0',
        'Authorization': 'undefined',
        'x-language-key': 'en',
        'x-issuer': 'PORTAL',
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'host': 'card.starbucks.vn'
    };
    const data={
        "mid": mid,
        "cn": cn,
        "ts": ts
    }
    const response = await axios.post(url,data,{headers:headers});
    return response.data;

}
async function main(){
    try {
        const { address, password } = await randomEmail();
        const phone = await randomPhoneNumber();
        const dateOfBirth=await randomDateOfBirth();
        const { firstName, lastName }=await randomName();
        await signUp(phone, address,dateOfBirth,firstName, lastName);
        console.log('Waiting for email...');
        await new Promise(resolve => setTimeout(resolve, 15000));
        await mailjs.login(address, password);
        const dataMail= await mailjs.getMessages();
        const idMessages=dataMail.data[0].id;
        const messages=await mailjs.getMessage(idMessages);
        if (messages){
            const $ = cheerio.load(messages.data.html.join(''));
            const links = [];
            $('a').each((index, element) => {
                links.push($(element).attr('href'));
            });
            const secondUrl = links[1];
            const regex = /\/verification\/([^\/]+)\/([^\/]+)\/([^\/]+)/;
            const matches = secondUrl.match(regex);
            if (matches) {
                const mid = matches[1];
                const cn = matches[2];
                const ts = matches[3];

                const statusVerify=await verifyRegistration(mid,cn,ts);
                if (statusVerify.message==="Congratulations! You've successfully confirmed your new account."){
                    console.log(`${address} : ${statusVerify.message}`);
                    fs.appendFileSync('data.txt', `${address} ${password} ${dateOfBirth} Tung1234@ \n`);
                    await main();
                }
            } else {
                console.error('No matches found.');
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}
main()