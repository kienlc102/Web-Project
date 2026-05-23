/**
 * Input Validation Utility
 * Validate and sanitize user inputs
 */

/**
 * Validate username
 * Rules:
 * - Length: 3-30 characters
 * - Allowed: letters, numbers, underscore, hyphen
 * - Must start with letter or number
 */
function validateUsername(username) {
    if (!username || typeof username !== 'string') {
        return { valid: false, error: 'Username là bắt buộc' };
    }

    const trimmed = username.trim();

    if (trimmed.length < 3) {
        return { valid: false, error: 'Username phải có ít nhất 3 ký tự' };
    }

    if (trimmed.length > 30) {
        return { valid: false, error: 'Username không được vượt quá 30 ký tự' };
    }

    // Only allow alphanumeric, underscore, hyphen
    const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;
    if (!usernameRegex.test(trimmed)) {
        return { 
            valid: false, 
            error: 'Username chỉ được chứa chữ cái, số, gạch dưới và gạch ngang. Phải bắt đầu bằng chữ cái hoặc số.' 
        };
    }

    return { valid: true, sanitized: trimmed };
}

/**
 * Validate password
 * Rules:
 * - Length: 8-128 characters
 * - Must contain: letter, number
 */
function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return { valid: false, error: 'Mật khẩu là bắt buộc' };
    }

    if (password.length < 8) {
        return { valid: false, error: 'Mật khẩu phải có ít nhất 8 ký tự' };
    }

    if (password.length > 128) {
        return { valid: false, error: 'Mật khẩu không được vượt quá 128 ký tự' };
    }

    if (!/[a-zA-Z]/.test(password)) {
        return { valid: false, error: 'Mật khẩu phải có ít nhất 1 chữ cái' };
    }

    if (!/[0-9]/.test(password)) {
        return { valid: false, error: 'Mật khẩu phải có ít nhất 1 chữ số' };
    }

    return { valid: true };
}

/**
 * Validate refresh token format
 */
function validateRefreshToken(token) {
    if (!token || typeof token !== 'string') {
        return { valid: false, error: 'Refresh token là bắt buộc' };
    }

    const trimmed = token.trim();

    if (trimmed.length === 0) {
        return { valid: false, error: 'Refresh token không được để trống' };
    }

    // JWT tokens are typically 100-500 characters
    if (trimmed.length < 50 || trimmed.length > 1000) {
        return { valid: false, error: 'Refresh token không hợp lệ' };
    }

    return { valid: true, sanitized: trimmed };
}

/**
 * Sanitize string input (remove dangerous characters)
 */
function sanitizeString(input, maxLength = 255) {
    if (!input || typeof input !== 'string') {
        return '';
    }

    // Trim and limit length
    let sanitized = input.trim().substring(0, maxLength);

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    return sanitized;
}

/**
 * Validate request body has required fields
 */
function validateRequiredFields(body, requiredFields) {
    const missing = [];

    for (const field of requiredFields) {
        if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
            missing.push(field);
        }
    }

    if (missing.length > 0) {
        return {
            valid: false,
            error: `Thiếu các trường bắt buộc: ${missing.join(', ')}`
        };
    }

    return { valid: true };
}

module.exports = {
    validateUsername,
    validatePassword,
    validateRefreshToken,
    sanitizeString,
    validateRequiredFields
};
