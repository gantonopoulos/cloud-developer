import http, {ClientRequest, IncomingMessage} from "http";
import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';
import {config} from "../../../../config/config";
import {Readable} from "stream";
import {RequestOptions} from "https";
import * as https from "https";


const router: Router = Router();

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});
    items.rows.map((item) => {
            if(item.url) {
                item.url = AWS.getGetSignedUrl(item.url);
            }
    });
    res.send(items);
});

//@TODO
//Add an endpoint to GET a specific resource by Primary Key
router.get('/:id',
    async (req: Request, res: Response) => {
        let {id} = req.params;
        if (!id) {
            return res.status(400).send("Id is required");
        }

        const result = await FeedItem.findOne({where: {id: id}})
        if (!result) {
            return res.status(404).send(`No entry with id$=${id} was found!`);    
        }
        
        return res.status(200).send(result);
    });



// update a specific resource
router.patch('/:id', 
    requireAuth, 
    async (req: Request, res: Response) => {
        //@TODO try it yourself
        let {id} = req.params;
        if (!id) {
            return res.status(400).send("Id is required");
        }

        const result = await FeedItem.findOne({where: {id: id}});
        if (!result) {
            return res.status(404).send(`No entry with id$=${id} was found!`);
        }

        await result.update({caption: "Changed"}).then(() => {
            return res.status(200).send(result);
        }, () => {
            return res.status(500).send(result);
        });
});


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName', 
    requireAuth, 
    async (req: Request, res: Response) => {
    let { fileName } = req.params;
    const url = AWS.getPutSignedUrl(fileName);
    res.status(201).send({url: url});
});

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/', 
    requireAuth, 
    async (req: Request, res: Response) => {
    const caption = req.body.caption;
    const fileName = req.body.url;

    // check Caption is valid
    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    // check Filename is valid
    if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
    }

    const item: FeedItem = await new FeedItem();
    item.caption = caption;
    item.url = fileName;

    const saved_item = await item.save();

    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
});

function UploadImage(image_name:string, filteredImageData:Buffer) {
    const uploadOptions: RequestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'image/jpeg',
            'Content-Length': Buffer.byteLength(filteredImageData)
        }
    }
    const signed_upload_url: URL = new URL(AWS.getPutSignedUrl(image_name));
    console.log("Uploading image to S3. Put-Signed-Url:["+signed_upload_url+"]");
    const uploadToS3Request: ClientRequest = https.request(signed_upload_url, uploadOptions,
        (s3Response) => {
            if (s3Response.statusCode != 200) {
                let error = new Error('Put request to S3 bucket failed.\n' +
                    `Status Code: ${s3Response.statusCode}`);
                console.error(error.message);
                s3Response.destroy(error);
                return;
            }
        });
    uploadToS3Request.write(filteredImageData);
    uploadToS3Request.end();
}


router.post('/filteredimage',
    requireAuth,
    async (req: Request, res: Response) => {
        const image_name:string = req.body.image_name;
        const image_source:string = req.body.image_src_url;
        
        if (!image_source)
            return res.status(400).send("image_src_url is missing.");

        if (!image_name)
            return res.status(400).send("image_name is missing.");

        console.log("Sending to filtering service:[" + config.dev.image_filter_server + '/filteredimage/?image_url=' + image_source + "]");
        const filteringResponse = http.get(
            config.dev.image_filter_server + '/filteredimage/?image_url=' + image_source,
            (filteringResponse: IncomingMessage) => {
                if (filteringResponse.statusCode !== 200) {
                    let error = new Error('Request to image filter server failed.\n' +
                        `Status Code: ${filteringResponse.statusCode}`);
                    console.error(error.message);
                    filteringResponse.destroy(error);
                    return res.status(filteringResponse.statusCode).send(error.message);
                }
                
                let filteredImageData:Buffer
                filteringResponse.on('data', (chunk) => {
                    filteredImageData = Buffer.from(chunk);
                });

                filteringResponse.on('end', () => {
                    UploadImage(image_name, filteredImageData);
                    res.send(AWS.getGetSignedUrl(image_name));
                })
            });
        
        filteringResponse.on('error', (e) => {
            console.log('Error: ${e.message}')
            res.send(e.message)
        })
});

export const FeedRouter: Router = router;