import { Request, Response } from 'express';

export async function hello(req: Request, res: Response) {
    console.log('hello endpoint hit');
    res.send(`HELLO !!!`);
}