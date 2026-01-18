/**
 * @file messageApi.js
 * @author moi
 * @description
 * Gọi API liên quan tới message
 */

import axios from "axios";

const API_URL = "http://localhost:5000/api/messages";

/**
 * Lấy lịch sử chat giữa user hiện tại và user khác
 * @param {string} userId - userId người chat cùng
 * @param {string} token - JWT token
 */
export const getChatHistory = async (userId, token) => {
    const response = await axios.get(`${API_URL}/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};
