import twilio from "twilio";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async ({ to, message }) => {
    if (!to) {
        throw new Error("Missing recipient phone number");
    }

    if (!message || message.trim().length === 0) {
        throw new Error("Missing SMS message content");
    }

    if (!process.env.TWILIO_ACCOUNT_SID) {
        throw new Error("TWILIO_ACCOUNT_SID not configured");
    }

    if (!process.env.TWILIO_AUTH_TOKEN) {
        throw new Error("TWILIO_AUTH_TOKEN not configured");
    }

    if (!process.env.TWILIO_PHONE_NUMBER) {
        throw new Error("TWILIO_PHONE_NUMBER not configured");
    }

    try {
        const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });

        // ✅ Return Twilio response
        return {
            sid: result.sid,
            status: result.status,
            to: result.to,
            from: result.from,
            dateCreated: result.dateCreated
        };
    } catch (error) {
        console.error(`❌ Twilio SMS Error:`, {
            message: error.message,
            code: error.code,
            moreInfo: error.moreInfo,
            status: error.status
        });
        
        // Provide specific error messages for common issues
        let errorMessage = error.message;
        
        if (error.code === 21608) {
            errorMessage = `SMS failed: Phone number ${to} is not verified. For Twilio trial accounts, you need to verify phone numbers at twilio.com/console/phone-numbers/verified before sending SMS.`;
        } else if (error.code === 21211) {
            errorMessage = `SMS failed: Invalid phone number format. Please use international format (e.g., +1234567890).`;
        } else if (error.code === 20003) {
            errorMessage = `SMS failed: Authentication error. Please check your Twilio Account SID and Auth Token.`;
        } else if (error.code === 21606) {
            errorMessage = `SMS failed: The From phone number ${process.env.TWILIO_PHONE_NUMBER} is not a valid, SMS-capable inbound phone number or short code for your account.`;
        }
        
        // Re-throw with more context
        throw new Error(`${errorMessage} (Code: ${error.code || 'Unknown'})`);
    }
};

// Test SMS function for debugging
export const testSMS = async (phoneNumber) => {
    try {
        const result = await sendSMS({
            to: phoneNumber,
            message: "Test message from SmartBite! If you receive this, SMS notifications are working correctly. 🎉"
        });
        
        return result;
    } catch (error) {
        console.error("❌ Test SMS failed:", error.message);
        throw error;
    }
};
