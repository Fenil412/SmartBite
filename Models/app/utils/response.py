# app/utils/response.py

def success(data=None, message="OK"):
    return {
        "success": True,
        "message": message,
        "data": data
    }, 200


def failure(message="Error", status=400):
    return {
        "success": False,
        "message": message,
        "data": None
    }, status
