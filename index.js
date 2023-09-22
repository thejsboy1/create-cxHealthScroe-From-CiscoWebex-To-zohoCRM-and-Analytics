var request = require('request');
const axios = require('axios');
const schedule = require('node-schedule');
var nodemailer = require('nodemailer');



// Set Cron Job Function////////////////////////////////////////////////
// const job =  schedule.scheduleJob('0 15 12 * * *', function () {
//     console.log('The answer to life, the universe, and everything!');
//     const Status =  getOrganizations();
//     if (Status.status == 201) {
//         mail("Data Sync Successfully", "Data Sync Successfull with status code 200")
//     }
// });

// Set Mail Function To send Update onmail//////////////////////////////////
const mail = (subject, text) => {
    var transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            user: 'pro.developer@proactive.co.in',
            pass: 'Proact@123'
        }
    });

    var mailOptions = {
        from: 'pro.developer@proactive.co.in',
        to: 'kapil.kumar@proactive.co.in',
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


// Sleep Function For Delay In Functions//////////////////////////////////////
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Webex_Customer_Name
// Total_Licence_Type
// Trends
// Health_Score


// Get Zoho Token From This Function////////////////////////////////////
const getwebextoken = async () => {
    try {


        const response = await axios({
            'method': 'post',
            url: 'https://webexapis.com/v1/access_token?grant_type=refresh_token&client_id=Cddad4b9d5566e911b8a86569cbf28a00b8de6d785157be3ab836476fea64d1c9&client_secret=9dd63f0ec6b33f6dd0cccc8886cecc6d917471a35acc846f81d19a0cfed1b193&refresh_token=NmU2NWZjZmMtMGQ4My00YTA1LTgzYWEtMjM1ZWJiNjZjOTFhOGM1MmIwNzctNjE5_PF84_3bf06e7b-f230-427f-9163-c54d2e428d6a',
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        console.log(response.data.access_token)
        return response.data.access_token;
    } catch (error) {
        // let subject = "Geeting Error In Faching data Webex Api"
        // let text = error
        // await mail(subject, text)
        console.log("get org error", error);
    }
}


// Get Zoho Token From This Function////////////////////////////////////
const getzohotoken = async () => {
    try {

        let data = JSON.stringify({
            "accountid": "434653000001059376"
        });
        const response = await axios({
            'method': 'post',
            url: 'https://accounts.zoho.com/oauth/v2/token?refresh_token=1000.3d6ae178a2e29685989160118f75ec99.7d80bb43db46acdef1d34e90c19a7b7d&client_id=1000.XLUX2G854HEVITG926DHT8LHH76G4H&client_secret=f743c69558faf7d852d8e99651b170862268287f51&grant_type=refresh_token',
            'headers': {
                'Content-Type': 'application/json',
            },
            data: data
        })
        console.log(response.data.access_token)
        return response.data.access_token;
    } catch (error) {
        let subject = "Geeting Error In Faching data Webex Api"
        let text = error
        await mail(subject, text)
        console.log("get org error", error);
    }
}

// Get Orgnizations From Webex Api ////////////////////////////
const getOrganizations = async () => {

    zohonewtoken = await getzohotoken();
    webexnewtoken = await getwebextoken();

    // await getLicenses('Y2lzY29zcGFyazovL3VzL09SR0FOSVpBVElPTi9lODU3ODcxMy1mMTBmLTRmNTMtYmY3MS1jOGZmMGNmNWUyNjQ', 'GlobalLogic')
    // await UpdateTrends('Y2lzY29zcGFyazovL3VzL09SR0FOSVpBVElPTi9lODU3ODcxMy1mMTBmLTRmNTMtYmY3MS1jOGZmMGNmNWUyNjQ')
    try {
        const response = await axios({
            'method': 'GET',
            'url': 'https://webexapis.com/v1/organizations',
            'headers': {
                'Authorization': 'Bearer ' + webexnewtoken
            }
        })
        let count = 0;
        let usedLicence = 0;
        let issuedlicence = 0;
        let trandresp = 0;
        for (const item of response.data.items) {
            // count++;
            let lastresponse = await getLicenses(item.id, item.displayName, zohonewtoken, webexnewtoken)
            console.log("total array data", lastresponse)
            // console.log("total array data",lastresponse[0].id)
            // await UpdateTrends(item.id)
            if (lastresponse) {
                usedLicence = usedLicence + lastresponse[0].usedlicence
                // issuedlicence = issuedlicence + lastresponse[0].issuedlicence
                issuedlicence = issuedlicence + lastresponse[0].issuedlicence
                if (lastresponse[0].ticketstatus) {
                    count++;
                }
                console.log("11newissuedlicence", issuedlicence)
                console.log("11newusedLicence", usedLicence)
                console.log("11ticketstatus", lastresponse[0].ticketstatus)
            }

        }
        for (const item of response.data.items) {
            // await getLicenses(item.id, item.displayName)

            trandresp = trandresp + await UpdateTrends(item.id, zohonewtoken)
            console.log("trandresp", trandresp)
        }
        console.log("newissuedlicence", issuedlicence)
        console.log("newusedLicence", usedLicence)
        console.log("trandresp", trandresp)
        await UpdateOrgCount(count, issuedlicence, usedLicence, trandresp, zohonewtoken, response.data.items)
        return response.status;
    } catch (error) {
        console.log("get org error", error);
    }
}



// console.log("trandresp", trandresp)


// Update Orgnization count, Total Licence And Used Licence From this function
const UpdateOrgCount = async (orgcount, issuedlicence, usedLicence, trandresp, zohonewtoken, Json) => {

    // Webex_Cx_Org_Count
    // Total_License
    // Used_License	
    // Total_Organizations

    var newjson = {};
    var newjson2 = [];
    newjson["Total_License"] = issuedlicence
    newjson["Used_License"] = usedLicence
    newjson["Total_Organizations"] = orgcount
    newjson["Org_Growth_Trend"] = trandresp
    newjson["JSON"] = Json
    newjson2.push(newjson)

    try {
        const response2 = await axios({
            'method': 'post',
            'url': 'https://www.zohoapis.com/crm/v2/Webex_Cx_Org_Count',
            'headers': {
                'Authorization': 'Zoho-oauthtoken ' + zohonewtoken,
                "Content-Type": "application/json"
            }, 'data': {
                "data": newjson2
            }
        });
        console.log(response2)
        console.log("UpdateOrgCount", response2.status);
        return response2.data
    } catch (error) {
        console.log("UpdateOrgCount", error);
    }

}



const changevaluenumtostr = (oldval, newval) => {
    if (typeof oldval !== 'undefined' && oldval) {
        totalval = Number(oldval) + Number(newval);
    } else {
        totalval = newval;
    }
    total = totalval;
    console.log("total", total)
    return total;
}

const appendsubsid = (oldval, newval) => {
    if (typeof oldval !== 'undefined' && oldval) {
        totalval = oldval + "," + newval;
    } else {
        totalval = newval;
    }
    total = totalval;
    return total;
}


const CheckSubsIdFromT6Headercrm = async (subscripId, zohonewtoken) => {
    try {

        const response = await axios({
            'method': 'get',
            url: 'https://www.zohoapis.com/crm/v2/Subscription_Header/search?sort_order=desc&sort_by=id&criteria=((Subscription_Reference_ID:equals:Sub680401) and (Status:equals:ACTIVE) and (Record_Current_Old:equals:Current))',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': 'Zoho-oauthtoken ' + zohonewtoken
            }
        })
        console.log("=======================================================================================================================" + response.status)
        if (response.status == 200) {
            return true;
        } else {
            return false;
        }
        // return response;
    } catch (error) {
        let subject = "Geeting Error In Faching data Webex Api"
        let text = error
        await mail(subject, text)
        console.log("get org error", error);
    }

}


// webexnewtoken = await getwebextoken();
//Get Licenses Data and update all in Zoho Crm (Create Webex CX Licenses Data) With Calculate CX Health Score And Trends
const getLicenses = async (orgid, displayName, zohonewtoken, webexnewtoken) => {


    try {
        const response = await axios({
            'method': 'GET',
            'url': 'https://webexapis.com/v1/licenses?orgId=' + orgid,
            'headers': {
                'Authorization': 'Bearer ' + webexnewtoken
            }
        })
        var newjson = {};
        var newjson2 = [];
        newjson["Webex_Customer_ID"] = orgid;
        newjson["Webex_Customer_Name"] = displayName;
        newjson["JSOn"] = response.data.items;

        var CheckSubsId = "";
        var TotalLicenceCount = 0;
        var TotalissuedLicense = 0;
        var TotalusedLicense = 0;

        for (const item of response.data.items) {
            var length = Object.keys(item).length;
            if (item.name === "MS Teams Video") {
                if (CheckSubsIdFromT6Headercrm(newjson["Integrations_Subscription_Id"], zohonewtoken)) {
                    if (typeof newjson["Integrations_Total_Units"] === 'undefined') { TotalLicenceCount = TotalLicenceCount + 1; }
                    newjson["Integrations_Consumed_Units"] = await changevaluenumtostr(newjson["Integrations_Consumed_Units"], item.consumedUnits);
                    newjson["Integrations_Subscription_Id"] = await appendsubsid(newjson["Integrations_Subscription_Id"], item.subscriptionId);
                    newjson["Integrations_Total_Units"] = await changevaluenumtostr(newjson["Integrations_Total_Units"], item.totalUnits);
                    CheckSubsId = item.subscriptionId;
                }
            }
            if (item.name === "Meeting 25 party") {
                if (CheckSubsIdFromT6Headercrm(newjson["Advanced_Space_Meeting_Subscription_Id"], zohonewtoken)) {
                    if (typeof newjson["Advanced_Space_Meeting_Total_Units"] === 'undefined') { TotalLicenceCount = TotalLicenceCount + 1; }
                    newjson["Advanced_Space_Meeting_Consumed_Units"] = await changevaluenumtostr(newjson["Advanced_Space_Meeting_Consumed_Units"], item.consumedUnits);
                    newjson["Advanced_Space_Meeting_Subscription_Id"] = await appendsubsid(newjson["Advanced_Space_Meeting_Subscription_Id"], item.subscriptionId);
                    newjson["Advanced_Space_Meeting_Total_Units"] = await changevaluenumtostr(newjson["Advanced_Space_Meeting_Total_Units"], item.totalUnits);
                    CheckSubsId = item.subscriptionId
                }
            }
            if (item.name === "Meeting - Webex Enterprise Edition") {
                if (CheckSubsIdFromT6Headercrm(newjson["Webex_Meeting_Suit_Subscription_Id"], zohonewtoken)) {
                    if (typeof newjson["Webex_Meeting_Suit_Total_Units"] === 'undefined') { TotalLicenceCount = TotalLicenceCount + 1; }
                    newjson["Webex_Meeting_Suit_Consumed_Units"] = await changevaluenumtostr(newjson["Webex_Meeting_Suit_Consumed_Units"], item.consumedUnits);
                    newjson["Webex_Meeting_Suit_Subscription_Id"] = await appendsubsid(newjson["Webex_Meeting_Suit_Subscription_Id"], item.subscriptionId);
                    newjson["Webex_Meeting_Suit_Total_Units"] = await changevaluenumtostr(newjson["Webex_Meeting_Suit_Total_Units"], item.totalUnits);
                    CheckSubsId = item.subscriptionId
                }
            }
            if (item.name === "Webex Meetings Assistant") {
                if (CheckSubsIdFromT6Headercrm(newjson["Webex_Assistant_For_Meeting_Subscription_Id"], zohonewtoken)) {
                    if (typeof newjson["Webex_Assistant_For_Meeting_Total_Units"] === 'undefined') { TotalLicenceCount = TotalLicenceCount + 1; }
                    newjson["Webex_Assistant_For_Meeting_Consumed_Units"] = await changevaluenumtostr(newjson["Webex_Assistant_For_Meeting_Consumed_Units"], item.consumedUnits);
                    newjson["Webex_Assistant_For_Meeting_Subscription_Id"] = await appendsubsid(newjson["Webex_Assistant_For_Meeting_Subscription_Id"], item.subscriptionId);
                    newjson["Webex_Assistant_For_Meeting_Total_Units"] = await changevaluenumtostr(newjson["Webex_Assistant_For_Meeting_Total_Units"], item.totalUnits);
                    CheckSubsId = item.subscriptionId
                }
            }
            // if (item.name === "Webex Event 3,000") {
            //     if (typeof newjson["Webex_Webener_3000_Total_Units"] === 'undefined') { TotalLicenceCount = TotalLicenceCount + 1; }
            //     newjson["Webex_Webener_3000_Consumed_Units"] = await changevaluenumtostr(newjson["Webex_Webener_3000_Consumed_Units"], item.consumedUnits);
            //     newjson["Webex_Webener_3000_Subscription_Id"] = await appendsubsid(newjson["Webex_Webener_3000_Subscription_Id"], item.subscriptionId);
            //     newjson["Webex_Webener_3000_Total_Units"] = await changevaluenumtostr(newjson["Webex_Webener_3000_Total_Units"], item.totalUnits);
            //     CheckSubsId = item.subscriptionId
            // }
            // if (item.name === "Webex Calling - Workspace") {
            //     if (typeof newjson["Work_Space_Total_Units"] === 'undefined') { TotalLicenceCount = TotalLicenceCount + 1; }
            //     newjson["Work_Space_Consumed_Units"] = await changevaluenumtostr(newjson["Work_Space_Consumed_Units"], item.consumedUnits);
            //     newjson["Work_Space_Subscription_Id"] = await appendsubsid(newjson["Work_Space_Subscription_Id"], item.subscriptionId);
            //     newjson["Work_Space_Total_Units"] = await changevaluenumtostr(newjson["Work_Space_Total_Units"], item.totalUnits);
            //     CheckSubsId = item.subscriptionId
            // }

            if (item.name === "Webex Calling - Professional") {
                if (CheckSubsIdFromT6Headercrm(newjson["Professional_Subscription_Id"], zohonewtoken)) {
                    if (typeof newjson["Professional_Total_Units"] === 'undefined') { TotalLicenceCount = TotalLicenceCount + 1; }
                    newjson["Professional_Consumed_Units"] = await changevaluenumtostr(newjson["Professional_Consumed_Units"], item.consumedUnits);
                    newjson["Professional_Subscription_Id"] = await appendsubsid(newjson["Professional_Subscription_Id"], item.subscriptionId);
                    newjson["Professional_Total_Units"] = await changevaluenumtostr(newjson["Professional_Total_Units"], item.totalUnits);
                    CheckSubsId = item.subscriptionId
                }
            }
            if (item.name === "Room Systems") {
                if (CheckSubsIdFromT6Headercrm(newjson["Web_Room_Subscription_Id"], zohonewtoken)) {
                    if (typeof newjson["Web_Room_Total_Units"] === 'undefined') { TotalLicenceCount = TotalLicenceCount + 1; }
                    newjson["Web_Room_Consumed_Units"] = await changevaluenumtostr(newjson["Web_Room_Consumed_Units"], item.consumedUnits);
                    newjson["Web_Room_Subscription_Id"] = await appendsubsid(newjson["Web_Room_Subscription_Id"], item.subscriptionId);
                    newjson["Web_Room_Total_Units"] = await changevaluenumtostr(newjson["Web_Room_Total_Units"], item.totalUnits);
                    CheckSubsId = item.subscriptionId
                }
            }
            if (item.name === "Messaging") {
                if (CheckSubsIdFromT6Headercrm(newjson["Advanced_Messaging_Subscription_Id"], zohonewtoken)) {
                    if (typeof newjson["Advanced_Messaging_Total_Units"] === 'undefined') { TotalLicenceCount = TotalLicenceCount + 1; }
                    newjson["Advanced_Messaging_Consumed_Units"] = await changevaluenumtostr(newjson["Advanced_Messaging_Consumed_Units"], item.consumedUnits);
                    newjson["Advanced_Messaging_Subscription_Id"] = await appendsubsid(newjson["Advanced_Messaging_Subscription_Id"], item.subscriptionId);
                    newjson["Advanced_Messaging_Total_Units"] = await changevaluenumtostr(newjson["Advanced_Messaging_Total_Units"], item.totalUnits);
                    CheckSubsId = item.subscriptionId
                }
            }
        }
        var isissuedlicencezero = 0;
        var isusedlicencezero = 0;
        var issuedlic = 0;
        var usedlic = 0;
        var HealthScore = 0;
        var keys = Object.keys(newjson);
        TotalWeightage = 0
        //Health Score Calculations
        if (typeof keys.find((key) => key === "Advanced_Messaging_Total_Units") !== 'undefined') {
            issuedlic = issuedlic + Number(newjson['Advanced_Messaging_Total_Units'])
            usedlic = usedlic + Number(newjson['Advanced_Messaging_Consumed_Units'])
            HealthScore = HealthScore + (Number(newjson['Advanced_Messaging_Consumed_Units']) / Number(newjson['Advanced_Messaging_Total_Units'])) * (0.25)
            TotalWeightage = TotalWeightage + 0.25;
            isissuedlicencezero = issuedlic
            isusedlicencezero = usedlic
            console.log("HealthScore", HealthScore)
        }
        if (typeof keys.find((key) => key === "Advanced_Space_Meeting_Total_Units") !== 'undefined') {
            issuedlic = issuedlic + Number(newjson['Advanced_Space_Meeting_Total_Units'])
            usedlic = usedlic + Number(newjson['Advanced_Space_Meeting_Consumed_Units'])
            HealthScore = HealthScore + (Number(newjson['Advanced_Space_Meeting_Consumed_Units']) / Number(newjson['Advanced_Space_Meeting_Total_Units'])) * (0.50)
            TotalWeightage = TotalWeightage + 0.50;
            isusedlicencezero = usedlic
            isissuedlicencezero = issuedlic
            console.log("HealthScore", HealthScore)
        }
        if (typeof keys.find((key) => key === "Integrations_Total_Units") !== 'undefined') {
            issuedlic = issuedlic + Number(newjson['Integrations_Total_Units'])
            usedlic = usedlic + Number(newjson['Integrations_Consumed_Units'])
            HealthScore = HealthScore + (Number(newjson['Integrations_Consumed_Units']) / Number(newjson['Integrations_Total_Units'])) * (0.1)
            TotalWeightage = TotalWeightage + 0.1;
            isusedlicencezero = usedlic
            isissuedlicencezero = issuedlic
        }
        if (typeof keys.find((key) => key === "Professional_Total_Units") !== 'undefined') {
            issuedlic = issuedlic + Number(newjson['Professional_Total_Units'])
            usedlic = usedlic + Number(newjson['Professional_Consumed_Units'])
            HealthScore = HealthScore + (Number(newjson['Professional_Consumed_Units']) / Number(newjson['Professional_Total_Units'])) * (0.1)
            TotalWeightage = TotalWeightage + 0.1;
            isusedlicencezero = usedlic
            isissuedlicencezero = issuedlic
        }
        if (typeof keys.find((key) => key === "Web_Room_Total_Units") !== 'undefined') {
            issuedlic = issuedlic + Number(newjson['Web_Room_Total_Units'])
            usedlic = usedlic + Number(newjson['Web_Room_Consumed_Units'])
            HealthScore = HealthScore + (Number(newjson['Web_Room_Consumed_Units']) / Number(newjson['Web_Room_Total_Units'])) * (0.1)
            TotalWeightage = TotalWeightage + 0.1;
            isusedlicencezero = usedlic
            isissuedlicencezero = issuedlic
        }
        // if (typeof keys.find((key) => key === "Work_Space_Total_Units") !== 'undefined') {
        //     issuedlic = issuedlic + Number(newjson['Work_Space_Total_Units'])
        //     usedlic = usedlic + Number(newjson['Work_Space_Consumed_Units'])
        //     HealthScore = HealthScore + (Number(newjson['Work_Space_Consumed_Units']) / Number(newjson['Work_Space_Total_Units'])) * (0.1)
        //     TotalWeightage = TotalWeightage + 0.1;
        //     isusedlicencezero = usedlic
        //     isissuedlicencezero = issuedlic
        // }
        if (typeof keys.find((key) => key === "Webex_Meeting_Suit_Total_Units") !== 'undefined') {
            issuedlic = issuedlic + Number(newjson['Webex_Meeting_Suit_Total_Units'])
            usedlic = usedlic + Number(newjson['Webex_Meeting_Suit_Consumed_Units'])
            HealthScore = HealthScore + (Number(newjson['Webex_Meeting_Suit_Consumed_Units']) / Number(newjson['Webex_Meeting_Suit_Total_Units'])) * (0.25)
            TotalWeightage = TotalWeightage + 0.25;
            isusedlicencezero = usedlic
            isissuedlicencezero = issuedlic
            console.log("HealthScore", HealthScore)
        }
        // if (typeof keys.find((key) => key === "Webex_Webener_3000_Total_Units") !== 'undefined') {
        //     issuedlic = issuedlic + Number(newjson['Webex_Webener_3000_Total_Units'])
        //     usedlic = usedlic + Number(newjson['Webex_Webener_3000_Consumed_Units'])
        //     HealthScore = HealthScore + (Number(newjson['Webex_Webener_3000_Consumed_Units']) / Number(newjson['Webex_Webener_3000_Total_Units'])) * (0.1)
        //     TotalWeightage = TotalWeightage + 0.1;
        //     isusedlicencezero = usedlic
        //     isissuedlicencezero = issuedlic
        //     console.log("HealthScore", HealthScore)
        // }
        if (typeof keys.find((key) => key === "Webex_Assistant_For_Meeting_Total_Units") !== 'undefined') {
            issuedlic = issuedlic + Number(newjson['Webex_Assistant_For_Meeting_Total_Units'])
            usedlic = usedlic + Number(newjson['Webex_Assistant_For_Meeting_Consumed_Units'])
            HealthScore = HealthScore + (Number(newjson['Webex_Assistant_For_Meeting_Consumed_Units']) / Number(newjson['Webex_Assistant_For_Meeting_Total_Units'])) * (0.1)
            TotalWeightage = TotalWeightage + 0.1;
            isusedlicencezero = usedlic
            isissuedlicencezero = issuedlic
        }
        // await sleep(2000)

        totalHealthscore = HealthScore * 100 / (TotalWeightage)
        console.log("isusedlicencezero", isusedlicencezero)
        console.log("isissuedlicencezero", isissuedlicencezero)
        console.log("TotalWeightage", TotalWeightage)
        console.log("HealthScore", HealthScore)
        console.log(displayName)
        console.log("totalHealthscore", totalHealthscore)
        newjson["Total_Licence_Type"] = TotalLicenceCount;
        newjson["Health_Score"] = totalHealthscore.toFixed(2);
        // Health_Score_AnalyticsEdit
        if (newjson["Health_Score"] >= 0 && newjson["Health_Score"] < 25) { newjson["Health_Score_Analytic"] = "25" }
        if (newjson["Health_Score"] >= 25 && newjson["Health_Score"] < 50) { newjson["Health_Score_Analytic"] = "50" }
        if (newjson["Health_Score"] >= 50 && newjson["Health_Score"] < 75) { newjson["Health_Score_Analytic"] = "75" }
        if (newjson["Health_Score"] >= 75 && newjson["Health_Score"] < 100) { newjson["Health_Score_Analytic"] = "100" }
        if (newjson["Health_Score"] >= 100) { newjson["Health_Score_Analytic"] = "101" }

        console.log("Health_Score_Analytic", newjson["Health_Score_Analytic"])
        // newjson["Health_Score"] = totalHealthscore.toFixed(2)==0.00?"0.01":totalHealthscore.toFixed(2);
        console.log(isissuedlicencezero != 0)
        console.log(isusedlicencezero != 0)
        console.log(isissuedlicencezero != 0 && isusedlicencezero != 0)
        newjson2.push(newjson)
        if (CheckSubsId != "" && (isissuedlicencezero !== 0 && isusedlicencezero !== 0)) {
            try {
                const response1 = await axios({
                    'method': 'post',
                    'url': 'https://www.zohoapis.com/crm/v2/Webex_CX_Licenses_Data',
                    'headers': {
                        'Authorization': 'Zoho-oauthtoken ' + zohonewtoken,
                        "Content-Type": "application/json"
                    }, 'data': {
                        "data": newjson2
                    }
                });
                console.log("add licenses", response1.status);
                return [{
                    'usedlicence': isusedlicencezero,
                    'issuedlicence': isissuedlicencezero,
                    'ticketstatus': response1.status == 201 ? true : false
                }]
                // return response1.data
            } catch (error) {
                console.log("add licenses error", error);
            }
        }
        CheckSubsId = "";
        TotalLicenceCount = 0;
        // return [{
        //     'usedlicence': isusedlicencezero,
        //     'issuedlicence': isissuedlicencezero,
        //     'ticketstatus': response1.status==201?true:false
        // }]
    } catch (error) {
        console.log("get licenses error ", error, orgid);
    }
}

// ↑



// Update treans from this functions/////////////////////////////////////////////////
const UpdateTrends = async (orgid, zohonewtoken) => {
    try {
        const response1 = await axios({
            'method': 'get',
            'url': 'https://www.zohoapis.com/crm/v2/Webex_CX_Licenses_Data/search?sort_order=desc&sort_by=Created_Time&criteria=(Webex_Customer_ID:equals:' + orgid + ')',
            'headers': {
                'Authorization': 'Zoho-oauthtoken ' + zohonewtoken,
                "Content-Type": "application/json"
            },
        });
        // console.log("Data Count ",response1.data.info.count)
        console.log("getTrends", response1.data.data);
        tempcount = 0;
        tempHealthScore = 0;
        currentHealthScore = 0;
        if (response1.status == 200) {
            // console.log(response1.data.data.length)
            for (const item of response1.data.data) {

                if (tempcount == 0) {
                    console.log("item.id", item.id)
                    currentHealthScore = item.Health_Score;
                    currentid = item.id;
                }
                if (tempcount > 0 && tempcount < 5) {
                    tempHealthScore = tempHealthScore + Number(item.Health_Score)
                }
                tempcount++;
            }
            console.log(currentHealthScore)
            console.log(tempHealthScore)
            console.log(tempcount < 5 ? tempcount - 1 : 4)
            treandsdata = ((currentHealthScore - (tempHealthScore / (tempcount < 5 ? tempcount - 1 : 4))) / currentHealthScore) * 100
            console.log(treandsdata)
            // Trends_Analytics
        } else {
            treandsdata = 0.00
        }
        orggroth = 0
        if (treandsdata) {
            if (treandsdata <= -50) { orggroth = orggroth - 4 }
            if (treandsdata >= -50 && treandsdata < -25) { orggroth = orggroth - 2 }
            if (treandsdata >= -25 && treandsdata < -10) { orggroth = orggroth - 1 }
            if (treandsdata >= -10 && treandsdata < 10) { orggroth = orggroth - 0 }
            if (treandsdata >= 10 && treandsdata < 25) { orggroth = orggroth + 1 }
            if (treandsdata >= 25 && treandsdata < 50) { orggroth = orggroth + 2 }
            if (treandsdata >= 50) { orggroth = orggroth + 4 }
        }
        // ↑
        console.log("orggroth", orggroth)

        let data1 = JSON.stringify({
            "data": [
                {
                    'id': currentid,
                    'Trends': treandsdata.toFixed(2)
                }
            ]
        });


        try {
            const response2 = await axios({
                'method': 'put',
                'url': 'https://www.zohoapis.com/crm/v2/Webex_CX_Licenses_Data',
                'headers': {
                    'Authorization': 'Zoho-oauthtoken ' + zohonewtoken,
                    "Content-Type": "application/json"
                }, 'data': data1
            });
            console.log("add UpdateTrends", response2);
            if (!isNaN(orggroth)) {
                return orggroth
            } else {
                return 0
            }

        } catch (error) {
            console.log("add UpdateTrends error", error);
        }
        return response2.data
    } catch (error) {
        console.log("UpdateTrends error", error);
    }
}



// code = "ZjdhZjUzODMtYWIzMS00ZGM4LWIwODEtMzlkOTQwODQyYzVmODlmZGJkYjEtMjZh_PF84_3bf06e7b-f230-427f-9163-c54d2e428d6a";
// Clientid = "Cddad4b9d5566e911b8a86569cbf28a00b8de6d785157be3ab836476fea64d1c9";
// ClientSecret = "9dd63f0ec6b33f6dd0cccc8886cecc6d917471a35acc846f81d19a0cfed1b193";




// {
//     "access_token": "NjVmMWE1NDAtZGQ3Mi00Yzg0LTg1MzQtYjlkMTE0MzA2NTk2N2UxMTdiZmItN2Y1_PF84_3bf06e7b-f230-427f-9163-c54d2e428d6a",
//     "expires_in": 1209599,
//     "refresh_token": "NmU2NWZjZmMtMGQ4My00YTA1LTgzYWEtMjM1ZWJiNjZjOTFhOGM1MmIwNzctNjE5_PF84_3bf06e7b-f230-427f-9163-c54d2e428d6a",
//     "refresh_token_expires_in": 6223532,
//     "token_type": "Bearer",
//     "scope": "spark-admin:broadworks_subscribers_write meeting:admin_preferences_write meeting:admin_preferences_read analytics:read_all spark-admin:people_write spark-admin:wholesale_customers_write spark-admin:places_read spark-admin:workspace_metrics_read spark-admin:wholesale_billing_reports_read spark-admin:video_mesh_api_webhook_write meeting:admin_config_write identity:tokens_read spark-admin:devices_write spark-admin:workspaces_write spark-admin:locations_write spark-admin:organizations_write spark-admin:workspace_locations_read spark-admin:wholesale_sub_partners_write spark-admin:broadworks_billing_reports_write spark-admin:call_qualities_read spark:kms spark-admin:wholesale_sub_partners_read spark-admin:wholesale_customers_read spark-admin:wholesale_subscribers_read meeting:admin_config_read spark-admin:people_read spark-admin:resource_groups_read spark:telephony_config_write spark-admin:locations_read spark-admin:video_mesh_api_read spark-admin:wholesale_billing_reports_write spark-admin:organizations_read identity:tokens_write spark-admin:wholesale_subscribers_write spark-admin:calling_cdr_read spark-admin:video_mesh_api_write spark-admin:devices_read spark-admin:hybrid_clusters_read spark-admin:workspace_locations_write spark-admin:broadworks_billing_reports_read spark-admin:broadworks_enterprises_write spark-admin:broadworks_enterprises_read spark-admin:roles_read spark-admin:workspaces_read spark-admin:resource_group_memberships_read spark-admin:resource_group_memberships_write spark-admin:broadworks_subscribers_read audit:events_read spark-admin:hybrid_connectors_read spark-admin:places_write spark-admin:licenses_read"
// }


// getOrganizations();




// {
//     "access_token": "NGIzZmJmMGItYjFkYy00ZDNlLWFiNmItNDM0NmUwZDY5OTY2NDNmNWMwOGEtZWM5_PF84_3bf06e7b-f230-427f-9163-c54d2e428d6a",
//     "expires_in": 1209599,
//     "refresh_token": "MjVkNTU1ZGItMDcxZS00YjQyLThkY2MtMTBjMWVhZDIyY2U5Y2VmNGI3MjUtNmQx_PF84_3bf06e7b-f230-427f-9163-c54d2e428d6a",
//     "refresh_token_expires_in": 7775999,
//     "token_type": "Bearer",
//     "scope": "spark:kms analytics:read_all spark-admin:organizations_write meeting:admin_participants_read spark-admin:organizations_read spark:organizations_read spark-admin:licenses_read meeting:admin_schedule_read"
// }



getOrganizations();
// getwebextoken();
