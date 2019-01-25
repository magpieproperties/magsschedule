require('dotenv').config()

const puppeteer = require('puppeteer');
const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require('path');


let {google} = require('googleapis');
let OAuth2 = google.auth.OAuth2;

let oauth2Client = new OAuth2(
	//ClientID
	process.env.GMAIL_CLIENTID,
	
	//Client Secret
	process.env.GMAIL_SECRET,
	
	//Redirect URL
	"https://developers.google.com/oauthplayground"
);


async function getMaggieSeaportData(){


//const browser = await puppeteer.launch({headless:false ,args:['--ignore-certificate-errors','--disable-gpu','--window-size=1366,768',"--proxy-server='direct://'",'--proxy-bypass-list=*']},{sloMo: 350}, {ignoreHTTPSErrors: true});
const browser = await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--ignore-certificate-errors','--disable-gpu','--window-size=1366,768',"--proxy-server='direct://'",'--proxy-bypass-list=*','--enable-features=NetworkService']},{sloMo: 350}, {ignoreHTTPSErrors: true});

const page = await browser.newPage();
const navigationPromise = page.waitForNavigation();
await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/67.0.3372.0 Safari/537.36');


await page.goto('https://seaport.seaworldentertainment.com/',{waitUntil: 'networkidle0'});

try
{
  await navigationPromise;
}
catch(err){
  console.log(err);
}

await page.waitFor(5000);

await page.click('#Username');
await page.keyboard.type(process.env.SEAPORT_USERNAME);


await page.click('#Password');
await page.keyboard.type(process.env.SEAPORT_PASSWORD);

await page.click('#submitButton');

await page.waitFor(5000);

await page.click('#onboardingModal > div > div > div.modal-header.sea-onboarding-modal-header > button');

await page.waitFor(2000);

//await page.click('#bootstrap-override > app-today > sidebar > div > div:nth-child(2) > div:nth-child(3) > a',{delay:2000});

await page.click('#bootstrap-override > app-today > tabbar > div > div > div:nth-child(2) > a',{delay:2000});

await page.waitFor(5000);

 await page.screenshot({path: 'maggieData.jpg', fullPage: true});

  await sendTheEmail();

  await browser.close();


}

 //const sendTextMessage = (status) => {
 //   const msg = {
 //     to: TWILIOTO,
 //     from: TWILIOFROM,
 //     body: `Gnarly Tap List: '${status}'`,
 //  };
 //
 //  twilioClient.messages.create(msg).catch(console.error);
 // };

function sendTheEmail()
{
	
// Set the refresh token
oauth2Client.setCredentials({
	refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

//Initialize an access token variable
let accessToken = "";

//Get the access token
oauth2Client.refreshAccessToken(function(err,tokens)
{
if(err) 
{
    console.log(err);
  } 
  else 
  {
    console.log(accessToken);
  }
	accessToken = tokens.access_token;
});

var smtpTransport = nodemailer.createTransport({
    host:"smtp.gmail.com",
	port: 465,
	secure: true,
	auth:{
      type: "OAuth2",
      user: process.env.GMAIL_USERNAME,
	  clientId: process.env.GMAIL_CLIENTID,
	  clientSecret: process.env.GMAIL_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
	  accessToken: accessToken
    }
});

var mailOptions = {
  from: process.env.GMAIL_USERNAME,
  to: "Kornarmy@gmail.com",
  subject: "Maggie's Discovery Cove Schedule",
  generateTextFromHTML: false,
  text: "DC Schedule Email\n",
  attachments: [{path : (path.resolve(__dirname,'maggieData.jpg'))
  }]
  
};

smtpTransport.sendMail(mailOptions, function(error, response) {
  if (error) {
    console.log(error);
  } else {
    console.log(response);
  }
  smtpTransport.close();
});
	
};

getMaggieSeaportData();