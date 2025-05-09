import { Request, Response } from 'express';

export async function handleCall(req: Request, res: Response) {
    const audioUrl = req.query.audioUrl as string;
    console.log('Handling call for audioUrl:', audioUrl);

    // Respond with TwiML to play the audio
    res.type('text/xml');
    res.send(`
        <Response>
            <Play>${audioUrl}</Play>
        </Response>
    `);
    console.log('Responded with TwiML for audioUrl:', audioUrl);
}