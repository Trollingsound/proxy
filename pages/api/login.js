import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import UserAgent from 'user-agents';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const proxy = 'http://51.159.4.90:3128' || "http://103.109.125.155:4444" || "http://72.10.164.178:4743" || "http://67.43.227.228:15435" || "http://67.43.228.254:10779" || "http://67.43.227.226:11267";
    const agent = new HttpsProxyAgent(proxy);

    const { username, password } = req.body;
    const url = 'https://www.instagram.com/api/v1/web/accounts/login/ajax/';

    const data = new URLSearchParams({
        enc_password: `#PWD_INSTAGRAM_BROWSER:0:${Date.now()}:${password}`,
        optIntoOneTap: 'false',
        queryParams: '{}',
        trustedDeviceRecords: '{}',
        username: username
    }).toString();

    const headers = {
        Accept: '*/*',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: 'csrftoken=tnGouLSeklzr75pd3UYRESQow7PlKpNg; mid=ZNOoBQALAAGNtLzGeFVzHXDZTR_3; ig_did=1D285229-F3AA-4B68-808D-750EBC68A716; ig_nrcb=1; datr=AajTZDTD2j-R1OV4Qsg-pSMK',
        Origin: 'https://www.instagram.com',
        Referer: 'https://www.instagram.com/',
        'Sec-Ch-Prefers-Color-Scheme': 'light',
        'Sec-Ch-Ua': '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
        'Sec-Ch-Ua-Full-Version-List': '"Not/A)Brand";v="99.0.0.0", "Google Chrome";v="115.0.5790.171", "Chromium";v="115.0.5790.171"',
        'Sec-Ch-Ua-Mobile': '63',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Ch-Ua-Platform-Version': '"10.0.0"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': new UserAgent().toString(),
        'Viewport-Width': '811',
        'X-Asbd-Id': '129477',
        'X-Csrftoken': 'tnGouLSeklzr75pd3UYRESQow7PlKpNg',
        'X-Ig-App-Id': '936619743392459',
        'X-Ig-Www-Claim': '0',
        'X-Instagram-Ajax': '1008001941',
        'X-Requested-With': 'XMLHttpRequest'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: data,
            // agent: agent // Proxy agent configuration
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        const responseHeaders = {};
        response.headers.forEach((value, name) => {
            responseHeaders[name] = value;
        });

        res.status(200).json({ data: responseData, headers: responseHeaders });

    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: error.message });
    }
}
