from rest_framework.views import exception_handler


def alma_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    detail = response.data.get("detail", response.data)
    response.data = {
        "data": None,
        "message": detail,
        "success": False,
    }
    return response
