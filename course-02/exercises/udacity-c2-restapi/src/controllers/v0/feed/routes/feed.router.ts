import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';
import {config} from "../../../../config/config";

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


router.post('/filteredimage',
    requireAuth,
    async (req: Request, res: Response) => {
        
        //res.redirect(config.dev.image_filter_server + req.url);
        res.send(config.dev.image_filter_server + req.url);
});

export const FeedRouter: Router = router;