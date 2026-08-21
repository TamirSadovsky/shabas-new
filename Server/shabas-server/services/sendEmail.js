const axios = require('axios')
const emailMessage = {
    'approved':{
        "from":"PersonalPuzzle",
        "subject":"הפאזל שלך מ-  PersonalPuzzle מתנת אסם",
        "text":` שמחים לעדכנכם שפרטי החשבונית שהזנת אושרו ושהפאזל האישי שלך נשלח להדפסה וצפוי להגיע אליך בהקדם. בברכה, צוות PersonalPuzzle`
    },
    'declined': {
        "from":"PersonalPuzzle",
        "subject":"הפאזל שלך מ-  PersonalPuzzle מתנת אסם",
        "text":`לאחר בדיקת החשבונית שצירפת, אנו מצטערים לעדכן שפרטי החשבונית לא עמדו בתנאי המבצע, ושאינך זכאי/ת לפאזל עם תמונה אישית עבור חשבונית זו.
        אבל זה לא הזמן להתייאש! המבצע תקף עד לתאריך 22/03/2024, זו הזדמנות לרכוש שישה ממוצרי אסם ולהשתתף במבצע :) 
        
        בכל שאלה,  ניתן לפנות לשירות הלקוחות במייל personalpuzzletlvisrael@gmail.com או בטלפון  052-5015707 ( שירות לקוחות – פעיל בימים א'-ה' בין השעות 10:00-16:00) , בברכה , צוות PersonalPuzzle
        `
    }
}

const sendEmail = async (emailType, emailAddress)=>{
    console.log(emailMessage[emailType])
    axios.post("https://osem-server.azurewebsites.net/mail", 
               {...emailMessage[emailType], "targetMail":emailAddress}
            )
}

module.exports = {sendEmail}

