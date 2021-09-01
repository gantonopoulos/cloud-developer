import { Router, Request, Response } from 'express';

const router: Router = Router();

router.get("/", async(req, res)=>{
    res.send("V0");
})

export const IndexRouter: Router = router;