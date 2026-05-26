from rest_framework.views import exception_handler


def core_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return response

    response.data = {
        'errors': response.data
    }

    return response
