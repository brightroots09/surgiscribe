var FCM = require("fcm-node");
var serverKey = "AAAAUfhvbiw:APA91bG0Hl0Qvz5UczQVlbRzaborIleCpAylt--ahYNwlT-1me1_SDC6SVmP8payASGAu56KeoUx0xap6iw1F06HU9XWXUzw5aENPtuPOAZzzAtPee2Af7akkaak_5C1Nf8TIU6hcaBS"; // Replace with your server key here
var fcm = new FCM(serverKey);

conbst = async (deviceToken, notificationData, title, message, timestamp, is_read) => {
  try {
    var message = {
      to: deviceToken,deviceType,
      notification: {
        title: title,
        body: message, 
      },
      data: notificationData,
    };
    
    const response = await fcm.send(message);
    console.log('Push sent successfully:', response);
  } catch (err) {
    console.error("Push send error:", err);
  }
};
