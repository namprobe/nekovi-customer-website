//src/shared/types/common.ts
export interface BaseEntity {
    id: string
    createdAt: Date
    createdBy?: string
    updatedAt?: Date
    updatedBy?: string
    isDeleted: boolean
    deletedBy?: string
    deletedAt?: Date
    status: EntityStatus
}

//Grant type enum matching with backend
export enum GrantTypeEnum {
    Password = 0,
    Google = 1,
}


export enum EntityStatus {
    Active = 1,
    Inactive = 0,
    Pending = 2,
    Archived = 3,
}

export enum Gender {
    Female = 0,
    Male = 1,
    Other = 2,
}

export enum AddressType {
    Home = 1,
    Work = 2,
    Other = 3,
}

export enum OrderStatus {
    Pending = 1,
    Processing = 2,
    Shipped = 3,
    Delivered = 4,
    Cancelled = 5,
    Returned = 6,
}

export enum PaymentStatus {
    Pending = 1,
    Completed = 2,
    Failed = 3,
    Refunded = 4,
    Cancelled = 5,
}

export enum DiscountType {
    Percentage = 1,
    FixedAmount = 2,
}

export enum UserAction {
    Create = 1,
    Update = 2,
    Delete = 3,
    View = 4,
    Login = 5,
    Logout = 6,
}

export enum StaffPosition {
    Manager = 1,
    Staff = 2,
    Admin = 3,
    SuperAdmin = 4,
}

export enum ConditionType {
    MinOrderAmount = 1,
    ProductCategory = 2,
    UserLevel = 3,
    FirstTimeUser = 4,
}

// API Response types
export interface ApiResult<T = unknown> {
    isSuccess: boolean
    data?: T
    message?: string
    errors?: string[]
    errorCode?: string
}

export interface PaginateResult<T = unknown> {
    isSuccess: boolean
    items: T[]
    totalItems: number
    currentPage: number
    totalPages: number
    pageSize: number
    hasPrevious: boolean
    hasNext: boolean
    errors?: string[]
    errorCode?: string
}
// Form types
export interface FormState {
    isLoading: boolean
    errors: Record<string, string>
    success: boolean
}

// Error codes matching với backend ErrorCodeEnum.cs
export enum ErrorCodeEnum {
    // Success
    Success = 0,

    // Authentication & Authorization (401, 403)
    Unauthorized = 1001,
    Forbidden = 1002,
    InvalidCredentials = 1003,
    TokenExpired = 1004,
    InvalidToken = 1005,

    // Validation & Bad Request (400)
    ValidationFailed = 2001,
    InvalidInput = 2002,
    DuplicateEntry = 2003,
    InvalidOperation = 2004,
    TooManyRequests = 2005,

    // Not Found (404)
    NotFound = 3001,

    // Business Logic Errors (422)
    BusinessRuleViolation = 4001,
    InsufficientPermissions = 4002,
    ResourceConflict = 4003,

    // Internal Server Errors (500)
    InternalError = 5001,
    DatabaseError = 5002,
    ExternalServiceError = 5003,

    // File & Storage Errors
    FileUploadFailed = 6001,
    FileNotFound = 6002,
    StorageError = 6003,
    InvalidFileType = 6004,
    FileSizeTooLarge = 6005,
}

// HTTP Status Code Helper
export function getHttpStatusFromErrorCode(errorCode: string): number {
    const code = parseInt(errorCode) as ErrorCodeEnum;

    switch (code) {
        // 400 Bad Request
        case ErrorCodeEnum.ValidationFailed:
        case ErrorCodeEnum.InvalidInput:
        case ErrorCodeEnum.DuplicateEntry:
        case ErrorCodeEnum.InvalidOperation:
        case ErrorCodeEnum.InvalidFileType:
        case ErrorCodeEnum.FileSizeTooLarge:
            return 400;

        // 401 Unauthorized
        case ErrorCodeEnum.Unauthorized:
        case ErrorCodeEnum.InvalidCredentials:
        case ErrorCodeEnum.TokenExpired:
        case ErrorCodeEnum.InvalidToken:
            return 401;

        // 403 Forbidden
        case ErrorCodeEnum.Forbidden:
        case ErrorCodeEnum.InsufficientPermissions:
            return 403;

        // 404 Not Found
        case ErrorCodeEnum.NotFound:
        case ErrorCodeEnum.FileNotFound:
            return 404;

        // 422 Unprocessable Entity
        case ErrorCodeEnum.BusinessRuleViolation:
        case ErrorCodeEnum.ResourceConflict:
            return 422;

        // 429 Too Many Requests
        case ErrorCodeEnum.TooManyRequests:
            return 429;

        // 500 Internal Server Error
        case ErrorCodeEnum.InternalError:
        case ErrorCodeEnum.DatabaseError:
        case ErrorCodeEnum.ExternalServiceError:
        case ErrorCodeEnum.FileUploadFailed:
        case ErrorCodeEnum.StorageError:
            return 500;

        default:
            return 500;
    }
}
