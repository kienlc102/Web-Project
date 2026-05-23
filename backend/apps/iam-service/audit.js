const { v4: uuidv4 } = require('uuid');

/**
 * Audit Logger Utility
 * Ghi lại các security events vào database
 */

let pool; // Will be injected from server.js

function setPool(dbPool) {
    pool = dbPool;
}

/**
 * Log audit event
 * @param {Object} params
 * @param {string} params.userId - User ID (nullable)
 * @param {string} params.eventType - Event category (AUTH, TOKEN, ADMIN, etc.)
 * @param {string} params.eventAction - Specific action (LOGIN_SUCCESS, LOGIN_FAILED, etc.)
 * @param {string} params.ipAddress - Client IP
 * @param {string} params.userAgent - Client User-Agent
 * @param {Object} params.requestData - Additional data (username, etc.)
 * @param {number} params.responseStatus - HTTP status code
 */
async function logAudit({
    userId = null,
    eventType,
    eventAction,
    ipAddress = null,
    userAgent = null,
    requestData = {},
    responseStatus = 200
}) {
    if (!pool) {
        console.error('⚠️ Audit pool not initialized');
        return;
    }

    try {
        const auditId = uuidv4();
        await pool.query(
            `INSERT INTO audit_logs 
            (id, user_id, event_type, event_action, ip_address, user_agent, request_data, response_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                auditId,
                userId,
                eventType,
                eventAction,
                ipAddress,
                userAgent,
                JSON.stringify(requestData),
                responseStatus
            ]
        );
    } catch (error) {
        // Don't fail the request if audit logging fails
        console.error('⚠️ Audit logging failed:', error.message);
    }
}

/**
 * Helper: Extract IP from request
 */
function getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress;
}

/**
 * Helper: Extract User-Agent
 */
function getUserAgent(req) {
    return req.headers['user-agent'] || 'Unknown';
}

module.exports = {
    setPool,
    logAudit,
    getClientIp,
    getUserAgent
};
