/**
 * charismaAuthService.js
 * Handles OAuth2 authentication for Charisma API
 */

import axios from "axios";
import https from "https";

export class BearerAuth {
  constructor() {
    this.token = null;
  }

  async init() {
    this.token = await this.getToken();
  }

  async getToken() {
    const clientId = process.env.CHARISMA_CLIENT_ID;
    const clientSecret = process.env.CHARISMA_CLIENT_SECRET;

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );

    const headers = {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const data = new URLSearchParams({
      grant_type: "client_credentials",
      scope: process.env.CHARISMA_SCOPE,
    });

    const httpsAgent = new https.Agent({ rejectUnauthorized: false }); // Like verify=False

    const response = await axios.post(process.env.CHARISMA_AUTH_URL, data, {
      headers,
      httpsAgent,
    });

    return response.data.access_token;
  }

  async post(url, payload) {
    if (!this.token) await this.init();

    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    const response = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${this.token}` },
      httpsAgent,
    });

    return response;
  }

  async get(url, params) {
    if (!this.token) await this.init();

    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${this.token}` },
      params,
      httpsAgent,
    });

    return response;
  }
}
