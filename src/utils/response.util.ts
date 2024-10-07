export function successResponse(message: string, data: any = null) {
    return {
      success: true,
      message,
      data,
    };
  }
  
  export function errorResponse(message: string, errors: any = null) {
    return {
      success: false,
      message,
      errors,
    };
  }