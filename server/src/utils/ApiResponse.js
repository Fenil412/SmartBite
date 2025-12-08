function success(res, data = null, status = 200) {
    return res.status(status).json({ success: true, data, error: null });
}

function fail(res, message = "Something went wrong", status = 400, code = null, details = null) {
    const error = { message: typeof message === "string" ? message : (message && message.message) || "Error", code };
    if (details) error.details = details;
    return res.status(status).json({ success: false, data: null, error });
}

// grouped object for compatibility with `import { ApiResponse } from "..."`
const ApiResponse = { success, fail };

export { success, fail, ApiResponse };
export default ApiResponse;
