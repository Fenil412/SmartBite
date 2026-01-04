import os from "os";

export const healthCheck = async (req, res) => {
    try {
        const healthData = {
            status: "OK",
            service: "SmartBite Backend API",
            timestamp: new Date().toISOString(),

            system: {
                uptime: Math.floor(process.uptime()),
                platform: os.platform(),
                cpuArchitecture: os.arch(),
                cpuCores: os.cpus().length,
                totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
                freeMemoryMB: Math.round(os.freemem() / 1024 / 1024),
            },

            environment: {
                nodeEnv: process.env.NODE_ENV || "development",
                port: process.env.PORT || "not_set",
            },
        };

        return res.status(200).json({
            success: true,
            data: healthData,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Health check failed",
            error: error.message,
        });
    }
};
