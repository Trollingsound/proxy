import fetch from 'node-fetch';

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    
    /** fetching data **/
    
    try {

        /** start **/

        /** end **/

    } catch (error) {

        /** start **/
        console.error('Fetch Error:', error);
        res.status(500).json({ error: error.message });
        /** end **/

    }

}
