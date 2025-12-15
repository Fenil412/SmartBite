import twilio from "twilio";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async ({ to, message }) => {
    if (!to) {
        throw new Error("Missing recipient phone number");
    }

    const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
    });

    // ✅ Return Twilio response
    return {
        sid: result.sid,
        status: result.status
    };
};
